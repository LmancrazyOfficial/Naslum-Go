import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { FileText, Plus, Save, Trash2, ArrowLeft, Loader2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NaslumLogo from '@/components/NaslumLogo';
import { toast } from 'sonner';

export default function NaslumDocs() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      loadDocs(u.id);
    }).catch(() => setLoading(false));
  }, []);

  const loadDocs = async (uid) => {
    setLoading(true);
    const data = await base44.entities.NaslumDoc.filter({ user_id: uid }, '-updated_date', 50);
    setDocs(data);
    setLoading(false);
  };

  const newDoc = () => {
    setSelected(null);
    setTitle('Untitled Document');
    setContent('');
  };

  const openDoc = (doc) => {
    setSelected(doc);
    setTitle(doc.title);
    setContent(doc.content || '');
  };

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    if (selected) {
      const updated = await base44.entities.NaslumDoc.update(selected.id, { title, content, updated_date: new Date().toISOString() });
      setDocs(prev => prev.map(d => d.id === selected.id ? { ...d, title, content } : d));
      toast.success('Document saved');
    } else {
      const doc = await base44.entities.NaslumDoc.create({ user_id: user.id, title, content });
      setDocs(prev => [doc, ...prev]);
      setSelected(doc);
      toast.success('Document created');
    }
    setSaving(false);
  };

  const deleteDoc = async (doc) => {
    if (!window.confirm('Delete this document?')) return;
    await base44.entities.NaslumDoc.delete(doc.id);
    setDocs(prev => prev.filter(d => d.id !== doc.id));
    if (selected?.id === doc.id) { setSelected(null); setTitle(''); setContent(''); }
    toast.success('Document deleted');
  };

  const exec = (cmd) => document.execCommand(cmd, false, null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/')} className="flex-shrink-0">
            <NaslumLogo size="sm" showText={false} />
          </button>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-lg">Naslum Docs</span>
          </div>
          {(selected || title) && (
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="flex-1 max-w-xs bg-transparent text-sm font-medium outline-none border-b border-transparent focus:border-primary/50 px-1"
              placeholder="Document title..."
            />
          )}
          <div className="ml-auto flex items-center gap-2">
            {(selected || content || title) && (<>
              <button onClick={() => setIsPublic(p => !p)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isPublic ? 'border-primary text-primary bg-primary/10' : 'border-muted-foreground text-muted-foreground'}`}>
                {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {isPublic ? 'Public' : 'Private'}
              </button>
              <Button onClick={save} disabled={saving} size="sm" className="rounded-full gap-2 bg-primary text-primary-foreground">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
              </Button>
            </>)}
            <Button onClick={newDoc} size="sm" variant="outline" className="rounded-full gap-2">
              <Plus className="w-3.5 h-3.5" /> New
            </Button>
            <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="rounded-full gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border flex-shrink-0 py-4 px-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">My Documents</p>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : docs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No documents yet</p>
              <button onClick={newDoc} className="text-xs text-primary hover:underline mt-1">Create one</button>
            </div>
          ) : (
            <div className="space-y-1">
              {docs.map(doc => (
                <div
                  key={doc.id}
                  className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${selected?.id === doc.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                  onClick={() => openDoc(doc)}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate flex-1">{doc.title}</span>
                  <button
                    onClick={e => { e.stopPropagation(); deleteDoc(doc); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Editor */}
        <main className="flex-1 flex flex-col">
          {(selected !== null || title) ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-1 px-6 py-2 border-b border-border bg-muted/30">
                {[
                  { icon: Bold, cmd: 'bold', title: 'Bold' },
                  { icon: Italic, cmd: 'italic', title: 'Italic' },
                  { icon: Underline, cmd: 'underline', title: 'Underline' },
                ].map(({ icon: Icon, cmd, title: t }) => (
                  <button key={cmd} onMouseDown={e => { e.preventDefault(); exec(cmd); }}
                    title={t} className="p-2 rounded hover:bg-muted transition-colors">
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
                <div className="w-px h-5 bg-border mx-1" />
                {[
                  { icon: AlignLeft, cmd: 'justifyLeft' },
                  { icon: AlignCenter, cmd: 'justifyCenter' },
                  { icon: AlignRight, cmd: 'justifyRight' },
                ].map(({ icon: Icon, cmd }) => (
                  <button key={cmd} onMouseDown={e => { e.preventDefault(); exec(cmd); }}
                    className="p-2 rounded hover:bg-muted transition-colors">
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
                <div className="w-px h-5 bg-border mx-1" />
                <button onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }}
                  className="p-2 rounded hover:bg-muted transition-colors">
                  <List className="w-4 h-4" />
                </button>
              </div>
              <div
                contentEditable
                suppressContentEditableWarning
                onInput={e => setContent(e.currentTarget.innerHTML)}
                dangerouslySetInnerHTML={{ __html: content }}
                className="flex-1 px-16 py-10 outline-none text-base leading-relaxed min-h-[600px] max-w-3xl mx-auto w-full"
                style={{ fontFamily: 'Georgia, serif' }}
                data-placeholder="Start typing your document..."
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <FileText className="w-20 h-20 text-muted-foreground/20 mx-auto mb-4" />
                <h2 className="font-heading font-bold text-2xl mb-2">Naslum Docs</h2>
                <p className="text-muted-foreground mb-6 max-w-sm">Create, edit, and organize your documents all in one place.</p>
                <Button onClick={newDoc} className="rounded-full bg-primary text-primary-foreground gap-2">
                  <Plus className="w-4 h-4" /> New Document
                </Button>
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
    }
