import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple KV store using a module-level variable
// For persistence across deployments, prompt is stored in CUSTOM_PROMPT env var as fallback
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

export function getPrompt(): string {
  return runtimePrompt || process.env.CUSTOM_PROMPT || DEFAULT_PROMPT;
}

export function setPrompt(newPrompt: string): void {
  runtimePrompt = newPrompt;
}

export function getDefaultPrompt(): string {
  return DEFAULT_PROMPT;
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // GET: fetch current prompt
  if (req.method === 'GET') {
    const { password } = req.query;
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: '密码错误' });
    }
    return res.status(200).json({ 
      prompt: getPrompt(),
      defaultPrompt: getDefaultPrompt(),
      isCustom: !!runtimePrompt || !!process.env.CUSTOM_PROMPT
    });
  }

  // POST: update prompt
  if (req.method === 'POST') {
    const { password, prompt, reset } = req.body;
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: '密码错误' });
    }
    if (reset) {
      runtimePrompt = null;
      return res.status(200).json({ success: true, message: '已重置为默认 Prompt' });
    }
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 10) {
      return res.status(400).json({ error: 'Prompt 内容太短' });
    }
    setPrompt(prompt.trim());
    return res.status(200).json({ success: true, message: 'Prompt 已更新' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
