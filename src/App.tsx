/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  Music, 
  Video, 
  Layers, 
  Search, 
  Mic, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2,
  X,
  Sparkles,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Data Structure ---
interface Product {
  id: string;
  name: string;
  modality: 'text' | 'image' | 'audio' | 'video' | 'general';
  difficulty: '小白级' | '进阶级' | '大神级';
  isPaid: '免费/有额度' | '纯付费';
  chinaFriendly: '直连使用' | '需魔法';
  upvotes: number;
  downvotes: number;
  description: string;
  pros: string[];
  cons: string[];
  keywords: string[];
}

const PRODUCTS: Product[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    modality: 'general',
    difficulty: '小白级',
    isPaid: '免费/有额度',
    chinaFriendly: '需魔法',
    upvotes: 85,
    downvotes: 15,
    description: '全球最聪明的 AI 聊天机器人，几乎能帮你做任何事。',
    pros: ['写文章、改代码、出主意都是顶尖水平', '手机端支持语音直接对话，像真人一样'],
    cons: ['国内注册和支付比较麻烦', '有时候会一本正经地胡说八道'],
    keywords: ['聊天', '写东西', '翻译', '主意', '全能', '问答', '对话']
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    modality: 'image',
    difficulty: '进阶级',
    isPaid: '纯付费',
    chinaFriendly: '需魔法',
    upvotes: 92,
    downvotes: 8,
    description: '目前画质最高、艺术感最强的 AI 绘画工具。',
    pros: ['画出来的图可以直接当壁纸或商用', '审美极高，随便写几个词就很惊艳'],
    cons: ['没有中文界面，需要用英文描述', '必须在 Discord 软件里用，操作有点怪'],
    keywords: ['画画', '设计', '插画', '壁纸', '艺术', '绘图', '作图', '配图']
  },
  {
    id: 'suno',
    name: 'Suno AI',
    modality: 'audio',
    difficulty: '小白级',
    isPaid: '免费/有额度',
    chinaFriendly: '需魔法',
    upvotes: 88,
    downvotes: 12,
    description: '只要输入一句话，它就能帮你写词、作曲、编曲并唱出来。',
    pros: ['完全不懂音乐也能做出专业级歌曲', '支持中文歌词，唱得非常有感情'],
    cons: ['免费额度很快就会用完', '偶尔会有电音感或杂音'],
    keywords: ['唱歌', '作词', '作曲', '音乐', '贺卡', '歌曲', '旋律']
  },
  {
    id: 'runway',
    name: 'Runway Gen-3',
    modality: 'video',
    difficulty: '进阶级',
    isPaid: '纯付费',
    chinaFriendly: '需魔法',
    upvotes: 80,
    downvotes: 20,
    description: '好莱坞级别的 AI 视频生成工具，画面极其逼真。',
    pros: ['画面质感像电影大片', '可以控制镜头移动和光影变化'],
    cons: ['生成速度比较慢', '价格较贵，适合专业人士'],
    keywords: ['视频', '电影', '动画', '特效', '剪辑', '生成视频']
  },
  {
    id: 'kimi',
    name: 'Kimi 智能助手',
    modality: 'text',
    difficulty: '小白级',
    isPaid: '免费/有额度',
    chinaFriendly: '直连使用',
    upvotes: 95,
    downvotes: 5,
    description: '国产最强长文本 AI，能一次性读完几十万字的文件。',
    pros: ['国内直接用，速度极快', '读超长文档、整理会议纪要的神器'],
    cons: ['在创意写作和逻辑推理上略逊于 ChatGPT', '高峰期偶尔需要排队'],
    keywords: ['读文档', '整理', '国内', '长文章', '办公', '总结', 'PDF', '报告']
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    modality: 'audio',
    difficulty: '小白级',
    isPaid: '免费/有额度',
    chinaFriendly: '需魔法',
    upvotes: 90,
    downvotes: 10,
    description: '目前最像真人的 AI 配音工具，甚至能克隆你的声音。',
    pros: ['声音非常有感情，听不出是机器人在说话', '支持几十种语言，包括地道的中文'],
    cons: ['克隆功能需要付费', '长文本配音成本较高'],
    keywords: ['配音', '朗读', '克隆', '说话', '有声书', '语音合成', '播客']
  },
  {
    id: 'pika',
    name: 'Pika Art',
    modality: 'video',
    difficulty: '小白级',
    isPaid: '免费/有额度',
    chinaFriendly: '需魔法',
    upvotes: 82,
    downvotes: 18,
    description: '让你的照片"动"起来，或者把文字变成有趣的动画。',
    pros: ['操作非常简单，点点鼠标就能动', '有很多有趣的特效（比如把东西压扁）'],
    cons: ['视频长度比较短', '清晰度偶尔会下降'],
    keywords: ['动图', '动画', '有趣', '照片变视频', '短视频', '特效']
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    modality: 'general',
    difficulty: '小白级',
    isPaid: '免费/有额度',
    chinaFriendly: '需魔法',
    upvotes: 94,
    downvotes: 6,
    description: '会联网的 AI 搜索，直接给你答案并附上来源，不再有广告。',
    pros: ['找资料效率极高，不用自己翻网页', '给出的信息都有出处，比较靠谱'],
    cons: ['中文搜索结果偶尔不如英文丰富', '需要网络环境支持'],
    keywords: ['搜索', '查资料', '写论文', '事实', '新闻', '研究', '找信息']
  },
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    modality: 'image',
    difficulty: '大神级',
    isPaid: '免费/有额度',
    chinaFriendly: '直连使用',
    upvotes: 75,
    downvotes: 25,
    description: '完全免费且开源的绘画工具，但需要一台好电脑。',
    pros: ['完全免费，没有任何限制', '可以精准控制画面的每一个细节'],
    cons: ['安装非常麻烦，对电脑显卡要求很高', '学习成本极高，不适合纯小白'],
    keywords: ['免费', '开源', '精准控制', '本地运行', '无限制']
  },
  {
    id: 'claude',
    name: 'Claude 3.5',
    modality: 'text',
    difficulty: '小白级',
    isPaid: '免费/有额度',
    chinaFriendly: '需魔法',
    upvotes: 91,
    downvotes: 9,
    description: '文笔最好、最像人类作家的 AI，写出来的东西不生硬。',
    pros: ['写诗、写小说、写邮件非常有文采', '代码能力目前是全球第一'],
    cons: ['封号风险比较高', '免费额度非常少'],
    keywords: ['写作', '文采', '代码', '聪明', '人性化', '编程', '邮件']
  },
  {
    id: 'doubao',
    name: '豆包',
    modality: 'general',
    difficulty: '小白级',
    isPaid: '免费/有额度',
    chinaFriendly: '直连使用',
    upvotes: 93,
    downvotes: 7,
    description: '字节跳动出品的国产 AI 助手，国内免费直连，功能全面。',
    pros: ['国内直接用，完全免费无限制', '支持图片识别、联网搜索、生成图片'],
    cons: ['在复杂逻辑推理上略逊于 ChatGPT', '部分内容有审查限制'],
    keywords: ['国内', '免费', '聊天', '全能', '字节', '抖音', '日常']
  },
  {
    id: 'tongyi',
    name: '通义千问',
    modality: 'general',
    difficulty: '小白级',
    isPaid: '免费/有额度',
    chinaFriendly: '直连使用',
    upvotes: 88,
    downvotes: 12,
    description: '阿里巴巴出品，国内直连，办公场景尤其好用。',
    pros: ['与钉钉深度集成，企业办公神器', '长文档处理和表格分析能力强'],
    cons: ['创意类任务表现平平', '界面稍显复杂'],
    keywords: ['阿里', '办公', '企业', '国内', '钉钉', '表格', '文档']
  },
  {
    id: 'wenxin',
    name: '文心一言',
    modality: 'general',
    difficulty: '小白级',
    isPaid: '免费/有额度',
    chinaFriendly: '直连使用',
    upvotes: 85,
    downvotes: 15,
    description: '百度出品，国内老牌 AI，中文理解能力扎实。',
    pros: ['国内直连，中文语境理解最地道', '与百度生态（地图、搜索）打通'],
    cons: ['回答有时过于保守', '创意和代码能力偏弱'],
    keywords: ['百度', '国内', '中文', '搜索', '地道', '生活']
  },
  {
    id: 'kling',
    name: '可灵 AI',
    modality: 'video',
    difficulty: '小白级',
    isPaid: '免费/有额度',
    chinaFriendly: '直连使用',
    upvotes: 89,
    downvotes: 11,
    description: '快手出品的国产视频生成神器，效果媲美 Sora，国内直连。',
    pros: ['国内直连，生成效果全球顶级', '支持图片转视频，动作自然流畅'],
    cons: ['免费额度有限，高清需要付费', '生成时间较长'],
    keywords: ['视频', '国内', '图转视频', '短视频', '快手', '动画', '免费']
  },
  {
    id: 'jimeng',
    name: '即梦 AI',
    modality: 'image',
    difficulty: '小白级',
    isPaid: '免费/有额度',
    chinaFriendly: '直连使用',
    upvotes: 87,
    downvotes: 13,
    description: '字节跳动出品的国产绘图工具，中文提示词直接用，国内直连。',
    pros: ['中文描述直接生成，不需要英文', '国内直连速度快，免费额度够用'],
    cons: ['复杂构图控制弱于 Midjourney', '商用授权需额外确认'],
    keywords: ['画画', '绘图', '国内', '中文', '插画', '免费', '设计', '字节']
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    modality: 'text',
    difficulty: '小白级',
    isPaid: '免费/有额度',
    chinaFriendly: '直连使用',
    upvotes: 96,
    downvotes: 4,
    description: '国产最强推理 AI，数学和代码能力碾压大多数对手，完全免费。',
    pros: ['完全免费，推理能力接近 GPT-4', '数学、逻辑、代码题全球顶级'],
    cons: ['高峰期经常服务器繁忙', '创意写作不如 Claude'],
    keywords: ['数学', '代码', '推理', '免费', '国内', '逻辑', '编程', '学习']
  },
  {
    id: 'hailuo',
    name: '海螺 AI',
    modality: 'audio',
    difficulty: '小白级',
    isPaid: '免费/有额度',
    chinaFriendly: '直连使用',
    upvotes: 84,
    downvotes: 16,
    description: 'MiniMax 出品的国产语音克隆工具，效果自然，国内直连免费用。',
    pros: ['国内直连，声音克隆效果非常自然', '支持情绪控制，悲伤/开心都能调'],
    cons: ['长文本生成偶尔有断句问题', '高级功能需要付费'],
    keywords: ['配音', '克隆', '语音', '国内', '声音', '有声书', '免费']
  },
  {
    id: 'napkin',
    name: 'Napkin AI',
    modality: 'image',
    difficulty: '小白级',
    isPaid: '免费/有额度',
    chinaFriendly: '需魔法',
    upvotes: 86,
    downvotes: 14,
    description: '把文字自动变成精美的信息图、流程图和 PPT 配图。',
    pros: ['输入文字秒出精美图表，不需要设计基础', '特别适合做演讲稿和汇报材料'],
    cons: ['目前中文支持还不够完善', '免费版每月有生成次数限制'],
    keywords: ['PPT', '图表', '流程图', '汇报', '演示', '可视化', '设计']
  },
  {
    id: 'gamma',
    name: 'Gamma',
    modality: 'general',
    difficulty: '小白级',
    isPaid: '免费/有额度',
    chinaFriendly: '需魔法',
    upvotes: 91,
    downvotes: 9,
    description: '用 AI 一键生成漂亮的 PPT、文档和网页，告别 PowerPoint。',
    pros: ['输入主题10秒出完整 PPT，模板非常好看', '可以直接分享链接，不用下载文件'],
    cons: ['中文字体支持一般', '深度自定义需要付费'],
    keywords: ['PPT', '演示', '幻灯片', '汇报', '提案', '网页', '文档']
  },
  {
    id: 'notion-ai',
    name: 'Notion AI',
    modality: 'text',
    difficulty: '进阶级',
    isPaid: '纯付费',
    chinaFriendly: '需魔法',
    upvotes: 83,
    downvotes: 17,
    description: '内嵌在 Notion 笔记里的 AI，帮你整理思路、写文档、做总结。',
    pros: ['和笔记无缝结合，随时 AI 辅助写作', '团队协作场景非常顺滑'],
    cons: ['需要已经在用 Notion 才值得', 'AI 功能需要额外付费'],
    keywords: ['笔记', '整理', '写作', '团队', '协作', '文档', '总结']
  }
];

