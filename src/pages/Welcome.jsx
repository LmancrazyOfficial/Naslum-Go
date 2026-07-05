import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Mail, ShoppingBag, Music, Film, TrendingUp, Gamepad2,
  FileText, Shield, Zap, Globe, UserPlus, LogIn, Eye, Search,
  Layers, HelpCircle, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import NaslumLogo from '@/components/NaslumLogo';
import { base44 } from '@/api/base44Client';

const FEATURES = [
  { icon: Search, title: 'Smart Search', desc: 'AI-powered web search with results & sources' },
  { icon: Sparkles, title: 'Naslum AI', desc: 'Built-in AI assistant — always online, no credits' },
  { icon: Mail, title: 'Naslum Mail', desc: 'Send & receive messages with other users' },
  { icon: ShoppingBag, title: 'Marketplace', desc: 'Buy and sell items in the Naslum market' },
  { icon: Music, title: 'Music', desc: 'Stream and upload audio tracks' },
  { icon: Film, title: 'Video Editor', desc: '60+ editing tools right in your browser' },
  { icon: TrendingUp, title: 'Stocks', desc: 'Simulated paper trading platform' },
  { icon: Gamepad2, title: 'Games', desc: 'Tic-Tac-Toe, 2048, Memory, Snake' },
  { icon: FileText, title: 'Docs & Slides', desc: 'Create documents and presentations' },
  { icon: Layers, title: 'Extensions', desc: '70+ add-ons to customize your experience' },
  { icon: HelpCircle, title: 'Help Center', desc: 'AI-powered help, always available' },
  { icon: Globe, title: 'App Store', desc: '50+ web apps in one place' },
];

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => {
      if (authed) navigate('/', { replace: true });
    });
  }, []);

  const continueAsGuest = () => {
    localStorage.setItem('naslum_guest', 'true');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <NaslumLogo size="md" />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Log in</Button>
          <Button size="sm" onClick={() => navigate('/register')}>Get started</Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto w-full py-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <NaslumLogo size="xl" />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="font-heading font-bold text-4xl md:text-6xl mt-6 mb-4 leading-tight">
          Search the web. <span className="text-primary">Ask AI.</span><br />Create anything.
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-muted-foreground text-lg max-w-xl mb-8">
          Your all-in-one browser platform — search, AI, mail, marketplace, games, and 70+ extensions. Built from scratch, always online.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3">
          <Button size="lg" onClick={() => navigate('/register')} className="gap-2 h-12 px-8 text-base">
            <UserPlus className="w-4 h-4" /> Create free account
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="gap-2 h-12 px-8 text-base">
            <LogIn className="w-4 h-4" /> Log in
          </Button>
          <Button size="lg" variant="ghost" onClick={continueAsGuest} className="gap-2 h-12 px-8 text-base">
            <Eye className="w-4 h-4" /> Continue as guest
          </Button>
        </motion.div>
        <p className="text-xs text-muted-foreground/60 mt-4">
          No credit card required. Guest mode lets you explore without an account.
        </p>

        {/* Features grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-16 w-full">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.04 }}
              className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust badges */}
        <div className="flex items-center gap-6 mt-12 text-sm text-muted-foreground flex-wrap justify-center">
          <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> Private & secure</span>
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> Always online</span>
          <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> Works worldwide</span>
          <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> No credits needed</span>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground/50">
        © 2026 Naslum Go™. All common rights reserved.
      </footer>
    </div>
  );
          }
