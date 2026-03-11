import type { VercelRequest, VercelResponse } from '@vercel/node';

// Rate limiter
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
  cleanupCounter++;
  if (cleanupCounter % 100 === 0) {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap.entries()) {
      if (now > entry.resetAt) rateLimitMap.delete(ip);
    }
  }
}

// Runtime prompt storage (shared with admin.ts in same process)
let runtimePrompt: string | null = null;

const DEFAULT_PROMPT = `你是一个 AI 工具推荐专家。用户描述了他们的需求，请从产品库中找出最合适的工具。

分析用户需求时请注意：
1. 如果用户提到"国内"、"不翻墙"、"直接用"，优先推荐 chinaFriendly 为"直连使用"的产品
2. 如果用户是小白或没有技术背景，优先推荐 difficulty 为"小白级"的产品
3. 如果用户提到"免费"、"不花钱"，优先推荐 isPaid 为"免费/有额度"的产品
4. 理解用户的隐含需求，比如"做视频"可能需要视频生成工具，"写报告"需要文字处理工具

用户需求：{{query}}

产品库：
{{productList}}

返回 JSON 格式（不要加任何 markdown 标记）：
{
  "recommendedIds": ["id1", "id2", "id3"],
  "reasoning": "一句话解释为什么推荐这些（用大白话，面向普通用户）",
  "detectedNeeds": ["需求标签1", "需求标签2"]
}

规则：
- recommendedIds 最多返回4个，按匹配度排序
- reasoning 不超过60字，口语化
- detectedNeeds 是2-4个简短标签（如：免费、国内直连、视频制作）
- 只返回纯 JSON，不要加任何解释`;

export function setRuntimePrompt(p: string | null) { runtimePrompt = p; }
export function getRuntimePrompt() { return runtimePrompt; }

function getPrompt(query: string, productList: string): string {
  const template = runtimePrompt || process.env.CUSTOM_PROMPT || DEFAULT_PROMPT;
  return template.replace('{{query}}', query).replace('{{productList}}', productList);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  maybeCleanup();

  if (isRateLimited(ip)) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      message: '请求太频繁，请1分钟后再试'
    });
  }

  const { query, productList } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

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
          { role: 'system', content: '你是一个 AI 工具推荐专家，只返回纯 JSON，不加任何 markdown。' },
          { role: 'user', content: getPrompt(query, productList) }
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
