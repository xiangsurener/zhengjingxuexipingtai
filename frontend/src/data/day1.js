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
        '同学们早上好！欢迎来到人工智能的「魔法学院」。接下来20分钟我们会一起揭开神经网络的神秘面纱。',
        '语音助手、短视频推荐、医疗筛查等 everyday 应用都依赖神经网络。课程中除了理论，还有亲手调教 AI 的实践环节。'
      ],
      keyPoints: [
        '神经网络是当今多数智能产品的核心',
        '课程将结合故事、数据与实践引导逐步理解'
      ]
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
        '1943 年，McCulloch 与 Pitts 提出的初代神经元模型奠定了神经网络的想法，尽管它只能处理最简单的逻辑。',
        '2006 年 Hinton 提出预训练 + 微调方法，大幅缓解深层网络训练困难，随后 2012 年 AlexNet 在 ImageNet 比赛上让识别错误率从 26% 降至 15%。'
      ],
      keyPoints: [
        '早期模型结构朴素，功能有限',
        '深度学习的复兴依赖更好的算法与数据集'
      ]
    },
    {
      id: 'history-quiz',
      title: '互动提问 · 早期神经网络为何发展缓慢？',
      type: 'quiz',
      question: '早期神经网络发展缓慢，就像给拖拉机装火箭发动机，主要问题出在哪？',
      options: [
        { key: 'A', text: '数学公式写错了' },
        { key: 'B', text: '电脑算不动' },
        { key: 'C', text: '科学家不想研究' }
      ],
      answer: 'B',
      explanation: '受限于当年的算力，训练一个简单模型都可能需要数天。GPU 的出现真正释放了神经网络的潜力。'
    },
    {
      id: 'relationship',
      title: '1.2 AI、机器学习与神经网络的关系',
      type: 'lecture',
      transcript: [
        '人工智能是最外层的目标：让机器像人一样思考。',
        '机器学习是实现 AI 的主要方式：让机器通过数据自我学习。',
        '神经网络是机器学习里「学霸级」的方法，可以像 AlphaGo 那样自行摸索策略而非人工写死规则。'
      ],
      keyPoints: [
        'AI ⊃ ML ⊃ NN 的套娃关系',
        '神经网络擅长在复杂数据上发现模式'
      ],
      mediaPlaceholder: '三层蛋糕图示占位'
    },
    {
      id: 'structure',
      title: '1.3 神经网络的基本结构',
      type: 'lecture',
      transcript: [
        '以手写数字识别为例：输入层把 28x28 像素展平成 784 个数值。',
        '隐藏层套用成百上千个「数学滤镜」提取特征，从简单的横竖线到复杂轮廓。',
        '输出层给出每个数字的概率，例如 90% 是 7，5% 是 1。'
      ],
      keyPoints: [
        '单层网络就可能拥有十万以上的参数',
        '大量参数意味着模型需要数据与算力支撑'
      ],
      mediaPlaceholder: 'MNIST 手写数字演示占位'
    },
    {
      id: 'ml-types',
      title: '2.1 机器学习的主要类型',
      duration: '5分钟',
      type: 'lecture',
      transcript: [
        '监督学习：有标签的数据，常用于分类与回归任务。',
        '无监督学习：没有标签，让模型自己发现模式，例如聚类。',
        '强化学习：基于奖励信号不断试错，典型案例是智能体学会走路或下棋。'
      ],
      keyPoints: [
        '监督学习在工业界应用占比超过 70%',
        '不同类型适用于不同问题场景'
      ],
      mediaPlaceholder: '学习类型对比图占位'
    },
    {
      id: 'ml-workflow',
      title: '2.2 机器学习项目的工作流程',
      type: 'lecture',
      transcript: [
        '数据收集：准备足够且合规的数据，例如 1 万张 X 光片。',
        '特征工程：传统方法依赖专家标注，深度学习让模型自动找关键特征。',
        '模型选择：可以复用如 ResNet50 等成熟架构，加快落地。',
        '训练与评估：合理划分训练、验证、测试集，避免数据泄露。'
      ],
      keyPoints: [
        '80/10/10 是常见的数据划分策略',
        '严格区分测试集，杜绝“提前看答案”'
      ],
      mediaPlaceholder: 'X 光诊断流程占位'
    },
    {
      id: 'linear-regression',
      title: '2.3 线性回归详解',
      type: 'lecture',
      transcript: [
        '线性回归用于预测连续数值，核心公式 y = wx + b。',
        '训练过程中通过不断调整 w 和 b 让预测误差最小，像调收音机频率一样精细。'
      ],
      keyPoints: [
        '输入是特征（如房子面积），输出是目标（房价）',
        '梯度下降负责寻找最优参数组合'
      ],
      mediaPlaceholder: '房价坐标图占位'
    },
    {
      id: 'linear-quiz',
      title: '互动提问 · 异常值会怎样影响线性回归？',
      type: 'quiz',
      question: '如果数据里出现 10 平米的豪宅卖 1000 万，线性回归最可能的反应是？',
      options: [
        { key: 'A', text: '假装没看见' },
        { key: 'B', text: '拼命拟合这个异常值' },
        { key: 'C', text: '自动删掉它' }
      ],
      answer: 'B',
      explanation: '线性回归极易被极端值拉偏，因此实际项目 often 会引入更稳健的模型或清洗异常值。'
    },
    {
      id: 'forward-backprop',
      title: '3.1 神经网络如何学习：前向与反向传播',
      type: 'lecture',
      transcript: [
        '前向传播像流水线：数据依次通过各层并输出预测。',
        '反向传播像“倒带追责”：从输出层开始计算误差对每层的影响，并调整权重。',
        '随机梯度下降（SGD）每次使用一小批数据训练，既高效又能避免陷入局部最优。'
      ],
      keyPoints: [
        '预测-对比-调整构成学习闭环',
        'SGD 是训练深度模型的基础优化策略'
      ],
      mediaPlaceholder: '前向/反向传播流程图占位'
    },
    {
      id: 'activations',
      title: '3.2 激活函数的性格对比',
      type: 'lecture',
      transcript: [
        'Sigmoid：输出范围 0-1，但梯度容易消失。',
        'Tanh：输出 -1 到 1，表达力更强但仍可能饱和。',
        'ReLU：正值直通，负值归零，简单高效但可能“死亡”。',
        'Swish：x · sigmoid(x)，具备自我调节能力，在多项任务表现更佳。'
      ],
      keyPoints: [
        '激活函数决定神经元的“性格与反应速度”',
        '实际项目会根据任务与模型深度进行选择'
      ],
      mediaPlaceholder: '激活函数曲线对比占位'
    },
    {
      id: 'loss-optimizer',
      title: '3.3 损失函数与优化器',
      type: 'lecture',
      transcript: [
        '损失函数像扣分表，常见的交叉熵能放大错误预测的惩罚。',
        '优化器是“训练教练”：SGD 老派稳健，Adam 会根据学习历史自适应调整步伐。'
      ],
      keyPoints: [
        '损失函数衡量模型表现，优化器决定改进的速度与方向',
        'Adam 结合动量与自适应学习率，收敛更快'
      ],
      mediaPlaceholder: '打靶例子 + 优化器对比占位'
    },
    {
      id: 'applications',
      title: '4.1 神经网络的跨领域应用',
      duration: '2.5分钟',
      type: 'lecture',
      transcript: [
        '计算机视觉：从刷脸支付到自动驾驶识别路况。',
        '自然语言处理：ChatGPT 能写作、编程甚至通过图灵测试。',
        '科学计算：AlphaFold 破解蛋白质结构，帮助药物研发。',
        '艺术创作：Stable Diffusion 实现“文生图”，开启创意新时代。'
      ],
      keyPoints: [
        '神经网络已经深入工业、科研与创意领域',
        '理解核心原理能帮助我们判断技术边界'
      ],
      mediaPlaceholder: '多行业案例轮播占位'
    },
    {
      id: 'coding',
      title: '4.2 编程实践 · 泰坦尼克号幸存预测',
      type: 'lecture',
      transcript: [
        '目标：构建一个模型预测乘客是否能幸存。',
        '步骤：① 加载数据并完成预处理；② 使用 Keras 搭建模型；③ 训练 10 个 epoch；④ 在测试集上评估准确率。'
      ],
      keyPoints: [
        '遵循训练流程并记录每次实验的结果',
        '多尝试不同网络结构或特征工程以优化表现'
      ],
      mediaPlaceholder: 'Notebook 演示占位'
    },
    {
      id: 'summary',
      title: '课程总结与下节预告',
      duration: '1分钟',
      type: 'lecture',
      transcript: [
        '今日关键词：神经网络的发展历程、机器学习流水线、前向/反向传播机制。',
        '课后任务：完成泰坦尼克号预测练习，思考还有哪些任务可以应用类似流程。',
        '预告：下一讲将深入 CNN，探讨如何让模型理解视频与方言。'
      ],
      keyPoints: [
        '理解历史、流程与训练机制，为后续课程打好基础',
        '持续实践能加深抽象概念的理解'
      ],
      mediaPlaceholder: '课程徽章展示占位'
    }
  ]
}
