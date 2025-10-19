export const day1Lesson = {
  id: 'nn',
  title: '神经网络入门',
  estimatedDuration: '约20分钟',
  intro: '以图像识别和语音助手为例，带你在一节课内理解神经网络的来龙去脉、基础流程以及实战路径。',
  segments: [
    {
      id: 'intro',
      title: '开场 · 进入AI的奇妙世界',
      duration: '1.5分钟',
      type: 'lecture',
      speaker: 'AI教师',
      hero: '热情欢迎并建立学习动机',
      transcript: [
        '同学们早上好！欢迎来到人工智能的"魔法学院"！今天我们要完成一项超酷的任务——用20分钟揭开神经网络的神秘面纱。但别以为这只是走马观花，我会带你们深入底层逻辑，从数学公式到代码实现，从历史争议到前沿突破！',
        '想象一下，你手机里的语音助手如何理解你的方言？短视频平台的推荐算法怎样精准预测你的喜好？甚至医院里的癌症筛查系统如何从像素级影像中捕捉病变？这些背后都藏着今天要讲的"黑科技"——神经网络。',
        '课程里不仅有烧脑的理论，还有能让你亲手"调教"AI的编程环节！现在请打开你们的笔记本电脑（或手机），准备进入机器学习的奇妙世界！'
      ],
      keyPoints: [
        '神经网络是当今多数智能产品的核心技术',
        '课程将结合故事、数据与实践引导逐步理解'
      ]
    },
    {
      id: 'warmup-quiz',
      title: '互动提问（开场热身） · 什么是神经网络核心特征？',
      type: 'quiz',
      question: '在正式开始前，先考考你们的直觉：以下哪项不是神经网络的核心特征？',
      options: [
        { key: 'A', text: '模仿人类神经元的连接方式' },
        { key: 'B', text: '通过反向传播自动调整参数' },
        { key: 'C', text: '完全依赖程序员手动编写所有规则' },
        { key: 'D', text: '需要海量数据进行训练' }
      ],
      answer: 'C',
      explanation: '神经网络的精髓正是"从数据中学习"，而非硬编码规则。那些认为AI只是"高级自动化"的人，往往低估了它的自适应能力。'
    },
    {
      id: 'history',
      title: '1.1 定义与历史背景',
      duration: '约6分钟',
      type: 'lecture',
      speaker: 'AI教师',
      hero: '穿越神经网络的发展时间线',
      video: {
        src: '//player.bilibili.com/player.html?bvid=BV15q421A7tB&page=1',
        title: '神经网络发展历程'
      },
      transcript: [
        '别看现在AI这么火，它的"祖师爷"其实是70多年前的两个学霸——心理学家McCulloch和数学家Pitts。他们当时用灯泡的亮灭模拟人类神经元的"开"和"关"，但这个初代模型特别笨，只能解决"与或非"这类逻辑问题。',
        '直到1958年，Frank Rosenblatt提出感知机（Perceptron），引入了可学习的权重参数，这才让AI能处理更复杂的模式。但真正的突破发生在2006年，Hinton教授带着预训练+微调方法，让深层网络终于能"长大成人"。',
        '最经典的案例就是2012年的AlexNet，它把图片识别的错误率从26%砍到15%，相当于让AI的视力从"近视800度"变成"戴眼镜的正常人"！AlexNet的关键创新包括使用ReLU激活函数、Dropout层和GPU并行计算。'
      ],
      keyPoints: [
        '1943年McCulloch-Pitts模型奠定基础',
        '2006年Hinton的预训练方法开启深度学习新时代',
        'AlexNet在2012年ImageNet比赛上取得突破性成果'
      ],
      mediaPlaceholder: '历史故事动画占位'
    },
    {
      id: 'history-quiz',
      title: '互动提问 · 早期神经网络为何发展缓慢？',
      type: 'quiz',
      question: '在回顾AI发展历程时，我们发现感知机在1960年代遭遇了"寒冬"。这一现象背后有着特定的原因，现在请思考一下，下面哪个选项准确指出了导致感知机陷入"寒冬"的主要因素呢？',
      options: [
        { key: 'A', text: '数学家证明其无法解决异或问题' },
        { key: 'B', text: '政府停止了对AI的资助' },
        { key: 'C', text: '计算机内存不足导致无法训练' },
        { key: 'D', text: '公众对AI产生恐惧心理' }
      ],
      answer: 'A',
      explanation: '1969年，Minsky和Papert在《感知机》一书中证明，单层感知机无法解决线性不可分问题（如异或运算），这直接导致第一次AI寒冬。但20年后，多层感知机和反向传播算法的诞生彻底打破了这一局限。'
    },
    {
      id: 'relationship',
      title: '1.2 AI、机器学习与神经网络的关系',
      type: 'lecture',
      transcript: [
        '这三个概念就像俄罗斯套娃：最外层是人工智能（AI）——让机器像人一样思考；中间层是机器学习（ML）——教机器通过数据"自学"；最核心的是神经网络（NN）——ML里最厉害的"学霸"。',
        '传统棋类AI要程序员手写"如果对手下这里，我就下那里"的规则，而AlphaGo直接通过神经网络+强化学习，自己摸索出了"神之一手"！这里有个关键区别：规则驱动的AI像"提线木偶"，数据驱动的AI则是"会自我进化的生命体"。',
        '神经网络在感知类任务（图像、语音、自然语言）中占据绝对优势，但在结构化数据预测（如金融风控）中，轻量级的传统算法可能更高效。就像飞机与汽车——前者适合跨洋飞行，后者适合城市通勤。'
      ],
      keyPoints: [
        'AI ⊃ ML ⊃ NN 的套娃关系',
        '神经网络擅长在复杂数据上发现模式',
        '不同算法各有适用场景，需要根据任务选择'
      ],
      mediaPlaceholder: '三层蛋糕图示占位'
    },
    {
      id: 'structure',
      title: '1.3 神经网络的基本结构',
      type: 'lecture',
      transcript: [
        '以28x28像素的手写数字"7"为例，神经网络这样"看懂"它：输入层把图片展开成784个数字，每个数字代表一个像素的灰度值；',
        '隐藏层用128个"数学滤镜"提取特征（比如第一层找横线，第二层找斜线，第三层组合成数字轮廓）；',
        '输出层给出0-9的概率（比如90%确定是"7"，5%可能是"1"）。光第一层就有784×128=10万个参数！相当于让AI记住10万本电话簿。',
        '但参数多也意味着风险——如果数据有偏差，AI可能学会"作弊"。比如早期猫狗分类器曾通过背景中的草地判断动物种类，而非真正识别动物特征。'
      ],
      keyPoints: [
        '输入层节点数由特征维度决定',
        '隐藏层通过多层变换提取高级特征',
        '输出层激活函数取决于任务类型（分类用Softmax，回归可不用）'
      ],
      mediaPlaceholder: 'MNIST 手写数字演示占位'
    },
    {
      id: 'ml-types',
      title: '2.1 机器学习的主要类型',
      duration: '5分钟',
      type: 'lecture',
      transcript: [
        '机器学习就像教动物学技能：监督学习给动物看图片+答案，让它学会分类，典型任务包括图像分类、文本情感分析；',
        '无监督学习扔一堆数据让动物自己找规律，比如电商用户分群、基因表达聚类；',
        '强化学习让动物做对动作就给奖励，做错就扣分，AlphaGo、自动驾驶都是它的应用场景。',
        '2023年数据显示，70%的工业应用都在用监督学习，但无监督学习正在崛起——比如ChatGPT的预训练阶段就使用了无监督的"自回归"任务。'
      ],
      keyPoints: [
        '监督学习在工业界应用占比超过70%',
        '无监督学习适合探索性数据分析',
        '强化学习在决策类任务中表现突出'
      ],
      mediaPlaceholder: '学习类型对比图占位'
    },
    {
      id: 'ml-workflow',
      title: '2.2 机器学习项目的工作流程',
      type: 'lecture',
      transcript: [
        '假设我们要教AI看X光片找肺炎：数据收集阶段从医院借来1万张脱敏后的片子，但要注意数据偏差——如果主要收集城市患者的片子，AI可能对农村患者的病变不敏感；',
        '特征工程阶段，传统方法要医生手动圈出病变区域，深度学习则让AI自己"找亮点"，但"黑盒"特性也带来风险；',
        '模型选择可以直接用现成的ResNet50，就像用预制菜做大餐；也可以定制网络，比如加入"注意力机制"让AI优先关注肺部区域；',
        '训练评估用80%数据训练，10%调参数，最后10%测试。重点提醒：千万别把测试数据混进训练集，就像不能偷看考试答案！'
      ],
      keyPoints: [
        '数据质量决定模型上限，特征工程决定模型下限',
        '80/10/10是常见的数据划分策略',
        '严格区分测试集，杜绝"提前看答案"'
      ],
      mediaPlaceholder: 'X 光诊断流程占位'
    },
    {
      id: 'linear-regression',
      title: '2.3 线性回归详解',
      type: 'lecture',
      transcript: [
        '最简单的机器学习——预测房价：输入是房子面积（比如80平米），输出是价格（比如500万），模型是y = wx + b（w是"每平米多少钱"，b是"基础价"）；',
        '训练时就像调收音机频率：如果预测520万（实际500万），就往回拧点w；如果预测480万，就往前拧点；',
        '但现实中的房价受多种因素影响（位置、装修、学区），这时候就需要多元线性回归：y = w1x1 + w2x2 + ... + wnxn + b。'
      ],
      keyPoints: [
        '线性回归是机器学习的基础模型',
        '梯度下降负责寻找最优参数组合',
        '多元线性回归可以处理多个特征'
      ],
      mediaPlaceholder: '房价坐标图占位'
    },
    {
      id: 'linear-quiz',
      title: '互动提问 · 异常值会怎样影响线性回归？',
      type: 'quiz',
      question: '如果数据里有个10平米"豪宅"卖1000万，线性回归会怎样？',
      options: [
        { key: 'A', text: '假装没看见' },
        { key: 'B', text: '拼命讨好这个异常值' },
        { key: 'C', text: '自动删掉它' },
        { key: 'D', text: '用鲁棒回归方法降低其影响' }
      ],
      answer: 'B',
      explanation: '线性回归本身缺乏异常值"免疫力"，会被极端值"牵着鼻子走"。那些认为"模型会自动处理异常"的想法，就像认为"厨师会自动去掉食材里的沙子"一样天真。'
    },
    {
      id: 'forward-backprop',
      title: '3.1 神经网络如何学习：前向与反向传播',
      type: 'lecture',
      transcript: [
        '前向传播就像流水线：输入层"倒"进像素数据，隐藏层用"卷积核"过滤器提取特征（比如找出"车轮""车门"），输出层用Softmax"投票"决定是"汽车"还是"卡车"；',
        '反向传播则是"倒带追责"：如果输出错了，就从输出层开始，一层层算"谁该背锅"，然后调整权重；',
        '这里有个绝招——随机梯度下降（SGD）：每次只拿一张图片训练，虽然"眼光短浅"，但能避免陷入"死胡同"。不过SGD可能像"醉汉走路"一样震荡，这时候就需要动量法来加速收敛。'
      ],
      keyPoints: [
        '前向传播计算预测结果',
        '反向传播通过链式法则计算梯度',
        '随机梯度下降平衡训练效率与收敛稳定性'
      ],
      mediaPlaceholder: '前向/反向传播流程图占位'
    },
    {
      id: 'activations',
      title: '3.2 激活函数的性格对比',
      type: 'lecture',
      transcript: [
        '激活函数就像神经元的"性格"：Sigmoid是温柔型（输出0-1），但容易"累瘫"（梯度消失）；',
        'Tanh是暴躁型（输出-1到1），力气更大但同样存在梯度消失问题；',
        'ReLU是直男型（x>0时原样输出），但可能"罢工"（x<0时输出0）；它的变体LeakyReLU解决了"神经元死亡"问题；',
        'Swish是最新"网红"，就像会"自我激励"的员工，在多项任务中表现更好，它的平滑性使得梯度流动更顺畅。'
      ],
      keyPoints: [
        'Sigmoid和Tanh容易饱和导致梯度消失',
        'ReLU及其变体缓解梯度消失问题',
        '不同激活函数适用于不同网络结构'
      ],
      mediaPlaceholder: '激活函数曲线对比占位'
    },
    {
      id: 'loss-optimizer',
      title: '3.3 损失函数与优化器',
      type: 'lecture',
      transcript: [
        '损失函数就是AI的"扣分表"：预测越错，扣分越多。分类任务常用交叉熵损失，就像打靶时离中心越远，扣分呈指数增长；回归任务则用均方误差（MSE）；',
        '优化器则是"训练教练"：SGD是老派教练，每次只纠正一个动作，简单但收敛慢；',
        'Adam是智能教练，能根据学员特点调整训练强度（自适应学习率），还能记住之前的错误（动量）；它的参数β1控制动量，β2控制自适应学习率；',
        'Adagrad适合处理稀疏梯度，RMSprop是Adagrad的改进版，解决了学习率单调下降的问题。'
      ],
      keyPoints: [
        '损失函数衡量模型预测与真实值的差距',
        '优化器决定参数更新的策略和步长',
        'Adam结合了动量法和自适应学习率的优点'
      ],
      mediaPlaceholder: '打靶例子 + 优化器对比占位'
    },
    {
      id: 'applications',
      title: '4.1 神经网络的跨领域应用',
      duration: '2.5分钟',
      type: 'lecture',
      transcript: [
        '神经网络现在是"全能选手"：计算机视觉从支付宝刷脸到自动驾驶看红绿灯，但也曾闹出笑话——2020年某AI将黑人误判为"大猩猩"，暴露了数据偏差问题；',
        '自然语言处理让ChatGPT能写情书、编代码，甚至通过图灵测试，但也可能生成虚假信息；',
        '科学计算方面，AlphaFold破解蛋白质结构，相当于提前"预知"生命的密码；',
        '艺术创作上，Stable Diffusion让"文生图"成为现实，但AI生成的艺术品缺乏"灵魂"的争议从未停止。'
      ],
      keyPoints: [
        '神经网络已深入工业、科研与创意领域',
        '不同领域需要针对性的网络结构和训练方法',
        '理解核心原理能帮助我们判断技术边界'
      ],
      mediaPlaceholder: '多行业案例轮播占位'
    },
    {
      id: 'coding',
      title: '4.2 编程实践 · 泰坦尼克号幸存预测',
      type: 'lecture',
      transcript: [
        '现在轮到你们动手了！请完成"泰坦尼克号幸存预测任务"：首先加载数据，使用Pandas读取CSV文件；',
        '然后进行数据预处理，处理缺失值（如用中位数填充年龄）、编码分类变量（如性别转为0/1）；',
        '接着搭建模型，用Keras的"乐高积木"构建网络结构；编译模型时选择损失函数（binary_crossentropy）和优化器（Adam）；',
        '训练模型让AI"做10套卷子"，最后测试效果，计算准确率、精确率、召回率。如果准确率始终50%，可能是模型未收敛；如果训练准确率高但测试准确率低，可能是过拟合。'
      ],
      keyPoints: [
        '遵循标准的数据预处理流程',
        '合理选择模型结构和超参数',
        '通过验证集监控模型性能防止过拟合'
      ],
      mediaPlaceholder: 'Notebook 演示占位'
    },
    {
      id: 'summary',
      title: '课程总结与下节预告',
      duration: '1分钟',
      type: 'lecture',
      transcript: [
        '今天我们解锁了三大成就：穿越时空，从1943年的初代模型到现代深度学习；拆解了机器学习的"流水线"；搞懂了神经网络如何"反向改作业"；',
        '课后请完成泰坦尼克号预测练习，思考还有哪些任务可以应用类似流程；',
        '下节课我们将深入CNN进阶，揭秘如何让AI"看懂"视频、"听懂"方言。记得完成今天的编程作业，我们下次课见！'
      ],
      keyPoints: [
        '理解历史发展、核心流程与训练机制',
        '实践是巩固理论知识的最佳途径',
        '为后续学习卷积神经网络打下基础'
      ],
      mediaPlaceholder: '课程徽章展示占位'
    }
  ]
}

