import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Loader2, MessageCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import NaslumLogo from '@/components/NaslumLogo';
import { toast } from 'sonner';

export default function NaslumMessages() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const targetUserId = params.get('u');
  const targetName = params.get('n') || 'User';
  const [user, setUser] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [conversations, setConversations] = useState([]); // [{ otherId, otherName, lastMsg, unread }]
  const [activeChat, setActiveChat] = useState(null); // { otherId, otherName }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      setMyProfile(profiles[0] || { display_name: u.full_name || u.email });
      await loadConversations(u);
      if (targetUserId) {
        setActiveChat({ otherId: targetUserId, otherName: targetName });
        await loadMessages(u, targetUserId);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!user) return;
    const unsubscribe = base44.entities.DirectMessage.subscribe(async (event) => {
      if (event.type === 'create') {
        const msg = event.data;
        if (msg.receiver_id === user.id || msg.sender_id === user.id) {
          await loadConversations(user);
          if (activeChat && (msg.sender_id === activeChat.otherId || msg.receiver_id === activeChat.otherId)) {
            setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
          }
        }
      }
    });
    return () => unsubscribe();
  }, [user, activeChat]);

  const loadConversations = async (u) => {
    const sent = await base44.entities.DirectMessage.filter({ sender_id: u.id }, '-created_date', 100);
    const received = await base44.entities.DirectMessage.filter({ receiver_id: u.id }, '-created_date', 100);
    const all = [...sent, ...received].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    // Group by the other participant
    const convMap = new Map();
    for (const m of all) {
      const otherId = m.sender_id === u.id ? m.receiver_id : m.sender_id;
      const otherName = m.sender_id === u.id ? m.receiver_name : m.sender_name;
      if (!convMap.has(otherId)) {
        convMap.set(otherId, { otherId, otherName, lastMsg: m, unread: 0 });
      }
      const conv = convMap.get(otherId);
      if (!m.is_read && m.receiver_id === u.id) conv.unread++;
    }
    setConversations(Array.from(convMap.values()));
  };

  const loadMessages = async (u, otherId) => {
    const sent = await base44.entities.DirectMessage.filter({ sender_id: u.id, receiver_id: otherId }, 'created_date', 200);
    const received = await base44.entities.DirectMessage.filter({ sender_id: otherId, receiver_id: u.id }, 'created_date', 200);
    const all = [...sent, ...received].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    setMessages(all);
    // Mark received as read
    const unread = received.filter(m => !m.is_read);
    for (const m of unread) {
      await base44.entities.DirectMessage.update(m.id, { is_read: true });
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const openChat = (conv) => {
    setActiveChat({ otherId: conv.otherId, otherName: conv.otherName });
    loadMessages(user, conv.otherId);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeChat) return;
    setSending(true);
    const content = input.trim();
    setInput('');
    await base44.entities.DirectMessage.create({
      sender_id: user.id,
      sender_name: myProfile?.display_name || user.full_name || user.email,
      receiver_id: activeChat.otherId,
      receiver_name: activeChat.otherName,
      content,
      is_read: false
    });
    // Notify the receiver
    await base44.entities.Notification.create({
      user_id: activeChat.otherId,
      title: 'New Message',
      message: `${myProfile?.display_name || user.full_name}: ${content.slice(0, 60)}${content.length > 60 ? '...' : ''}`,
      type: 'info', link: '/messages'
    });
    setSending(false);
    await loadConversations(user);
    await loadMessages(user, activeChat.otherId);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="bg-background/95 backdrop-blur-md border-b border-border flex items-center gap-4 px-4 py-3 flex-shrink-0">
        <button onClick={() => navigate('/')}><NaslumLogo size="sm" showText={false} /></button>
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <span className="font-heading font-bold text-lg">Messages</span>
        </div>
        <Button onClick={() => navigate('/friends')} variant="outline" size="sm" className="rounded-full gap-1.5 ml-auto">
          <Search className="w-4 h-4" /> New Chat
        </Button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversation list */}
        <aside className={`w-full md:w-80 border-r border-border flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="overflow-y-auto flex-1">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No conversations yet. <button onClick={() => navigate('/friends')} className="text-primary hover:underline">Find friends to message</button>
              </div>
            ) : (
              conversations.map((c) => (
                <button key={c.otherId} onClick={() => openChat(c)}
                  className={`w-full p-3 flex items-center gap-3 hover:bg-muted/50 border-b border-border/50 text-left transition-colors ${activeChat?.otherId === c.otherId ? 'bg-primary/5' : ''}`}>
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                    {(c.otherName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm truncate">{c.otherName || 'Unknown'}</p>
                      {c.unread > 0 && <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0">{c.unread}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.lastMsg?.content || ''}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Chat view */}
        <div className={`flex-1 flex flex-col ${activeChat ? 'flex' : 'hidden md:flex'}`}>
          {activeChat ? (
            <>
              <div className="px-4 py-3 border-b border-border flex items-center gap-3 flex-shrink-0">
                <button onClick={() => setActiveChat(null)} className="md:hidden"><ArrowLeft className="w-5 h-5" /></button>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {(activeChat.otherName || 'U').charAt(0).toUpperCase()}
                </div>
                <p className="font-heading font-semibold">{activeChat.otherName}</p>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((m) => {
                  const mine = m.sender_id === user.id;
                  return (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${mine ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted rounded-bl-md'}`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                        <p className={`text-[10px] mt-1 ${mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {new Date(m.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {mine && (m.is_read ? ' · Read' : ' · Sent')}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    Say hello to {activeChat.otherName}! 👋
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-border flex-shrink-0">
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2">
                  <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-full bg-muted border border-border text-sm outline-none focus:border-primary/50" />
                  <Button type="submit" disabled={!input.trim() || sending} size="icon" className="rounded-full h-10 w-10 flex-shrink-0">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Select a conversation or start a new one</p>
              <Button onClick={() => navigate('/friends')} variant="outline" size="sm" className="mt-4 rounded-full">Find Friends</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
                                                            }
