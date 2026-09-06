'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Save, X, ChevronLeft, ChevronRight,
  BookOpen, TrendingUp, FileText, Search, MessageSquare, FileText as ArticleIcon,
  Lock, Upload,
} from 'lucide-react';

import { marked } from 'marked';
import { HtmlRenderer } from '@/components/html-renderer';

marked.setOptions({
  breaks: true,
  gfm: true,
});

function renderMarkdown(md: string): string {
  return marked.parse(md) as string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  category: string;
  summary: string | null;
  content: string;
  cover_image: string | null;
  is_published: boolean;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: 'cases', label: '财税案例', icon: BookOpen, color: 'bg-brand-navy' },
  { value: 'tips', label: '财税知识', icon: TrendingUp, color: 'bg-brand-gold' },
  { value: 'policies', label: '政策解读', icon: FileText, color: 'bg-[#2A5A8C]' },
];

const EMPTY_FORM = {
  title: '',
  slug: '',
  category: 'cases',
  summary: '',
  content: '',
  cover_image: '',
  is_published: false,
  sort_order: 0,
};

type TabKey = 'articles' | 'consultations';

interface Consultation {
  id: number;
  company_name: string;
  phone: string;
  content: string;
  status: string;
  created_at: string;
}

// 管理密码由服务端校验（2026-09-06 修复：密码不再打进前端包，登录走 /api/auth/check）

