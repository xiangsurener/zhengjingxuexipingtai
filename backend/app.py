from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from config import config

# 蓝图
from routes.lesson import bp as lesson_bp
from routes.qa import bp as qa_bp
from routes.assignment import bp as assignment_bp
from routes.report import bp as report_bp

# 新增：AI 教师相关依赖与类（参考 test.py）
import os
import re
import sys
import traceback
import socket
from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv())

# 尝试导入 LLM 相关库，若失败则提供降级占位实现
try:
    from langchain_community.llms import Tongyi
    from langchain_core.runnables import RunnableSequence
    from langchain.prompts import PromptTemplate

    class QwenTurboTongyi(Tongyi):
        model_name: str = "qwen-turbo"

    class QwenMaxTongyi(Tongyi):
        model_name: str = "qwen-max"
    LLM_AVAILABLE = True
except Exception:
    # 降级占位：当无法导入 LLM 时，返回固定回答，避免服务崩溃
    LLM_AVAILABLE = False

    class QwenTurboTongyi:
        def __init__(self, *args, **kwargs):
            pass

        def __call__(self, prompt=None, **kwargs):
            return "（本地未配置LLM，返回占位回答）"

    class RunnableSequence:
        def __init__(self, *args, **kwargs):
            pass

        def invoke(self, payload):
            return "（本地未配置LLM，无法生成真实回答）"

    class PromptTemplate:
        def __init__(self, template=None, input_variables=None):
            self.template = template

# 新增：将要返回给前端的 segment 剥离敏感字段（如 answer）
def _sanitize_segment_for_client(seg: dict):
    # 仅复制对前端可见的字段，剔除内部字段（如 answer）
    if not isinstance(seg, dict):
        return seg
    allowed = {}
    for k, v in seg.items():
        if k == "answer":
            continue
        allowed[k] = v
    # 确保至少包含基础字段
    allowed.setdefault("scene", seg.get("scene", ""))
    allowed.setdefault("content", seg.get("content", ""))
    allowed.setdefault("type", seg.get("type", "dialogue"))
    return allowed

# ===== 新增：LMService - 统一封装 LLM 初始化与调用逻辑（兼容降级） =====
class LMService:
    """
    轻量封装：负责 LLM 实例化、PromptTemplate 构造及 RunnableSequence 调用细节。
    如果环境中未安装 LLM 库，提供降级占位实现，保持返回类型为字符串。
    """
    def __init__(self):
        self.available = LLM_AVAILABLE
        if self.available:
            # 按需初始化两个 LLM 实例（teacher 与 qa）
            self.teacher_llm = QwenTurboTongyi(temperature=0.7)
            self.qa_llm = QwenTurboTongyi(temperature=1)
            # QA prompt template（保留现有字符串模板含义）
            self.qa_template = '''
                你的名字是AI教师,当有人问问题的时候,你都会回答{question}, 内容尽量详细
            '''
            try:
                self.qa_prompt = PromptTemplate(template=self.qa_template, input_variables=["question"])
                # RunnableSequence 的组合在不同版本上行为不同，兼容处理
                if hasattr(RunnableSequence, "__or__"):
                    self.qa_chain = RunnableSequence(self.qa_prompt | self.qa_llm)
                else:
                    self.qa_chain = RunnableSequence(self.qa_prompt, self.qa_llm)
            except Exception:
                # 若 PromptTemplate / RunnableSequence 初始化异常，降级为简单占位链
                self.available = False
                self.qa_chain = RunnableSequence()
        else:
            # LLM 不可用时的占位实现（与现有降级兼容）
            self.teacher_llm = None
            self.qa_llm = None
            self.qa_chain = RunnableSequence()

    def run_qa(self, question: str, chat_history=None, script_context=None):
        """统一调用 QA 链并返回字符串，内部兼容 invoke 或直接调用。
        chat_history: list of {"role","text"} 最近对话
        script_context: list of strings（与问题相关的剧本段落）
        """
        if not self.available:
            return "（本地未配置LLM，无法生成真实回答）"
        # 构造 prompt：系统指令（教师身份） + 剧本上下文 + 聊天历史 + 本次问题
        system_inst = ("你是课程中的 AI 教师，语气亲切、专业、适合课堂讲解。回答应参考课程剧本上下文，"
                       "并指出若有引用剧本文本需明确标注。回答需要清晰、分步并适度举例。")
        parts = [system_inst]
        if script_context:
            parts.append("以下为与问题相关的课程剧本片段（仅作参考）：")
            for idx, sc in enumerate(script_context, 1):
                parts.append(f"片段{idx}: {sc}")
        if chat_history:
            parts.append("以下为最近对话历史：")
            for h in chat_history:
                r = h.get("role", "user")
                t = h.get("text", "")
                parts.append(f"{r}: {t}")
        parts.append("问题：" + question)
        prompt_input = "\n\n".join(parts)
        try:
            # 若 qa_chain 支持 invoke
            if hasattr(self.qa_chain, "invoke"):
                resp = self.qa_chain.invoke({"question": prompt_input})
            else:
                resp = self.qa_chain({"question": prompt_input})
            return str(resp)
        except Exception as e:
            return f"回答生成出错：{e}"
