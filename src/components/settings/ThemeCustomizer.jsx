import React, { useState, useRef } from 'react';
import { Palette, X, RotateCcw, Sun, Moon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const PRESET_THEMES = [
  { name: 'Naslum Red', primary: '#dc2626' },
  { name: 'Midnight', primary: '#ef4444' },
  { name: 'Ocean', primary: '#3b82f6' },
  { name: 'Forest', primary: '#22c55e' },
  { name: 'Sunset', primary: '#f97316' },
  { name: 'Royal', primary: '#8b5cf6' },
  { name: 'Cyber', primary: '#06b6d4' },
  { name: 'Rose', primary: '#f43f5e' },
];

const BG_IMAGES = [
  { name: 'None', url: '' },
  { name: 'Mountains', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80' },
  { name: 'Ocean', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80' },
  { name: 'Night Sky', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80' },
  { name: 'Abstract', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80' },
  { name: 'Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80' },
];

function hexToHSL(hex) {
  let r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
  let max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h=0, s=0, l=(max+min)/2;
  if(max!==min){let d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break;}}
  return `${Math.round(h*360)} ${Math.round(s*100)}% ${Math.round(l*100)}%`;
}

async function saveSettings(patch) {
  const user = await base44.auth.me().catch(() => null);
  if (!user) return;
  const existing = await base44.entities.UserSettings.filter({ user_id: user.id });
  if (existing[0]) {
    await base44.entities.UserSettings.update(existing[0].id, patch);
  } else {
    await base44.entities.UserSettings.create({ user_id: user.id, ...patch });
  }
}

export default function ThemeCustomizer({ onBgChange, currentBg }) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const applyTheme = (hex) => {
    document.documentElement.style.setProperty('--primary', hexToHSL(hex));
    document.documentElement.style.setProperty('--ring', hexToHSL(hex));
    saveSettings({ theme_color: hex });
  };

  const resetTheme = () => {
    document.documentElement.style.setProperty('--primary', '0 78% 55%');
    document.documentElement.style.setProperty('--ring', '0 78% 55%');
    onBgChange?.('');
    saveSettings({ theme_color: '', bg_image: '' });
  };

  const handleBgChange = (url) => {
    onBgChange?.(url);
    saveSettings({ bg_image: url });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    handleBgChange(file_url);
    setUploading(false);
  };

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="rounded-full hover:bg-primary/10 hover:text-primary">
        <Palette className="w-4 h-4" />
      </Button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-background/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  <h2 className="font-heading font-bold text-lg">Customize Naslum Go</h2>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => document.documentElement.classList.toggle('dark')} className="rounded-full">
                    <Sun className="w-4 h-4 dark:hidden" /><Moon className="w-4 h-4 hidden dark:block" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={resetTheme} className="rounded-full">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
                {/* Color themes */}
                <div>
                  <h3 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Accent Color</h3>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {PRESET_THEMES.map((t) => (
                      <button key={t.name} onClick={() => applyTheme(t.primary)} className="group flex flex-col items-center gap-1.5">
                        <div className="w-12 h-12 rounded-xl border-2 border-border group-hover:border-foreground group-hover:scale-110 transition-all shadow-sm" style={{ background: t.primary }} />
                        <span className="text-[10px] text-muted-foreground font-medium">{t.name}</span>
                      </button>
                    ))}
                  </div>
                  {/* Custom color picker */}
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
                    <label className="text-xs font-medium text-muted-foreground flex-1">Custom Color</label>
                    <input
                      type="color"
                      defaultValue="#dc2626"
                      onChange={(e) => applyTheme(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                    />
                  </div>
                </div>

                {/* Background images */}
                <div>
                  <h3 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Background</h3>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {BG_IMAGES.map((bg) => (
                      <button
                        key={bg.name}
                        onClick={() => handleBgChange(bg.url)}
                        className={`relative h-20 rounded-xl border-2 overflow-hidden transition-all ${currentBg === bg.url ? 'border-primary' : 'border-border hover:border-foreground/30'}`}
                      >
                        {bg.url
                          ? <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-muted flex items-center justify-center"><span className="text-xs text-muted-foreground">None</span></div>
                        }
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                          <span className="text-[10px] text-white font-medium">{bg.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Upload from device */}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload from device'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
  }
