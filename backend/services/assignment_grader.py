import ast
import json
import os
import re
import runpy
import shutil
import subprocess
import sys
import tempfile
import textwrap
import traceback
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional

BASE_DIR = Path(__file__).resolve().parent.parent
ASSETS_DIR = BASE_DIR / "eval_assets" / "titanic"
TRAIN_DATA_PATH = ASSETS_DIR / "train_public.csv"

# 允许常见本地模块，屏蔽网络/进程等高风险库
FORBIDDEN_IMPORTS = {
    "subprocess",
    "socket",
    "requests",
    "urllib",
    "http",
    "ftplib",
    "paramiko",
}

FORBIDDEN_CALLS = {"eval", "exec", "__import__", "compile"}

SCRIPT_ACCURACY_PATTERNS = [
    re.compile(r"accuracy\s*[:=]\s*(0\.\d{2,4})", re.IGNORECASE),
    re.compile(r"accuracy\s*[:=]\s*(\d{1,3})\s*%", re.IGNORECASE),
]


@dataclass
class ComplianceResult:
    score: int
    issues: List[str]
    syntax_ok: bool


@dataclass
class CodeAnalysis:
    mode: str  # "function" or "script"
    has_build_model: bool


def _check_compliance(code: str) -> ComplianceResult:
    try:
        tree = ast.parse(code)
    except SyntaxError as exc:
        return ComplianceResult(
            score=0,
            issues=[f"语法错误：{exc.msg}（第 {exc.lineno} 行）"],
            syntax_ok=False,
        )

    issues: List[str] = []

    class SafetyVisitor(ast.NodeVisitor):
        def visit_Import(self, node: ast.Import) -> None:
            for alias in node.names:
                base = alias.name.split(".")[0]
                if base in FORBIDDEN_IMPORTS:
                    issues.append(f"禁止导入模块：{alias.name}")
            self.generic_visit(node)

        def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
            base = (node.module or "").split(".")[0]
            if base in FORBIDDEN_IMPORTS:
                issues.append(f"禁止从模块导入：{node.module}")
            self.generic_visit(node)

        def visit_Call(self, node: ast.Call) -> None:
            target = ""
            if isinstance(node.func, ast.Name):
                target = node.func.id
            elif isinstance(node.func, ast.Attribute):
                target = node.func.attr
            if target in FORBIDDEN_CALLS:
                issues.append(f"禁止调用函数：{target}")
            self.generic_visit(node)

    SafetyVisitor().visit(tree)
    score = 10 if not issues else 0
    return ComplianceResult(score=score, issues=issues, syntax_ok=True)


def _analyse_code_mode(code: str) -> CodeAnalysis:
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return CodeAnalysis(mode="script", has_build_model=False)

    has_build_model = False
    has_main_guard = False
    top_level_executable = 0

    for node in tree.body:
        if isinstance(node, ast.FunctionDef) and node.name == "build_model":
            has_build_model = True
        elif isinstance(node, ast.If):
            # 检测 if __name__ == "__main__"
            compare = node.test
            if (
                isinstance(compare, ast.Compare)
                and isinstance(compare.left, ast.Name)
                and compare.left.id == "__name__"
                and any(
                    isinstance(comp, ast.Constant) and comp.value == "__main__"
                    for comp in compare.comparators
                )
            ):
                has_main_guard = True
        elif not isinstance(node, (ast.FunctionDef, ast.ClassDef, ast.Import, ast.ImportFrom)):
            top_level_executable += 1

    script_hint = has_main_guard or top_level_executable >= 3
    mode = "function" if has_build_model and not script_hint else "script"
    return CodeAnalysis(mode=mode, has_build_model=has_build_model)