// 新增：自动探测可用后端基地址并缓存
async function _probeUrl(url, timeout = 2000) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { method: 'GET', signal: controller.signal, mode: 'cors' });
    clearTimeout(timer);
    return res && (res.ok || res.status === 200 || res.status === 404); // 404 说明到了该主机但路径不存在（可认为可达）
  } catch (e) {
    return false;
  }
}

async function findWorkingBackend() {
  // 优先使用缓存的可用地址，缓存键名
  const cacheKey = 'tts_backend_base_working';
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname || 'localhost';
  // 常见端口，包含你提到的 8080
  const ports = [5000, 5001, 5002, 8000, 8080, 5010];
  const variants = [];

  // 构造候选（优先 localhost/127.0.0.1，再 hostname）
  for (const p of ports) {
    variants.push(`http://localhost:${p}`);
    variants.push(`http://127.0.0.1:${p}`);
    variants.push(`http://${hostname}:${p}`);
  }
  // 最后尝试相对路径（适用于已配置 proxy 或同域）
  variants.push("");

  for (const base of variants) {
    try {
      // 测试两个常用探测路径：/__status 优先，否则 /api/health
      if (base === "") {
        // 相对路径检测
        if (await _probeUrl('/__status') || await _probeUrl('/api/health')) {
          localStorage.setItem(cacheKey, "");
          return "";
        }
      } else {
        const statusUrl = (base.replace(/\/$/,"")) + '/__status';
        const healthUrl = (base.replace(/\/$/,"")) + '/api/health';
        if (await _probeUrl(statusUrl) || await _probeUrl(healthUrl)) {
          localStorage.setItem(cacheKey, base);
          return base;
        }
      }
    } catch (e) {
      // 忽略，尝试下一个
      continue;
    }
  }
  return null;
}

