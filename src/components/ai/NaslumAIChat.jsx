import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Code, Image, MessageSquare, Loader2, Copy, Check, X, Search, Music, Video, Calculator, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { naslumAIRespond } from '@/lib/naslumAI';

const MODE_CONFIG = {
  chat: { icon: MessageSquare, label: 'Chat', placeholder: 'Ask Naslum AI anything...' },
  code: { icon: Code, label: 'Code', placeholder: 'Describe the code you need...' },
  research: { icon: Search, label: 'Research', placeholder: 'What would you like researched?' },
  math: { icon: Calculator, label: 'Math', placeholder: 'Enter a math problem...' },
  music: { icon: Music, label: 'Music', placeholder: 'Describe music, lyrics, or theory...' },
  video: { icon: Video, label: 'Video', placeholder: 'Ask about videos or get a script...' },
};

export default function NaslumAIChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Simulate thinking for UX, then respond locally
    await new Promise(r => setTimeout(r, 300 + Math.random() * 400));

    let response;
    if (mode === 'image') {
      response = `🎨 **Image generation** requires integration credits which are currently unavailable. Once credits are available, I can generate images from your descriptions!\n\nIn the meantime, you can upload images via the **Upload** page or search for images on the **Images** tab.`;
    } else if (mode === 'math') {
      response = naslumAIRespond(input, messages);
    } else if (mode === 'code') {
      response = `## Code Help 💻\n\nI'm Naslum AI — a local assistant built into Naslum Go. For detailed code generation, I can provide guidance and examples for common patterns:\n\n${naslumAIRespond(input, messages)}\n\n---\n*For complex code generation, try the Naslum Go search bar to find documentation and tutorials.*`;
    } else if (mode === 'research') {
      response = `## Research 📚\n\nI'm a local assistant, so for in-depth research I recommend using the **Naslum Go search bar** — it provides AI-powered web results.\n\n${naslumAIRespond(input, messages)}`;
    } else {
      response = naslumAIRespond(input, messages);
    }

    setMessages(prev => [...prev, { role: 'ai', content: response }]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-3xl h-[80vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg">Naslum AI</h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> Built from scratch • Always online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {Object.entries(MODE_CONFIG).map(([key, cfg]) => (
                <Button key={key} variant={mode === key ? 'default' : 'ghost'} size="sm"
                  onClick={() => setMode(key)}
                  className={`rounded-full text-xs gap-1 px-2.5 h-7 ${mode === key ? 'bg-primary text-primary-foreground' : ''}`}>
                  <cfg.icon className="w-3 h-3" /> {cfg.label}
                </Button>
              ))}
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full ml-2">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2">Welcome to Naslum AI</h3>
                <p className="text-muted-foreground text-sm max-w-md mb-6">
                  I'm a local assistant built from scratch — no external services needed. I can help with platform guidance, math, and more.
                </p>
                <div className="grid grid-cols-2 gap-2 max-w-sm">
                  {['How do I use Stocks?', 'What games are available?', 'Calculate 15 * 23 + 100', 'How do I customize my page?'].map(q => (
                    <button key={q} onClick={() => setInput(q)}
                      className="text-left px-3 py-2 rounded-xl border border-border bg-muted/50 hover:border-primary/40 hover:bg-primary/5 text-xs transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3'
                  : 'bg-muted rounded-2xl rounded-bl-md px-4 py-3'}`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <div className="relative group">
                      <div className="naslum-code">
                        <ReactMarkdown className="text-sm prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                          components={{
                            code: ({ inline, className, children, ...props }) => {
                              if (!inline) return <pre className="bg-background rounded-lg p-3 overflow-x-auto my-2 text-xs"><code className={className} {...props}>{children}</code></pre>;
                              return <code className="px-1 py-0.5 rounded bg-background/50 text-xs" {...props}>{children}</code>;
                            },
                            p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                          }}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      <button onClick={() => handleCopy(msg.content, idx)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-background/80">
                        {copiedIdx === idx ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-border">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-3">
              <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
                placeholder={MODE_CONFIG[mode].placeholder} disabled={isLoading}
                className="flex-1 bg-muted rounded-full px-5 py-3 text-sm outline-none border border-transparent focus:border-primary/30 transition-colors" />
              <Button type="submit" disabled={!input.trim() || isLoading} size="icon"
                className="rounded-full bg-primary hover:bg-primary/90 h-11 w-11 flex-shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
        }