def _build_function_runner() -> str:
    return textwrap.dedent(
        """
        import json
        import os
        import random
        import signal
        import sys
        import traceback

        import numpy as np
        import pandas as pd


        RESULT_PATH = "result.json"


        def limit_resources():
            try:
                import resource

                resource.setrlimit(resource.RLIMIT_CPU, (20, 20))
                max_bytes = 1024 * 1024 * 1024
                resource.setrlimit(resource.RLIMIT_AS, (max_bytes, max_bytes))
            except Exception:
                pass

            try:
                signal.alarm(30)
            except Exception:
                pass


        def load_student_module():
            import importlib.util

            spec = importlib.util.spec_from_file_location("student_solution", "student_solution.py")
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            return module


        def main():
            limit_resources()
            result = {
                "status": "error",
                "scores": {"run": 0, "effect": 0},
                "metrics": {},
                "messages": [],
                "traceback": "",
                "mode": "function",
            }

            train_path = os.environ.get("LP_TITANIC_TRAIN")
            if not train_path or not os.path.exists(train_path):
                result["messages"].append("评测数据缺失，请联系管理员。")
                with open(RESULT_PATH, "w", encoding="utf-8") as f:
                    json.dump(result, f, ensure_ascii=False)
                return

            random.seed(2024)
            np.random.seed(2024)

            try:
                full_df = pd.read_csv(train_path)
                if "Survived" not in full_df.columns:
                    raise ValueError("缺少 Survived 标签列。")

                indices = list(range(len(full_df)))
                random.shuffle(indices)

                holdout_size = max(1, int(len(indices) * 0.2))
                holdout_idx = set(indices[:holdout_size])

                train_df = full_df.loc[~full_df.index.isin(holdout_idx)].reset_index(drop=True)
                hidden_df = full_df.loc[full_df.index.isin(holdout_idx)].reset_index(drop=True)

                if len(train_df) == 0 or len(hidden_df) == 0:
                    raise ValueError("评测数据划分失败，请联系管理员。")

                features_hidden = hidden_df.drop(columns=["Survived"])
                labels_hidden = hidden_df["Survived"].reset_index(drop=True)

                student = load_student_module()

                if not hasattr(student, "build_model"):
                    raise AttributeError("学生代码需定义 build_model(train_df) 函数。")

                model = student.build_model(train_df.copy())

                if hasattr(student, "predict"):
                    preds = student.predict(model, features_hidden.copy())
                elif hasattr(model, "predict"):
                    preds = model.predict(features_hidden)
                else:
                    raise AttributeError(
                        "未找到预测函数。请实现 student.predict(model, features_df) 或让返回的模型实现 predict 方法。"
                    )

                preds_series = pd.Series(preds).reset_index(drop=True)
                if preds_series.isna().any():
                    raise ValueError("预测结果包含缺失值，请确保输出 0/1。")

                if len(preds_series) != len(labels_hidden):
                    raise ValueError("预测数量与隐藏集样本数量不一致。")

                preds_series = preds_series.astype(float).round().astype(int).clip(0, 1)

                accuracy = float((preds_series == labels_hidden).mean())

                result["status"] = "ok"
                result["scores"]["run"] = 20
                result["scores"]["effect"] = int(round(accuracy * 50))
                result["metrics"]["accuracy"] = accuracy

                result["messages"].append(
                    f"运行成功，隐藏集准确率 {accuracy:.3f}，得分 {result['scores']['effect']}/50。"
                )
            except Exception as exc:  # noqa: BLE001
                result["status"] = "error"
                result["messages"].append(str(exc))
                result["traceback"] = traceback.format_exc()

            with open(RESULT_PATH, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False)


        if __name__ == "__main__":
            try:
                main()
            finally:
                try:
                    signal.alarm(0)
                except Exception:
                    pass
        """
    )


def _build_script_runner() -> str:
    return textwrap.dedent(
        """
        import json
        import os
        import runpy
        import signal
        import traceback

        RESULT_PATH = "result.json"
        SCRIPT_PATH = "student_solution.py"


        def limit_resources():
            try:
                import resource

                resource.setrlimit(resource.RLIMIT_CPU, (20, 20))
                max_bytes = 1024 * 1024 * 1024
                resource.setrlimit(resource.RLIMIT_AS, (max_bytes, max_bytes))
            except Exception:
                pass

            try:
                signal.alarm(30)
            except Exception:
                pass


        def main():
            limit_resources()
            result = {
                "status": "ok",
                "messages": [],
                "mode": "script",
            }
            try:
                runpy.run_path(SCRIPT_PATH, run_name="__main__")
            except SystemExit as exc:
                code = exc.code if isinstance(exc.code, int) else 0
                if code not in (0, None):
                    result["status"] = "error"
                    result["messages"].append(f"脚本调用 sys.exit({code})")
            except Exception as exc:  # noqa: BLE001
                result["status"] = "error"
                result["messages"].append(str(exc))
                result["traceback"] = traceback.format_exc()

            with open(RESULT_PATH, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False)


        if __name__ == "__main__":
            try:
                main()
            finally:
                try:
                    signal.alarm(0)
                except Exception:
                    pass
        """
    )


