import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Shield, Zap, Globe, Mail, ShoppingBag, Puzzle, Image, Video, Music, Upload, FileText, Layers, BarChart2, Store, Film, TrendingUp, HardDrive, Settings2, HelpCircle, Gamepad2, Settings, UserCircle, X, Users, MessageCircle, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import NaslumLogo from '@/components/NaslumLogo';
import SearchBar from '@/components/search/SearchBar';
import NaslumAIChat from '@/components/ai/NaslumAIChat';
import ThemeCustomizer from '@/components/settings/ThemeCustomizer';
import NaslumClock from '@/components/NaslumClock';
import NotificationBell from '@/components/notifications/NotificationBell';
import { base44 } from '@/api/base44Client';

function hexToHSL(hex) {
  let r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
  let max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h=0, s=0, l=(max+min)/2;
  if(max!==min){let d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break;}}
  return `${Math.round(h*360)} ${Math.round(s*100)}% ${Math.round(l*100)}%`;
}

export default function Home() {
  const navigate = useNavigate();
  const [showAI, setShowAI] = useState(false);
  const [bgImage, setBgImage] = useState('');
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [showGuestBanner, setShowGuestBanner] = useState(true);

  useEffect(() => {
    // Load custom background from localStorage (works for guests and authed users)
    const customBg = localStorage.getItem('naslum_custom_bg');
    if (customBg) { setBgImage(customBg); return; }

    base44.auth.isAuthenticated().then(async (authed) => {
      if (!authed) {
        // Guest mode check — redirect to welcome if not opted in
        if (!localStorage.getItem('naslum_guest')) {
          navigate('/welcome', { replace: true });
          return;
        }
        setIsGuest(true);
        // Load guest theme from localStorage
        const guestTheme = localStorage.getItem('naslum_guest_theme');
        if (guestTheme) {
          const hsl = hexToHSL(guestTheme);
          document.documentElement.style.setProperty('--primary', hsl);
          document.documentElement.style.setProperty('--ring', hsl);
        }
        return;
      }
      // Authenticated user — load settings from DB
      const u = await base44.auth.me();
      setUser(u);
      const settings = await base44.entities.UserSettings.filter({ user_id: u.id });
      const s = settings[0];
      if (!s) return;
      if (s.bg_image) setBgImage(s.bg_image);
      if (s.theme_color) {
        const hsl = hexToHSL(s.theme_color);
        document.documentElement.style.setProperty('--primary', hsl);
        document.documentElement.style.setProperty('--ring', hsl);
      }
    }).catch(() => {
      if (!localStorage.getItem('naslum_guest')) {
        navigate('/welcome', { replace: true });
      } else {
        setIsGuest(true);
      }
    });
  }, []);

  const handleSearch = (query) => navigate(`/search?q=${encodeURIComponent(query)}`);
  const exitGuest = () => {
    localStorage.removeItem('naslum_guest');
    navigate('/welcome');
  };

  return (
    <div className="min-h-screen flex flex-col relative"
      style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
      {bgImage && <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />}

      {isGuest && showGuestBanner && (
        <div className="relative z-20 bg-primary/10 border-b border-primary/20 px-4 py-2 text-center text-sm flex items-center justify-center gap-3">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <UserCircle className="w-4 h-4 text-primary" />
            You're browsing as a guest.
          </span>
          <Link to="/register" className="text-primary font-medium hover:underline">Create an account</Link>
          <span className="text-muted-foreground/50">to save your settings & data.</span>
          <button onClick={() => setShowGuestBanner(false)} className="absolute right-4 top-1/2 -translate-y-1/2">
            <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      )}

      <header className="relative z-10 flex items-center justify-between px-4 md:px-6 py-3 gap-2">
        <nav className="flex items-center gap-0.5 flex-wrap">
          {[
            { to: '/mail', icon: Mail, label: 'Mail' },
            { to: '/friends', icon: Users, label: 'Friends' },
            { to: '/messages', icon: MessageCircle, label: 'Messages' },
            { to: '/market', icon: ShoppingBag, label: 'Market' },
            { to: '/docs', icon: FileText, label: 'Docs' },
            { to: '/slides', icon: Layers, label: 'Slides' },
            { to: '/polls', icon: BarChart2, label: 'Polls' },
            { to: '/music', icon: Music, label: 'Music' },
            { to: '/upload', icon: Upload, label: 'Upload' },
            { to: '/apps', icon: Store, label: 'Apps' },
            { to: '/games', icon: Gamepad2, label: 'Games' },
            { to: '/stocks', icon: TrendingUp, label: 'Stocks' },
            { to: '/drive', icon: HardDrive, label: 'Drive' },
            { to: '/video-editor', icon: Film, label: 'Video Editor' },
            { to: '/console', icon: Terminal, label: 'Console' },
            { to: '/extensions', icon: Puzzle, label: 'Extensions' },
            { to: '/settings', icon: Settings, label: 'Settings' },
            { to: '/help', icon: HelpCircle, label: 'Help' },
          ].map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Icon className="w-3.5 h-3.5" /> {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <NaslumClock compact format="12h" />
          <NotificationBell user={user} />
          <ThemeCustomizer onBgChange={setBgImage} currentBg={bgImage} />
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 -mt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="flex flex-col items-center w-full max-w-2xl">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-8">
            <NaslumClock format="12h" />
          </motion.div>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <NaslumLogo size="lg" />
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-muted-foreground text-sm md:text-base mt-2 mb-8 text-center">
            Search the web. Ask AI. Create anything.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full">
            <SearchBar onSearch={handleSearch} onAIClick={() => setShowAI(true)} variant="home" autoFocus />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <button onClick={() => setShowAI(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
              <Sparkles className="w-3.5 h-3.5" /> Ask Naslum AI
            </button>
            <Link to="/games"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
              <Gamepad2 className="w-3.5 h-3.5" /> Games
            </Link>
            <Link to="/images?q=wallpapers"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 hover:text-foreground transition-colors">
              <Image className="w-3.5 h-3.5" /> Images
            </Link>
            <Link to="/videos?q=trending"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 hover:text-foreground transition-colors">
              <Video className="w-3.5 h-3.5" /> Videos
            </Link>
            {['Tech News', 'Sports', 'Weather', 'Finance'].map((topic) => (
              <button key={topic} onClick={() => handleSearch(topic)}
                className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 hover:text-foreground transition-colors">
                {topic}
              </button>
            ))}
          </motion.div>
        </motion.div>
      </main>

      <footer className="relative z-10 py-4 text-center">
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Private</span>
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Fast</span>
          <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Worldwide</span>
        </div>
        <p className="text-xs text-muted-foreground/50 mt-1">© 2026 Naslum Go™. All common rights reserved.</p>
      </footer>

      <NaslumAIChat isOpen={showAI} onClose={() => setShowAI(false)} />
    </div>
  );
            }
