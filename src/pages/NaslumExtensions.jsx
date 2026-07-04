import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Puzzle, Clock, Mail, ShoppingBag, Image, Video,
  Sparkles, Globe, Calculator, StickyNote, Bookmark,
  Rss, Cpu, ToggleLeft, ToggleRight, CheckCircle2, ArrowLeft, ExternalLink,
  Music, BarChart2, Layers, FileText, Upload, Shield, Languages, Map, Palette, Mic,
  Gamepad2, Type
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import NaslumLogo from '@/components/NaslumLogo';

const ALL_ADDONS = [
  {
    id: 'clock',
    name: 'Naslum Clock',
    description: 'A beautiful real-time clock on your homepage with 12/24h support.',
    icon: Clock,
    category: 'Productivity',
    featured: true,
  },
  {
    id: 'mail',
    name: 'Naslum Mail',
    description: 'Full-featured email client. Send & receive messages with Naslum users.',
    icon: Mail,
    category: 'Communication',
    featured: true,
  },
  {
    id: 'marketplace',
    name: 'Naslum Market',
    description: 'Buy and sell items in the Naslum branded marketplace.',
    icon: ShoppingBag,
    category: 'Shopping',
    featured: true,
  },
  {
    id: 'image_search',
    name: 'Image Search',
    description: 'Search for images across the web with AI-powered results.',
    icon: Image,
    category: 'Search',
    featured: false,
  },
  {
    id: 'video_search',
    name: 'Video Search',
    description: 'Discover videos with curated results from across the internet.',
    icon: Video,
    category: 'Search',
    featured: false,
  },
  {
    id: 'naslum_ai',
    name: 'Naslum AI',
    description: 'AI chat, code generation, and image creation — always on.',
    icon: Sparkles,
    category: 'AI',
    featured: true,
  },
  {
    id: 'quick_notes',
    name: 'Quick Notes',
    description: 'Jot down notes right from your Naslum homepage.',
    icon: StickyNote,
    category: 'Productivity',
    featured: false,
  },
  {
    id: 'bookmarks',
    name: 'Smart Bookmarks',
    description: 'Save and organize your favorite websites.',
    icon: Bookmark,
    category: 'Productivity',
    featured: false,
  },
  {
    id: 'news_feed',
    name: 'News Feed',
    description: 'Personalized news headlines from around the world.',
    icon: Rss,
    category: 'News',
    featured: false,
  },
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Quick calculations without leaving Naslum Go.',
    icon: Calculator,
    category: 'Tools',
    featured: false,
  },
  {
    id: 'ai_assistant',
    name: 'AI Sidebar',
    description: 'Keep Naslum AI docked as a sidebar while you browse.',
    icon: Cpu,
    category: 'AI',
    featured: false,
  },
  {
    id: 'global_search',
    name: 'Global Web',
    description: 'Expand search to include deep web and specialized sources.',
    icon: Globe,
    category: 'Search',
    featured: false,
  },
  {
    id: 'naslum_music',
    name: 'Naslum Music',
    description: 'Stream, upload, and discover music with AI-powered moderation.',
    icon: Music,
    category: 'Media',
    featured: true,
  },
  {
    id: 'naslum_polls',
    name: 'Naslum Polls',
    description: 'Create polls, gather opinions, and see real-time results.',
    icon: BarChart2,
    category: 'Productivity',
    featured: false,
  },
  {
    id: 'naslum_slides',
    name: 'Naslum Slides',
    description: 'Build and present beautiful slideshows right in your browser.',
    icon: Layers,
    category: 'Productivity',
    featured: true,
  },
  {
    id: 'naslum_docs',
    name: 'Naslum Docs',
    description: 'Create, edit, and organize documents with a built-in rich editor.',
    icon: FileText,
    category: 'Productivity',
    featured: true,
  },
  {
    id: 'naslum_upload',
    name: 'Naslum Upload',
    description: 'Upload images, videos, and audio with AI-powered content moderation.',
    icon: Upload,
    category: 'Media',
    featured: false,
  },
  {
    id: 'content_guard',
    name: 'Content Guard',
    description: 'Extra protection layer that filters harmful content from search results.',
    icon: Shield,
    category: 'Security',
    featured: false,
  },
  {
    id: 'translator',
    name: 'Naslum Translate',
    description: 'Instantly translate any webpage or text into 100+ languages.',
    icon: Languages,
    category: 'Tools',
    featured: false,
  },
  {
    id: 'maps',
    name: 'Naslum Maps',
    description: 'Integrated maps and location search right inside your browser.',
    icon: Map,
    category: 'Tools',
    featured: false,
  },
  {
    id: 'theme_studio',
    name: 'Theme Studio',
    description: 'Advanced theme editor with custom fonts, colors, and backgrounds.',
    icon: Palette,
    category: 'Productivity',
    featured: false,
  },
  {
    id: 'voice_search',
    name: 'Voice Search',
    description: 'Search the web hands-free using your microphone.',
    icon: Mic,
    category: 'Search',
    featured: false,
  },
  {
    id: 'weather',
    name: 'Weather Widget',
    description: 'Live weather forecasts and radar right on your homepage.',
    icon: Globe,
    category: 'Tools',
    featured: false,
  },
  {
    id: 'unit_converter',
    name: 'Unit Converter',
    description: 'Convert units — length, weight, currency, temperature, and more.',
    icon: Calculator,
    category: 'Tools',
    featured: false,
  },
  {
    id: 'code_editor',
    name: 'Code Editor',
    description: 'In-browser code editor with syntax highlighting for 50+ languages.',
    icon: Cpu,
    category: 'Productivity',
    featured: false,
  },
  {
    id: 'task_manager',
    name: 'Task Manager',
    description: 'Kanban-style task boards and to-do lists built right in.',
    icon: CheckCircle2,
    category: 'Productivity',
    featured: false,
  },
  {
    id: 'focus_mode',
    name: 'Focus Mode',
    description: 'Block distracting sites and use a Pomodoro timer to stay productive.',
    icon: Shield,
    category: 'Productivity',
    featured: false,
  },
  {
    id: 'screenshot_tool',
    name: 'Screenshot Tool',
    description: 'Capture, annotate, and share screenshots instantly.',
    icon: Image,
    category: 'Tools',
    featured: false,
  },
  {
    id: 'ai_writer',
    name: 'AI Writer',
    description: 'AI-powered writing assistant for emails, essays, and content.',
    icon: Sparkles,
    category: 'AI',
    featured: true,
  },
  {
    id: 'ai_summarizer',
    name: 'AI Summarizer',
    description: 'Summarize any webpage or document with one click using AI.',
    icon: Cpu,
    category: 'AI',
    featured: false,
  },
  {
    id: 'ai_translator',
    name: 'AI Translator',
    description: 'Real-time AI translation of selected text into any language.',
    icon: Languages,
    category: 'AI',
    featured: false,
  },
  {
    id: 'rss_reader',
    name: 'RSS Reader',
    description: 'Follow your favorite blogs and sites with a custom RSS feed reader.',
    icon: Rss,
    category: 'News',
    featured: false,
  },
  {
    id: 'crypto_ticker',
    name: 'Crypto Ticker',
    description: 'Real-time cryptocurrency prices and market trends.',
    icon: BarChart2,
    category: 'Tools',
    featured: false,
  },
  {
    id: 'stock_tracker',
    name: 'Stock Tracker',
    description: 'Track your stock portfolio with live prices and alerts.',
    icon: BarChart2,
    category: 'Tools',
    featured: false,
  },
  {
    id: 'vpn_badge',
    name: 'Privacy Indicator',
    description: 'Shows your connection security status and anonymity level.',
    icon: Shield,
    category: 'Security',
    featured: false,
  },
  {
    id: 'ad_blocker',
    name: 'Ad Blocker',
    description: 'Block intrusive ads and trackers for a cleaner browsing experience.',
    icon: Shield,
    category: 'Security',
    featured: true,
  },
  {
    id: 'dark_reader',
    name: 'Dark Reader',
    description: 'Force dark mode on any website for comfortable night browsing.',
    icon: Palette,
    category: 'Productivity',
    featured: false,
  },
  {
    id: 'font_picker',
    name: 'Font Picker',
    description: 'Change the font across Naslum Go to suit your reading style.',
    icon: Palette,
    category: 'Productivity',
    featured: false,
  },
  {
    id: 'speed_dial',
    name: 'Speed Dial',
    description: 'Quick-access tiles for your top 9 websites on the homepage.',
    icon: Globe,
    category: 'Productivity',
    featured: false,
  },
  {
    id: 'reading_list',
    name: 'Reading List',
    description: 'Save articles and pages to read later, offline or online.',
    icon: Bookmark,
    category: 'Productivity',
    featured: false,
  },
  {
    id: 'grammar_check',
    name: 'Grammar Check',
    description: 'Real-time grammar and spelling corrections as you type anywhere.',
    icon: StickyNote,
    category: 'AI',
    featured: false,
  },
  {
    id: 'video_editor',
    name: 'Naslum Video Editor',
    description: 'Full-featured in-browser video editor with 20+ tools and export.',
    icon: Video,
    category: 'Media',
    featured: true,
  },
  {
    id: 'app_store',
    name: 'App Store',
    description: '50+ popular web apps accessible directly inside Naslum Go.',
    icon: ShoppingBag,
    category: 'Productivity',
    featured: true,
  },
  {
    id: 'game_2048',
    name: '2048',
    description: 'Classic sliding tile puzzle game — merge numbers to reach 2048.',
    icon: Gamepad2,
    category: 'Games',
    featured: false,
  },
  {
    id: 'game_snake',
    name: 'Snake',
    description: 'The classic snake game built right into your browser.',
    icon: Gamepad2,
    category: 'Games',
    featured: false,
  },
  {
    id: 'game_tetris',
    name: 'Tetris',
    description: 'Play Tetris without leaving Naslum Go.',
    icon: Gamepad2,
    category: 'Games',
    featured: false,
  },
  {
    id: 'game_wordle',
    name: 'Wordle Clone',
    description: 'Guess the 5-letter word in 6 tries — daily word puzzle.',
    icon: Gamepad2,
    category: 'Games',
    featured: true,
  },
  {
    id: 'game_chess',
    name: 'Chess',
    description: 'Play chess against AI or challenge a friend online.',
    icon: Gamepad2,
    category: 'Games',
    featured: false,
  },
  {
    id: 'game_minesweeper',
    name: 'Minesweeper',
    description: 'Classic minesweeper — clear the grid without hitting mines.',
    icon: Gamepad2,
    category: 'Games',
    featured: false,
  },
  { id: 'tab_manager', name: 'Tab Manager', description: 'Organize and group open browser tabs with labels and colors.', icon: Layers, category: 'Productivity', featured: false },
  { id: 'pomodoro', name: 'Pomodoro Timer', description: 'Stay focused with work/break intervals using the Pomodoro technique.', icon: Clock, category: 'Productivity', featured: false },
  { id: 'habit_tracker', name: 'Habit Tracker', description: 'Track daily habits and build streaks to stay consistent.', icon: CheckCircle2, category: 'Productivity', featured: false },
  { id: 'password_gen', name: 'Password Generator', description: 'Generate strong, secure passwords with one click.', icon: Shield, category: 'Security', featured: false },
  { id: 'clipboard_manager', name: 'Clipboard Manager', description: 'Save and reuse your clipboard history across sessions.', icon: StickyNote, category: 'Productivity', featured: false },
  { id: 'emoji_picker', name: 'Emoji Picker', description: 'Quick access to all emojis — copy with one click.', icon: Sparkles, category: 'Tools', featured: false },
  { id: 'color_picker', name: 'Color Picker', description: 'Pick colors from any webpage and copy the hex/rgb values.', icon: Palette, category: 'Tools', featured: false },
  { id: 'json_viewer', name: 'JSON Viewer', description: 'Format and explore JSON data with syntax highlighting.', icon: Cpu, category: 'Productivity', featured: false },
  { id: 'font_preview', name: 'Font Previewer', description: 'Preview and compare Google Fonts on any webpage.', icon: Palette, category: 'Tools', featured: false },
  { id: 'image_downloader', name: 'Image Downloader', description: 'Bulk download all images from any webpage.', icon: Image, category: 'Tools', featured: false },
  { id: 'link_checker', name: 'Link Checker', description: 'Scan pages for broken links and redirect chains.', icon: Globe, category: 'Tools', featured: false },
  { id: 'network_monitor', name: 'Network Monitor', description: 'Monitor network requests and response times in real-time.', icon: Rss, category: 'Tools', featured: false },
  { id: 'text_expander', name: 'Text Expander', description: 'Create shortcuts that expand into full phrases or templates.', icon: Type, category: 'Productivity', featured: false },
  { id: 'ai_image_gen', name: 'AI Image Gen', description: 'Generate images from text descriptions using AI.', icon: Sparkles, category: 'AI', featured: true },
  { id: 'ai_voice', name: 'AI Voice', description: 'Convert any text to natural-sounding speech using AI voices.', icon: Mic, category: 'AI', featured: false },
  { id: 'smart_forms', name: 'Smart Forms', description: 'AI-powered form filler that learns your data over time.', icon: CheckCircle2, category: 'AI', featured: false },
  { id: 'game_sudoku', name: 'Sudoku', description: 'Classic number puzzle with multiple difficulty levels.', icon: Gamepad2, category: 'Games', featured: false },
  { id: 'game_flappy', name: 'Flappy Bird', description: 'Tap to fly — the addictive one-tap endless runner.', icon: Gamepad2, category: 'Games', featured: false },
  { id: 'game_memory', name: 'Memory Match', description: 'Flip cards to find matching pairs and test your memory.', icon: Gamepad2, category: 'Games', featured: false },
  { id: 'game_pong', name: 'Pong', description: 'The original arcade classic — two paddles, one ball.', icon: Gamepad2, category: 'Games', featured: false },
  { id: 'naslum_stocks', name: 'Naslum Stocks', description: 'Track your stock watchlist with charts and real-time prices.', icon: BarChart2, category: 'Tools', featured: true },
  { id: 'naslum_drive', name: 'Naslum Drive', description: 'Your personal cloud storage — upload, manage, and share files.', icon: Upload, category: 'Media', featured: true },
];

