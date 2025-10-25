export const day2Lesson = {
  id: 'dl',
  title: '深度学习基础',
  estimatedDuration: '约45分钟',
  intro: '深入探讨深度神经网络的结构设计、训练策略与实战技巧，包含 CNN 实践与避免过拟合的方法。',
  segments: [
    {
      id: 'opening',
      title: '开场 · 深度学习基础引入',
      type: 'lecture',
      transcript: [
        '亲爱的同学们，欢迎再次走进深度学习这个充满无限可能的精彩世界！昨天，我们一同揭开了神经网络的神秘面纱，初步领略了它独特的魅力。今天我们将开启一段更为精彩绝伦的深度学习进阶之旅。',
        '想象一下，怎样让我们的 AI 模型在错综复杂的图像识别任务里达到超越人类专家的精准度？在计算资源捉襟见肘的情况下，又如何让模型依旧保持高效稳定的运行？这一切的奥秘，都将在今天的课程中逐一为大家呈现。',
        '现在，请大家迅速打开各自的笔记本电脑，我们马上就要开启这场充满挑战与惊喜的深度学习探险啦！'
      ],
      keyPoints: [
        '本节聚焦网络设计、优化策略与训练技巧',
        '目标是提升模型泛化能力与训练稳定性'
      ]
    },
    {
      id: 'warmup-quiz',
      title: '互动提问（开场热身）',
      type: 'quiz',
      question: '以下哪一项并非深度学习相较于传统机器学习的显著优势？',
      options: [
        { key: 'A', text: '能够自动且高效地提取复杂特征' },
        { key: 'B', text: '严重依赖于大量手工精心设计的特征' },
        { key: 'C', text: '在处理海量数据集时，表现更为卓越' },
        { key: 'D', text: '能够轻松应对非结构化数据，如图像、语音等' }
      ],
      answer: 'B',
      explanation: '深度学习的优势在于自动从数据中学习特征，而非高度依赖手工特征。'
    },
    {
      id: 'overview',
      title: '1.1 深度学习概述与应用',
      type: 'lecture',
      transcript: [
        '深度学习，简单来说，就是借助深层神经网络这一强大工具，自动学习和提取数据中隐藏的复杂特征。它的独特之处在于“深”——通过多层非线性变换，实现对数据的逐层抽象和提炼。',
        '从图像识别到自然语言处理，从语音识别到智能推荐系统，深度学习正以前所未有的速度改变着我们的世界，为许多行业带来效率与能力的飞跃。',
        '在本小节我们将回顾深度学习的定义、特点与典型应用场景，帮助大家建立宏观理解，便于后续深入具体技术点的学习。'
      ],
      keyPoints: [
        '“深”指多层非线性变换用于抽象特征',
        '深度学习在图像、语音、NLP 等领域表现卓越'
      ],
      mediaPlaceholder: '深度学习应用示例图',
  image: '/images/placeholders/5-1.png'
    },
    {
      id: 'advantages',
      title: '1.2 深度学习相比传统机器学习的优势',
      type: 'lecture',
      transcript: [
        '与传统机器学习相比，深度学习在特征提取方面展现出了强大的自动性。传统机器学习需要我们精心设计特征，而深度学习能够直接从原始数据中学习有用的表示。',
        '当数据规模增大时，深度模型往往能学习到更复杂、更细粒度的模式，从而在许多任务上超越传统方法。尤其在处理图像、语音、文本等非结构化数据时，深度学习展现出明显优势。',
        '本节将通过对比示例讨论两者流程差异，帮助你判断在何种场景下优先采用深度学习方法。'
      ],
      keyPoints: [
        '自动特征学习',
        '在海量数据上表现更好',
        '适合非结构化数据'
      ],
      mediaPlaceholder: '传统 ML vs 深度学习 对比图',
  image: '/images/placeholders/5-2.png'
    },
    {
      id: 'overfitting-quiz',
      title: '选择题 · 过拟合防止策略',
      type: 'quiz',
      question: '以下哪项技术不常用于防止过拟合？',
      options: [
        { key: 'A', text: 'Dropout——随机丢弃部分神经元' },
        { key: 'B', text: 'Batch Normalization——对每批数据归一化' },
        { key: 'C', text: 'L1/L2正则化——限制模型复杂度' },
        { key: 'D', text: '增加网络层数——通常可能加剧过拟合' }
      ],
      answer: 'D',
      explanation: '增加层数通常提升模型复杂度，可能加剧过拟合，而不是防止它。'
    },
    {
      id: 'dnn-design',
      title: '2.1 深度神经网络的结构设计',
      type: 'lecture',
      transcript: [
        '设计深度神经网络时，层数与每层的神经元数量需要根据任务与数据规模谨慎选择。过多的层数或参数会使模型更具表达能力，但也更容易过拟合并且训练难度增加；过少则可能无法捕捉到复杂特征。',
        '实际设计时要权衡性能与计算资源、关注数据量、任务复杂度以及部署限制，常见做法包括从较小模型出发逐步增大规模并使用验证集监控性能。'
      ],
      keyPoints: [
        '网络深度与宽度需与数据规模匹配',
        '设计需兼顾性能与计算成本'
      ],
      mediaPlaceholder: '网络结构示意',
  image: '/images/placeholders/5-3.png'
    },
    {
      id: 'init-opt',
      title: '2.2 权重初始化与优化策略',
      type: 'lecture',
      transcript: [
        '权重初始化是模型训练的重要一步。Xavier（Glorot）和 He 初始化方法通过考虑前后层神经元数量，设置合适的初始权重分布，从而尽量保持每层输入输出的方差一致，减缓梯度消失或爆炸问题。',
        '优化器方面，传统的 SGD 简单但收敛较慢；自适应方法如 Adam 能基于一阶矩与二阶矩估计自适应调整学习率，加速收敛并在许多任务中表现良好。',
        '结合合理的初始化与适当的优化器（并配合学习率调度），往往能显著提高训练稳定性与最终性能。'
      ],
      keyPoints: [
        'Xavier/He 初始化帮助稳定训练',
        'Adam 等自适应优化器常用'
      ],
      mediaPlaceholder: '初始化与优化对比图',
  image: '/images/placeholders/5-4.png'
    },
    {
      id: 'xavier-quiz',
      title: '选择题 · Xavier 初始化理解',
      type: 'quiz',
      question: '关于 Xavier 初始化，哪项描述正确？',
      options: [
        { key: 'A', text: '适用于所有网络类型' },
        { key: 'B', text: '完全随机，不考虑前后层神经元' },
        { key: 'C', text: '旨在保持输入输出方差一致，助力训练稳定' },
        { key: 'D', text: '通常会导致梯度消失' }
      ],
      answer: 'C',
      explanation: 'Xavier 初始化旨在保持每层输入输出的方差一致，从而缓解梯度问题。'
    },
    {
      id: 'overfitting-techniques',
      title: '2.3 避免过拟合的技术',
      type: 'lecture',
      transcript: [
        '过拟合会导致模型在训练集上表现良好，但在未见数据上效果差。常见防治方法包括 Dropout（随机丢弃部分神经元以减少对单个神经元的依赖）、L1/L2 正则化（惩罚过大的参数）以及数据增强（人为扩充训练集多样性）。',
        'Batch Normalization 虽然主要用于稳定训练，但也能在一定程度上改善泛化。早停法（Early Stopping）通过在验证集上监控性能并在无改进时停止训练，是一种简单而有效的手段。',
        '实际工程中通常将多种方法组合使用，以获得更稳健的泛化能力。'
      ],
      keyPoints: [
        'Dropout 可减少对单一神经元的依赖',
        'BatchNorm 有助于稳定训练，配合其他方法使用效果更佳'
      ],
      mediaPlaceholder: '过拟合示例图',
  image: '/images/placeholders/5-5.png'
    },
    {
      id: 'cnn-intro',
      title: '3.1 卷积神经网络（CNN）基础',
      type: 'lecture',
      transcript: [
        'CNN 是图像处理领域的核心模型，通过卷积层的参数共享机制高效提取局部特征，池化层用于下采样并保留重要响应，最终由全连接层输出分类或回归结果。',
        '卷积核就像不同风格的“画笔”，能从图像中提取边缘、纹理等低层特征，经过多层组合后形成对更高层语义的表示，这正是 CNN 在视觉任务中强大的原因。'
      ],
      keyPoints: [
        '卷积层自动提取局部特征',
        '池化层降低维度、减少计算'
      ],
      mediaPlaceholder: 'CNN 工作原理 动画/示意',
  image: '/images/placeholders/5-67.png'
    },
    {
      id: 'conv-pool',
      title: '3.2 卷积层与池化层的作用',
      type: 'lecture',
      transcript: [
        '卷积层通过滑动窗口对局部区域进行点积运算，提取局部响应，随后经激活函数产生非线性。不同卷积核可以学习到不同的滤波器，例如检测边缘或纹理。',
        '池化操作（如最大池化或平均池化）用于下采样，减少特征图尺寸和计算量，同时保留最显著的响应，有助于提高模型的平移不变性和鲁棒性。'
      ],
      keyPoints: [
        '卷积提取边缘/纹理等局部特征',
        '池化用于下采样与噪声抑制'
      ],
      mediaPlaceholder: '卷积与池化 动图',
  image: '/images/placeholders/5-67.png'
    },
    {
      id: 'cnn-example',
      title: '3.3 示例：使用 CNN 做 CIFAR-10 分类',
      type: 'lecture',
      transcript: [
        '示例流程：首先搭建包含若干卷积层、池化层与若干全连接层的网络结构；接着对 CIFAR-10 数据进行预处理（归一化、数据增强）；然后设置损失函数和优化器并开始训练，同时使用验证集监控过拟合。',
        '在实践中，通过调整卷积核数量、网络深度、学习率、批大小以及数据增强策略，往往能显著提升模型在测试集上的表现。此外，记得保存最佳模型并记录实验配置，便于复现。'
      ],
      keyPoints: [
        '实践步骤清晰：数据->模型->训练->评估',
        '调参与数据增强通常比仅修改架构更有效'
      ],
      mediaPlaceholder: 'Notebook / 代码片段 占位',
  image: '/images/placeholders/5-8.png'
    },
    {
      id: 'pooling-quiz',
      title: '选择题 · 池化层的主要作用',
      type: 'quiz',
      question: '在 CNN 中，池化层的主要作用是什么？',
      options: [
        { key: 'A', text: '增加特征维度' },
        { key: 'B', text: '提取局部特征，如边缘、纹理' },
        { key: 'C', text: '降低特征维度，减少计算量并保留重要特征' },
        { key: 'D', text: '引入非线性变换' }
      ],
      answer: 'C',
      explanation: '池化用于下采样，降低特征维度并保留重要信息，从而减少计算量。'
    },
    {
      id: 'training-tips',
      title: '4.1 数据增强与预处理',
      type: 'lecture',
      transcript: [
        '数据增强是提高模型泛化能力的重要手段，常见方法包括随机旋转、裁剪、缩放、水平翻转和添加噪声等。通过这些变换可以在不实际增加标注成本的情况下扩充数据多样性。',
        '同时，良好的预处理（如归一化或标准化）能让模型更快收敛并提高稳定性。结合数据增强与合适的预处理通常能带来明显的性能提升。'
      ],
      keyPoints: [
        '数据增强增加数据多样性',
        '归一化与标准化常用且重要'
      ],
      mediaPlaceholder: '数据增强示例',
  image: '/images/placeholders/5-9.png'
    },
    {
      id: 'lr-earlystop',
      title: '4.2 学习率调整与早停法',
      type: 'lecture',
      transcript: [
        '学习率是训练中最关键的超参数之一。常见策略包括固定衰减、余弦退火（cosine annealing）和 Warmup（训练初期使用小学习率并逐步放大），这些策略能帮助模型更稳健地收敛。',
        '早停法通过在验证集上监控性能并在长时间无改进时提前停止训练，可以有效防止过拟合并节省计算资源。实践中常把学习率调度与早停法结合使用以获得最佳效果。'
      ],
      keyPoints: [
        '动态调整学习率通常比固定学习率效果更好',
        '早停法通过监控验证指标防止过拟合'
      ],
      mediaPlaceholder: '学习率曲线 占位',
  image: '/images/placeholders/5-10.png'
    },
    {
      id: 'model-eval',
      title: '4.3 模型评估与选择',
      type: 'lecture',
      transcript: [
        '模型评估应根据任务选择合适的指标：分类任务常用准确率、精确率、召回率与 F1 分数；对于不平衡数据集，精确率与召回率往往比准确率更有参考价值。',
        '交叉验证（cross-validation）能在小数据集上提高评估稳定性，帮助我们更可靠地比较不同模型或超参数配置。'
      ],
      keyPoints: [
        '多个指标综合评估模型性能',
        '交叉验证提高结果可信度'
      ],
      mediaPlaceholder: '评估指标 对比图',
  image: '/images/placeholders/5-11.png'
    },
    {
      id: 'grad-quiz',
      title: '选择题 · 梯度消失问题的解决方法',
      type: 'quiz',
      question: '下列哪项通常不用于解决梯度消失问题？',
      options: [
        { key: 'A', text: '使用 ReLU 激活函数' },
        { key: 'B', text: '采用残差连接（ResNet）' },
        { key: 'C', text: '增加网络层数' },
        { key: 'D', text: '使用批量归一化（BatchNorm）' }
      ],
      answer: 'C',
      explanation: '增加层数通常会加剧梯度消失，而其他方法都有助于缓解该问题。'
    },
    {
      id: 'interactive',
      title: '互动环节：编程实践与讨论',
      type: 'lecture',
      transcript: [
        '编程实践：请打开本地“物体识别任务.ipynb”文件，按照 notebook 中提示完成数据加载、预处理、模型搭建、训练与评估流程。重点尝试调整卷积核数量、网络深度、优化器与学习率，并记录每次实验的配置和结果。',
        '课上讨论：基于实验结果，思考并讨论如何进一步优化 CNN 性能：是通过增加深度、改进数据增强、调整学习率调度，还是引入更高级的架构（如残差连接、注意力机制）？分享你的见解。'
      ],
      keyPoints: [
        '实践是掌握深度学习的关键',
        '记录实验配置与结果，便于复现实验'
      ],
      mediaPlaceholder: 'Notebook 演示 占位',
  image: '/images/placeholders/4-2.png'
    },
    {
      id: 'summary',
      title: '课程总结与下节预告',
      type: 'lecture',
      transcript: [
        '今天的课程中，我们一起深入探索了深度学习的核心概念，包括网络设计、权重初始化、优化策略以及避免过拟合的方法；并重点介绍了卷积神经网络的工作原理与实战流程。',
        '请务必完成本次的编程练习并记录实验结果，下节课我们将继续探索循环神经网络（RNN）及序列建模，深入理解如何处理时序与文本数据。期待在下次课堂见到大家带来的问题与改进思路！'
      ],
      keyPoints: [
        '设计、初始化与优化对训练成功至关重要',
        '数据增强与评估指标是提升泛化的核心工具'
      ],
      mediaPlaceholder: '课程徽章 占位',
  image: '/images/placeholders/4-3.png'
    }
  ]
};