def _parse_accuracy(stdout: str) -> Optional[float]:
    candidates: List[float] = []
    for pattern in SCRIPT_ACCURACY_PATTERNS:
        for match in pattern.finditer(stdout):
            value = match.group(1)
            if value.endswith("%"):
                continue
            # 百分比模式已拆分
            if "%" in match.group(0):
                try:
                    percent_value = float(value)
                    candidates.append(percent_value / 100.0)
                except ValueError:
                    continue
            else:
                try:
                    candidates.append(float(value))
                except ValueError:
                    continue
    return max(candidates) if candidates else None


def _map_accuracy_to_effect_score(accuracy: Optional[float]) -> int:
    if accuracy is None:
        return 25
    if accuracy >= 0.85:
        return 50
    if accuracy >= 0.80:
        return 45
    if accuracy >= 0.75:
        return 40
    if accuracy >= 0.70:
        return 35
    if accuracy >= 0.60:
        return 30
    return 25


def grade_titanic_assignment(code: str) -> Dict:
    compliance = _check_compliance(code)
    if not compliance.syntax_ok:
        return {
            "totalScore": 0,
            "scores": {"run": 0, "compliance": 0, "effect": 0},
            "messages": compliance.issues,
            "logs": {"stdout": "", "stderr": ""},
            "mode": "syntax-error",
        }

    analysis = _analyse_code_mode(code)

    if compliance.issues:
        return {
            "totalScore": 0,
            "scores": {"run": 0, "compliance": 0, "effect": 0},
            "messages": compliance.issues,
            "logs": {"stdout": "", "stderr": ""},
            "mode": analysis.mode,
        }

    if analysis.mode == "function" and analysis.has_build_model:
        return _grade_function_submission(code, compliance)

    return _grade_script_submission(code, compliance)


def _grade_function_submission(code: str, compliance: ComplianceResult) -> Dict:
    if not TRAIN_DATA_PATH.exists():
        return {
            "totalScore": 0,
            "scores": {"run": 0, "compliance": 0, "effect": 0},
            "messages": ["评测数据缺失，请联系管理员。"],
            "logs": {"stdout": "", "stderr": ""},
            "mode": "function",
        }

    with tempfile.TemporaryDirectory(prefix="lp_grade_func_") as tmp_dir:
        tmp_path = Path(tmp_dir)
        (tmp_path / "student_solution.py").write_text(code, encoding="utf-8")
        runner_path = tmp_path / "runner.py"
        runner_path.write_text(_build_function_runner(), encoding="utf-8")

        env = {
            "PYTHONPATH": tmp_dir,
            "LP_TITANIC_TRAIN": str(TRAIN_DATA_PATH),
        }
        for key in ["PATH", "HOME", "LANG", "LC_ALL"]:
            if key in os.environ:
                env[key] = os.environ[key]

        try:
            completed = subprocess.run(
                [sys.executable, str(runner_path)],
                cwd=tmp_dir,
                timeout=40,
                capture_output=True,
                text=True,
                env=env,
            )
        except subprocess.TimeoutExpired:
            return {
                "totalScore": compliance.score,
                "scores": {"run": 0, "compliance": compliance.score, "effect": 0},
                "messages": ["执行超时，请优化代码或降低训练开销。"],
                "logs": {"stdout": "", "stderr": ""},
                "mode": "function",
            }

        result_path = tmp_path / "result.json"
        if not result_path.exists():
            messages = ["评测失败：未生成结果文件。"]
            if completed.stderr:
                messages.append("stderr: " + completed.stderr.strip())
            return {
                "totalScore": compliance.score,
                "scores": {"run": 0, "compliance": compliance.score, "effect": 0},
                "messages": messages,
                "logs": {"stdout": completed.stdout, "stderr": completed.stderr},
                "mode": "function",
            }

        result = json.loads(result_path.read_text(encoding="utf-8"))
        run_score = int(result["scores"].get("run", 0))
        effect_score = int(result["scores"].get("effect", 0))

        total = compliance.score + run_score + effect_score
        messages = result.get("messages", [])

        if result.get("status") != "ok" and result.get("traceback"):
            messages.append("运行堆栈：")
            messages.append(result["traceback"])

        return {
            "totalScore": total,
            "scores": {
                "run": run_score,
                "compliance": compliance.score,
                "effect": effect_score,
            },
            "metrics": result.get("metrics", {}),
            "messages": messages,
            "logs": {
                "stdout": completed.stdout,
                "stderr": completed.stderr,
            },
            "mode": "function",
        }


