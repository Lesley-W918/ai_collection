import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put, head, getDownloadUrl } from '@vercel/blob';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';
const BLOB_KEY = 'products.json';

const DEFAULT_PRODUCTS = [
  {
    id: 'chatgpt', name: 'ChatGPT', modality: 'general', difficulty: '小白级',
    isPaid: '免费/有额度', chinaFriendly: '需魔法', upvotes: 85, downvotes: 15,
    description: '全球最聪明的 AI 聊天机器人，几乎能帮你做任何事。',
    pros: ['写文章、改代码、出主意都是顶尖水平', '手机端支持语音直接对话，像真人一样'],
    cons: ['国内注册和支付比较麻烦', '有时候会一本正经地胡说八道'],
    keywords: ['聊天', '写东西', '翻译', '主意', '全能', '问答', '对话', '英语', '写邮件', '改文章', '头脑风暴', '出点子', '写方案', '写简历', '写文案']
  },
  {
    id: 'deepseek', name: 'DeepSeek', modality: 'text', difficulty: '小白级',
    isPaid: '免费/有额度', chinaFriendly: '直连使用', upvotes: 96, downvotes: 4,
    description: '国产最强推理 AI，数学和代码能力碾压大多数对手，完全免费。',
    pros: ['完全免费，推理能力接近 GPT-4', '数学、逻辑、代码题全球顶级'],
    cons: ['高峰期经常服务器繁忙', '创意写作不如 Claude'],
    keywords: ['数学', '代码', '推理', '免费', '国内', '逻辑', '编程', '学习', '作业', '解题', '考研', '数理化', '逻辑题', '推导', '算法', '写代码', '调bug']
  },
  {
    id: 'kimi', name: 'Kimi 智能助手', modality: 'text', difficulty: '小白级',
    isPaid: '免费/有额度', chinaFriendly: '直连使用', upvotes: 95, downvotes: 5,
    description: '国产最强长文本 AI，能一次性读完几十万字的文件。',
    pros: ['国内直接用，速度极快', '读超长文档、整理会议纪要的神器'],
    cons: ['在创意写作和逻辑推理上略逊于 ChatGPT', '高峰期偶尔需要排队'],
    keywords: ['读文档', '整理', '国内', '长文章', '办公', '总结', 'PDF', '报告', '合同', '读书笔记', '论文', '会议记录', '提炼重点', '文件分析', '超长文本']
  },
  {
    id: 'doubao', name: '豆包', modality: 'general', difficulty: '小白级',
    isPaid: '免费/有额度', chinaFriendly: '直连使用', upvotes: 93, downvotes: 7,
    description: '字节跳动出品的国产 AI 助手，国内免费直连，功能全面。',
    pros: ['国内直接用，完全免费无限制', '支持图片识别、联网搜索、生成图片'],
    cons: ['在复杂逻辑推理上略逊于 ChatGPT', '部分内容有审查限制'],
    keywords: ['国内', '免费', '聊天', '全能', '字节', '抖音', '日常', '解闷', '问问题', '百科', '查信息', '随便聊', '陪伴', '娱乐', '生活助手']
  },
  {
    id: 'midjourney', name: 'Midjourney', modality: 'image', difficulty: '进阶级',
    isPaid: '纯付费', chinaFriendly: '需魔法', upvotes: 92, downvotes: 8,
    description: '目前画质最高、艺术感最强的 AI 绘画工具。',
    pros: ['画出来的图可以直接当壁纸或商用', '审美极高，随便写几个词就很惊艳'],
    cons: ['没有中文界面，需要用英文描述', '必须在 Discord 软件里用，操作有点怪'],
    keywords: ['画画', '设计', '插画', '壁纸', '艺术', '绘图', '作图', '配图', '头像', '封面', '海报', '商业插画', '高质量图', '写实风', '动漫风']
  },
  {
    id: 'jimeng', name: '即梦 AI', modality: 'image', difficulty: '小白级',
    isPaid: '免费/有额度', chinaFriendly: '直连使用', upvotes: 87, downvotes: 13,
    description: '字节跳动出品的国产绘图工具，中文提示词直接用，国内直连。',
    pros: ['中文描述直接生成，不需要英文', '国内直连速度快，免费额度够用'],
    cons: ['复杂构图控制弱于 Midjourney', '商用授权需额外确认'],
    keywords: ['画画', '绘图', '国内', '中文', '插画', '免费', '设计', '字节', '头像', '封面', '海报', '朋友圈配图', '表情包', '社交图片']
  },
  {
    id: 'suno', name: 'Suno AI', modality: 'audio', difficulty: '小白级',
    isPaid: '免费/有额度', chinaFriendly: '需魔法', upvotes: 88, downvotes: 12,
    description: '只要输入一句话，它就能帮你写词、作曲、编曲并唱出来。',
    pros: ['完全不懂音乐也能做出专业级歌曲', '支持中文歌词，唱得非常有感情'],
    cons: ['免费额度很快就会用完', '偶尔会有电音感或杂音'],
    keywords: ['唱歌', '作词', '作曲', '音乐', '贺卡', '歌曲', '旋律', '生日歌', '情歌', 'BGM', '背景音乐', '送朋友', '纪念日', 'rap', '儿歌', '原创歌曲', '献给', '惊喜礼物', '有声贺卡']
  },
  {
    id: 'hailuo', name: '海螺 AI', modality: 'audio', difficulty: '小白级',
    isPaid: '免费/有额度', chinaFriendly: '直连使用', upvotes: 84, downvotes: 16,
    description: 'MiniMax 出品的国产语音克隆工具，效果自然，国内直连免费用。',
    pros: ['国内直连，声音克隆效果非常自然', '支持情绪控制，悲伤/开心都能调'],
    cons: ['长文本生成偶尔有断句问题', '高级功能需要付费'],
    keywords: ['配音', '克隆', '语音', '国内', '声音', '有声书', '免费', '声音复刻', '朗读', '播客', '语音合成', '模仿声音']
  },
  {
    id: 'kling', name: '可灵 AI', modality: 'video', difficulty: '小白级',
    isPaid: '免费/有额度', chinaFriendly: '直连使用', upvotes: 89, downvotes: 11,
    description: '快手出品的国产视频生成神器，效果媲美 Sora，国内直连。',
    pros: ['国内直连，生成效果全球顶级', '支持图片转视频，动作自然流畅'],
    cons: ['免费额度有限，高清需要付费', '生成时间较长'],
    keywords: ['视频', '国内', '图转视频', '短视频', '快手', '动画', '免费', '动起来', '照片动画', '人物跳舞', '卡点视频', '视频特效', '老照片动起来']
  },
  {
    id: 'runway', name: 'Runway Gen-3', modality: 'video', difficulty: '进阶级',
    isPaid: '纯付费', chinaFriendly: '需魔法', upvotes: 80, downvotes: 20,
    description: '好莱坞级别的 AI 视频生成工具，画面极其逼真。',
    pros: ['画面质感像电影大片', '可以控制镜头移动和光影变化'],
    cons: ['生成速度比较慢', '价格较贵，适合专业人士'],
    keywords: ['视频', '电影', '动画', '特效', '剪辑', '生成视频', '专业视频', '高质量视频', '好莱坞']
  },
  {
    id: 'perplexity', name: 'Perplexity', modality: 'general', difficulty: '小白级',
    isPaid: '免费/有额度', chinaFriendly: '需魔法', upvotes: 94, downvotes: 6,
    description: '会联网的 AI 搜索，直接给你答案并附上来源，不再有广告。',
    pros: ['找资料效率极高，不用自己翻网页', '给出的信息都有出处，比较靠谱'],
    cons: ['中文搜索结果偶尔不如英文丰富', '需要网络环境支持'],
    keywords: ['搜索', '查资料', '写论文', '事实', '新闻', '研究', '找信息', '实时搜索', '带来源', '可信信息', '学术搜索']
  },
  {
    id: 'gamma', name: 'Gamma', modality: 'general', difficulty: '小白级',
    isPaid: '免费/有额度', chinaFriendly: '需魔法', upvotes: 91, downvotes: 9,
    description: '用 AI 一键生成漂亮的 PPT、文档和网页，告别 PowerPoint。',
    pros: ['输入主题10秒出完整 PPT，模板非常好看', '可以直接分享链接，不用下载文件'],
    cons: ['中文字体支持一般', '深度自定义需要付费'],
    keywords: ['PPT', '演示', '幻灯片', '汇报', '提案', '网页', '文档', '做PPT', '快速PPT', '漂亮PPT', '演讲稿']
  },
  {
    id: 'claude', name: 'Claude 3.5', modality: 'text', difficulty: '小白级',
    isPaid: '免费/有额度', chinaFriendly: '需魔法', upvotes: 91, downvotes: 9,
    description: '文笔最好、最像人类作家的 AI，写出来的东西不生硬。',
    pros: ['写诗、写小说、写邮件非常有文采', '代码能力目前是全球第一'],
    cons: ['封号风险比较高', '免费额度非常少'],
    keywords: ['写作', '文采', '代码', '聪明', '人性化', '编程', '邮件', '写小说', '写诗', '文章润色', '创意写作', '代码审查']
  }
];

