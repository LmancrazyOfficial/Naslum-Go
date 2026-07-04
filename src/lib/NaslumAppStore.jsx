import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, X, ExternalLink, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NaslumLogo from '@/components/NaslumLogo';

const APPS = [
  // Productivity
  { id: 'notion', name: 'Notion', category: 'Productivity', rating: 4.8, url: 'https://notion.so', desc: 'All-in-one workspace for notes, docs, and databases.', color: '#000000', emoji: '📝' },
  { id: 'trello', name: 'Trello', category: 'Productivity', rating: 4.7, url: 'https://trello.com', desc: 'Visual boards for managing your projects and tasks.', color: '#0052CC', emoji: '📋' },
  { id: 'asana', name: 'Asana', category: 'Productivity', rating: 4.6, url: 'https://asana.com', desc: 'Project management and team collaboration tool.', color: '#F06A6A', emoji: '✅' },
  { id: 'todoist', name: 'Todoist', category: 'Productivity', rating: 4.8, url: 'https://todoist.com', desc: 'The best to-do list app for organizing your life.', color: '#DB4035', emoji: '☑️' },
  { id: 'evernote', name: 'Evernote', category: 'Productivity', rating: 4.5, url: 'https://evernote.com', desc: 'Note-taking and organization for everything.', color: '#00A82D', emoji: '🐘' },
  { id: 'clickup', name: 'ClickUp', category: 'Productivity', rating: 4.7, url: 'https://clickup.com', desc: 'One app to replace them all — project & task management.', color: '#7B68EE', emoji: '⚡' },
  { id: 'airtable', name: 'Airtable', category: 'Productivity', rating: 4.6, url: 'https://airtable.com', desc: 'Spreadsheet meets database for organizing anything.', color: '#18BFFF', emoji: '🗃️' },
  { id: 'linear', name: 'Linear', category: 'Productivity', rating: 4.8, url: 'https://linear.app', desc: 'Issue tracking built for modern software teams.', color: '#5E6AD2', emoji: '🎯' },

  // Communication
  { id: 'slack', name: 'Slack', category: 'Communication', rating: 4.7, url: 'https://slack.com', desc: 'Team messaging and collaboration platform.', color: '#4A154B', emoji: '💬' },
  { id: 'discord', name: 'Discord', category: 'Communication', rating: 4.8, url: 'https://discord.com', desc: 'Chat, voice, and video for communities and gaming.', color: '#5865F2', emoji: '🎮' },
  { id: 'zoom', name: 'Zoom', category: 'Communication', rating: 4.6, url: 'https://zoom.us', desc: 'Video meetings, webinars, and phone calls.', color: '#2D8CFF', emoji: '📹' },
  { id: 'teams', name: 'Microsoft Teams', category: 'Communication', rating: 4.5, url: 'https://teams.microsoft.com', desc: 'Chat, meet, call, and collaborate — all in one place.', color: '#6264A7', emoji: '👥' },
  { id: 'telegram', name: 'Telegram', category: 'Communication', rating: 4.9, url: 'https://web.telegram.org', desc: 'Fast and secure messaging and file sharing.', color: '#26A5E4', emoji: '✈️' },
  { id: 'whatsapp', name: 'WhatsApp Web', category: 'Communication', rating: 4.7, url: 'https://web.whatsapp.com', desc: 'Message and call friends from your browser.', color: '#25D366', emoji: '📱' },

  // Social Media
  { id: 'twitter', name: 'X (Twitter)', category: 'Social', rating: 4.4, url: 'https://x.com', desc: 'Explore trending topics, news, and conversations.', color: '#000000', emoji: '𝕏' },
  { id: 'reddit', name: 'Reddit', category: 'Social', rating: 4.7, url: 'https://reddit.com', desc: 'The front page of the internet — dive into communities.', color: '#FF4500', emoji: '🤖' },
  { id: 'linkedin', name: 'LinkedIn', category: 'Social', rating: 4.5, url: 'https://linkedin.com', desc: 'Professional networking and job opportunities.', color: '#0A66C2', emoji: '💼' },
  { id: 'instagram', name: 'Instagram', category: 'Social', rating: 4.6, url: 'https://instagram.com', desc: 'Share photos, reels, and stories with the world.', color: '#E4405F', emoji: '📸' },
  { id: 'pinterest', name: 'Pinterest', category: 'Social', rating: 4.5, url: 'https://pinterest.com', desc: 'Discover and save creative ideas for anything.', color: '#E60023', emoji: '📌' },

  // Entertainment
  { id: 'youtube', name: 'YouTube', category: 'Entertainment', rating: 4.9, url: 'https://youtube.com', desc: 'Watch, upload, and discover videos worldwide.', color: '#FF0000', emoji: '▶️' },
  { id: 'spotify', name: 'Spotify', category: 'Entertainment', rating: 4.8, url: 'https://open.spotify.com', desc: 'Stream millions of songs, podcasts, and audiobooks.', color: '#1DB954', emoji: '🎵' },
  { id: 'netflix', name: 'Netflix', category: 'Entertainment', rating: 4.7, url: 'https://netflix.com', desc: 'Watch TV shows and movies anywhere, anytime.', color: '#E50914', emoji: '🎬' },
  { id: 'twitch', name: 'Twitch', category: 'Entertainment', rating: 4.6, url: 'https://twitch.tv', desc: 'Live streaming for gaming, music, and creative content.', color: '#9146FF', emoji: '🎮' },
  { id: 'soundcloud', name: 'SoundCloud', category: 'Entertainment', rating: 4.5, url: 'https://soundcloud.com', desc: 'Discover and stream independent music and podcasts.', color: '#FF7700', emoji: '🎶' },

  // Design & Creative
  { id: 'figma', name: 'Figma', category: 'Design', rating: 4.9, url: 'https://figma.com', desc: 'Collaborative UI/UX design and prototyping tool.', color: '#F24E1E', emoji: '🎨' },
  { id: 'canva', name: 'Canva', category: 'Design', rating: 4.8, url: 'https://canva.com', desc: 'Create graphics, presentations, and marketing materials.', color: '#00C4CC', emoji: '✏️' },
  { id: 'miro', name: 'Miro', category: 'Design', rating: 4.7, url: 'https://miro.com', desc: 'Online whiteboard for brainstorming and collaboration.', color: '#FFD02F', emoji: '🖼️' },
  { id: 'excalidraw', name: 'Excalidraw', category: 'Design', rating: 4.8, url: 'https://excalidraw.com', desc: 'Virtual whiteboard for hand-drawn diagrams.', color: '#6965DB', emoji: '✍️' },

  // Developer Tools
  { id: 'github', name: 'GitHub', category: 'Developer', rating: 4.9, url: 'https://github.com', desc: 'Host, review, and collaborate on code with Git.', color: '#181717', emoji: '🐙' },
  { id: 'codepen', name: 'CodePen', category: 'Developer', rating: 4.7, url: 'https://codepen.io', desc: 'Build, share, and discover front-end code snippets.', color: '#000000', emoji: '🖊️' },
  { id: 'replit', name: 'Replit', category: 'Developer', rating: 4.6, url: 'https://replit.com', desc: 'Code, run, and deploy apps in any language online.', color: '#F26207', emoji: '💻' },
  { id: 'stackoverflow', name: 'Stack Overflow', category: 'Developer', rating: 4.8, url: 'https://stackoverflow.com', desc: 'The largest Q&A community for developers worldwide.', color: '#F58025', emoji: '📚' },
  { id: 'vercel', name: 'Vercel', category: 'Developer', rating: 4.7, url: 'https://vercel.com', desc: 'Deploy frontend apps with zero configuration.', color: '#000000', emoji: '▲' },

  // Finance
  { id: 'coinbase', name: 'Coinbase', category: 'Finance', rating: 4.5, url: 'https://coinbase.com', desc: 'Buy, sell, and manage your crypto portfolio.', color: '#0052FF', emoji: '💰' },
  { id: 'paypal', name: 'PayPal', category: 'Finance', rating: 4.4, url: 'https://paypal.com', desc: 'Send money and pay online securely.', color: '#003087', emoji: '💳' },
  { id: 'robinhood', name: 'Robinhood', category: 'Finance', rating: 4.3, url: 'https://robinhood.com', desc: 'Commission-free stock and crypto trading.', color: '#00C805', emoji: '📈' },

  // Education
  { id: 'duolingo', name: 'Duolingo', category: 'Education', rating: 4.8, url: 'https://duolingo.com', desc: 'Learn a new language with fun, gamified lessons.', color: '#58CC02', emoji: '🦉' },
  { id: 'coursera', name: 'Coursera', category: 'Education', rating: 4.7, url: 'https://coursera.org', desc: 'Online courses from top universities and companies.', color: '#0056D2', emoji: '🎓' },
  { id: 'khan', name: 'Khan Academy', category: 'Education', rating: 4.9, url: 'https://khanacademy.org', desc: 'Free world-class education for anyone, anywhere.', color: '#14BF96', emoji: '📖' },
  { id: 'udemy', name: 'Udemy', category: 'Education', rating: 4.6, url: 'https://udemy.com', desc: 'Learn any skill from expert-led video courses.', color: '#A435F0', emoji: '🏫' },

  // Tools & Utilities
  { id: 'wolfram', name: 'Wolfram Alpha', category: 'Tools', rating: 4.8, url: 'https://wolframalpha.com', desc: 'Computational knowledge engine — answer anything.', color: '#DD1100', emoji: '🔢' },
  { id: 'translate', name: 'Google Translate', category: 'Tools', rating: 4.7, url: 'https://translate.google.com', desc: 'Instant translation in 100+ languages.', color: '#4285F4', emoji: '🌐' },
  { id: 'weather_app', name: 'Weather.com', category: 'Tools', rating: 4.5, url: 'https://weather.com', desc: 'Accurate weather forecasts worldwide.', color: '#2196F3', emoji: '🌤️' },
  { id: 'maps', name: 'Google Maps', category: 'Tools', rating: 4.9, url: 'https://maps.google.com', desc: 'Navigation, directions, and local business search.', color: '#4285F4', emoji: '🗺️' },
  { id: 'calendar', name: 'Google Calendar', category: 'Tools', rating: 4.7, url: 'https://calendar.google.com', desc: 'Organize your schedule and share events.', color: '#4285F4', emoji: '📅' },
  { id: 'drive', name: 'Google Drive', category: 'Tools', rating: 4.8, url: 'https://drive.google.com', desc: 'Store, share, and collaborate on files in the cloud.', color: '#4285F4', emoji: '☁️' },
  { id: 'dropbox', name: 'Dropbox', category: 'Tools', rating: 4.6, url: 'https://dropbox.com', desc: 'Cloud storage and file sharing for teams.', color: '#0061FF', emoji: '📦' },
  { id: 'chatgpt', name: 'ChatGPT', category: 'Tools', rating: 4.9, url: 'https://chatgpt.com', desc: 'AI-powered conversation and content generation.', color: '#10A37F', emoji: '🤖' },
  { id: 'perplexity', name: 'Perplexity', category: 'Tools', rating: 4.7, url: 'https://perplexity.ai', desc: 'AI-powered search engine with real-time answers.', color: '#20808D', emoji: '🔍' },
  { id: 'gemini', name: 'Gemini', category: 'Tools', rating: 4.8, url: 'https://gemini.google.com', desc: "Google's most capable AI assistant.", color: '#4285F4', emoji: '✨' },
  { id: 'claude', name: 'Claude', category: 'Tools', rating: 4.8, url: 'https://claude.ai', desc: "Anthropic's AI assistant for complex tasks.", color: '#B4846C', emoji: '🧠' },
  { id: 'midjourney', name: 'Midjourney', category: 'Design', rating: 4.9, url: 'https://midjourney.com', desc: 'AI image generation with stunning artistic results.', color: '#000000', emoji: '🎨' },
  { id: 'runway', name: 'Runway', category: 'Design', rating: 4.7, url: 'https://runwayml.com', desc: 'AI-powered video editing and generation tool.', color: '#FF5A5A', emoji: '🎬' },
  { id: 'adobe_express', name: 'Adobe Express', category: 'Design', rating: 4.6, url: 'https://express.adobe.com', desc: 'Quick and easy graphic design for everyone.', color: '#FF0000', emoji: '🅰️' },
  { id: 'lottiefiles', name: 'LottieFiles', category: 'Design', rating: 4.7, url: 'https://lottiefiles.com', desc: 'Lightweight animations for apps and websites.', color: '#00DDB4', emoji: '💫' },
  { id: 'unsplash', name: 'Unsplash', category: 'Design', rating: 4.8, url: 'https://unsplash.com', desc: 'Free high-resolution photos for any project.', color: '#000000', emoji: '📷' },
  { id: 'pexels', name: 'Pexels', category: 'Design', rating: 4.7, url: 'https://pexels.com', desc: 'Free stock photos, videos, and royalty-free media.', color: '#05A081', emoji: '🖼️' },
  { id: 'loom', name: 'Loom', category: 'Communication', rating: 4.7, url: 'https://loom.com', desc: 'Record and share video messages quickly.', color: '#625DF5', emoji: '📹' },
  { id: 'calendly', name: 'Calendly', category: 'Productivity', rating: 4.7, url: 'https://calendly.com', desc: 'Easy scheduling software for meetings.', color: '#006BFF', emoji: '📅' },
  { id: 'hubspot', name: 'HubSpot', category: 'Productivity', rating: 4.5, url: 'https://hubspot.com', desc: 'CRM, marketing, and sales platform.', color: '#FF7A59', emoji: '🔧' },
  { id: 'mailchimp', name: 'Mailchimp', category: 'Productivity', rating: 4.4, url: 'https://mailchimp.com', desc: 'Email marketing and automation platform.', color: '#FFE01B', emoji: '📧' },
  { id: 'stripe', name: 'Stripe', category: 'Finance', rating: 4.8, url: 'https://stripe.com', desc: 'Payment infrastructure for the internet.', color: '#635BFF', emoji: '💳' },
  { id: 'wise', name: 'Wise', category: 'Finance', rating: 4.7, url: 'https://wise.com', desc: 'International money transfers at real exchange rates.', color: '#9FE870', emoji: '💱' },
  { id: 'binance', name: 'Binance', category: 'Finance', rating: 4.4, url: 'https://binance.com', desc: "World's largest crypto exchange..", color: '#F3BA2F', emoji: '₿' },
  { id: 'skillshare', name: 'Skillshare', category: 'Education', rating: 4.6, url: 'https://skillshare.com', desc: 'Creative and professional online classes.', color: '#00FF84', emoji: '🎯' },
  { id: 'brilliant', name: 'Brilliant', category: 'Education', rating: 4.9, url: 'https://brilliant.org', desc: 'Interactive STEM learning with guided problems.', color: '#FF6B35', emoji: '💡' },
  { id: 'github_copilot', name: 'GitHub Copilot', category: 'Developer', rating: 4.8, url: 'https://github.com/features/copilot', desc: 'AI pair programmer that helps you write code faster.', color: '#181717', emoji: '🤖' },
  { id: 'postman', name: 'Postman', category: 'Developer', rating: 4.7, url: 'https://postman.com', desc: 'API platform for building and testing APIs.', color: '#FF6C37', emoji: '📮' },
  { id: 'supabase', name: 'Supabase', category: 'Developer', rating: 4.8, url: 'https://supabase.com', desc: 'Open source Firebase alternative with Postgres.', color: '#3ECF8E', emoji: '🗄️' },
  { id: 'deno', name: 'Deno', category: 'Developer', rating: 4.6, url: 'https://deno.com', desc: 'Modern runtime for JavaScript and TypeScript.', color: '#000000', emoji: '🦕' },
  { id: 'planetscale', name: 'PlanetScale', category: 'Developer', rating: 4.7, url: 'https://planetscale.com', desc: 'MySQL-compatible serverless database platform.', color: '#000000', emoji: '🪐' },
  { id: 'hulu', name: 'Hulu', category: 'Entertainment', rating: 4.5, url: 'https://hulu.com', desc: 'Stream TV shows, movies, and live TV.', color: '#1CE783', emoji: '📺' },
  { id: 'tidal', name: 'Tidal', category: 'Entertainment', rating: 4.4, url: 'https://tidal.com', desc: 'Hi-fi music streaming with lossless audio quality.', color: '#000000', emoji: '🎧' },
  { id: 'mixcloud', name: 'Mixcloud', category: 'Entertainment', rating: 4.4, url: 'https://mixcloud.com', desc: 'DJ mixes, radio shows, and podcasts online.', color: '#5000FF', emoji: '🎚️' },
  // 20+ more
  { id: 'framer', name: 'Framer', category: 'Design', rating: 4.8, url: 'https://framer.com', desc: 'Design and publish beautiful sites and prototypes.', color: '#0055FF', emoji: '🖌️' },
  { id: 'webflow', name: 'Webflow', category: 'Developer', rating: 4.7, url: 'https://webflow.com', desc: 'Build professional websites visually without code.', color: '#4353FF', emoji: '🌐' },
  { id: 'v0', name: 'v0 by Vercel', category: 'Developer', rating: 4.8, url: 'https://v0.dev', desc: 'AI-powered UI generation from text prompts.', color: '#000000', emoji: '⚡' },
  { id: 'bolt', name: 'Bolt.new', category: 'Developer', rating: 4.8, url: 'https://bolt.new', desc: 'Prompt, run, and deploy full-stack web apps with AI.', color: '#7C3AED', emoji: '⚡' },
  { id: 'lovable', name: 'Lovable', category: 'Developer', rating: 4.7, url: 'https://lovable.dev', desc: 'Build full-stack apps with AI in seconds.', color: '#FF4D6D', emoji: '❤️' },
  { id: 'cursor', name: 'Cursor', category: 'Developer', rating: 4.9, url: 'https://cursor.com', desc: 'The AI code editor built for pair programming.', color: '#000000', emoji: '🖱️' },
  { id: 'pika', name: 'Pika', category: 'Design', rating: 4.6, url: 'https://pika.art', desc: 'AI video generation from ideas and images.', color: '#FF6B6B', emoji: '🎬' },
  { id: 'suno', name: 'Suno AI', category: 'Entertainment', rating: 4.7, url: 'https://suno.com', desc: 'Create songs with AI from a text prompt.', color: '#6C63FF', emoji: '🎵' },
  { id: 'udio', name: 'Udio', category: 'Entertainment', rating: 4.6, url: 'https://udio.com', desc: 'Generate music with AI — vocals, instruments, genres.', color: '#FF6B35', emoji: '🎶' },
  { id: 'elevenlabs', name: 'ElevenLabs', category: 'Tools', rating: 4.8, url: 'https://elevenlabs.io', desc: 'Ultra-realistic AI voice generation and cloning.', color: '#000000', emoji: '🎙️' },
  { id: 'kling', name: 'Kling AI', category: 'Design', rating: 4.7, url: 'https://klingai.com', desc: 'AI video generation with realistic motion.', color: '#5B21B6', emoji: '🎥' },
  { id: 'heygen', name: 'HeyGen', category: 'Design', rating: 4.6, url: 'https://heygen.com', desc: 'Create AI avatar videos for marketing and training.', color: '#FF4500', emoji: '🧑‍💻' },
  { id: 'descript', name: 'Descript', category: 'Design', rating: 4.7, url: 'https://descript.com', desc: 'Record, edit, and transcribe audio and video easily.', color: '#6C19FF', emoji: '✂️' },
  { id: 'typeform', name: 'Typeform', category: 'Productivity', rating: 4.6, url: 'https://typeform.com', desc: 'Build beautiful forms and surveys that people love.', color: '#261F63', emoji: '📋' },
  { id: 'zapier', name: 'Zapier', category: 'Productivity', rating: 4.7, url: 'https://zapier.com', desc: 'Automate workflows between 7000+ apps.', color: '#FF4A00', emoji: '⚡' },
  { id: 'make', name: 'Make', category: 'Productivity', rating: 4.6, url: 'https://make.com', desc: 'Visual automation platform for complex workflows.', color: '#6366F1', emoji: '🔮' },
  { id: 'whimsical', name: 'Whimsical', category: 'Design', rating: 4.7, url: 'https://whimsical.com', desc: 'Flowcharts, wireframes, and mind maps in one place.', color: '#7C3AED', emoji: '🌸' },
  { id: 'luma', name: 'Luma AI', category: 'Design', rating: 4.7, url: 'https://lumalabs.ai', desc: 'Create stunning 3D models and video from photos.', color: '#000000', emoji: '🌐' },
  { id: 'gamma', name: 'Gamma', category: 'Productivity', rating: 4.7, url: 'https://gamma.app', desc: 'Create beautiful presentations with AI instantly.', color: '#FF6B6B', emoji: '🎯' },
  { id: 'beehiiv', name: 'Beehiiv', category: 'Productivity', rating: 4.6, url: 'https://beehiiv.com', desc: 'Newsletter platform built for growth and creators.', color: '#F97316', emoji: '🐝' },
  { id: 'cal', name: 'Cal.com', category: 'Productivity', rating: 4.7, url: 'https://cal.com', desc: 'Open-source scheduling infrastructure for everyone.', color: '#292929', emoji: '📆' },
  { id: 'resend', name: 'Resend', category: 'Developer', rating: 4.8, url: 'https://resend.com', desc: 'Email API for developers — send emails with ease.', color: '#000000', emoji: '📤' },
];

const CATEGORIES = ['All', 'Productivity', 'Communication', 'Social', 'Entertainment', 'Design', 'Developer', 'Finance', 'Education', 'Tools', 'AI'];

export default function NaslumAppStore() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [openApp, setOpenApp] = useState(null);

  const filtered = APPS.filter(a => {
    const matchCat = category === 'All' || a.category === category;
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/')}><NaslumLogo size="sm" showText={false} /></button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            <span c