// --- AI Intent Recognition ---
async function recognizeIntent(userQuery: string, productsList: Product[], modalityHint?: string | null): Promise<{
  recommendedIds: string[];
  reasoning: string;
  detectedNeeds: string[];
}> {
  const modalityNames: Record<string, string> = { text:'文字', image:'图片', audio:'音频', video:'视频', general:'综合' };
  const modalityNote = modalityHint ? `\n\n【重要提示】用户已选择「${modalityNames[modalityHint] || modalityHint}」类别标签，请优先推荐 modality 为 "${modalityHint}" 的产品，只有在该类别完全没有匹配时才推荐其他类别。` : '';
  const productList = productsList.map(p => 
    `[ID必须用: ${p.id}] ${p.name}: ${p.description} | 关键词: ${p.keywords.join(', ')} | 类型: ${p.modality} | 国内直连: ${p.chinaFriendly} | 难度: ${p.difficulty} | 费用: ${p.isPaid}`
  ).join('\n');

  const idList = productsList.map(p => p.id).join(', ');

  const response = await fetch('/api/intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: userQuery + modalityNote, productList, idList })
  });

  if (!response.ok) {
    const err: any = new Error('API 请求失败');
    err.status = response.status;
    throw err;
  }
  return response.json();
}

// --- Components ---

