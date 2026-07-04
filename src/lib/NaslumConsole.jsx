import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Plus, Trash2, Globe, Loader2, Terminal, FileText, CheckCircle2, Clock, Download, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import NaslumLogo from '@/components/NaslumLogo';
import { toast } from 'sonner';

const PAGE_TYPES = [
  { value: 'page', label: 'Page', color: 'bg-blue-500/10 text-blue-500' },
  { value: 'article', label: 'Article', color: 'bg-purple-500/10 text-purple-500' },
  { value: 'product', label: 'Product', color: 'bg-green-500/10 text-green-500' },
  { value: 'media', label: 'Media', color: 'bg-orange-500/10 text-orange-500' },
  { value: 'app', label: 'App', color: 'bg-pink-500/10 text-pink-500' },
];

export default function NaslumConsole() {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, indexed, pending, excluded
  const [form, setForm] = useState({ url: '', title: '', description: '', keywords: '', page_type: 'page', priority: 0.5 });

  useEffect(() => { loadPages(); }, []);

  const loadPages = async () => {
    setLoading(true);
    const data = await base44.entities.IndexedPage.list('-created_date', 200);
    setPages(data);
    setLoading(false);
  };

  const submitPage = async (e) => {
    e.preventDefault();
    if (!form.url || !form.title) { toast.error('URL and title are required'); return; }
    let url = form.url;
    if (!url.startsWith('http')) url = `https://${url}`;
    const existing = pages.find(p => p.url === url);
    if (existing) { toast.error('This URL is already indexed'); return; }
    await base44.entities.IndexedPage.create({
      url, title: form.title, description: form.description,
      keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
      page_type: form.page_type, priority: parseFloat(form.priority), status: 'pending'
    });
    toast.success('Page submitted for indexing!');
    setForm({ url: '', title: '', description: '', keywords: '', page_type: 'page', priority: 0.5 });
    setShowForm(false);
    loadPages();
  };

  const approvePage = async (p) => {
    await base44.entities.IndexedPage.update(p.id, { status: 'indexed', last_crawled: new Date().toISOString() });
    toast.success('Page indexed!');
    loadPages();
  };

  const excludePage = async (p) => {
    await base44.entities.IndexedPage.update(p.id, { status: 'excluded' });
    toast.success('Page excluded from search');
    loadPages();
  };

  const deletePage = async (p) => {
    await base44.entities.IndexedPage.delete(p.id);
    toast.success('Page removed');
    loadPages();
  };

  const generateSitemap = () => {
    const indexed = pages.filter(p => p.status === 'indexed');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexed.map(p => `  <url>\n    <loc>${p.url}</loc>\n    <priority>${p.priority}</priority>\n  </url>`).join('\n')}\n</urlset>`;
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sitemap.xml'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Sitemap downloaded!');
  };

  const filtered = pages.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search && !(p.title || '').toLowerCase().includes(search.toLowerCase()) && !(p.url || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: pages.length,
    indexed: pages.filter(p => p.status === 'indexed').length,
    pending: pages.filter(p => p.status === 'pending').length,
    excluded: pages.filter(p => p.status === 'excluded').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/')}><NaslumLogo size="sm" showText={false} /></button>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-lg">Naslum Go Console</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button onClick={generateSitemap} variant="outline" size="sm" className="rounded-full gap-1.5" disabled={stats.indexed === 0}>
              <Download className="w-3.5 h-3.5" /> Sitemap
            </Button>
            <Button onClick={() => setShowForm(true)} size="sm" className="rounded-full gap-1.5">
              <Plus className="w-4 h-4" /> Submit URL
            </Button>
            <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Pages', value: stats.total, icon: FileText, color: 'text-muted-foreground' },
            { label: 'Indexed', value: stats.indexed, icon: CheckCircle2, color: 'text-green-500' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-500' },
            { label: 'Excluded', value: stats.excluded, icon: BarChart2, color: 'text-red-500' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><s.icon className={`w-4 h-4 ${s.color}`} /><p className="text-xs text-muted-foreground">{s.label}</p></div>
              <p className="font-heading font-bold text-2xl">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-5xl mx-auto px-4 pt-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search indexed pages..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-muted border border-border text-sm outline-none focus:border-primary/50" />
        </div>
        <div className="flex gap-2">
          {['all', 'indexed', 'pending', 'excluded'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-full text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Globe className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm mb-4">{pages.length === 0 ? 'No pages indexed yet.' : 'No pages match your filters.'}</p>
            <Button onClick={() => setShowForm(true)} size="sm" className="rounded-full gap-1.5"><Plus className="w-4 h-4" /> Submit your first URL</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p, i) => {
              const typeCfg = PAGE_TYPES.find(t => t.value === p.page_type) || PAGE_TYPES[0];
              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                  className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeCfg.color}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-heading font-semibold text-sm">{p.title}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        p.status === 'indexed' ? 'bg-green-500/10 text-green-500' :
                        p.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'}`}>{p.status}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{typeCfg.label}</span>
                    </div>
                    <a href={p.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline truncate block mt-0.5">{p.url}</a>
                    {p.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
                    {p.keywords && p.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.keywords.slice(0, 5).map((k, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{k}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {p.status === 'pending' && (
                      <button onClick={() => approvePage(p)} title="Index" className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-500">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {p.status !== 'excluded' && (
                      <button onClick={() => excludePage(p)} title="Exclude" className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500">
                        <BarChart2 className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => deletePage(p)} title="Delete" className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Submit form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl p-6" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Submit URL for Indexing</h2>
            <form onSubmit={submitPage} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">URL *</label>
                <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://example.com/page"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-muted border border-border text-sm outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Page Title"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-muted border border-border text-sm outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Page description..." rows={2}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-muted border border-border text-sm outline-none focus:border-primary/50 resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Keywords (comma-separated)</label>
                <input value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} placeholder="naslum, search, ai"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-muted border border-border text-sm outline-none focus:border-primary/50" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Page Type</label>
                  <select value={form.page_type} onChange={e => setForm({ ...form, page_type: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-muted border border-border text-sm outline-none focus:border-primary/50">
                    {PAGE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="w-24">
                  <label className="text-xs font-medium text-muted-foreground">Priority</label>
                  <input type="number" min="0" max="1" step="0.1" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-muted border border-border text-sm outline-none focus:border-primary/50" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1 rounded-xl gap-1.5"><Plus className="w-4 h-4" /> Submit for Indexing</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
