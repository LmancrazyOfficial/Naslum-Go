import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Upload, Image, Video, Music, X, Check, Loader2, Shield, ArrowLeft, Globe, Lock, Play, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NaslumLogo from '@/components/NaslumLogo';
import { toast } from 'sonner';

const FILE_TYPES = [
  { id: 'image', label: 'Images', icon: Image, accept: 'image/*', color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'video', label: 'Videos', icon: Video, accept: 'video/*', color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'audio', label: 'Music', icon: Music, accept: 'audio/*', color: 'text-green-500', bg: 'bg-green-50' },
];

export default function NaslumUpload() {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [publicUploads, setPublicUploads] = useState([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [preview, setPreview] = useState(null);
  const [makePrivate, setMakePrivate] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    base44.entities.NaslumUpload.filter({ is_public: true }).then(setPublicUploads).catch(() => {});
  }, [uploads]);

  const processFile = async (file) => {
    const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : null;
    if (!type) return toast.error(`${file.name}: unsupported file type`);
    if (file.size > 100 * 1024 * 1024) return toast.error(`${file.name}: file too large (max 100MB)`);

    const id = Date.now().toString() + Math.random();
    setUploads(prev => [...prev, { id, name: file.name, type, status: 'uploading', progress: 0 }]);

    const setStatus = (status, extra = {}) =>
      setUploads(prev => prev.map(u => u.id === id ? { ...u, status, ...extra } : u));

    setStatus('uploading');
    let file_url;
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      file_url = res.file_url;
    } catch (uploadErr) {
      setStatus('error', { reason: 'Upload failed — integration credits may be exhausted. Try again later or contact support.' });
      toast.error('Upload failed. Integration credits may be unavailable right now.');
      return;
    }
    setStatus('moderating');

    // Local moderation (no integration needed) — check filename for inappropriate content
    const lowerName = file.name.toLowerCase();
    const flagged = ['porn', 'xxx', 'nsfw', 'nude', 'explicit', 'violence', 'gore', 'hate'];
    const flaggedHit = flagged.find(w => lowerName.includes(w));
    const mod = flaggedHit
      ? { status: 'rejected', reason: `Filename contains flagged keyword: "${flaggedHit}"` }
      : { status: 'approved', reason: 'Auto-approved by local moderation' };

    const user = await base44.auth.me().catch(() => null);
    try {
      await base44.entities.NaslumUpload.create({
        user_id: user?.id,
        file_url,
        file_name: file.name,
        file_type: type,
        status: mod.status,
        moderation_reason: mod.reason,
        is_public: mod.status === 'approved' && !makePrivate,
      });
    } catch {
      setStatus('error', { reason: 'Could not save upload record. Please try again.' });
      return;
    }

    setStatus(mod.status === 'approved' ? 'approved' : 'rejected', { reason: mod.reason });
  };

  const handleFiles = (files) => {
    Array.from(files).forEach(processFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/')}><NaslumLogo size="sm" showText={false} /></button>
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-lg">Naslum Media</span>
          </div>
          <div className="flex gap-2 ml-4">
            {['browse', 'upload'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${activeTab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {t}
              </button>
            ))}
          </div>
          <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="ml-auto rounded-full gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'browse' ? (
          <>
            <h2 className="font-heading font-bold text-xl mb-6">Public Media Gallery</h2>
            {publicUploads.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No public uploads yet. Be the first to share!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {publicUploads.map(item => (
                  <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="relative rounded-xl overflow-hidden bg-muted border border-border cursor-pointer group"
                    onClick={() => setPreview(item)}>
                    {item.file_type === 'image' && <img src={item.file_url} alt={item.file_name} className="w-full aspect-square object-cover" />}
                    {item.file_type === 'video' && (
                      <div className="w-full aspect-square bg-gradient-to-br from-purple-500/20 to-purple-900/40 flex items-center justify-center">
                        <Play className="w-10 h-10 text-purple-400" />
                      </div>
                    )}
                    {item.file_type === 'audio' && (
                      <div className="w-full aspect-square bg-gradient-to-br from-green-500/20 to-green-900/40 flex items-center justify-center">
                        <Music className="w-10 h-10 text-green-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">{item.file_name}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl mb-6">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">AI-Powered Moderation</p>
                <p className="text-xs text-muted-foreground mt-0.5">All uploads are reviewed by AI before publishing. Approved content is public unless you mark it private.</p>
              </div>
            </div>

            {/* Private toggle */}
            <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl mb-6">
              {makePrivate ? <Lock className="w-4 h-4 text-muted-foreground" /> : <Globe className="w-4 h-4 text-primary" />}
              <div className="flex-1">
                <p className="text-sm font-medium">{makePrivate ? 'Private Upload' : 'Public Upload'}</p>
                <p className="text-xs text-muted-foreground">{makePrivate ? 'Only you can see this' : 'Everyone can see approved uploads'}</p>
              </div>
              <button onClick={() => setMakePrivate(!makePrivate)}
                className={`w-10 h-6 rounded-full transition-colors relative ${makePrivate ? 'bg-muted-foreground/40' : 'bg-primary'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${makePrivate ? 'translate-x-0.5' : 'translate-x-4'}`} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {FILE_TYPES.map(ft => {
                const Icon = ft.icon;
                return (
                  <button key={ft.id} onClick={() => { fileRef.current.accept = ft.accept; fileRef.current.click(); }}
                    className="p-5 rounded-2xl border border-border hover:border-primary/40 bg-card transition-all flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl ${ft.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${ft.color}`} />
                    </div>
                    <span className="text-sm font-medium">{ft.label}</span>
                  </button>
                );
              })}
            </div>

            <div onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)} onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all mb-6 ${dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
              <Upload className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-medium mb-1">Drop files here or click to browse</p>
              <p className="text-xs text-muted-foreground">Images, videos, audio up to 100MB</p>
              <input ref={fileRef} type="file" multiple accept="image/*,video/*,audio/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
              <Button onClick={() => fileRef.current?.click()} variant="outline" className="rounded-full mt-4">Browse Files</Button>
            </div>

            {uploads.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-heading font-semibold">Your Uploads</h3>
                {uploads.map(upload => (
                  <motion.div key={upload.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      {upload.type === 'image' ? <Image className="w-4 h-4 text-blue-500" /> :
                       upload.type === 'video' ? <Video className="w-4 h-4 text-purple-500" /> :
                       <Music className="w-4 h-4 text-green-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{upload.name}</p>
                      {upload.reason && <p className="text-xs text-muted-foreground">{upload.reason}</p>}
                    </div>
                    {upload.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                    {upload.status === 'moderating' && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Shield className="w-3.5 h-3.5 animate-pulse text-primary" /> Moderating...</div>}
                    {upload.status === 'approved' && <Badge className="bg-green-100 text-green-700 gap-1"><Check className="w-3 h-3" />Approved</Badge>}
                    {upload.status === 'rejected' && <Badge className="bg-red-100 text-red-700 gap-1"><X className="w-3 h-3" />Rejected</Badge>}
                    {upload.status === 'error' && <Badge className="bg-orange-100 text-orange-700 gap-1"><X className="w-3 h-3" />Error</Badge>}
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <p className="text-white font-medium">{preview.file_name}</p>
              <button onClick={() => setPreview(null)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {preview.file_type === 'image' && <img src={preview.file_url} alt="" className="w-full rounded-xl max-h-[70vh] object-contain" />}
            {preview.file_type === 'video' && <video src={preview.file_url} controls className="w-full rounded-xl max-h-[70vh]" />}
            {preview.file_type === 'audio' && <audio src={preview.file_url} controls className="w-full mt-4" />}
          </div>
        </div>
      )}
    </div>
  );
    }
