import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox, Send, Star, Trash2, PenSquare, Search,
  Loader2, Mail, RefreshCw, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NaslumLogo from '@/components/NaslumLogo';
import ComposeModal from '@/components/mail/ComposeModal';
import MailItem from '@/components/mail/MailItem';
import MailView from '@/components/mail/MailView';

const FOLDER_LIST = [
{ key: 'inbox', label: 'Inbox', icon: Inbox },
{ key: 'sent', label: 'Sent', icon: Send },
{ key: 'starred', label: 'Starred', icon: Star },
{ key: 'trash', label: 'Trash', icon: Trash2 },
];

export default function NaslumMail() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [folder, setFolder] = useState('inbox');
  const [mails, setMails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [composing, setComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) loadMails();
  }, [user, folder]);

  const loadMails = async () => {
    setLoading(true);
    setSelected(null);
    let filter = {};
    if (folder === 'inbox') filter = { to_user_id: user.id, is_deleted: false, folder: 'inbox' };
    else if (folder === 'sent') filter = { from_user_id: user.id, folder: 'sent' };
    else if (folder === 'starred') filter = { to_user_id: user.id, is_starred: true, is_deleted: false };
    else if (folder === 'trash') filter = { to_user_id: user.id, is_deleted: true };

    const data = await base44.entities.Mail.filter(filter, '-created_date', 50);
    setMails(data);
    setLoading(false);
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadMails();
    setRefreshing(false);
  };

  const handleMarkRead = async (mail) => {
    await base44.entities.Mail.update(mail.id, { is_read: true });
    setMails(prev => prev.map(m => m.id === mail.id ? { ...m, is_read: true } : m));
  };

  const handleStar = async (mail, e) => {
    e.stopPropagation();
    const val = !mail.is_starred;
    await base44.entities.Mail.update(mail.id, { is_starred: val });
    setMails(prev => prev.map(m => m.id === mail.id ? { ...m, is_starred: val } : m));
  };

  const handleDelete = async (mail) => {
    await base44.entities.Mail.update(mail.id, { is_deleted: true });
    setMails(prev => prev.filter(m => m.id !== mail.id));
    setSelected(null);
  };

  const unread = mails.filter(m => !m.is_read).length;

  const filtered = mails.filter(m =>
    !searchQuery ||
    m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.from_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.body?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center gap-4 px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <button onClick={() => navigate('/')} className="flex-shrink-0">
          <NaslumLogo size="sm" showText={false} />
        </button>
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          <span className="font-heading font-bold text-lg">Naslum Mail</span>
        </div>
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search mail..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full bg-muted text-sm outline-none focus:ring-2 ring-primary/30"
            />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={refresh} className="rounded-full">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setComposing(true)} className="rounded-full bg-primary text-primary-foreground gap-2">
            <PenSquare className="w-4 h-4" /> Compose
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 border-r border-border bg-card p-3 flex flex-col gap-1">
          {FOLDER_LIST.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFolder(key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full text-left ${
                folder === key ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {key === 'inbox' && unread > 0 && (
                <Badge className="ml-auto bg-primary-foreground text-primary text-xs px-1.5 py-0">{unread}</Badge>
              )}
            </button>
          ))}
          <div className="mt-auto pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground px-3">{user?.email}</p>
            <p className="text-xs text-primary font-medium px-3 mt-0.5">Naslum Mail</p>
          </div>
        </aside>

        {/* Mail list */}
        <div className="w-80 flex-shrink-0 border-r border-border flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="font-heading font-semibold capitalize">{folder}</h2>
            <span className="text-xs text-muted-foreground">{filtered.length} messages</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                <Mail className="w-10 h-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No messages</p>
              </div>
            ) : (
              filtered.map(mail => (
                <MailItem
                  key={mail.id}
                  mail={mail}
                  isSelected={selected?.id === mail.id}
                  onClick={() => { setSelected(mail); handleMarkRead(mail); }}
                  onStar={handleStar}
                />
              ))
            )}
          </div>
        </div>

        {/* Mail view */}
        <div className="flex-1 overflow-hidden">
          {selected ? (
            <MailView
              mail={selected}
              onDelete={() => handleDelete(selected)}
              onClose={() => setSelected(null)}
              onReply={() => setComposing({ replyTo: selected })}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Mail className="w-16 h-16 text-muted-foreground/20 mb-4" />
              <p className="font-heading font-semibold text-lg text-muted-foreground">Select a message</p>
              <p className="text-sm text-muted-foreground/60">Choose a message from the list to read it</p>
            </div>
          )}
        </div>
      </div>

      {composing && (
        <ComposeModal
          user={user}
          replyTo={composing.replyTo}
          onClose={() => setComposing(false)}
          onSent={() => { setComposing(false); if (folder === 'sent') loadMails(); }}
        />
      )}
    </div>
  );
    }
