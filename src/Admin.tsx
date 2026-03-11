import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Lock, LogOut, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

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

export default function Admin() {
  const [password, setPassword] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [savedPrompt, setSavedPrompt] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleLogin = async () => {
    if (!inputPassword) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin?password=${encodeURIComponent(inputPassword)}`);
      if (res.status === 401) {
        showStatus('error', '密码错误，请重试');
        return;
      }
      const data = await res.json();
      setPassword(inputPassword);
      setPrompt(data.prompt);
      setSavedPrompt(data.prompt);
      setIsCustom(data.isCustom);
      setIsLoggedIn(true);
    } catch {
      showStatus('error', '连接失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, prompt })
      });
      const data = await res.json();
      if (res.ok) {
        setSavedPrompt(prompt);
        setIsCustom(true);
        showStatus('success', '✅ Prompt 已保存并立即生效！');
      } else {
        showStatus('error', data.error || '保存失败');
      }
    } catch {
      showStatus('error', '保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('确定要重置为默认 Prompt 吗？')) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, reset: true })
      });
      if (res.ok) {
        setPrompt(DEFAULT_PROMPT);
        setSavedPrompt(DEFAULT_PROMPT);
        setIsCustom(false);
        showStatus('success', '已重置为默认 Prompt');
      }
    } catch {
      showStatus('error', '重置失败');
    }
  };

  const hasChanges = prompt !== savedPrompt;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-stone-800 rounded-2xl flex items-center justify-center">
              <Lock size={24} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-stone-800 text-center mb-2">后台管理</h1>
          <p className="text-stone-400 text-sm text-center mb-8">AI 选型助手 · Prompt 编辑器</p>

          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              value={inputPassword}
              onChange={e => setInputPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="输入管理密码"
              className="w-full px-4 py-3 pr-12 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/10 focus:border-stone-300 text-stone-800"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {status && (
            <div className={`mb-4 px-4 py-2 rounded-xl text-sm text-center ${status.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {status.message}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoading || !inputPassword}
            className="w-full py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-900 transition-colors disabled:opacity-50"
          >
            {isLoading ? '验证中...' : '登录'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-stone-800">Prompt 编辑器</h1>
          <p className="text-xs text-stone-400">AI 选型助手 · 后台管理</p>
        </div>
        <div className="flex items-center gap-3">
          {isCustom && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
              自定义中
            </span>
          )}
          <a
            href="/"
            className="px-4 py-2 text-sm text-stone-500 hover:text-stone-800 transition-colors"
          >
            查看网站
          </a>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-stone-500 hover:text-stone-800 transition-colors"
          >
            <LogOut size={16} />
            退出
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Status Banner */}
        {status && (
          <div className={`mb-6 px-5 py-3 rounded-2xl flex items-center gap-3 ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-medium">{status.message}</span>
          </div>
        )}

        {/* Tips */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-6">
          <p className="text-sm font-bold text-amber-800 mb-2">✏️ 使用说明</p>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• <code className="bg-amber-100 px-1 rounded">{'{{query}}'}</code> 会被替换为用户的搜索内容，必须保留</li>
            <li>• <code className="bg-amber-100 px-1 rounded">{'{{productList}}'}</code> 会被替换为产品库数据，必须保留</li>
            <li>• 修改后点"保存并生效"，用户搜索时立即使用新 Prompt</li>
            <li>• 注意：服务器重启后会恢复默认，建议把好用的 Prompt 另存一份</li>
          </ul>
        </div>

        {/* Editor */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
            <span className="text-sm font-bold text-stone-700">系统 Prompt</span>
            {hasChanges && (
              <span className="text-xs text-amber-600 font-medium">● 有未保存的修改</span>
            )}
          </div>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className="w-full p-6 text-sm text-stone-700 font-mono leading-relaxed resize-none focus:outline-none"
            style={{ minHeight: '500px' }}
            spellCheck={false}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="flex items-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-900 transition-colors disabled:opacity-40"
          >
            <Save size={16} />
            {isSaving ? '保存中...' : '保存并生效'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-stone-100 text-stone-600 rounded-xl font-medium hover:bg-stone-200 transition-colors"
          >
            <RotateCcw size={16} />
            重置为默认
          </button>
        </div>

        <p className="text-xs text-stone-400 mt-3">
          💡 提示：想永久保存自定义 Prompt，可以把内容复制到 Vercel 环境变量 <code>CUSTOM_PROMPT</code> 中
        </p>
      </main>
    </div>
  );
}
