import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Palette, Sun, Moon, Upload, RotateCcw, Check,
  Monitor, Type, Layout, Sliders, Image, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import NaslumLogo from '@/components/NaslumLogo';
import { toast } from 'sonner';

const ACCENT_COLORS = [
  { name: 'Naslum Red', hex: '#dc2626' },
  { name: 'Crimson', hex: '#ef4444' },
  { name: 'Ocean Blue', hex: '#3b82f6' },
  { name: 'Forest', hex: '#22c55e' },
  { name: 'Sunset', hex: '#f97316' },
  { name: 'Royal Purple', hex: '#8b5cf6' },
  { name: 'Cyber Cyan', hex: '#06b6d4' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Pink', hex: '#ec4899' },
];

const BG_IMAGES = [
  { name: 'None', url: '' },
  { name: 'Mountains', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80' },
  { name: 'Ocean', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80' },
  { name: 'Night Sky', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80' },
  { name: 'Abstract', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80' },
  { name: 'Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80' },
  { name: 'City Night', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80' },
  { name: 'Desert', url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80' },
  { name: 'Aurora', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80' },
  { name: 'Flowers', url: 'https://images.unsplash.com/photo-1490750967868-88df5691166c?w=1920&q=80' },
  { name: 'Space', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80' },
];

const FONTS = [
  { name: 'Default (Space Grotesk)', heading: "'Space Grotesk', sans-serif", body: "'Inter', sans-serif" },
  { name: 'Modern Sans', heading: "'Inter', sans-serif", body: "'Inter', sans-serif" },
  { name: 'Serif Classic', heading: "'Georgia', serif", body: "'Georgia', serif" },
  { name: 'Mono Tech', heading: "'Courier New', monospace", body: "'Courier New', monospace" },
];

const LAYOUT_DENSITIES = [
  { id: 'compact', label: 'Compact', desc: 'More content, less spacing' },
  { id: 'normal', label: 'Normal', desc: 'Balanced layout' },
  { id: 'spacious', label: 'Spacious', desc: 'More breathing room' },
];

function hexToHSL(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) { let d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); switch (max) { case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break; case g: h = ((b - r) / d + 2) / 6; break; case b: h = ((r - g) / d + 4) / 6; break; } }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export default function NaslumCustomize() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('colors');

  const [selectedColor, setSelectedColor] = useState('#dc2626');
  const [customColor, setCustomColor] = useState('#dc2626');
  const [bgImage, setBgImage] = useState('');
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [selectedFont, setSelectedFont] = useState(0);
  const [clockFormat, setClockFormat] = useState('12h');
  const [showClock, setShowClock] = useState(true);
  const [density, setDensity] = useState('normal');

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const res = await base44.entities.UserSettings.filter({ user_id: u.id });
      const s = res[0];
      if (s) {
        setSettings(s);
        if (s.theme_color) { setSelectedColor(s.theme_color); setCustomColor(s.theme_color); applyColor(s.theme_color); }
        if (s.bg_image) setBgImage(s.bg_image);
        if (s.clock_format) setClockFormat(s.clock_format);
        if (s.show_clock !== undefined) setShowClock(s.show_clock);
      }
    }).catch(() => {});
  }, []);

  const applyColor = (hex) => {
    const hsl = hexToHSL(hex);
    document.documentElement.style.setProperty('--primary', hsl);
    document.documentElement.style.setProperty('--ring', hsl);
  };

  const handleColorSelect = (hex) => {
    setSelectedColor(hex);
    setCustomColor(hex);
    applyColor(hex);
  };

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(d => !d);
  };

  const handleBgSelect = (url) => setBgImage(url);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setBgImage(file_url);
    setUploading(false);
    toast.success('Background uploaded!');
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const patch = {
      user_id: user.id,
      theme_color: selectedColor,
      bg_image: bgImage,
      clock_format: clockFormat,
      show_clock: showClock,
    };
    if (settings) {
      await base44.entities.UserSettings.update(settings.id, patch);
    } else {
      const created = await base44.entities.UserSettings.create(patch);
      setSettings(created);
    }
    setSaving(false);
    toast.success('Customizations saved!');
  };

  const handleReset = () => {
    document.documentElement.style.setProperty('--primary', '0 78% 55%');
    document.documentElement.style.setProperty('--ring', '0 78% 55%');
    setSelectedColor('#dc2626');
    setCustomColor('#dc2626');
    setBgImage('');
    setClockFormat('12h');
    setShowClock(true);
    setDensity('normal');
    toast.success('Reset to defaults');
  };

  const SECTIONS = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'background', label: 'Background', icon: Image },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'widgets', label: 'Widgets', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/')}><NaslumLogo size="sm" showText={false} /></button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-lg">Customize Naslum Go</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="rounded-full gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="rounded-full gap-1.5">
              <Check className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="rounded-full gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 flex gap-6">
        {/* Sidebar nav */}
        <aside className="w-48 flex-shrink-0 hidden md:block">
          <nav className="space-y-1">
            {SECTIONS.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeSection === s.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}>
                  <Icon className="w-4 h-4" /> {s.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile section tabs */}
        <div className="md:hidden flex gap-2 flex-wrap mb-6 absolute">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeSection === s.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 space-y-6">
          {/* Colors */}
          {activeSection === 'colors' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-heading font-bold text-lg mb-1">Accent Color</h2>
                <p className="text-sm text-muted-foreground mb-5">Choose the primary color used across the entire site.</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-5">
                  {ACCENT_COLORS.map(c => (
                    <button key={c.hex} onClick={() => handleColorSelect(c.hex)}
                      className="group flex flex-col items-center gap-1.5">
                      <div className={`w-12 h-12 rounded-xl border-2 transition-all group-hover:scale-110 shadow-sm ${selectedColor === c.hex ? 'border-foreground scale-110' : 'border-border'}`}
                        style={{ background: c.hex }} />
                      <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight">{c.name}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30">
                  <label className="text-sm font-medium flex-1">Custom color</label>
                  <input type="color" value={customColor}
                    onChange={e => { setCustomColor(e.target.value); handleColorSelect(e.target.value); }}
                    className="w-12 h-10 rounded-lg border border-border cursor-pointer bg-transparent" />
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-heading font-bold text-lg mb-1">Dark / Light Mode</h2>
                <p className="text-sm text-muted-foreground mb-4">Toggle between dark and light theme.</p>
                <div className="flex gap-3">
                  <button onClick={() => { if (darkMode) toggleDark(); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-medium ${!darkMode ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30'}`}>
                    <Sun className="w-4 h-4" /> Light
                  </button>
                  <button onClick={() => { if (!darkMode) toggleDark(); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-medium ${darkMode ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30'}`}>
                    <Moon className="w-4 h-4" /> Dark
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Background */}
          {activeSection === 'background' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-heading font-bold text-lg mb-1">Homepage Background</h2>
                <p className="text-sm text-muted-foreground mb-5">Choose a background for your Naslum Go homepage.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {BG_IMAGES.map(bg => (
                    <button key={bg.name} onClick={() => handleBgSelect(bg.url)}
                      className={`relative h-24 rounded-xl border-2 overflow-hidden transition-all ${bgImage === bg.url ? 'border-primary' : 'border-border hover:border-primary/30'}`}>
                      {bg.url
                        ? <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-muted flex items-center justify-center"><span className="text-xs text-muted-foreground">None</span></div>}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                        <span className="text-xs text-white font-medium">{bg.name}</span>
                      </div>
                      {bgImage === bg.url && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium text-muted-foreground hover:text-primary">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading…' : 'Upload custom background image'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Typography */}
          {activeSection === 'typography' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-heading font-bold text-lg mb-1">Font Style</h2>
                <p className="text-sm text-muted-foreground mb-5">Choose the typeface used throughout Naslum Go.</p>
                <div className="space-y-3">
                  {FONTS.map((f, i) => (
                    <button key={f.name} onClick={() => {
                      setSelectedFont(i);
                      document.documentElement.style.setProperty('--font-heading', f.heading);
                      document.documentElement.style.setProperty('--font-body', f.body);
                      document.documentElement.style.setProperty('--font-display', f.heading);
                    }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedFont === i ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{f.name}</span>
                        {selectedFont === i && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      <p className="text-muted-foreground text-base" style={{ fontFamily: f.heading }}>
                        The quick brown fox jumps over the lazy dog
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Layout */}
          {activeSection === 'layout' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-heading font-bold text-lg mb-1">Layout Density</h2>
                <p className="text-sm text-muted-foreground mb-5">Adjust how content is spaced across the app.</p>
                <div className="space-y-3">
                  {LAYOUT_DENSITIES.map(d => (
                    <button key={d.id} onClick={() => setDensity(d.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${density === d.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{d.label}</p>
                          <p className="text-xs text-muted-foreground">{d.desc}</p>
                        </div>
                        {density === d.id && <Check className="w-4 h-4 text-primary" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Widgets */}
          {activeSection === 'widgets' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-heading font-bold text-lg mb-1">Clock Widget</h2>
                <p className="text-sm text-muted-foreground mb-5">Configure the homepage clock display.</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                    <div>
                      <p className="font-medium text-sm">Show Clock</p>
                      <p className="text-xs text-muted-foreground">Display clock on the homepage</p>
                    </div>
                    <button onClick={() => setShowClock(p => !p)}
                      className={`w-12 h-6 rounded-full transition-colors ${showClock ? 'bg-primary' : 'bg-muted'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${showClock ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex gap-3">
                    {['12h', '24h'].map(fmt => (
                      <button key={fmt} onClick={() => setClockFormat(fmt)}
                        className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${clockFormat === fmt ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30'}`}>
                        {fmt} Format
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
   }