def _grade_script_submission(code: str, compliance: ComplianceResult) -> Dict:
    if not TRAIN_DATA_PATH.exists():
        return {
            "totalScore": 0,
            "scores": {"run": 0, "compliance": 0, "effect": 0},
            "messages": ["评测数据缺失，请联系管理员。"],
            "logs": {"stdout": "", "stderr": ""},
            "mode": "script",
        }

    with tempfile.TemporaryDirectory(prefix="lp_grade_script_") as tmp_dir:
        tmp_path = Path(tmp_dir)
        (tmp_path / "student_solution.py").write_text(code, encoding="utf-8")
        runner_path = tmp_path / "runner.py"
        runner_path.write_text(_build_script_runner(), encoding="utf-8")

        # 准备多套数据路径，兼容常见写法
        local_data_dir = tmp_path / "data"
        local_data_dir.mkdir(exist_ok=True)
        shutil.copy(TRAIN_DATA_PATH, local_data_dir / "train.csv")
        shutil.copy(TRAIN_DATA_PATH, tmp_path / "train.csv")

        parent_data_dir = tmp_path.parent / "data"
        created_parent_dir = False
        created_parent_file = False
        try:
            if not parent_data_dir.exists():
                parent_data_dir.mkdir(parents=True, exist_ok=True)
                created_parent_dir = True
            target_parent_file = parent_data_dir / "train.csv"
            if not target_parent_file.exists():
                shutil.copy(TRAIN_DATA_PATH, target_parent_file)
                created_parent_file = True
        except Exception:
            # 如果父级目录不可写则忽略
            created_parent_dir = False
            created_parent_file = False

        env = {
            "PYTHONPATH": tmp_dir,
            "LP_TITANIC_TRAIN": str(TRAIN_DATA_PATH),
            "LP_COMPAT_TRAIN_PATH": str(TRAIN_DATA_PATH),
        }
        for key in ["PATH", "HOME", "LANG", "LC_ALL"]:
            if key in os.environ:
                env[key] = os.environ[key]

        try:
            completed = subprocess.run(
                [sys.executable, str(runner_path)],
                cwd=tmp_dir,
                timeout=40,
                capture_output=True,
                text=True,
                env=env,
            )
        except subprocess.TimeoutExpired:
            _cleanup_parent_dataset(created_parent_dir, created_parent_file, parent_data_dir)
            return {
                "totalScore": compliance.score,
                "scores": {"run": 0, "compliance": compliance.score, "effect": 0},
                "messages": ["脚本执行超时，请尝试减少训练量或输出。"],
                "logs": {"stdout": "", "stderr": ""},
                "mode": "script",
            }

        result_path = Path(tmp_dir) / "result.json"

        _cleanup_parent_dataset(created_parent_dir, created_parent_file, parent_data_dir)

        if not result_path.exists():
            messages = ["脚本评测失败：未生成结果文件。"]
            if completed.stderr:
                messages.append("stderr: " + completed.stderr.strip())
            return {
                "totalScore": compliance.score,
                "scores": {"run": 0, "compliance": compliance.score, "effect": 0},
                "messages": messages,
                "logs": {"stdout": completed.stdout, "stderr": completed.stderr},
                "mode": "script",
            }

        result = json.loads(result_path.read_text(encoding="utf-8"))
        run_score = 20 if result.get("status") == "ok" else 0

        stdout_text = completed.stdout or ""
        accuracy = _parse_accuracy(stdout_text)
        effect_score = _map_accuracy_to_effect_score(accuracy) if run_score else 0

        messages = result.get("messages", [])
        if accuracy is not None:
            messages.append(f"脚本输出解析到 accuracy ≈ {accuracy:.3f}，估算得分 {effect_score}/50。")
        else:
            messages.append("未在输出中解析到 accuracy，请打印形如 'Accuracy: 0.82' 的行以获得更高分。")

        if result.get("status") != "ok" and result.get("traceback"):
            messages.append("运行堆栈：")
            messages.append(result["traceback"])

        total = compliance.score + run_score + effect_score

        return {
            "totalScore": total,
            "scores": {
                "run": run_score,
                "compliance": compliance.score,
                "effect": effect_score,
            },
            "metrics": {"parsedAccuracy": accuracy},
            "messages": messages,
            "logs": {
                "stdout": stdout_text,
                "stderr": completed.stderr,
            },
            "mode": "script",
        }


def _cleanup_parent_dataset(created_dir: bool, created_file: bool, parent_dir: Path) -> None:
    try:
        if created_file:
            target_file = parent_dir / "train.csv"
            if target_file.exists():
                target_file.unlink()
        if created_dir:
            if parent_dir.exists():
                parent_dir.rmdir()
    except Exception:
        pass