// 以下功能与 day1.js 保持一致：后端探测、TTS 调用、注入按钮、焦点/目录绑定等。
// 仅对 day2Lesson 引用与路由检测作相应调整（/lesson/dl），确保功能独立。
async function _probeUrl(url, timeout = 2000) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { method: 'GET', signal: controller.signal, mode: 'cors' });
    clearTimeout(timer);
    return res && (res.ok || res.status === 200 || res.status === 404);
  } catch (e) {
    return false;
  }
}

async function findWorkingBackend() {
  const cacheKey = 'tts_backend_base_working';
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname || 'localhost';
  const ports = [5000, 5001, 5002, 8000, 8080, 5010];
  const variants = [];

  for (const p of ports) {
    variants.push(`http://localhost:${p}`);
    variants.push(`http://127.0.0.1:${p}`);
    variants.push(`http://${hostname}:${p}`);
  }
  variants.push("");

  for (const base of variants) {
    try {
      if (base === "") {
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
      continue;
    }
  }
  return null;
}

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
      await audio.play().catch(()=>{});
    }
    return audio;
  } catch (e) {
    console.error('playTextTTS error', e);
    localStorage.removeItem('tts_backend_base_working');
    alert('请求后端 TTS 失败，请确认后端已启动并可通过网络访问。');
    return null;
  }
}

