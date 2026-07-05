import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Plus, Trash2, ArrowLeft, Loader2, Check, X, Share2, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NaslumLogo from '@/components/NaslumLogo';
import { toast } from 'sonner';

export default function NaslumPolls() {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [user, setUser] = useState(null);
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''], isPrivate: false });
  const [saving, setSaving] = useState(false);
  const [votes, setVotes] = useState({}); // pollId -> optionIdx

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      loadPolls();
    }).catch(() => setLoading(false));
  }, []);

  const loadPolls = async () => {
    setLoading(true);
    const data = await base44.entities.NaslumPoll.list('-created_date', 50);
    setPolls(data);
    setLoading(false);
  };

  const addOption = () => setNewPoll(p => ({ ...p, options: [...p.options, ''] }));
  const removeOption = (idx) => setNewPoll(p => ({ ...p, options: p.options.filter((_, i) => i !== idx) }));
  const updateOption = (idx, val) => setNewPoll(p => ({ ...p, options: p.options.map((o, i) => i === idx ? val : o) }));

  const createPoll = async () => {
    if (!newPoll.question.trim()) return toast.error('Add a question');
    const validOptions = newPoll.options.filter(o => o.trim());
    if (validOptions.length < 2) return toast.error('Add at least 2 options');
    setSaving(true);
    const poll = await base44.entities.NaslumPoll.create({
      question: newPoll.question,
      options: validOptions.map(o => ({ text: o, votes: 0 })),
      creator_id: user?.id,
      is_active: !newPoll.isPrivate,
      total_votes: 0,
    });
    setPolls(prev => [poll, ...prev]);
    setCreating(false);
    setNewPoll({ question: '', options: ['', ''] });
    toast.success('Poll created!');
    setSaving(false);
  };

  const vote = async (poll, optionIdx) => {
    if (votes[poll.id] !== undefined) return toast.info('You already voted on this poll');
    const updatedOptions = poll.options.map((o, i) => i === optionIdx ? { ...o, votes: (o.votes || 0) + 1 } : o);
    const totalVotes = (poll.total_votes || 0) + 1;
    await base44.entities.NaslumPoll.update(poll.id, { options: updatedOptions, total_votes: totalVotes });
    setPolls(prev => prev.map(p => p.id === poll.id ? { ...p, options: updatedOptions, total_votes: totalVotes } : p));
    setVotes(prev => ({ ...prev, [poll.id]: optionIdx }));
    toast.success('Vote recorded!');
  };

  const deletePoll = async (poll) => {
    if (!window.confirm('Delete this poll?')) return;
    await base44.entities.NaslumPoll.delete(poll.id);
    setPolls(prev => prev.filter(p => p.id !== poll.id));
    toast.success('Poll deleted');
  };

  const sharePoll = (poll) => {
    navigator.clipboard.writeText(`${window.location.origin}/polls?id=${poll.id}`);
    toast.success('Poll link copied!');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/')}><NaslumLogo size="sm" showText={false} /></button>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-lg">Naslum Polls</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button onClick={() => setCreating(true)} size="sm" className="rounded-full gap-2 bg-primary text-primary-foreground">
              <Plus className="w-3.5 h-3.5" /> Create Poll
            </Button>
            <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="rounded-full gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Create poll modal */}
        <AnimatePresence>
          {creating && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-6 bg-card border border-border rounded-2xl shadow-lg">
              <h2 className="font-heading font-bold text-lg mb-4">Create a Poll</h2>
              <input
                value={newPoll.question}
                onChange={e => setNewPoll(p => ({ ...p, question: e.target.value }))}
                placeholder="Ask a question..."
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none mb-4 font-medium"
              />
              <div className="space-y-2 mb-4">
                {newPoll.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      value={opt}
                      onChange={e => updateOption(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 bg-muted rounded-lg px-4 py-2.5 text-sm outline-none"
                    />
                    {newPoll.options.length > 2 && (
                      <button onClick={() => removeOption(idx)} className="p-1.5 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button onClick={addOption} variant="outline" size="sm" className="rounded-full gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add Option
                </Button>
                <button onClick={() => setNewPoll(p => ({ ...p, isPrivate: !p.isPrivate }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${newPoll.isPrivate ? 'border-muted-foreground bg-muted text-muted-foreground' : 'border-primary text-primary bg-primary/10'}`}>
                  {newPoll.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                  {newPoll.isPrivate ? 'Private' : 'Public'}
                </button>
                <div className="ml-auto flex gap-2">
                  <Button onClick={() => setCreating(false)} variant="ghost" size="sm" className="rounded-full">Cancel</Button>
                  <Button onClick={createPoll} disabled={saving} size="sm" className="rounded-full bg-primary text-primary-foreground gap-2">
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Create
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : polls.length === 0 ? (
          <div className="text-center py-20">
            <BarChart2 className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="font-heading font-bold text-xl mb-2">No polls yet</h3>
            <p className="text-muted-foreground mb-6">Be the first to create a poll!</p>
            <Button onClick={() => setCreating(true)} className="rounded-full bg-primary text-primary-foreground gap-2">
              <Plus className="w-4 h-4" /> Create Poll
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {polls.map((poll, pi) => {
              const hasVoted = votes[poll.id] !== undefined;
              const totalVotes = poll.total_votes || 0;
              const isOwner = user && poll.creator_id === user.id;
              return (
                <motion.div key={poll.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-heading font-semibold text-lg flex-1 pr-4">{poll.question}</h3>
                    <div className="flex items-center gap-1">
                      <button onClick={() => sharePoll(poll)} className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground">
                        <Share2 className="w-4 h-4" />
                      </button>
                      {isOwner && (
                        <button onClick={() => deletePoll(poll)} className="p-1.5 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {poll.options?.map((option, idx) => {
                      const pct = totalVotes > 0 ? Math.round(((option.votes || 0) / totalVotes) * 100) : 0;
                      const isMyVote = votes[poll.id] === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => !hasVoted && vote(poll, idx)}
                          disabled={hasVoted}
                          className={`w-full relative text-left rounded-xl border overflow-hidden transition-all ${
                            hasVoted ? 'cursor-default' : 'hover:border-primary/50 hover:bg-primary/5'
                          } ${isMyVote ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`}
                        >
                          {hasVoted && (
                            <div className="absolute inset-0 rounded-xl overflow-hidden">
                              <div className="h-full bg-primary/10 transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          )}
                          <div className="relative flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-2">
                              {isMyVote && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                              <span className="text-sm font-medium">{option.text}</span>
                            </div>
                            {hasVoted && (
                              <span className="text-sm font-bold text-primary">{pct}%</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
                    {hasVoted && <Badge variant="secondary" className="text-xs">Voted</Badge>}
                    {poll.is_active && <Badge className="text-xs bg-green-100 text-green-700">Active</Badge>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
      }
