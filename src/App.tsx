/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
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
  X
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
    keywords: ['聊天', '写东西', '翻译', '主意', '全能']
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
    keywords: ['画画', '设计', '插画', '壁纸', '艺术']
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
    keywords: ['唱歌', '作词', '作曲', '音乐', '贺卡']
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
    keywords: ['视频', '电影', '动画', '特效']
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
    keywords: ['读文档', '整理', '国内', '长文章', '办公']
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
    keywords: ['配音', '朗读', '克隆', '说话', '有声书']
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
    description: '让你的照片“动”起来，或者把文字变成有趣的动画。',
    pros: ['操作非常简单，点点鼠标就能动', '有很多有趣的特效（比如把东西压扁）'],
    cons: ['视频长度比较短', '清晰度偶尔会下降'],
    keywords: ['动图', '动画', '有趣', '照片变视频']
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
    keywords: ['搜索', '查资料', '写论文', '事实']
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
    keywords: ['免费', '开源', '精准控制', '本地运行']
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
    keywords: ['写作', '文采', '代码', '聪明', '人性化']
  }
];

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

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
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

      {/* Vote Bar */}
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

      {/* Detail Dialog */}
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
  };
  recognition.onerror = () => setIsListening(false);
  recognition.start();
};

  // --- Intent Recognition Logic ---
  const filteredProducts = useMemo(() => {
    if (!selectedModality && !query) return [];

    let results = PRODUCTS;

    if (selectedModality) {
      results = results.filter(p => p.modality === selectedModality || (selectedModality === 'general' && p.modality === 'general'));
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(p => {
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesKeywords = p.keywords.some(k => q.includes(k) || k.includes(q));
        const matchesDesc = p.description.includes(q);
        return matchesName || matchesKeywords || matchesDesc;
      });

      // Sort by relevance (keyword matches first)
      results = [...results].sort((a, b) => {
        const aScore = a.keywords.filter(k => q.includes(k)).length;
        const bScore = b.keywords.filter(k => q.includes(k)).length;
        return bScore - aScore;
      });
    }

    return results;
  }, [selectedModality, query]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header Section */}
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

        {/* Modality Selector */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-w-3xl mx-auto mb-16">
          <ModalityButton 
            icon={Type} label="文字" 
            active={selectedModality === 'text'} 
            onClick={() => setSelectedModality(selectedModality === 'text' ? null : 'text')} 
          />
          <ModalityButton 
            icon={ImageIcon} label="图片" 
            active={selectedModality === 'image'} 
            onClick={() => setSelectedModality(selectedModality === 'image' ? null : 'image')} 
          />
          <ModalityButton 
            icon={Music} label="音频" 
            active={selectedModality === 'audio'} 
            onClick={() => setSelectedModality(selectedModality === 'audio' ? null : 'audio')} 
          />
          <ModalityButton 
            icon={Video} label="视频" 
            active={selectedModality === 'video'} 
            onClick={() => setSelectedModality(selectedModality === 'video' ? null : 'video')} 
          />
          <ModalityButton 
            icon={Layers} label="综合" 
            active={selectedModality === 'general'} 
            onClick={() => setSelectedModality(selectedModality === 'general' ? null : 'general')} 
          />
        </div>

        {/* Intent Recognition Input */}
        <div className="max-w-2xl mx-auto relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-800 transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="用大白话描述你想解决的问题（如：我想给爷爷奶奶做一张会说话的电子贺卡）"
            className="w-full pl-14 pr-16 py-5 bg-white rounded-2xl shadow-sm border border-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-800/10 focus:border-stone-300 transition-all text-stone-800 placeholder:text-stone-300"
          />
<button 
  onClick={handleVoiceInput}
  className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-stone-300 hover:text-stone-800'}`}
>
  <Mic size={20} />
</button>
        </div>
      </header>

      {/* Results Section */}
      <main className="max-w-6xl mx-auto mt-20 px-6">
        <AnimatePresence mode="wait">
          {filteredProducts.length > 0 ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
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
                  <p className="text-sm font-medium">点击上方模态或输入需求开始筛选</p>
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

      {/* Footer Decoration */}
      <footer className="mt-40 text-center opacity-20 pointer-events-none">
        <div className="serif font-black select-none" style={{fontSize: '9px', letterSpacing: '0.05em'}}>AI SELECTOR</div>
      </footer>
    </div>
  );
}
