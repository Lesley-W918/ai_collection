import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query, productList } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const prompt = `你是一个 AI 工具推荐专家。用户描述了他们的需求，请从产品库中找出最合适的工具。

用户需求：${query}

产品库：
${productList}

请分析用户需求，返回 JSON 格式（不要加任何 markdown 标记）：
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
