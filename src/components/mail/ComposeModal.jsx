import React, { useState } from 'react';
import { X, Send, Minus, Maximize2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function ComposeModal({ user, replyTo, onClose, onSent }) {
  const [to, setTo] = useState(replyTo?.from_email || '');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setSending(true);
    setError('');

    // Find recipient user by email
    let toUserId = null;
    try {
      const users = await base44.entities.User.list();
      const match = users.find(u => u.email === to.trim());
      toUserId = match?.id || null;
    } catch {}

    // Save sent copy
    await base44.entities.Mail.create({
      from_user_id: user.id,
      from_name: user.full_name || user.email,
      from_email: user.email,
      to_email: to.trim(),
      to_user_id: toUserId,
      subject: subject.trim(),
      body: body.trim(),
      folder: 'sent',
      is_read: true,
    });

    // Deliver to recipient inbox if they exist in the system
    if (toUserId) {
      await base44.entities.Mail.create({
        from_user_id: user.id,
        from_name: user.full_name || user.email,
        from_email: user.email,
        to_user_id: toUserId,
        to_email: to.trim(),
        subject: subject.trim(),
        body: body.trim(),
        folder: 'inbox',
        is_read: false,
      });
    }

    // Also send real email notification
    try {
      await base44.integrations.Core.SendEmail({
        to: to.trim(),
        subject: `[Naslum Mail] ${subject.trim()}`,
        body: `You have a new message from ${user.full_name || user.email} via Naslum Mail:\n\n${body.trim()}`,
        from_name: 'Naslum Mail',
      });
    } catch {}

    setSent(true);
    setSending(false);
    setTimeout(onSent, 1200);
  };

  if (minimized) {
    return (
      <motion.div
        initial={{ y: 100 }} animate={{ y: 0 }}
        className="fixed bottom-0 right-6 z-50 w-72 bg-card border border-border rounded-t-xl shadow-2xl"
      >
        <div className="flex items-center justify-between px-4 py-2.5 bg-primary text-primary-foreground rounded-t-xl cursor-pointer" onClick={() => setMinimized(false)}>
          <span className="text-sm font-medium truncate">{subject || 'New Message'}</span>
          <div className="flex gap-1">
            <button><Maximize2 className="w-3.5 h-3.5" /></button>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }}><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 60 }}
      className="fixed bottom-6 right-6 z-50 w-[520px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      style={{ maxHeight: '600px' }}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
        <span className="font-medium text-sm">New Message</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setMinimized(true)}><Minus className="w-4 h-4" /></button>
          <button onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Fields */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <input
          type="email"
          placeholder="To"
          value={to}
          onChange={e => setTo(e.target.value)}
          className="px-4 py-2.5 border-b border-border text-sm bg-transparent outline-none"
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="px-4 py-2.5 border-b border-border text-sm bg-transparent outline-none font-medium"
        />
        <textarea
          placeholder="Write your message..."
          value={body}
          onChange={e => setBody(e.target.value)}
          className="flex-1 px-4 py-3 text-sm bg-transparent outline-none resize-none min-h-[200px]"
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between">
        {error && <p className="text-xs text-destructive">{error}</p>}
        {sent && <p className="text-xs text-green-600 font-medium">✓ Message sent!</p>}
        {!error && !sent && <span />}
        <Button
          onClick={handleSend}
          disabled={sending || sent}
          className="rounded-full bg-primary text-primary-foreground gap-2 ml-auto"
          size="sm"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          {sent ? 'Sent!' : sending ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </motion.div>
  );
        }