const CATEGORIES = ['All', 'Productivity', 'AI', 'Search', 'Communication', 'Shopping', 'News', 'Tools', 'Media', 'Security', 'Games'];

// Map extensions that have dedicated pages to their routes
const EXTENSION_ROUTES = {
  mail: '/mail', marketplace: '/market', image_search: '/images', video_search: '/videos',
  naslum_music: '/music', naslum_polls: '/polls', naslum_slides: '/slides', naslum_docs: '/docs',
  naslum_upload: '/upload', video_editor: '/video-editor', app_store: '/apps',
  naslum_stocks: '/stocks', naslum_drive: '/drive', theme_studio: '/customize',
  game_2048: '/games', game_snake: '/games', game_memory: '/games', game_tetris: '/games',
  game_wordle: '/games', game_chess: '/games', game_minesweeper: '/games', game_sudoku: '/games',
  game_flappy: '/games', game_pong: '/games',
};

export default function NaslumExtensions() {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState([
    'clock', 'mail', 'marketplace', 'image_search', 'video_search', 'naslum_ai'
  ]);
  const [category, setCategory] = useState('All');
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.UserSettings.filter({ user_id: u.id }).then(res => {
        if (res[0]?.enabled_addons) setEnabled(res[0].enabled_addons);
      });
    }).catch(() => {
      // Guest mode — load from localStorage
      const saved = localStorage.getItem('naslum_guest_addons');
      if (saved) setEnabled(JSON.parse(saved));
    });
  }, []);

  const toggle = async (id) => {
    setSaving(id);
    const next = enabled.includes(id) ? enabled.filter(e => e !== id) : [...enabled, id];
    setEnabled(next);
    if (user) {
      const existing = await base44.entities.UserSettings.filter({ user_id: user.id });
      if (existing[0]) {
        await base44.entities.UserSettings.update(existing[0].id, { enabled_addons: next });
      } else {
        await base44.entities.UserSettings.create({ user_id: user.id, enabled_addons: next });
      }
    } else {
      // Guest mode — persist to localStorage
      localStorage.setItem('naslum_guest_addons', JSON.stringify(next));
    }
    setSaving(null);
  };

  const openExtension = (id) => {
    const route = EXTENSION_ROUTES[id];
    if (route) navigate(route);
  };

  const filtered = category === 'All' ? ALL_ADDONS : ALL_ADDONS.filter(a => a.category === category);
  const featured = ALL_ADDONS.filter(a => a.featured);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/')} className="flex-shrink-0">
            <NaslumLogo size="sm" showText={false} />
          </button>
          <div className="flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-lg">Naslum Extensions</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="ml-auto gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Naslum Go
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-10 p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Puzzle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl">Extension Store</h1>
              <p className="text-sm text-muted-foreground">Customize your Naslum Go experience</p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm max-w-lg">
            Enable or disable features to build your perfect browser. All add-ons are built by Naslum and sync across your account.
          </p>
          <div className="flex gap-4 mt-4 text-sm">
            <span className="font-semibold">{enabled.length} <span className="text-muted-foreground font-normal">enabled</span></span>
            <span className="font-semibold">{ALL_ADDONS.length - enabled.length} <span className="text-muted-foreground font-normal">available</span></span>
          </div>
        </motion.div>

        {/* Featured */}
        <section className="mb-10">
          <h2 className="font-heading font-bold text-lg mb-4">Featured</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featured.map((addon, i) => (
              <AddonCard key={addon.id} addon={addon} enabled={enabled.includes(addon.id)} onToggle={toggle} onOpen={openExtension} saving={saving === addon.id} index={i} />
            ))}
          </div>
        </section>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {c