# ===== end LMService =====

# AI 教师实现（简化自 test.py）
class AITeacherGame:
    def __init__(self):
        # 使用 LMService 统一管理 LLM/Prompt/Chain 的初始化与调用，保持原行为
        self.lm = LMService()
        # 兼容性：保留 teacher_llm 与 qa_chain 字段以防其他代码依赖
        self.teacher_llm = getattr(self.lm, "teacher_llm", None)
        self.qa_chain = getattr(self.lm, "qa_chain", None)

    def load_script(self, file_path: str):
        """读取剧本文件并分段，返回段列表"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return self._parse_script_segments(content)
        except FileNotFoundError:
            return []

    def _parse_script_segments(self, content: str):
        """
        按空行分段；若段落包含以 A. B. C. 开头的选项，则提取 choices（列表）
        并尝试解析紧随段落中或下一行的答案标注形式：【答案: X】
        """
        segments = []
        if not content:
            return segments

        # 以一个或多个空行分割段落（兼容 \r\n 与 \n）
        parts = re.split(r'\r?\n\s*\r?\n+', content)

        for part in parts:
            text = part.strip()
            if not text:
                continue

            # 默认
            scene = ""
            m = re.match(r'^\s*\[(.*?)\]\s*(.*)$', text, re.DOTALL)
            if m:
                scene = m.group(1).strip()
                body = m.group(2).strip()
            else:
                body = text

            # 查找选项行（以 A. 或 A）开头的多行选择
            lines = [ln.strip() for ln in body.splitlines() if ln.strip()]
            choices = []
            answer = None
            # collect lines starting with A. / B. / C. (允许多种格式)
            choice_pattern = re.compile(r'^\s*([A-Z])\s*[\.：:)\-]?\s*(.+)$', re.IGNORECASE)
            other_lines = []
            for ln in lines:
                cm = choice_pattern.match(ln)
                if cm:
                    label = cm.group(1).upper()
                    text_choice = cm.group(2).strip().strip('"“”')
                    choices.append({'label': label, 'text': text_choice})
                else:
                    other_lines.append(ln)

            # 尝试从 body 中提取答案标注，格式例如：【答案:B】 或 【答案: B】 或 (答案:B)
            ans_m = re.search(r'【\s*答案\s*[:：]\s*([A-Z])\s*】', body, re.IGNORECASE)
            if not ans_m:
                ans_m = re.search(r'\(答案\s*[:：]?\s*([A-Z])\)', body, re.IGNORECASE)
            if ans_m:
                answer = ans_m.group(1).upper()

            # 如果没有在 body 找到答案，也尝试在 other_lines 的末尾（可能作者在下一行单独标注）
            if not answer and other_lines:
                for ol in reversed(other_lines[-2:]):
                    ans_m2 = re.search(r'【\s*答案\s*[:：]\s*([A-Z])\s*】', ol, re.IGNORECASE) or re.search(r'\(答案\s*[:：]?\s*([A-Z])\)', ol, re.IGNORECASE)
                    if ans_m2:
                        answer = ans_m2.group(1).upper()
                        break

            segment = {
                'type': 'dialogue',
                'scene': scene,
                'content': body,
            }
            if choices:
                segment['choices'] = choices
            if answer:
                segment['answer'] = answer  # 仅服务器端保存，响应给前端时会剥离
            segments.append(segment)

        return segments

    def is_interaction_point(self, segment):
        interaction_keywords = ['互动提问', '提问', '问题', '选择', 'A.', 'B.', 'C.']
        content = segment['content'] if isinstance(segment, dict) else segment
        return any(keyword in content for keyword in interaction_keywords)

    def ask_question(self, question: str):
        """通过 qa_chain 回答问题，返回字符串（由 LMService 统一处理异常与降级）"""
        return self.lm.run_qa(question)

# 实例化 AI 教师（可在模块级复用）
teacher = AITeacherGame()

def create_app():
    app = Flask(__name__, static_folder=None)
    # 允许所有来源访问 /api/*（开发阶段）
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # 蓝图注册并加上统一前缀 /api
    app.register_blueprint(lesson_bp, url_prefix="/api/lesson")
    app.register_blueprint(qa_bp, url_prefix="/api/qa")
    app.register_blueprint(assignment_bp, url_prefix="/api/assignment")
    app.register_blueprint(report_bp, url_prefix="/api/report")

    # 静态前端文件目录（项目根的 frontend）
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    frontend_dir = os.path.join(project_root, "frontend")

    # 提供静态前端，方便同源访问 API（SPA 支持）
    @app.route("/", defaults={"path": "index.html"})
    @app.route("/<path:path>")
    def serve_frontend(path):
        # 优先返回文件，找不到则降级返回 index.html（支持 SPA 路由）
        target = os.path.join(frontend_dir, path)
        if os.path.exists(target) and os.path.isfile(target):
            return send_from_directory(frontend_dir, path)
        return send_from_directory(frontend_dir, "index.html")

    @app.after_request
    def add_cors_headers(response):
        # 统一添加 CORS 头（以防某些请求缺少）
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        return response

    # 新增：记录每次请求，便于调试（打印方法、路径、远程地址）
    @app.before_request
    def log_request_info():
        try:
            print(f"REQ {request.method} {request.path} from {request.remote_addr}")
        except Exception:
            pass

    # 新增：快速响应 OPTIONS（CORS 预检）
    @app.route('/<path:any>', methods=['OPTIONS'])
    def handle_options(any):
        resp = jsonify({"ok": True, "method": "OPTIONS"})
        resp.status_code = 200
        return resp

    # 新增：简单 echo 接口，返回请求头与来源，便于诊断被代理/拦截情况
    @app.route("/api/echo", methods=["GET", "POST"])
    def api_echo():
        data = {
            "method": request.method,
            "path": request.path,
            "remote_addr": request.remote_addr,
            "headers": {k: v for k, v in request.headers.items()},
            "args": request.args.to_dict(),
        }
        return jsonify(data)

    return app

app = create_app()

# 简单健康检查（文本），便于 curl / 浏览器快速验证
@app.route("/api/health", methods=["GET"])
def api_health():
    print("DEBUG: /api/health requested from", request.remote_addr)
    return "ok", 200

# 简单健康检查/回显接口，前端可用它来检测后端地址是否可达
@app.route("/api/ping", methods=["GET"])
def api_ping():
    print("DEBUG: /api/ping requested from", request.remote_addr)
    return jsonify({"ok": True, "host": request.host, "url": request.host_url})

# 新增辅助函数：解析剧本路径并读取文本，避免重复代码
def resolve_script_path(req_file: str) -> str:
    """把相对名优先解析到 project/database，再 fallback 到 backend 目录；绝对路径保持不变"""
    if os.path.isabs(req_file):
        return req_file
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(backend_dir, ".."))
    database_path = os.path.join(project_root, "database", req_file)
    backend_path = os.path.join(backend_dir, req_file)
    return database_path if os.path.exists(database_path) else backend_path

def read_script_text(script_path: str):
    """读取文件原文，失败返回 None"""
    try:
        with open(script_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception:
        return None

# 新增接口：获取剧本分段（前端调用以展示课程）
@app.route("/api/ai_teacher/segments", methods=["GET"])
def api_segments():
    """
    参数:
      file: 可选，剧本文件相对或绝对路径（默认 database 下的 DAY1.txt）
    返回: JSON 列表 [{scene, content, type, is_interaction}, ...]
    """
    req_file = request.args.get("file", "DAY1.txt")
    script_path = resolve_script_path(req_file)

    segments = teacher.load_script(script_path)
    out = []
    for seg in segments:
        # 计算并返回基础字段，同时剥离答案
        c = _sanitize_segment_for_client(seg)
        c.update({
            "scene": seg.get("scene", ""),
            "content": seg.get("content", ""),
            "type": seg.get("type", "dialogue"),
            "is_interaction": teacher.is_interaction_point(seg) or ('choices' in seg)
        })
        # 如果有 choices，返回 choices 给客户端用于渲染选项
        if 'choices' in seg:
            c['choices'] = seg['choices']
        out.append(c)
    return jsonify({"path": script_path, "segments": out})

# 新增接口：获取剧本原文内容，便于前端完整展示
@app.route("/api/ai_teacher/script", methods=["GET"])
def api_script():
    """
    参数:
      file: 可选，剧本文件相对或绝对路径（默认 database 下的 DAY1.txt）
    返回: {"path": ..., "content": "...}
    """
    req_file = request.args.get("file", "DAY1.txt")
    script_path = resolve_script_path(req_file)

    content = read_script_text(script_path)
    if content is None:
        return jsonify({"error": "file not found or unreadable", "path": script_path}), 404
    return jsonify({"path": script_path, "content": content})

# 新增接口：问答，前端将用户问题发送到此接口获取 AI 回答
@app.route("/api/ai_teacher/ask", methods=["POST"])
def api_ask():
    """
    请求 JSON:
      {"question": "...", "client_id": "...", "file": "DAY1.txt"}
    返回 JSON:
      {"answer": "...}
    """
    try:
        # 打印请求来源与部分头信息，便于浏览器端调试
        print("DEBUG: /api/ai_teacher/ask from", request.remote_addr)
        try:
            # 打印一些关键头部（避免泄露敏感信息）
            for h in ("origin", "referer", "user-agent", "content-type"):
                v = request.headers.get(h)
                if v:
                    print(f"DEBUG HEADER {h}: {v}")
        except Exception:
            pass

        data = request.get_json(force=True, silent=True) or {}
        question = (data.get("question") or "").strip()
        client_id = (data.get("client_id") or "").strip()
        file_name = data.get("file", "DAY1.txt")

        if not question:
            return jsonify({"error": "question required"}), 400

        # 构造上下文：先从记忆取最近对话，再用简单检索从剧本获取相关片段
        chat_hist = get_chat_history(client_id, last_n=8)
        script_ctx = retrieve_script_context(question, file_name=file_name, top_k=3)

        # 记录用户问题到记忆
        append_memory(client_id, "user", question)

        # 调用 LMService（会合并系统 prompt + script_ctx + chat_hist + question）
        answer = teacher.lm.run_qa(question, chat_history=chat_hist, script_context=script_ctx)

        # 记录助手回答
        append_memory(client_id, "assistant", answer)

        resp = jsonify({"answer": answer})
        # 确保 CORS 头万无一失（防止某些环境缺失 after_request）
        resp.headers["Access-Control-Allow-Origin"] = "*"
        return resp
    except Exception as e:
        print("ERROR in /api/ai_teacher/ask:", e)
        traceback.print_exc()
        return jsonify({"error": "internal error"}), 500

@app.route("/api/ai_teacher/start", methods=["GET"])
def api_start():
    """
    启动授课：返回首段元数据和总段数（不返回整篇文本，避免前端一次性展示全部段落）
    参数:
      file: 可选，剧本文件相对名或绝对路径（默认 database 下的 DAY1.txt）
    返回:
      {
        "path": "...",
        "first": {"scene","content","type","is_interaction"},
        "total": N
      }
    """
    req_file = request.args.get("file", "DAY1.txt")
    script_path = resolve_script_path(req_file)

    # 仍然读取文件以检查可读性，但不将全文返回给前端
    full_text = read_script_text(script_path)
    if full_text is None:
        return jsonify({"error": "file not found or unreadable", "path": script_path}), 404

    segments = teacher.load_script(script_path)
    if not segments:
        return jsonify({"error": "no segments found", "path": script_path}), 404

    first_seg = segments[0]
    first_out = {
        "scene": first_seg.get("scene", ""),
        "content": first_seg.get("content", ""),
        "type": first_seg.get("type", "dialogue"),
        "is_interaction": teacher.is_interaction_point(first_seg)
    }

    return jsonify({
        "path": script_path,
        "first": first_out,
        "total": len(segments),
    })

@app.route("/api/ai_teacher/segment/<int:idx>", methods=["GET"])
def api_segment(idx):
    """
    按索引返回单段内容
    参数:
      file: 可选，剧本文件相对或绝对路径（默认 database 下的 DAY1.txt）
    返回:
      {"index": idx, "segment": {...}}
    """
    req_file = request.args.get("file", "DAY1.txt")
    script_path = resolve_script_path(req_file)

    segments = teacher.load_script(script_path)
    total = len(segments)
    if idx < 0 or idx >= total:
        return jsonify({"error": "index out of range", "total": total}), 404

    seg = segments[idx]
    out = {
        "index": idx,
        "scene": seg.get("scene", ""),
        "content": seg.get("content", ""),
        "type": seg.get("type", "dialogue"),
        "is_interaction": teacher.is_interaction_point(seg),
        "path": script_path,
        "total": total
    }
    return jsonify(out)

@app.route("/api/ai_teacher/next", methods=["POST"])
def api_next():
    """
    前端调用获取下一段文本。
    请求 JSON:
      {
        "file": "DAY1.txt",    # 可选，默认 DAY1.txt
        "current": 0,          # 当前已展示段的索引（int），如果省略则从 -1 开始（返回第0段）
        "step": 1              # 步长，可选，默认 1
      }
    返回 JSON:
      {
        "done": bool,          # 是否已经到末尾（没有更多段）
        "index": next_index,   # 本次返回段的索引（如果 done 为 true 则可能省略）
        "content": "...",      # 段落文本
        "scene": "...",
        "is_interaction": bool,
        "total": N,
        "path": "绝对路径"
      }
    """
    data = request.get_json(force=True, silent=True) or {}
    req_file = data.get("file", "DAY1.txt")
    current = data.get("current", None)
    step = data.get("step", 1)

    # 解析并容错
    try:
        cur = int(current) if current is not None else -1
    except Exception:
        return jsonify({"error": "invalid current index"}), 400
    try:
        step = int(step)
    except Exception:
        step = 1

    script_path = resolve_script_path(req_file)
    segments = teacher.load_script(script_path)
    total = len(segments)

    if total == 0:
        return jsonify({"error": "no segments found", "path": script_path}), 404

    next_idx = cur + step
    if next_idx < 0:
        next_idx = 0

    if next_idx >= total:
        # 已经到末尾
        return jsonify({"done": True, "total": total})

    seg = segments[next_idx]
    return jsonify({
        "done": False,
        "index": next_idx,
        "scene": seg.get("scene", ""),
        "content": seg.get("content", ""),
        "type": seg.get("type", "dialogue"),
        "is_interaction": teacher.is_interaction_point(seg),
        "total": total,
        "path": script_path
    })

# 新增：简单状态接口，便于调试（不要返回敏感信息）
@app.route("/__status", methods=["GET"])
def __status():
	# 返回实际 ACTIVE_PORT 与 LOCAL_IP（若未设置则退回配置或默认）
	port = None
	try:
		port = int(ACTIVE_PORT) if 'ACTIVE_PORT' in globals() and ACTIVE_PORT else None
	except Exception:
		port = None
	if not port:
		try:
			port = int(getattr(config, "PORT", None) or os.environ.get("PORT", 5000))
		except Exception:
			port = 5000
	return jsonify({"ok": True, "port": int(port), "host_ip": LOCAL_IP, "message": "backend running"})

# 在模块顶层（在 load_dotenv 之后）添加
ACTIVE_PORT = None

def _tcp_port_free(port: int) -> bool:
	"""尝试在 0.0.0.0:port 上绑定 TCP socket，若能绑定说明端口可用；否则返回 False。"""
	import socket
	s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
	try:
		s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
		s.bind(("0.0.0.0", int(port)))
		s.close()
		return True
	except OSError:
		try:
			s.close()
		except Exception:
			pass
		return False

# 获取本机对外可见IP（UDP连接到公网上的地址），失败时退回 hostname 解析
def get_local_ip():
	"""获取本机对外可见IP（UDP连接到公网上的地址），失败时退回 hostname 解析"""
	try:
		s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
		s.connect(("8.8.8.8", 80))
		ip = s.getsockname()[0]
		s.close()
		return ip
	except Exception:
		try:
			return socket.gethostbyname(socket.gethostname())
		except Exception:
			return "127.0.0.1"

# 预先计算本机IP供状态接口使用
LOCAL_IP = get_local_ip()

# 剧本缓存与简单检索（用于为 LLM 提供相关剧本上下文）
SCRIPT_CACHE = {}

def load_script_segments_cached(file_name="DAY1.txt"):
    if file_name in SCRIPT_CACHE:
        return SCRIPT_CACHE[file_name]
    path = resolve_script_path(file_name)
    segs = teacher.load_script(path)
    SCRIPT_CACHE[file_name] = segs
    return segs

def retrieve_script_context(question: str, file_name="DAY1.txt", top_k: int = 3):
    """
    简单基于关键词交集的弱检索：返回与 question 相关的剧本段落（最多 top_k 条）。
    若无匹配则返回前 top_k 段作为上下文。
    """
    segments = load_script_segments_cached(file_name)
    if not segments:
        return []
    q_words = set(re.findall(r'\w+', question.lower()))
    scores = []
    for seg in segments:
        text = seg.get("content", "") or ""
        words = set(re.findall(r'\w+', text.lower()))
        score = len(q_words & words)
        scores.append((score, text))
    scores.sort(key=lambda x: x[0], reverse=True)
    res = [t for s, t in scores if s > 0][:top_k]
    if not res:
        res = [t for s, t in scores][:top_k]
    return res

# 会话记忆（内存实现，按 client_id 存储最近消息）
MEMORIES = {}  # client_id -> list of {"role": "user"/"assistant", "text": "..."}

def append_memory(client_id: str, role: str, text: str, limit: int = 20):
    if not client_id:
        return
    lst = MEMORIES.setdefault(client_id, [])
    lst.append({"role": role, "text": text})
    if len(lst) > limit:
        del lst[0: len(lst) - limit]

def get_chat_history(client_id: str, last_n: int = 10):
    if not client_id:
        return []
    return MEMORIES.get(client_id, [])[-last_n:]

if __name__ == "__main__":
	try:
		port = getattr(config, "PORT", None)
	except Exception:
		port = None
	if not port:
		try:
			port = int(os.environ.get("PORT", 5000))
		except Exception:
			port = 5000

	# 不再直接退出，尝试备选端口范围
	if not _tcp_port_free(port):
		print(f"WARNING: TCP 端口 {port} 无法绑定，尝试查找备选端口 5001-5010 ...")
		found = False
		for p in range(5001, 5011):
			if _tcp_port_free(p):
				print(f"选择备用端口 {p}")
				port = p
				found = True
				break
		if not found:
			print(f"ERROR: 未找到可用的备用端口（5001-5010），请手动释放端口或使用其它机器端口。")
			print("建议排查命令： netstat -ano | findstr :5000")
			sys.exit(1)

	try:
		# 把最终端口写入 ACTIVE_PORT，便于状态接口或日志使用
		ACTIVE_PORT = int(port)
		print(f"Starting backend on 0.0.0.0:{ACTIVE_PORT} - frontend served from / (project/frontend)")
		print("DEBUG: sys.executable =", sys.executable)
		print("DEBUG: cwd =", os.getcwd())
		try:
			hostname = socket.gethostname()
			host_ip = socket.gethostbyname(hostname)
		except Exception:
			hostname, host_ip = "unknown", "unknown"
		print(f"DEBUG: hostname={hostname}, host_ip={host_ip}")
		print("DEBUG: You can test with: curl -i http://localhost:{port}/__status")
		print("DEBUG: or: curl -i http://127.0.0.1:{port}/api/echo")
		# debug=True 仍保留，但你可在生产关闭
		app.run(host="0.0.0.0", port=int(ACTIVE_PORT), debug=True, threaded=True)
	except Exception as e:
		print("Failed to start backend:", e)
		traceback.print_exc()
		print("提示：如果是 Windows，请确认防火墙没有阻止 Python 监听该端口；在 PowerShell 可运行：netstat -ano | findstr :{}".format(port))
		raise