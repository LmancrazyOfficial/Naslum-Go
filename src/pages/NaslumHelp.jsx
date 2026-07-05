import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Send, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NaslumLogo from '@/components/NaslumLogo';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { naslumAIRespond, QUICK_QUESTIONS } from '@/lib/naslumAI';

export default function NaslumHelp() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = async (text) => {
    const content = text || input;
    if (!content.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', content }]);
    setInput('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
    const response = naslumAIRespond(content, messages);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/')}><NaslumLogo size="sm" showText={false} /></button>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-lg">Naslum Help</span>
          </div>
          <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="ml-auto rounded-full gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-6 gap-4">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-heading font-bold text-xl mb-2">Naslum Go Helper</h2>
            <p className="text-sm text-muted-foreground mb-6 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Powered by Naslum AI — built from scratch, always online
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => handleSend(q)}
                  className="text-left px-4 py-3 rounded-xl border border-border bg-muted/50 hover:border-primary/40 hover:bg-primary/5 text-sm transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto min-h-0 max-h-[55vh]">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted rounded-bl-md'
              }`}>
                {msg.role === 'user'
                  ? <p>{msg.content}</p>
                  : <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{msg.content}</ReactMarkdown>
                }
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Naslum AI is thinking…</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-3">
          <input value={input} onChange={e => setInput(e.target.value)}
            placeholder="Ask how to do anything on Naslum Go…"
            disabled={loading}
            className="flex-1 bg-muted rounded-full px-5 py-3 text-sm outline-none border border-transparent focus:border-primary/30 transition-colors disabled:opacity-50" />
          <Button type="submit" disabled={!input.trim() || loading} size="icon" className="rounded-full h-11 w-11 flex-shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </main>
    </div>
  );
          }