export default function AdminPage() {
  // 密码验证
  const [authed, setAuthed] = useState(false);
  const tokenRef = useRef('');
  const [pwdInput, setPwdInput] = useState('');
  const [pwdError, setPwdError] = useState('');

  const [activeTab, setActiveTab] = useState<TabKey>('articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // 咨询记录
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [consultTotal, setConsultTotal] = useState(0);
  const [consultLoading, setConsultLoading] = useState(false);

  // 登录检查：每次访问需重新输入密码（密码只存于本次会话内存，不落 sessionStorage）

  // 登录：服务端校验密码（x-admin-token 与 ADMIN_API_PASSWORD 比对）
  const handleLogin = async () => {
    setPwdError('');
    try {
      const res = await fetch('/api/auth/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': pwdInput },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setAuthed(true);
        tokenRef.current = pwdInput;
      } else {
        setPwdError('密码错误');
      }
    } catch {
      setPwdError('网络错误，请重试');
    }
  };

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(page * limit),
      });
      if (filterCategory) params.set('category', filterCategory);

      const res = await fetch(`/api/articles?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '获取列表失败');
      setArticles(json.data || []);
      setTotal(json.total || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '获取列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterCategory]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const fetchConsultations = useCallback(async () => {
    setConsultLoading(true);
    try {
      const res = await fetch('/api/consultations', { headers: { 'x-admin-token': tokenRef.current } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '获取咨询记录失败');
      setConsultations(json.data || []);
      setConsultTotal(json.total || 0);
    } catch {
      setConsultations([]);
    } finally {
      setConsultLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'consultations') {
      fetchConsultations();
    }
  }, [activeTab, fetchConsultations]);

  const handleNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError('');
  };

  const handleEdit = (article: Article) => {
    setEditing(article);
    setForm({
      title: article.title,
      slug: article.slug,
      category: article.category,
      summary: article.summary || '',
      content: article.content,
      cover_image: article.cover_image || '',
      is_published: article.is_published,
      sort_order: article.sort_order,
    });
    setShowForm(true);
    setError('');
  };

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.category || !form.content) {
      setError('请填写标题、Slug、分类和内容');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const url = editing ? `/api/articles/${editing.id}` : '/api/articles';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-token': tokenRef.current },
        body: JSON.stringify(form),
      });
      if (res.status === 401) {
        setAuthed(false);
        setError('登录已失效，请重新登录');
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '保存失败');
      setEditing(null);
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchArticles();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这篇文章吗？')) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE', headers: { 'x-admin-token': tokenRef.current } });
      if (res.status === 401) {
        setAuthed(false);
        setError('登录已失效，请重新登录');
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '删除失败');
      fetchArticles();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleTogglePublish = async (article: Article) => {
    try {
      const res = await fetch(`/api/articles/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': tokenRef.current },
        body: JSON.stringify({ is_published: !article.is_published }),
      });
      if (res.status === 401) {
        setAuthed(false);
        setError('登录已失效，请重新登录');
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '操作失败');
      fetchArticles();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  const generateSlug = (title: string) => {
    const timestamp = Date.now();
    // 提取标题中的英文/数字部分作为 slug 前缀，中文部分跳过
    const asciiPart = title
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase()
      .slice(0, 40);
    return `${asciiPart || 'article'}-${timestamp}`;
  };

  const totalPages = Math.ceil(total / limit);

  const filteredArticles = search
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.slug.toLowerCase().includes(search.toLowerCase())
      )
    : articles;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getCategoryLabel = (cat: string) => {
    return CATEGORIES.find((c) => c.value === cat)?.label || cat;
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg border max-w-sm w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-brand-navy rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-brand-text">管理后台登录</h2>
            <p className="text-sm text-brand-text-muted mt-1">请输入管理员密码</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              value={pwdInput}
              onChange={(e) => { setPwdInput(e.target.value); setPwdError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="请输入密码"
              className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/30 focus:border-brand-navy"
            />
            {pwdError && <p className="text-red-500 text-xs">{pwdError}</p>}
            <button
              onClick={handleLogin}
              className="w-full py-2.5 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-brand-navy/90 transition-colors"
            >
              登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部栏 */}
      <div className="bg-brand-navy text-white py-4">
        <div className="container-brand px-4 md:px-8 flex items-center justify-between">
          <h1 className="text-lg font-bold">内容管理后台</h1>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-white/70 hover:text-white transition-colors">
              返回官网
            </Link>
            <button
              onClick={() => { setAuthed(false); sessionStorage.removeItem('admin_authed'); }}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>

      <div className="container-brand px-4 md:px-8 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}

        {/* Tab 切换 */}
        <div className="flex items-center gap-1 mb-6 border-b pb-0">
          <button
            onClick={() => setActiveTab('articles')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'articles'
                ? 'border-brand-navy text-brand-navy'
                : 'border-transparent text-brand-text-muted hover:text-brand-text'
            }`}
          >
            <ArticleIcon size={16} />
            财税资讯管理
          </button>
          <button
            onClick={() => setActiveTab('consultations')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'consultations'
                ? 'border-brand-navy text-brand-navy'
                : 'border-transparent text-brand-text-muted hover:text-brand-text'
            }`}
          >
            <MessageSquare size={16} />
            预约咨询记录
            {consultTotal > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">{consultTotal}</span>
            )}
          </button>
        </div>

        {activeTab === 'articles' && (
          <>
        {/* 工具栏 */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy text-white text-sm font-medium rounded-md hover:bg-[#2A5A8C] transition-colors"
            >
              <Plus size={16} />
              新建文章
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setFilterCategory(''); setPage(0); }}
                className={`px-3 py-1.5 text-xs rounded ${!filterCategory ? 'bg-brand-navy text-white' : 'bg-white text-brand-text-muted border'}`}
              >
                全部
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => { setFilterCategory(cat.value); setPage(0); }}
                  className={`px-3 py-1.5 text-xs rounded ${filterCategory === cat.value ? 'bg-brand-navy text-white' : 'bg-white text-brand-text-muted border'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" />
            <input
              type="text"
              placeholder="搜索标题..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border rounded-md w-64 focus:outline-none focus:border-brand-navy"
            />
          </div>
        </div>

        {/* 编辑表单 */}
        {showForm && (
          <div className="mb-6 bg-white border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-brand-navy">
                {editing ? '编辑文章' : '新建文章'}
              </h2>
              <button
                onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm(false); setError(''); }}
                className="text-brand-text-muted hover:text-brand-text"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">标题 *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => {
                    setForm({ ...form, title: e.target.value });
                    if (!editing) {
                      setForm((prev) => ({ ...prev, title: e.target.value, slug: generateSlug(e.target.value) }));
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-brand-navy"
                  placeholder="文章标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">Slug（URL 标识）*</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-brand-navy"
                  placeholder="url-friendly-slug"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">分类 *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-brand-navy"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">排序权重</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-brand-navy"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-brand-text mb-1">摘要</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-brand-navy"
                  placeholder="文章摘要（可选，用于列表展示）"
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-brand-text">内容 *（支持 Markdown 格式，右侧实时预览）</label>
                  <label className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer transition-colors">
                    <Upload size={12} />
                    上传文件
                    <input
                      type="file"
                      accept=".md,.markdown,.txt,.html,.htm"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          let text = ev.target?.result as string;
                          // HTML 文件添加标记，渲染时直接输出
                          if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
                            text = '<!-- html-content -->\n' + text;
                          }
                          setForm({ ...form, content: text });
                        };
                        reader.readAsText(file, 'UTF-8');
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    rows={18}
                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-brand-navy font-mono"
                    placeholder={"文章正文，支持 Markdown 格式（## 二级标题、### 三级标题、- 列表项、空行分段）\n\n也可以点击右上角「上传 .md 文件」按钮直接导入"}
                  />
                  <div className="border rounded-md p-4 bg-gray-50 overflow-y-auto max-h-[450px]">
                    <p className="text-xs text-brand-text-muted mb-3 font-medium">预览效果</p>
                    {form.content ? (
                      form.content.startsWith('<!-- html-content -->') ? (
                        <HtmlRenderer
                          html={form.content.replace('<!-- html-content -->', '').trim()}
                          className="prose-custom"
                        />
                      ) : (
                        <div className="prose-custom" dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content) }} />
                      )
                    ) : (
                      <p className="text-sm text-gray-400 italic">输入内容后这里显示预览...</p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">封面图片 URL</label>
                <input
                  type="text"
                  value={form.cover_image}
                  onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-brand-navy"
                  placeholder="https://...（可选）"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-brand-text">立即发布</span>
                </label>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 bg-brand-navy text-white text-sm font-medium rounded-md hover:bg-[#2A5A8C] disabled:opacity-50 transition-colors"
              >
                <Save size={16} />
                {saving ? '保存中...' : '保存'}
              </button>
              <button
                onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm(false); setError(''); }}
                className="px-5 py-2 text-sm text-brand-text-muted border rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* 文章列表 */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-xs font-semibold text-brand-text-muted uppercase">标题</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-brand-text-muted uppercase hidden md:table-cell">分类</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-brand-text-muted uppercase hidden lg:table-cell">发布日期</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-brand-text-muted uppercase">状态</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-brand-text-muted uppercase">排序</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-brand-text-muted uppercase">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-brand-text-muted text-sm">
                    加载中...
                  </td>
                </tr>
              ) : filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-brand-text-muted text-sm">
                    暂无文章，点击「新建文章」开始创作
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => (
                  <tr key={article.id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-brand-text line-clamp-1">{article.title}</div>
                      <div className="text-xs text-brand-text-muted mt-0.5">/{article.slug}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-brand-navy/10 text-brand-navy rounded">
                        {getCategoryLabel(article.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-text-muted hidden lg:table-cell">
                      {formatDate(article.published_at || article.created_at)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {article.is_published ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded">
                          <Eye size={12} /> 已发布
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded">
                          <EyeOff size={12} /> 草稿
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-brand-text-muted">
                      {article.sort_order}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleTogglePublish(article)}
                          className="p-1.5 text-brand-text-muted hover:text-brand-navy transition-colors"
                          title={article.is_published ? '转为草稿' : '发布'}
                        >
                          {article.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => handleEdit(article)}
                          className="p-1.5 text-brand-text-muted hover:text-brand-navy transition-colors"
                          title="编辑"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="p-1.5 text-brand-text-muted hover:text-red-600 transition-colors"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-brand-text-muted">
              共 {total} 篇，第 {page + 1} / {totalPages} 页
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
          </>
        )}

        {activeTab === 'consultations' && (
          <div>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-brand-text-muted uppercase">公司名称</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-brand-text-muted uppercase">联系电话</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-brand-text-muted uppercase hidden md:table-cell">咨询内容</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-brand-text-muted uppercase hidden lg:table-cell">提交时间</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-brand-text-muted uppercase">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {consultLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-brand-text-muted text-sm">
                        加载中...
                      </td>
                    </tr>
                  ) : consultations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-brand-text-muted text-sm">
                        暂无咨询记录
                      </td>
                    </tr>
                  ) : (
                    consultations.map((c) => (
                      <tr key={c.id} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-brand-text">{c.company_name}</td>
                        <td className="px-4 py-3 text-sm text-brand-navy font-mono">{c.phone}</td>
                        <td className="px-4 py-3 text-sm text-brand-text-muted line-clamp-2 hidden md:table-cell">{c.content}</td>
                        <td className="px-4 py-3 text-sm text-brand-text-muted hidden lg:table-cell">
                          {new Date(c.created_at).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded ${
                            c.status === 'pending' ? 'text-yellow-700 bg-yellow-50' :
                            c.status === 'contacted' ? 'text-green-700 bg-green-50' :
                            'text-gray-700 bg-gray-50'
                          }`}>
                            {c.status === 'pending' ? '待跟进' : c.status === 'contacted' ? '已联系' : '已关闭'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {consultTotal > 0 && (
              <p className="mt-3 text-sm text-brand-text-muted">共 {consultTotal} 条咨询记录</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