async function getProducts() {
  try {
    const blobUrl = process.env.PRODUCTS_BLOB_URL;
    if (!blobUrl) return DEFAULT_PRODUCTS;
    const res = await fetch(blobUrl);
    if (!res.ok) return DEFAULT_PRODUCTS;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {}
  return DEFAULT_PRODUCTS;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');

  // GET: fetch all products (public)
  if (req.method === 'GET' && !req.query.admin) {
    const products = await getProducts();
    return res.status(200).json(products);
  }

  // Admin operations require password
  const password = req.method === 'GET' ? req.query.password : req.body?.password;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: '密码错误' });
  }

  // GET admin: fetch products for editing
  if (req.method === 'GET') {
    const products = await getProducts();
    return res.status(200).json({ products });
  }

  // POST: save products to Blob
  if (req.method === 'POST') {
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: '数据格式错误' });
    }
    try {
      const blob = await put(BLOB_KEY, JSON.stringify(products), {
        access: 'private',
        allowOverwrite: true,
        contentType: 'application/json',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      // Save blob URL as env var hint in response
      return res.status(200).json({ 
        success: true, 
        message: `已保存 ${products.length} 个产品`,
        blobUrl: blob.url
      });
    } catch (e: any) {
      return res.status(500).json({ error: '保存失败: ' + e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