// 更新：调用后端 TTS 并返回 Audio 对象（不一定立即播放）
// 现在支持 opts.autoplay (默认 true)；若 autoplay=false 则只构建 Audio 返回，不调用 play()
export async function playTextTTS(text, opts = {}) {
  if (!text) return null;
  const timeoutMs = opts.timeoutMs || 15000;
  const autoplay = opts.autoplay !== undefined ? !!opts.autoplay : true;

  const base = await findWorkingBackend();
  if (base === null) {
    alert('无法找到可用的后端 TTS 服务。请确认后端已启动并监听常见端口（如 5000/8080 等）。');
    return null;
  }

  const baseUrl = (base === "" ? "" : base.replace(/\/$/,""));
  const url = (baseUrl || "") + "/api/ai_teacher/tts";

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      localStorage.removeItem('tts_backend_base_working');
      const errJson = await res.json().catch(()=>({}));
      console.error('TTS HTTP error', res.status, errJson);
      alert('后端 TTS 服务返回错误，请查看后端日志。');
      return null;
    }

    const j = await res.json().catch(()=>({}));
    if (!j || !j.url) {
      localStorage.removeItem('tts_backend_base_working');
      alert('后端未返回音频 URL。');
      return null;
    }

    // 将相对路径转为绝对 URL（如果返回的是相对路径）
    let audioUrl = j.url;
    if (audioUrl.startsWith("/")) {
      const hostBase = baseUrl || window.location.origin;
      audioUrl = hostBase.replace(/\/$/,"") + audioUrl;
    } else if (!/^https?:\/\//i.test(audioUrl)) {
      const hostBase = baseUrl || window.location.origin;
      audioUrl = hostBase.replace(/\/$/,"") + "/" + audioUrl.replace(/^\//,"");
    }

    const audio = new Audio(audioUrl);
    audio.crossOrigin = 'anonymous';
    if (autoplay) {
      await audio.play().catch(()=>{ /* 用户手势限制可能阻止自动播放 */ });
    }
    return audio;
  } catch (e) {
    console.error('playTextTTS error', e);
    localStorage.removeItem('tts_backend_base_working');
    alert('请求后端 TTS 失败，请确认后端已启动并可通过网络访问。');
    return null;
  }
}

