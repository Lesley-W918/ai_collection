import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, X } from 'lucide-react';

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

const EMPTY_PRODUCT: Product = {
  id: '', name: '', modality: 'general', difficulty: '小白级',
  isPaid: '免费/有额度', chinaFriendly: '需魔法',
  upvotes: 80, downvotes: 20,
  description: '', pros: [''], cons: [''], keywords: []
};

export default function AdminProducts({ password }: { password: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 3000);
  };

  useEffect(() => {
    fetch(`/api/products?admin=1&password=${encodeURIComponent(password)}`)
      .then(r => r.json())
      .then(data => { setProducts(data.products || []); setIsLoading(false); })
      .catch(() => { showStatus('error', '加载失败'); setIsLoading(false); });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, products })
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', '✅ ' + data.message);
        // If blob URL returned, remind admin to set env var
        if (data.blobUrl) {
          console.log('Products saved to Blob URL:', data.blobUrl);
          // Store in sessionStorage for reference
          sessionStorage.setItem('PRODUCTS_BLOB_URL', data.blobUrl);
        }
      } else showStatus('error', data.error || '保存失败');
    } catch { showStatus('error', '保存失败'); }
    finally { setIsSaving(false); }
  };

  const addProduct = () => {
    const newProduct = { ...EMPTY_PRODUCT, id: `product-${Date.now()}` };
    setProducts([...products, newProduct]);
    setExpandedId(newProduct.id);
  };

  const deleteProduct = (id: string) => {
    if (!confirm('确定删除这个产品？')) return;
    setProducts(products.filter(p => p.id !== id));
  };

  const updateProduct = (id: string, field: keyof Product, value: any) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const updateArrayField = (id: string, field: 'pros' | 'cons', index: number, value: string) => {
    setProducts(products.map(p => {
      if (p.id !== id) return p;
      const arr = [...p[field]];
      arr[index] = value;
      return { ...p, [field]: arr };
    }));
  };

  const addArrayItem = (id: string, field: 'pros' | 'cons') => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: [...p[field], ''] } : p));
  };

  const removeArrayItem = (id: string, field: 'pros' | 'cons', index: number) => {
    setProducts(products.map(p => {
      if (p.id !== id) return p;
      const arr = p[field].filter((_, i) => i !== index);
      return { ...p, [field]: arr.length ? arr : [''] };
    }));
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.includes(searchTerm)
  );

  if (isLoading) return (
    <div className="flex items-center justify-center py-20 text-stone-400">加载中...</div>
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="搜索产品..."
          className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-800/10"
        />
        <button
          onClick={addProduct}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-900 transition-colors"
        >
          <Plus size={16} /> 添加产品
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          <Save size={16} /> {isSaving ? '保存中...' : '保存全部'}
        </button>
      </div>

      {status && (
        <div className={`mb-4 px-4 py-3 rounded-xl flex items-center gap-2 text-sm ${
          status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {status.message}
        </div>
      )}

      <p className="text-xs text-stone-400 mb-4">共 {products.length} 个产品，显示 {filteredProducts.length} 个</p>

      {/* Product List */}
      <div className="space-y-3">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm">
            {/* Product Header */}
            <div
              className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-stone-50 transition-colors"
              onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-800">{product.name || '（未命名）'}</span>
                  <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-xs rounded-full">{product.modality}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${product.chinaFriendly === '直连使用' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                    {product.chinaFriendly}
                  </span>
                </div>
                <p className="text-xs text-stone-400 truncate mt-0.5">{product.description || '暂无描述'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={e => { e.stopPropagation(); deleteProduct(product.id); }}
                  className="p-1.5 text-stone-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                {expandedId === product.id ? <ChevronUp size={18} className="text-stone-400" /> : <ChevronDown size={18} className="text-stone-400" />}
              </div>
            </div>

            {/* Expanded Editor */}
            {expandedId === product.id && (
              <div className="border-t border-stone-100 px-5 py-5 space-y-4 bg-stone-50/50">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-500 mb-1 block">产品ID（英文）</label>
                    <input value={product.id} onChange={e => updateProduct(product.id, 'id', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800/10" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 mb-1 block">产品名称</label>
                    <input value={product.name} onChange={e => updateProduct(product.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800/10" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-500 mb-1 block">简介</label>
                  <textarea value={product.description} onChange={e => updateProduct(product.id, 'description', e.target.value)}
                    rows={2} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800/10 resize-none" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-500 mb-1 block">类型</label>
                    <select value={product.modality} onChange={e => updateProduct(product.id, 'modality', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none bg-white">
                      {['text','image','audio','video','general'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 mb-1 block">难度</label>
                    <select value={product.difficulty} onChange={e => updateProduct(product.id, 'difficulty', e.target.value as any)}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none bg-white">
                      {['小白级','进阶级','大神级'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 mb-1 block">费用</label>
                    <select value={product.isPaid} onChange={e => updateProduct(product.id, 'isPaid', e.target.value as any)}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none bg-white">
                      {['免费/有额度','纯付费'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 mb-1 block">国内访问</label>
                    <select value={product.chinaFriendly} onChange={e => updateProduct(product.id, 'chinaFriendly', e.target.value as any)}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none bg-white">
                      {['直连使用','需魔法'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-500 mb-1 block">推荐指数（好评数）</label>
                    <input type="number" value={product.upvotes} onChange={e => updateProduct(product.id, 'upvotes', +e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800/10" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 mb-1 block">差评数</label>
                    <input type="number" value={product.downvotes} onChange={e => updateProduct(product.id, 'downvotes', +e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800/10" />
                  </div>
                </div>

                {/* Pros */}
                <div>
                  <label className="text-xs font-bold text-stone-500 mb-2 block">✅ 真香理由</label>
                  <div className="space-y-2">
                    {product.pros.map((pro, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={pro} onChange={e => updateArrayField(product.id, 'pros', i, e.target.value)}
                          placeholder={`真香理由 ${i+1}`}
                          className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800/10" />
                        <button onClick={() => removeArrayItem(product.id, 'pros', i)} className="p-2 text-stone-300 hover:text-red-400 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addArrayItem(product.id, 'pros')}
                      className="text-xs text-stone-400 hover:text-stone-600 transition-colors">+ 添加一条</button>
                  </div>
                </div>

                {/* Cons */}
                <div>
                  <label className="text-xs font-bold text-stone-500 mb-2 block">⚠️ 避雷提示</label>
                  <div className="space-y-2">
                    {product.cons.map((con, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={con} onChange={e => updateArrayField(product.id, 'cons', i, e.target.value)}
                          placeholder={`避雷提示 ${i+1}`}
                          className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800/10" />
                        <button onClick={() => removeArrayItem(product.id, 'cons', i)} className="p-2 text-stone-300 hover:text-red-400 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addArrayItem(product.id, 'cons')}
                      className="text-xs text-stone-400 hover:text-stone-600 transition-colors">+ 添加一条</button>
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <label className="text-xs font-bold text-stone-500 mb-1 block">关键词（用逗号分隔，越多匹配越准）</label>
                  <input
                    value={product.keywords.join('、')}
                    onChange={e => updateProduct(product.id, 'keywords', e.target.value.split(/[,，、]/).map(k => k.trim()).filter(Boolean))}
                    placeholder="例：画画、插画、设计、壁纸、艺术"
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800/10"
                  />
                  <p className="text-xs text-stone-400 mt-1">当前 {product.keywords.length} 个关键词</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
