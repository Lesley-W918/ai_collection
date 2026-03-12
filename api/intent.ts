import type { VercelRequest, VercelResponse } from '@vercel/node';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 7;
const WINDOW_MS = 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

let cleanupCounter = 0;
function maybeCleanup() {
  if (++cleanupCounter % 100 === 0) {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap.entries()) {
      if (now > entry.resetAt) rateLimitMap.delete(ip);
    }
  }
}

const DEFAULT_PROMPT = `你是一个专业的 AI 工具推荐专家，深度理解中国用户的使用场景和习惯。

## 识别用户画像
- 学生：作业、考试、论文、学习、免费
- 职场人：工作、汇报、会议、报告、效率
- 创作者：视频、博主、粉丝、副业、变现
- 普通用户：日常、送礼、娱乐、生活

## 识别隐含条件（非常重要，必须严格执行）
- 提到"国内/不翻墙/直接用/大陆/不科学上网" → 只能推荐 chinaFriendly=直连使用 的产品，绝对不推荐需要魔法的产品
- 提到"免费/不花钱/穷/学生/没钱" → 只推荐 isPaid=免费/有额度 的产品
- 提到"简单/小白/不会/第一次" → 只推荐 difficulty=小白级 的产品
- 提到"送人/礼物/贺卡/生日/纪念日" → 推荐有创意输出的工具
- 提到"工作/汇报/老板/商务" → 推荐专业稳定的工具

## 场景联想
- 给老人/长辈 → 必须国内直连 + 小白级
- 给朋友/闺蜜 → 有创意、有趣
- 学习/考试/论文 → 搜索、文档、推理类`;

// Runtime custom prompt storage
let runtimePrompt: string | null = null;
export function setCustomPrompt(p: string) { runtimePrompt = p; }
export function getCustomPrompt() { return runtimePrompt || process.env.CUSTOM_PROMPT || DEFAULT_PROMPT; }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  maybeCleanup();
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Rate limit exceeded', message: '请求太频繁，请1分钟后再试' });
  }

  const { query, productList, idList } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const basePrompt = getCustomPrompt();

  const prompt = `${basePrompt}

用户需求：${query}

产品库（[ID必须用: xxx] 是你必须原样返回的ID，不能修改）：
${productList}

【强制规则】
1. recommendedIds 里的值必须完全等于产品库中 [ID必须用: xxx] 的 xxx，不能拼写错误
2. 可用ID完整列表：${idList || '见上方产品库'}
3. 如果用户要求国内直连，绝对不能推荐标注"需魔法"的产品

返回 JSON（不加任何 markdown）：
{
  "recommendedIds": ["精确ID1", "精确ID2"],
  "reasoning": "像朋友推荐一样口语化，不超过60字",
  "detectedNeeds": ["用户画像", "需求类型", "场景"]
}`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 500,
        messages: [
          { role: 'system', content: '你是AI工具推荐专家。只返回纯JSON，ID必须从产品库原样复制，绝不自造ID。' },
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '{}';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: 'AI analysis failed' });
  }
}