// 新增：判断当前是否在课程页 /lesson/nn（支持 pathname 与 hash）
function _isLessonNNPage() {
	try {
		if (typeof window === 'undefined') return false;
		const p = (window.location && window.location.pathname) ? window.location.pathname : '';
		const h = (window.location && window.location.hash) ? window.location.hash : '';
		// 支持 /lesson/nn 或 /lesson/nn/xxx，也支持 hash 模式 #/lesson/nn
		if (/\/lesson\/nn(?:\/|$)/.test(p)) return true;
		if (/#\/?lesson\/nn(?:\/|$)/.test(h)) return true;
		return false;
	} catch (e) {
		return false;
	}
}

// 替换：自动在页面右下角注入一个“朗读课程”浮动按钮（仅在 /lesson/nn 页面注入）
// 新逻辑保持不变，但增加页面判断以避免在其它页面出现按钮
(function _injectTTSButton(){
  try {
    if (typeof document === 'undefined') return;
    // 仅在课程页面注入按钮
    if (!_isLessonNNPage()) return;
    if (document.getElementById('tts-play-button')) return;

    // 全局播放器对象：存放 current Audio、段文本数组、当前索引、状态
    window._aiTtsPlayer = window._aiTtsPlayer || { audio: null, segmentsText: [], index: 0, playing: false };

    const btn = document.createElement('button');
    btn.id = 'tts-play-button';
    btn.textContent = '朗读课程';
    Object.assign(btn.style, {
      position: 'fixed',
      right: '16px',
      bottom: '16px',
      zIndex: 9999,
      padding: '10px 14px',
      background: '#0b79d0',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    });
    btn.title = '朗读本课程（中英文混合）';

    // 把 day1Lesson 分段为若干可读文本（每个元素为一小节）
    function _collectTranscriptSegments() {
      const segments = [];
      for (const seg of day1Lesson.segments || []) {
        if (Array.isArray(seg.transcript)) {
          const txt = seg.transcript.join(' ');
          if (txt && txt.trim()) segments.push(txt.trim());
        } else if (typeof seg.transcript === 'string') {
          const txt = seg.transcript.trim();
          if (txt) segments.push(txt);
        }
      }
      return segments;
    }

    // 清理播放资源
    function _cleanupPlayer() {
      try {
        const p = window._aiTtsPlayer;
        if (p && p.audio) {
          try { p.audio.pause(); } catch (e) {}
          try { p.audio.src = ""; } catch (e) {}
        }
      } catch (e) {}
      window._aiTtsPlayer.audio = null;
      window._aiTtsPlayer.playing = false;
      btn.disabled = false;
      btn.textContent = '朗读课程';
    }

    btn.addEventListener('click', async () => {
      try {
        const player = window._aiTtsPlayer;
        // 如果没有已加载的段文本，初始化
        if (!player.segmentsText || player.segmentsText.length === 0) {
          player.segmentsText = _collectTranscriptSegments();
          player.index = 0;
        }

        // 若当前有 audio 且正在播放 -> 暂停当前播放
        if (player.audio && !player.audio.paused && !player.audio.ended) {
          player.audio.pause();
          player.playing = false;
          btn.textContent = '继续朗读';
          return;
        }

        // 若当前有 audio 且是暂停状态（未结束） -> 恢复播放该段
        if (player.audio && player.audio.paused && !player.audio.ended) {
          try {
            await player.audio.play();
            player.playing = true;
            btn.textContent = '播放中...';
          } catch (e) {
            // 恢复失败，重新生成并播放当前段
            console.warn('resume failed, regenerating segment', e);
            player.audio = null;
          }
          return;
        }

        // 若没有 audio（首次或上一段已结束），播放当前索引的段
        if (player.index >= (player.segmentsText || []).length) {
          // 播放完毕，重新从头开始
          player.index = 0;
        }

        const segText = (player.segmentsText || [])[player.index];
        if (!segText) {
          alert('没有可朗读的段落。');
          return;
        }

        btn.disabled = true;
        btn.textContent = '生成语音中...';

        // 生成当前段的 Audio（不自动播放），然后调用 play()
        const audio = await playTextTTS(segText, { autoplay: false });
        if (!audio) {
          btn.disabled = false;
          btn.textContent = '朗读课程';
          return;
        }

        // 保存 audio 并播放
        player.audio = audio;
        try {
          await audio.play();
        } catch (e) {
          console.warn('play failed after generation', e);
        }
        player.playing = true;
        btn.disabled = false;
        btn.textContent = '播放中...';

        // 当段播放结束时：自动停（不连播），更新按钮为继续，并将索引指向下一段
        audio.onended = () => {
          player.playing = false;
          player.audio = null; // 清掉已结束的 audio
          // 增加索引到下一段，但不自动播放
          player.index = Math.min(player.index + 1, (player.segmentsText || []).length);
          btn.textContent = player.index >= (player.segmentsText || []).length ? '朗读结束' : '继续朗读';
        };
        audio.onpause = () => {
          if (audio && !audio.ended) btn.textContent = '继续朗读';
        };
        audio.onplay = () => {
          btn.textContent = '播放中...';
        };
      } catch (err) {
        console.error('TTS button error', err);
        btn.disabled = false;
        btn.textContent = '朗读课程';
      }
    });

    document.body.appendChild(btn);
  } catch (e) { /* 安静失败，不影响页面其它功能 */ }
})();

export function getTranscriptSegments() {
	// ...existing code...
}

// 新增：设置焦点段（仅停止当前播放并记录索引，不自动播放）
export function setFocusSegment(index) {
  const segments = getTranscriptSegments();
  if (!Array.isArray(segments) || index < 0 || index >= segments.length) return null;
  // 停止当前播放但不触发播放
  stopCurrentTTS();
  window._aiTtsPlayer = window._aiTtsPlayer || { audio: null, segmentsText: [], index: 0, playing: false };
  window._aiTtsPlayer.segmentsText = segments;
  window._aiTtsPlayer.index = index;
  window._aiTtsPlayer.playing = false;
  // 更新按钮文本（若存在）
  const btn = document.getElementById('tts-play-button');
  if (btn) btn.textContent = '继续朗读';
  return true;
}

export function setFocusSegmentById(id) {
  if (!id) return null;
  const idx = _findSegmentIndexById(id);
  if (idx === -1) return null;
  // 尝试滚动到对应内容区域（按 data-seg-index 或 id 匹配）
  try {
    const elByIndex = document.querySelector(`[data-seg-index="${idx}"]`);
    const elById = document.querySelector(`#${CSS.escape(id)}`);
    const target = elByIndex || elById;
    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  } catch (e) { /* ignore */ }
  return setFocusSegment(idx);
}

// 修改：bindOutlineClicks 不再直接播放，而是设置焦点并停止当前播放（并滚动到对应位置）
export function bindOutlineClicks(rootSelector) {
  // ...existing code to find root...
  // 在事件处理里替换 playSegment(...) 调用为 setFocusSegment(...)
  // 下面为完整替换事件回调实现：
  const candidates = rootSelector ? [rootSelector] : ['#course-outline', '.course-outline', '.outline', '.toc', '#toc', '.sidebar-toc'];
  let root = null;
  for (const sel of candidates) {
    try {
      if (!sel) continue;
      const el = document.querySelector(sel);
      if (el) { root = el; break; }
    } catch (e) { continue; }
  }
  if (!root) root = document.body;
  if (root._ttsOutlineBound) return;
  root._ttsOutlineBound = true;

  root.addEventListener('click', (ev) => {
    try {
      let el = ev.target;
      while (el && el !== root && el !== document) {
        if (el.hasAttribute && (el.hasAttribute('data-seg-index') || el.hasAttribute('data-seg-id'))) break;
        const cls = el.className || '';
        if (typeof cls === 'string' && (cls.split(/\s+/).includes('segment-tag') || cls.split(/\s+/).includes('outline-item'))) break;
        el = el.parentElement;
      }
      if (!el || el === root || el === document) return;

      // 优先 data-seg-index：只设置焦点并停止播放，不自动播放
      if (el.hasAttribute && el.hasAttribute('data-seg-index')) {
        const idx = parseInt(el.getAttribute('data-seg-index'), 10);
        if (!Number.isNaN(idx)) {
          ev.preventDefault();
          setFocusSegment(idx);
          // 尝试滚动到主内容区域，如果对应内容有 data-seg-index 属性
          try {
            const contentEl = document.querySelector(`[data-seg-index="${idx}"]`);
            if (contentEl && typeof contentEl.scrollIntoView === 'function') contentEl.scrollIntoView({behavior:'smooth', block:'center'});
          } catch (e) {}
          return;
        }
      }

      if (el.hasAttribute && el.hasAttribute('data-seg-id')) {
        const id = el.getAttribute('data-seg-id');
        if (id) {
          ev.preventDefault();
          setFocusSegmentById(id);
          try {
            const contentEl = document.querySelector(`#${CSS.escape(id)}`) || document.querySelector(`[data-seg-id="${CSS.escape(id)}"]`);
            if (contentEl && typeof contentEl.scrollIntoView === 'function') contentEl.scrollIntoView({behavior:'smooth', block:'center'});
          } catch (e) {}
          return;
        }
      }

      // 类名匹配的备用逻辑：读取 data-index/data-id 或尝试解析 text
      if (el.className && (el.className.split(/\s+/).includes('segment-tag') || el.className.split(/\s+/).includes('outline-item'))) {
        if (el.dataset && el.dataset.index) {
          const idx = parseInt(el.dataset.index, 10);
          if (!Number.isNaN(idx)) { ev.preventDefault(); setFocusSegment(idx); return; }
        }
        if (el.dataset && el.dataset.id) {
          ev.preventDefault(); setFocusSegmentById(el.dataset.id); return;
        }
      }
    } catch (e) {
      console.error('bindOutlineClicks handler error', e);
    }
  }, false);
}

// 自动绑定保持原样（MutationObserver 等无需修改）
(function _autoBindOutline() {
  try {
    if (typeof document === 'undefined') return;
    // 仅在课程页执行绑定逻辑
    if (!_isLessonNNPage()) return;

    // 尝试立即绑定
    bindOutlineClicks();
    // 观察 body，若有新节点可能为目录时再绑定（轻量观察）
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (!m.addedNodes) continue;
        for (const n of m.addedNodes) {
          if (!(n instanceof Element)) continue;
          if (n.querySelector && (n.querySelector('[data-seg-index]') || n.querySelector('[data-seg-id]') || n.querySelector('.segment-tag') || n.querySelector('.outline-item'))) {
            bindOutlineClicks();
            return;
          }
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (e) {
    console.error('autoBindOutline error', e);
  }
})();