const ModalityButton = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 ${
      active 
        ? 'bg-white shadow-xl scale-105 border-2 border-stone-800' 
        : 'bg-stone-100 hover:bg-stone-200 opacity-60 hover:opacity-100'
    }`}
  >
    <Icon size={32} className={active ? 'text-stone-800' : 'text-stone-500'} />
    <span className={`mt-3 text-sm font-medium ${active ? 'text-stone-800' : 'text-stone-500'}`}>
      {label}
    </span>
  </button>
);

const ProductCard: React.FC<{ product: Product; aiReason?: string }> = ({ product, aiReason }) => {
  const [showDetail, setShowDetail] = useState(false);
  const totalVotes = product.upvotes + product.downvotes;
  const upvotePercent = Math.round((product.upvotes / totalVotes) * 100);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-stone-100 flex flex-col h-full"
    >
      {aiReason && (
        <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2">
          <Sparkles size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 leading-relaxed">{aiReason}</p>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <h3 className="serif text-2xl font-bold text-stone-800">{product.name}</h3>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-stone-100 text-[10px] rounded-full text-stone-500 font-bold uppercase tracking-wider">
            {product.difficulty}
          </span>
        </div>
      </div>

      <p className="text-stone-600 text-sm mb-6 leading-relaxed flex-grow">
        {product.description}
      </p>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span className={`w-2 h-2 rounded-full ${product.isPaid === '纯付费' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
          {product.isPaid}
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span className={`w-2 h-2 rounded-full ${product.chinaFriendly === '需魔法' ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
          {product.chinaFriendly}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-[10px] text-stone-400 mb-1 font-bold uppercase tracking-tighter">
          <span>推荐指数</span>
          <span>{upvotePercent}%</span>
        </div>
        <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden flex">
          <div className="h-full bg-emerald-400" style={{ width: `${upvotePercent}%` }}></div>
          <div className="h-full bg-red-400" style={{ width: `${100 - upvotePercent}%` }}></div>
        </div>
      </div>

      <button 
        onClick={() => setShowDetail(true)}
        className="w-full py-3 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-900 transition-colors flex items-center justify-center gap-2"
      >
        适用场景 <ChevronRight size={16} />
      </button>

      <AnimatePresence>
        {showDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#F5F2ED] w-full max-w-lg rounded-3xl p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowDetail(false)}
                className="absolute top-6 right-6 p-2 hover:bg-stone-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="serif text-3xl font-bold mb-2">{product.name}</h2>
              <p className="text-stone-500 text-sm mb-8">大白话对比：到底该不该选它？</p>
              <div className="space-y-8">
                <section>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold mb-3">
                    <CheckCircle2 size={20} />
                    <span>真香：这些情况超好用</span>
                  </div>
                  <ul className="space-y-2">
                    {product.pros.map((pro, i) => (
                      <li key={i} className="text-stone-700 text-sm leading-relaxed pl-7 relative">
                        <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-emerald-200 rounded-full"></span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <div className="flex items-center gap-2 text-red-500 font-bold mb-3">
                    <AlertCircle size={20} />
                    <span>避雷：这些情况别选它</span>
                  </div>
                  <ul className="space-y-2">
                    {product.cons.map((con, i) => (
                      <li key={i} className="text-stone-700 text-sm leading-relaxed pl-7 relative">
                        <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-red-200 rounded-full"></span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
              <button 
                onClick={() => setShowDetail(false)}
                className="mt-10 w-full py-4 bg-stone-800 text-white rounded-2xl font-bold hover:bg-stone-900 transition-colors"
              >
                我知道了
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function App() {
  const [selectedModality, setSelectedModality] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResults, setAiResults] = useState<{
    products: Product[];
    reasoning: string;
    detectedNeeds: string[];
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [products, setProducts] = React.useState<Product[]>(PRODUCTS);

  // Load products from API on mount
  React.useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setProducts(data); })
      .catch(() => {});
  }, []);

  // --- Voice Input ---
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('你的浏览器不支持语音输入，建议使用 Chrome');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleAiSearch(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  // --- AI Search ---
  const handleAiSearch = async (searchQuery: string, modalityHint?: string | null) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 4) {
      setAiResults(null);
      return;
    }
    setIsAnalyzing(true);
    setAiError(null);
    try {
      const result = await recognizeIntent(searchQuery, products, modalityHint);
      // FIX: case-insensitive ID matching to prevent empty results
      // Robust matching: exact → lowercase → name contains → keyword fallback
      const matchedProducts = result.recommendedIds.map(id => {
        const normalized = id.toLowerCase().trim();
        // 1. Exact match
        let p = products.find(p => p.id === id);
        if (p) return p;
        // 2. Case-insensitive ID match
        p = products.find(p => p.id.toLowerCase().trim() === normalized);
        if (p) return p;
        // 3. Product name contains the ID (e.g. AI returns "kimi" and name is "Kimi 智能助手")
        p = products.find(p => p.name.toLowerCase().includes(normalized) || normalized.includes(p.id.toLowerCase()));
        if (p) return p;
        console.warn('Unmatched ID from AI:', id, '| Available IDs:', products.map(p => p.id));
        return null;
      }).filter(Boolean) as Product[];

      // Deduplicate (in case fuzzy matching returned duplicates)
      const seen = new Set<string>();
      const deduped = matchedProducts.filter(p => seen.has(p.id) ? false : (seen.add(p.id), true));
      setAiResults({
        products: deduped,
        reasoning: result.reasoning,
        detectedNeeds: result.detectedNeeds
      });
    } catch (e: any) {
      if (e?.status === 429) {
        setAiError('搜索太频繁啦，休息1分钟再试试 😊');
      } else {
        setAiError('AI 分析暂时不可用，已为你展示关键词匹配结果');
      }
      setAiResults(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setAiResults(null);
      setAiError(null);
      return;
    }
    debounceRef.current = setTimeout(() => {
      handleAiSearch(value, selectedModality);
    }, 800);
  };

  // --- Keyword fallback filter ---
  const keywordFilteredProducts = useMemo(() => {
    if (!selectedModality && !query) return [];
    let results = products;
    if (selectedModality) {
      results = results.filter(p => p.modality === selectedModality);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(p => {
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesKeywords = p.keywords.some(k => q.includes(k) || k.includes(q));
        const matchesDesc = p.description.includes(q);
        return matchesName || matchesKeywords || matchesDesc;
      });
      results = [...results].sort((a, b) => {
        const aScore = a.keywords.filter(k => query.toLowerCase().includes(k)).length;
        const bScore = b.keywords.filter(k => query.toLowerCase().includes(k)).length;
        return bScore - aScore;
      });
    }
    return results;
  }, [selectedModality, query, products]);

  // 筛选标签作为强制条件，AI结果在其范围内排序
  const aiFilteredProducts = useMemo(() => {
    if (!aiResults?.products.length) return [];
    if (!selectedModality) return aiResults.products;
    return aiResults.products.filter(p => p.modality === selectedModality);
  }, [aiResults, selectedModality]);

  const displayProducts = useMemo(() => {
    if (aiResults?.products.length) {
      // 有AI结果：优先用AI过滤后的，过滤为空时仍展示AI结果（不降级到关键词匹配）
      return aiFilteredProducts.length > 0 ? aiFilteredProducts : aiResults.products;
    }
    return keywordFilteredProducts;
  }, [aiResults, aiFilteredProducts, keywordFilteredProducts]);

  // AI模式：有AI结果就算AI模式，标签过滤为空时也保持AI模式
  const isAiMode = !!aiResults?.products.length;
  // 标签和AI结果有冲突时提示
  const hasModalityConflict = !!selectedModality && !!aiResults?.products.length && aiFilteredProducts.length === 0;

  return (
    <div className="min-h-screen pb-20">
      <header className="max-w-6xl mx-auto pt-20 px-6 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="serif text-5xl md:text-6xl font-bold text-stone-800 mb-4"
        >
          AI 选型助手
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-stone-500 text-lg mb-16"
        >
          文科生也能听懂的 AI 导购，帮你找到最趁手的工具
        </motion.p>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-w-3xl mx-auto mb-16">
          <ModalityButton icon={Type} label="文字" active={selectedModality === 'text'} onClick={() => setSelectedModality(selectedModality === 'text' ? null : 'text')} />
          <ModalityButton icon={ImageIcon} label="图片" active={selectedModality === 'image'} onClick={() => setSelectedModality(selectedModality === 'image' ? null : 'image')} />
          <ModalityButton icon={Music} label="音频" active={selectedModality === 'audio'} onClick={() => setSelectedModality(selectedModality === 'audio' ? null : 'audio')} />
          <ModalityButton icon={Video} label="视频" active={selectedModality === 'video'} onClick={() => setSelectedModality(selectedModality === 'video' ? null : 'video')} />
          <ModalityButton icon={Layers} label="综合" active={selectedModality === 'general'} onClick={() => setSelectedModality(selectedModality === 'general' ? null : 'general')} />
        </div>

        <div className="max-w-2xl mx-auto relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-800 transition-colors">
            {isAnalyzing ? <Loader2 size={20} className="animate-spin text-amber-500" /> : <Search size={20} />}
          </div>
          <input 
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={
              selectedModality === 'text' ? '在文字工具里找什么？（如：免费的、能帮我写论文的）' :
              selectedModality === 'image' ? '在图片工具里找什么？（如：国内直连、免费画插画）' :
              selectedModality === 'audio' ? '在音频工具里找什么？（如：做生日歌、克隆声音）' :
              selectedModality === 'video' ? '在视频工具里找什么？（如：照片动起来、国内可用）' :
              selectedModality === 'general' ? '在综合工具里找什么？（如：免费的、能做PPT的）' :
              '用大白话描述你想解决的问题（如：我想给爷爷奶奶做一张会说话的电子贺卡）'
            }
            className="w-full pl-14 pr-16 py-5 bg-white rounded-2xl shadow-sm border border-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-800/10 focus:border-stone-300 transition-all text-stone-800 placeholder:text-stone-300"
          />
          <button 
            onClick={handleVoiceInput}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-stone-300 hover:text-stone-800'}`}
          >
            <Mic size={20} />
          </button>
        </div>

        {/* AI Analysis Result Banner */}
        <AnimatePresence>
          {isAiMode && aiResults && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto mt-4 px-5 py-4 bg-amber-50 border border-amber-100 rounded-2xl text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-amber-500" />
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">我猜你想找的是…</span>
              </div>
              <p className="text-base text-amber-900 font-medium leading-relaxed mb-2">
                {aiResults.reasoning}
              </p>
              {(hasModalityConflict || (selectedModality && !hasModalityConflict && aiFilteredProducts.length < (aiResults?.products.length ?? 0))) && (
                <p className="text-xs text-amber-600 mb-2">
                  {hasModalityConflict
                    ? `⚠️ AI推荐的产品不在「${({'text':'文字','image':'图片','audio':'音频','video':'视频','general':'综合'} as any)[selectedModality!]}」分类里，已显示全部AI推荐`
                    : `· 已按「${({'text':'文字','image':'图片','audio':'音频','video':'视频','general':'综合'} as any)[selectedModality!]}」筛选`
                  }
                </p>
              )}
              {aiResults.detectedNeeds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {aiResults.detectedNeeds.map((need, i) => (
                    <span key={i} className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">#{need}</span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
          {aiError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl mx-auto mt-4 px-4 py-3 bg-stone-100 rounded-xl text-xs text-stone-500 text-center"
            >
              {aiError}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-6xl mx-auto mt-20 px-6">
        <AnimatePresence mode="wait">
          {displayProducts.length > 0 ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {displayProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  aiReason={undefined}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-stone-300"
            >
              {!selectedModality && !query ? (
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center">
                      <ChevronRight size={32} />
                    </div>
                  </div>
                  <p className="text-sm font-medium">点击上方分类或输入需求开始筛选</p>
                </div>
              ) : isAnalyzing ? (
                <div className="text-center">
                  <Loader2 size={32} className="animate-spin mx-auto mb-4 text-amber-400" />
                  <p className="text-sm font-medium text-stone-400">AI 正在分析你的需求...</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium">暂时没找到完全匹配的，换个说法试试？</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-40 text-center opacity-20 pointer-events-none">
        <div className="serif font-black select-none" style={{fontSize: '9px', letterSpacing: '0.05em'}}>AI SELECTOR</div>
      </footer>
    </div>
  );
}
