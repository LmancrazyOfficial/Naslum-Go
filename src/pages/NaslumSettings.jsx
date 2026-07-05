import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, User, Palette, Clock, Save, Loader2, Upload, ImageIcon, Trash2, Bell, Shield, Type, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import NaslumLogo from '@/components/NaslumLogo';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const PRESET_COLORS = [
  '#dc2626', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
];
const BG_IMAGES = [
  { name: 'None', url: '' },
  { name: 'Mountains', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80' },
  { name: 'Ocean', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80' },
  { name: 'Night Sky', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80' },
  { name: 'Abstract', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80' },
  { name: 'Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80' },
  { name: 'City', url: 'https://images.unsplash.com/photo-1477959858617-67f13cf969e9?w=1920&q=80' },
  { name: 'Aurora', url: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1920&q=80' },
  { name: 'Desert', url: 'https://images.unsplash.com/photo-1473580044384-34baa60199bf?w=1920&q=80' },
  { name: 'Galaxy', url: 'https://images.unsplash.com/photo-1462331940025-971df4846683?w=1920&q=80' },
];
const FONT_SIZES = [
  { label: 'Small', value: 'sm', class: 'text-sm' },
  { label: 'Medium', value: 'md', class: 'text-base' },
  { label: 'Large', value: 'lg', class: 'text-lg' },
];

function hexToHSL(hex) {
  let r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
  let max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h=0, s=0, l=(max+min)/2;
  if(max!==min){let d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break;}}
  return `${Math.round(h*360)} ${Math.round(s*100)}% ${Math.round(l*100)}%`;
}

export default function NaslumSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [name, setName] = useState('');
  const [themeColor, setThemeColor] = useState('');
  const [bgImage, setBgImage] = useState('');
  const [clockFormat, setClockFormat] = useState('12h');
  const [showClock, setShowClock] = useState(true);
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [fontSize, setFontSize] = useState('md');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [contentFilter, setContentFilter] = useState(true);
  const [customBgUrl, setCustomBgUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef(null);

  useEffect(() => {
    // Load custom bg from localStorage (works for all users)
    const stored = localStorage.getItem('naslum_custom_bg');
    if (stored) setCustomBgUrl(stored);

    base44.auth.me().then(async (u) => {
      setUser(u);
      setName(u.full_name || '');
      const s = await base44.entities.UserSettings.filter({ user_id: u.id });
      if (s[0]) {
        setSettings(s[0]);
        setThemeColor(s[0].theme_color || '');
        if (!stored) setBgImage(s[0].bg_image || '');
        setClockFormat(s[0].clock_format || '12h');
        setShowClock(s[0].show_clock !== false);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 3_000_000) {
      toast.error('Image too large (max 3MB for local storage)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      localStorage.setItem('naslum_custom_bg', dataUrl);
      setCustomBgUrl(dataUrl);
      setBgImage('');
      toast.success('Custom background uploaded!');
    };
    reader.readAsDataURL(file);
  };

  const clearCustomBg = () => {
    localStorage.removeItem('naslum_custom_bg');
    setCustomBgUrl('');
    toast.success('Custom background removed');
  };

  const save = async () => {
    setSaving(true);
    try {
      if (name !== user.full_name) {
        await base44.auth.updateMe({ full_name: name });
        setUser(u => ({ ...u, full_name: name }));
      }
      const patch = {
        theme_color: themeColor,
        bg_image: customBgUrl ? '' : bgImage,
        clock_format: clockFormat,
        show_clock: showClock
      };
      if (settings) await base44.entities.UserSettings.update(settings.id, patch);
      else {
        const created = await base44.entities.UserSettings.create({ user_id: user.id, ...patch });
        setSettings(created);
      }
      // Save local-only preferences
      localStorage.setItem('naslum_font_size', fontSize);
      localStorage.setItem('naslum_reduce_motion', reduceMotion ? 'true' : 'false');
      localStorage.setItem('naslum_notif_enabled', notifEnabled ? 'true' : 'false');
      localStorage.setItem('naslum_content_filter', contentFilter ? 'true' : 'false');
      toast.success('Settings saved!');
    } catch (e) {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  const applyTheme = (hex) => {
    setThemeColor(hex);
    const hsl = hexToHSL(hex);
    document.documentElement.style.setProperty('--primary', hsl);
    document.documentElement.style.setProperty('--ring', hsl);
  };

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/')}><NaslumLogo size="sm" showText={false} /></button>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-lg">Site Settings</span>
          </div>
          <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="ml-auto rounded-full gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-bold text-lg">Profile</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Display Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
              <p className="mt-1 px-4 py-2.5 rounded-xl bg-muted text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-bold text-lg">Appearance</h3>
          </div>

          <div className="space-y-5">
            {/* Dark mode */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Toggle between light and dark themes</p>
              </div>
              <button onClick={toggleDark} className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-primary' : 'bg-muted-foreground/40'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Theme color */}
            <div>
              <p className="text-sm font-medium mb-2">Accent Color</p>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => applyTheme(c)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${themeColor === c ? 'border-foreground scale-110' : 'border-border'}`}
                    style={{ background: c }} />
                ))}
                <input type="color" value={themeColor || '#dc2626'} onChange={e => applyTheme(e.target.value)}
                  className="w-10 h-10 rounded-full border-2 border-border cursor-pointer" />
              </div>
            </div>

            {/* Background */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Background Image</p>
                {customBgUrl && (
                  <button onClick={clearCustomBg} className="text-xs text-destructive hover:underline flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Remove custom
                  </button>
                )}
              </div>

              {/* Custom upload */}
              <div className="mb-3">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
                <button onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-sm">
                  {customBgUrl ? (
                    <><ImageIcon className="w-4 h-4 text-primary" /> Custom background active — Click to replace</>
                  ) : (
                    <><Upload className="w-4 h-4 text-muted-foreground" /> Upload your own image</>
                  )}
                </button>
                {customBgUrl && (
                  <div className="mt-2 relative h-20 rounded-xl overflow-hidden border border-border">
                    <img src={customBgUrl} alt="Custom background" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Presets */}
              <div className="grid grid-cols-5 gap-2">
                {BG_IMAGES.map(bg => (
                  <button key={bg.name} disabled={!!customBgUrl} onClick={() => setBgImage(bg.url)}
                    className={`relative h-16 rounded-xl border-2 overflow-hidden transition-all ${bgImage === bg.url && !customBgUrl ? 'border-primary' : 'border-border hover:border-primary/40'} ${customBgUrl ? 'opacity-40 cursor-not-allowed' : ''}`}>
                    {bg.url ? <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" /> :
                      <div className="w-full h-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">None</div>}
                  </button>
                ))}
              </div>
              {customBgUrl && <p className="text-xs text-muted-foreground mt-2">Preset backgrounds are disabled while a custom image is set.</p>}
            </div>

            {/* Font size */}
            <div>
              <p className="text-sm font-medium mb-2">Text Size</p>
              <div className="flex gap-2">
                {FONT_SIZES.map(f => (
                  <button key={f.value} onClick={() => setFontSize(f.value)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${fontSize === f.value ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Clock */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-bold text-lg">Clock</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show Clock</p>
                <p className="text-xs text-muted-foreground">Display clock on homepage</p>
              </div>
              <button onClick={() => setShowClock(!showClock)} className={`w-12 h-6 rounded-full transition-colors relative ${showClock ? 'bg-primary' : 'bg-muted-foreground/40'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${showClock ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Time Format</p>
              <div className="flex gap-2">
                {['12h', '24h'].map(f => (
                  <button key={f} onClick={() => setClockFormat(f)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${clockFormat === f ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted'}`}>
                    {f === '12h' ? '12-Hour' : '24-Hour'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-bold text-lg">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Push Notifications</p>
                <p className="text-xs text-muted-foreground">Receive in-app notifications</p>
              </div>
              <button onClick={() => setNotifEnabled(!notifEnabled)} className={`w-12 h-6 rounded-full transition-colors relative ${notifEnabled ? 'bg-primary' : 'bg-muted-foreground/40'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-bold text-lg">Privacy & Security</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Content Filter</p>
                <p className="text-xs text-muted-foreground">Filter explicit content from search results</p>
              </div>
              <button onClick={() => setContentFilter(!contentFilter)} className={`w-12 h-6 rounded-full transition-colors relative ${contentFilter ? 'bg-primary' : 'bg-muted-foreground/40'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${contentFilter ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Accessibility */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-bold text-lg">Accessibility</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Reduce Motion</p>
                <p className="text-xs text-muted-foreground">Minimize animations and transitions</p>
              </div>
              <button onClick={() => setReduceMotion(!reduceMotion)} className={`w-12 h-6 rounded-full transition-colors relative ${reduceMotion ? 'bg-primary' : 'bg-muted-foreground/40'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${reduceMotion ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </motion.div>

        <Button onClick={save} disabled={saving} className="w-full rounded-xl gap-2 h-12">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </main>
    </div>
  );
}