function _isLessonDLPage() {
  try {
    if (typeof window === 'undefined') return false;
    const p = (window.location && window.location.pathname) ? window.location.pathname : '';
    const h = (window.location && window.location.hash) ? window.location.hash : '';
    // 如果是 summary 页（/lesson/dl/summary 或 hash 中包含），明确排除
    const isSummaryPath = /\/lesson\/dl\/summary(?:\/|$)/.test(p) || /#\/?lesson\/dl\/summary(?:\/|$)/.test(h);
    if (isSummaryPath) return false;
    // 普通 /lesson/dl 路由匹配（不包含 summary）
    if (/\/lesson\/dl(?:\/|$)/.test(p)) return true;
    if (/#\/?lesson\/dl(?:\/|$)/.test(h)) return true;
    return false;
  } catch (e) {
    return false;
  }
}

(function _injectTTSButtonForDL(){
  try {
    if (typeof document === 'undefined') return;

    function ensureButton() {
      if (!_isLessonDLPage()) return;
      if (document.getElementById('tts-play-button-dl')) return;

      window._aiTtsPlayerDL = window._aiTtsPlayerDL || { audio: null, segmentsText: [], index: 0, playing: false };

      const btn = document.createElement('button');
      btn.id = 'tts-play-button-dl';
      btn.textContent = '朗读课程';
      Object.assign(btn.style, {
        position: 'fixed',
        right: '16px',
        bottom: '16px',
        zIndex: 2147483647,
        padding: '10px 14px',
        background: '#0b79d0',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        pointerEvents: 'auto'
      });
      btn.title = '朗读本课程（中英文混合）';

      function _collectTranscriptSegments() {
        const segments = [];
        for (const seg of day2Lesson.segments || []) {
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

      btn.addEventListener('click', async () => {
        try {
          const player = window._aiTtsPlayerDL;

          if (!player.segmentsText || player.segmentsText.length === 0) {
            player.segmentsText = _collectTranscriptSegments();
            if (!Number.isInteger(player.index) || player.index < 0 || player.index >= player.segmentsText.length) {
              player.index = 0;
            }
          }

          if (player.audio && !player.audio.paused && !player.audio.ended) {
            try { player.audio.pause(); } catch (e) {}
            player.playing = false;
            btn.textContent = '继续朗读';
            return;
          }

          if (player.audio && player.audio.paused && !player.audio.ended) {
            try {
              await player.audio.play();
              player.playing = true;
              btn.textContent = '播放中...';
            } catch (e) {
              console.warn('resume failed, regenerating segment', e);
              player.audio = null;
            }
            return;
          }

          if (player.index >= (player.segmentsText || []).length) player.index = 0;
          const segText = (player.segmentsText || [])[player.index];
          if (!segText) {
            alert('没有可朗读的段落。');
            return;
          }

          btn.disabled = true;
          btn.textContent = '生成语音中...';
          const audio = await playTextTTS(segText, { autoplay: false });
          btn.disabled = false;
          if (!audio) { btn.textContent = '朗读课程'; return; }

          player.audio = audio;
          try { await audio.play(); } catch (e) {}
          player.playing = true;
          btn.textContent = '播放中...';

          audio.onended = () => {
            player.playing = false;
            player.audio = null;
            // 不自动跳到下一段，保持只读当前小节的行为（与 day1.js 修改一致）
            btn.textContent = '继续朗读';
          };
          audio.onpause = () => { if (audio && !audio.ended) btn.textContent = '继续朗读'; };
          audio.onplay = () => { btn.textContent = '播放中...'; };
        } catch (err) {
          console.error('TTS button error', err);
          btn.disabled = false;
          btn.textContent = '朗读课程';
        }
      });

      document.body.appendChild(btn);
    }

    function removeButton() {
      try {
        const btn = document.getElementById('tts-play-button-dl');
        if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
      } catch (e) {}
      try {
        const p = window._aiTtsPlayerDL;
        if (p && p.audio) {
          try { p.audio.pause(); } catch (e) {}
          try { p.audio.currentTime = 0; } catch (e) {}
          try { p.audio.src = ''; } catch (e) {}
        }
        if (p) { p.audio = null; p.playing = false; }
      } catch (e) {}
    }

    function updateByRoute() {
      if (_isLessonDLPage()) ensureButton();
      else removeButton();
    }

    updateByRoute();

    window.addEventListener('hashchange', updateByRoute);
    window.addEventListener('popstate', updateByRoute);
    try {
      const _ps = history.pushState;
      history.pushState = function() {
        const ret = _ps && _ps.apply(this, arguments);
        try { window.dispatchEvent(new Event('popstate')); } catch(e){}
        return ret;
      };
      const _rs = history.replaceState;
      history.replaceState = function() {
        const ret = _rs && _rs.apply(this, arguments);
        try { window.dispatchEvent(new Event('popstate')); } catch(e){}
        return ret;
      };
    } catch (e) {}
  } catch (e) { /* ignore */ }
})();

export function getTranscriptSegments() {
  const segments = [];
  for (const seg of day2Lesson.segments || []) {
    if (!seg) continue;
    if (Array.isArray(seg.transcript)) {
      const txt = seg.transcript.join(' ').trim();
      if (txt) segments.push(txt);
    } else if (typeof seg.transcript === 'string') {
      const txt = seg.transcript.trim();
      if (txt) segments.push(txt);
    } else if (seg.content) {
      const txt = (Array.isArray(seg.content) ? seg.content.join(' ') : String(seg.content || '')).trim();
      if (txt) segments.push(txt);
    }
  }
  return segments;
}

export function stopCurrentTTS() {
  try {
    const p = (window._aiTtsPlayerDL = window._aiTtsPlayerDL || { audio: null, segmentsText: [], index: 0, playing: false });
    if (p.audio) {
      try { p.audio.pause(); } catch (_) {}
      try { p.audio.currentTime = 0; } catch (_) {}
      try { p.audio.src = ''; } catch (_) {}
    }
  } catch (_) {}
  window._aiTtsPlayerDL.audio = null;
  window._aiTtsPlayerDL.playing = false;
}

function _findSegmentIndexById(id) {
  if (!id) return -1;
  for (let i = 0; i < (day2Lesson.segments || []).length; i++) {
    const s = day2Lesson.segments[i];
    if (s && s.id === id) return i;
  }
  return -1;
}

export function setFocusSegment(index) {
  const segments = getTranscriptSegments();
  if (!Array.isArray(segments) || index < 0 || index >= segments.length) return null;
  stopCurrentTTS();
  window._aiTtsPlayerDL = window._aiTtsPlayerDL || { audio: null, segmentsText: [], index: 0, playing: false };
  window._aiTtsPlayerDL.segmentsText = segments;
  window._aiTtsPlayerDL.index = index;
  window._aiTtsPlayerDL.playing = false;
  const btn = document.getElementById('tts-play-button-dl');
  if (btn) btn.textContent = '继续朗读';
  return true;
}

export function setFocusSegmentById(id) {
  if (!id) return null;
  const idx = _findSegmentIndexById(id);
  if (idx === -1) return null;
  try {
    const elByIndex = document.querySelector(`[data-seg-index="${idx}"]`);
    const elById = document.querySelector(`#${CSS.escape(id)}`);
    const target = elByIndex || elById;
    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  } catch (e) {}
  return setFocusSegment(idx);
}

export function bindOutlineClicks(rootSelector) {
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

  // 事件处理：查找包含 data-seg-index / data-seg-id 或常见类名的元素
  function handleClick(ev) {
    try {
      let el = ev.target;
      while (el && el !== root && el !== document) {
        if (el.getAttribute && (el.getAttribute('data-seg-index') || el.getAttribute('data-seg-id'))) break;
        const cls = el.className || '';
        if (typeof cls === 'string' && (cls.split(/\s+/).includes('segment-tag') || cls.split(/\s+/).includes('outline-item'))) break;
        el = el.parentElement;
      }
      if (!el || el === root || el === document) return;

      // 优先 data-seg-index
      if (el.getAttribute && el.getAttribute('data-seg-index')) {
        const idx = parseInt(el.getAttribute('data-seg-index'), 10);
        if (!Number.isNaN(idx)) {
          ev.preventDefault();
          setFocusSegment(idx);
          try {
            const contentEl = document.querySelector(`[data-seg-index="${idx}"]`);
            if (contentEl && typeof contentEl.scrollIntoView === 'function') contentEl.scrollIntoView({behavior:'smooth', block:'center'});
          } catch (e) {}
          return;
        }
      }

      // data-seg-id
      if (el.getAttribute && el.getAttribute('data-seg-id')) {
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

      // 类名匹配的备用逻辑
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
  }

  root.addEventListener('click', handleClick, false);
}

(function _autoBindOutlineDL() {
  try {
    if (typeof document === 'undefined') return;
    if (!_isLessonDLPage()) return;
    bindOutlineClicks();
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
    console.error('autoBindOutlineDL error', e);
  }
})();

// 回退渲染：当路由为 /lesson/dl 时，如果页面仍显示“课程建设中”，用 day2Lesson 渲染真实内容。
