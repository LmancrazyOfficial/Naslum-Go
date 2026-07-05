import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, Save, Trash2, ArrowLeft, Loader2, ChevronLeft, ChevronRight, Type, Image as ImageIcon, Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NaslumLogo from '@/components/NaslumLogo';
import { toast } from 'sonner';

const SLIDE_THEMES = [
  { id: 'white', label: 'White', bg: 'bg-white', text: 'text-gray-900' },
  { id: 'dark', label: 'Dark', bg: 'bg-gray-900', text: 'text-white' },
  { id: 'primary', label: 'Brand', bg: 'bg-primary', text: 'text-primary-foreground' },
  { id: 'blue', label: 'Ocean', bg: 'bg-blue-600', text: 'text-white' },
  { id: 'green', label: 'Forest', bg: 'bg-emerald-600', text: 'text-white' },
];

function emptySlide() {
  return { id: Date.now().toString(), title: 'New Slide', body: 'Add your content here...', theme: 'white' };
}

export default function NaslumSlides() {
  const navigate = useNavigate();
  const [presentations, setPresentations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [presTitle, setPresTitle] = useState('');
  const [slides, setSlides] = useState([emptySlide()]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [presenting, setPresenting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      loadPresentations(u.id);
    }).catch(() => setLoading(false));
  }, []);

  const loadPresentations = async (uid) => {
    setLoading(true);
    const data = await base44.entities.NaslumPresentation.filter({ user_id: uid }, '-updated_date', 50);
    setPresentations(data);
    setLoading(false);
  };

  const newPresentation = () => {
    setSelected(null);
    setPresTitle('Untitled Presentation');
    setSlides([emptySlide()]);
    setActiveSlide(0);
  };

  const openPresentation = (pres) => {
    setSelected(pres);
    setPresTitle(pres.title);
    setSlides(pres.slides?.length ? pres.slides : [emptySlide()]);
    setActiveSlide(0);
  };

  const save = async () => {
    if (!presTitle.trim()) return;
    setSaving(true);
    if (selected) {
      await base44.entities.NaslumPresentation.update(selected.id, { title: presTitle, slides });
      setPresentations(prev => prev.map(p => p.id === selected.id ? { ...p, title: presTitle, slides } : p));
    } else {
      const pres = await base44.entities.NaslumPresentation.create({ user_id: user.id, title: presTitle, slides });
      setPresentations(prev => [pres, ...prev]);
      setSelected(pres);
    }
    toast.success('Presentation saved');
    setSaving(false);
  };

  const addSlide = () => {
    const s = emptySlide();
    setSlides(prev => [...prev, s]);
    setActiveSlide(slides.length);
  };

  const deleteSlide = (idx) => {
    if (slides.length === 1) return;
    setSlides(prev => prev.filter((_, i) => i !== idx));
    setActiveSlide(Math.max(0, idx - 1));
  };

  const updateSlide = (key, value) => {
    setSlides(prev => prev.map((s, i) => i === activeSlide ? { ...s, [key]: value } : s));
  };

  const currentSlide = slides[activeSlide] || slides[0];
  const currentTheme = SLIDE_THEMES.find(t => t.id === currentSlide?.theme) || SLIDE_THEMES[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/')}><NaslumLogo size="sm" showText={false} /></button>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-lg">Naslum Slides</span>
          </div>
          {(selected || presTitle) && (
            <input value={presTitle} onChange={e => setPresTitle(e.target.value)}
              className="flex-1 max-w-xs bg-transparent text-sm font-medium outline-none border-b border-transparent focus:border-primary/50 px-1" />
          )}
          <div className="ml-auto flex items-center gap-2">
            {slides.length > 0 && (
              <Button onClick={() => setPresenting(true)} variant="outline" size="sm" className="rounded-full gap-1.5">
                <Maximize2 className="w-3.5 h-3.5" /> Present
              </Button>
            )}
            {(selected || presTitle) && (
              <Button onClick={save} disabled={saving} size="sm" className="rounded-full gap-2 bg-primary text-primary-foreground">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
              </Button>
            )}
            <Button onClick={newPresentation} size="sm" variant="outline" className="rounded-full gap-2"><Plus className="w-3.5 h-3.5" /> New</Button>
            <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="rounded-full gap-1.5"><ArrowLeft className="w-4 h-4" /> Back</Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* Presentations list */}
        <aside className="w-56 border-r border-border flex-shrink-0 py-4 px-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Presentations</p>
          {loading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            : presentations.length === 0 ? (
              <div className="text-center py-8">
                <Layers className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No presentations yet</p>
              </div>
            ) : presentations.map(pres => (
              <div key={pres.id}
                className={`px-2 py-2 rounded-lg cursor-pointer text-sm truncate transition-colors ${selected?.id === pres.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                onClick={() => openPresentation(pres)}>
                {pres.title}
              </div>
            ))}
        </aside>

        {/* Editor */}
        {(selected !== null || presTitle) ? (
          <div className="flex flex-1">
            {/* Slide list */}
            <div className="w-40 border-r border-border flex flex-col gap-2 py-4 px-2 overflow-y-auto">
              {slides.map((slide, idx) => {
                const theme = SLIDE_THEMES.find(t => t.id === slide.theme) || SLIDE_THEMES[0];
                return (
                  <div key={slide.id}
                    onClick={() => setActiveSlide(idx)}
                    className={`group relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all aspect-video ${activeSlide === idx ? 'border-primary' : 'border-transparent hover:border-border'}`}
                  >
                    <div className={`w-full h-full p-2 ${theme.bg} flex flex-col`}>
                      <p className={`text-[7px] font-bold truncate ${theme.text}`}>{slide.title}</p>
                      <p className={`text-[6px] truncate mt-0.5 opacity-70 ${theme.text}`}>{slide.body}</p>
                    </div>
                    <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100">
                      <button onClick={e => { e.stopPropagation(); deleteSlide(idx); }}
                        className="w-4 h-4 rounded-full bg-destructive text-white flex items-center justify-center">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <div className="absolute bottom-0.5 left-1 text-[6px] text-muted-foreground">{idx + 1}</div>
                  </div>
                );
              })}
              <button onClick={addSlide} className="flex items-center justify-center gap-1 p-2 rounded-lg border border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-primary text-xs transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Slide editor */}
            <div className="flex-1 flex flex-col">
              {/* Theme picker */}
              <div className="flex items-center gap-2 px-6 py-2 border-b border-border bg-muted/30">
                <span className="text-xs text-muted-foreground mr-1">Theme:</span>
                {SLIDE_THEMES.map(t => (
                  <button key={t.id} onClick={() => updateSlide('theme', t.id)}
                    className={`w-6 h-6 rounded-full ${t.bg} border-2 transition-all ${currentSlide?.theme === t.id ? 'border-primary scale-110' : 'border-transparent'}`}
                    title={t.label} />
                ))}
              </div>

              {/* Slide canvas */}
              <div className="flex-1 flex items-center justify-center p-8 bg-muted/20">
                <div className={`w-full max-w-3xl aspect-video ${currentTheme.bg} rounded-2xl shadow-2xl p-12 flex flex-col justify-center`}>
                  <input
                    value={currentSlide?.title || ''}
                    onChange={e => updateSlide('title', e.target.value)}
                    className={`bg-transparent text-4xl font-heading font-bold outline-none w-full mb-4 ${currentTheme.text} placeholder-current opacity-100`}
                    placeholder="Slide Title"
                    style={{ color: 'inherit' }}
                  />
                  <textarea
                    value={currentSlide?.body || ''}
                    onChange={e => updateSlide('body', e.target.value)}
                    className={`bg-transparent text-xl outline-none w-full resize-none flex-1 ${currentTheme.text}`}
                    placeholder="Add content..."
                    rows={5}
                    style={{ color: 'inherit' }}
                  />
                </div>
              </div>

              {/* Slide nav */}
              <div className="flex items-center justify-center gap-4 py-3 border-t border-border">
                <button onClick={() => setActiveSlide(p => Math.max(0, p - 1))} disabled={activeSlide === 0}
                  className="p-1.5 rounded-full hover:bg-muted disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-sm text-muted-foreground">{activeSlide + 1} / {slides.length}</span>
                <button onClick={() => setActiveSlide(p => Math.min(slides.length - 1, p + 1))} disabled={activeSlide === slides.length - 1}
                  className="p-1.5 rounded-full hover:bg-muted disabled:opacity-30 transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Layers className="w-20 h-20 text-muted-foreground/20 mx-auto mb-4" />
              <h2 className="font-heading font-bold text-2xl mb-2">Naslum Slides</h2>
              <p className="text-muted-foreground mb-6 max-w-sm">Build beautiful presentations right in your browser.</p>
              <Button onClick={newPresentation} className="rounded-full bg-primary text-primary-foreground gap-2">
                <Plus className="w-4 h-4" /> New Presentation
              </Button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Presentation mode */}
      <AnimatePresence>
        {presenting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
            onKeyDown={e => {
              if (e.key === 'Escape') setPresenting(false);
              if (e.key === 'ArrowRight') setActiveSlide(p => Math.min(slides.length - 1, p + 1));
              if (e.key === 'ArrowLeft') setActiveSlide(p => Math.max(0, p - 1));
            }}
            tabIndex={0}
            autoFocus
          >
            {(() => {
              const slide = slides[activeSlide];
              const theme = SLIDE_THEMES.find(t => t.id === slide?.theme) || SLIDE_THEMES[0];
              return (
                <div className={`w-full max-w-5xl mx-auto aspect-video ${theme.bg} rounded-2xl p-20 flex flex-col justify-center shadow-2xl`}>
                  <h1 className={`text-6xl font-heading font-bold mb-6 ${theme.text}`}>{slide?.title}</h1>
                  <p className={`text-2xl ${theme.text} opacity-80`}>{slide?.body}</p>
                </div>
              );
            })()}
            <div className="flex items-center gap-4 mt-6">
              <button onClick={() => setActiveSlide(p => Math.max(0, p - 1))} className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-white/60 text-sm">{activeSlide + 1} / {slides.length}</span>
              <button onClick={() => setActiveSlide(p => Math.min(slides.length - 1, p + 1))} className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
                <ChevronRight className="w-5 h-5" />
              </button>
              <button onClick={() => setPresenting(false)} className="ml-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
        }
