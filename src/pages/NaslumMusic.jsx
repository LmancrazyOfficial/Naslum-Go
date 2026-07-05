import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Music, Upload, Play, Pause, SkipForward, SkipBack, Volume2, Loader2, ArrowLeft, Trash2, CheckCircle, XCircle, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NaslumLogo from '@/components/NaslumLogo';
import { toast } from 'sonner';

export default function NaslumMusic() {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [makePrivate, setMakePrivate] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [user, setUser] = useState(null);
  const audioRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      loadTracks();
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const loadTracks = async () => {
    setLoading(true);
    const data = await base44.entities.NaslumTrack.filter({ status: 'approved' }, '-created_date', 50);
    setTracks(data);
    setLoading(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) return toast.error('Please upload an audio file');
    if (file.size > 50 * 1024 * 1024) return toast.error('File must be under 50MB');

    setUploading(true);
    toast.info('Uploading and moderating your track...');

    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    // AI moderation
    const mod = await base44.integrations.Core.InvokeLLM({
      prompt: `A user uploaded an audio file named "${file.name}". Based solely on the filename and metadata, determine if this appears to be appropriate content for a public music platform. Respond with approved or rejected and a brief reason.`,
      response_json_schema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['approved', 'rejected'] },
          reason: { type: 'string' }
        }
      }
    });

    const track = await base44.entities.NaslumTrack.create({
      title: file.name.replace(/\.[^/.]+$/, ''),
      file_url,
      uploader_id: user?.id,
      uploader_name: user?.full_name || 'Anonymous',
      status: makePrivate ? 'private' : mod.status,
      moderation_reason: mod.reason,
      file_size: file.size,
    });

    if (mod.status === 'approved') {
      setTracks(prev => [track, ...prev]);
      toast.success('Track uploaded and approved!');
    } else {
      toast.error(`Track rejected: ${mod.reason}`);
    }
    setUploading(false);
  };

  const playTrack = (track) => {
    if (currentTrack?.id === track.id) {
      if (playing) { audioRef.current?.pause(); setPlaying(false); }
      else { audioRef.current?.play(); setPlaying(true); }
      return;
    }
    setCurrentTrack(track);
    setPlaying(true);
    setProgress(0);
  };

  const deleteTrack = async (track) => {
    if (!window.confirm('Delete this track?')) return;
    await base44.entities.NaslumTrack.delete(track.id);
    setTracks(prev => prev.filter(t => t.id !== track.id));
    if (currentTrack?.id === track.id) { setCurrentTrack(null); setPlaying(false); }
    toast.success('Track deleted');
  };

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.file_url;
      audioRef.current.play().catch(() => {});
    }
  }, [currentTrack]);

  const nextTrack = () => {
    if (!currentTrack) return;
    const idx = tracks.findIndex(t => t.id === currentTrack.id);
    if (idx < tracks.length - 1) playTrack(tracks[idx + 1]);
  };

  const prevTrack = () => {
    if (!currentTrack) return;
    const idx = tracks.findIndex(t => t.id === currentTrack.id);
    if (idx > 0) playTrack(tracks[idx - 1]);
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/')}><NaslumLogo size="sm" showText={false} /></button>
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-lg">Naslum Music</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={handleUpload} />
            <button onClick={() => setMakePrivate(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${makePrivate ? 'border-muted-foreground text-muted-foreground' : 'border-primary text-primary bg-primary/10'}`}>
              {makePrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
              {makePrivate ? 'Private' : 'Public'}
            </button>
            <Button onClick={() => fileRef.current?.click()} disabled={uploading} size="sm" className="rounded-full gap-2 bg-primary text-primary-foreground">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Upload
            </Button>
            <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="rounded-full gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-20">
            <Music className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="font-heading font-bold text-xl mb-2">No tracks yet</h3>
            <p className="text-muted-foreground mb-6">Upload your first track to get started!</p>
            <Button onClick={() => fileRef.current?.click()} className="rounded-full gap-2 bg-primary text-primary-foreground">
              <Upload className="w-4 h-4" /> Upload Track
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {tracks.map((track, idx) => {
              const isPlaying = currentTrack?.id === track.id && playing;
              const isOwner = user && track.uploader_id === user.id;
              return (
                <motion.div key={track.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group ${
                    currentTrack?.id === track.id ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-border/80 hover:bg-muted/50'
                  }`}
                  onClick={() => playTrack(track)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isPlaying ? 'bg-primary text-primary-foreground' : 'bg-muted group-hover:bg-primary/10'
                  }`}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{track.title}</p>
                    <p className="text-xs text-muted-foreground">{track.uploader_name}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{track.status}</Badge>
                  {isOwner && (
                    <button onClick={e => { e.stopPropagation(); deleteTrack(track); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Audio player */}
      {currentTrack && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border px-6 py-4">
          <audio
            ref={audioRef}
            onEnded={nextTrack}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={() => {
              if (audioRef.current) {
                setProgress((audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100);
              }
            }}
          />
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-1">
                <p className="font-medium text-sm truncate">{currentTrack.title}</p>
                <p className="text-xs text-muted-foreground">{currentTrack.uploader_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={prevTrack} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={() => playing ? audioRef.current?.pause() : audioRef.current?.play()}
                  className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                >
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button onClick={nextTrack} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <input type="range" min="0" max="1" step="0.01" value={volume}
                  onChange={e => setVolume(parseFloat(e.target.value))}
                  className="w-20 accent-primary" />
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
      }
