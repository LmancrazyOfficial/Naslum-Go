import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, Play, Eye, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import NaslumLogo from '@/components/NaslumLogo';
import SearchBar from '@/components/search/SearchBar';

export default function VideoSearch() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q') || '';
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [userVideos, setUserVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load approved public video uploads from Naslum users
  useEffect(() => {
    base44.entities.NaslumUpload.filter({ is_public: true, file_type: 'video', status: 'approved' }).then(uploads => {
      setUserVideos(uploads.map(u => ({ title: u.file_name, channel: 'Naslum User', url: u.file_url, platform: 'Naslum', isNaslum: true })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setVideos([]);
    base44.integrations.Core.InvokeLLM({
      prompt: `You are a video search engine. For the query "${query}", return 12 relevant video results from YouTube and other video platforms. Use real YouTube video URLs when possible (https://www.youtube.com/watch?v=...). Include realistic metadata.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          videos: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                channel: { type: "string" },
                url: { type: "string" },
                thumbnail: { type: "string" },
                duration: { type: "string" },
                views: { type: "string" },
                published: { type: "string" },
                platform: { type: "string" }
              }
            }
          }
        }
      }
    }).then(data => setVideos([...userVideos, ...(data.videos || [])]))
    .catch(() => setVideos(userVideos))
    .finally(() => setLoading(false));
  }, [query]);

  const handleSearch = (q) => {
    navigate(`/videos?q=${encodeURIComponent(q)}`);
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/')} className="flex-shrink-0">
            <NaslumLogo size="sm" showText={false} />
          </button>
          <div className="flex-1 max-w-2xl">
            <SearchBar query={query} onSearch={handleSearch} variant="compact" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 flex gap-6 text-sm border-t border-border/50">
          {[
            { label: 'All', path: `/search?q=${encodeURIComponent(query)}` },
            { label: 'Images', path: `/images?q=${encodeURIComponent(query)}` },
            { label: 'Videos', path: `/videos?q=${encodeURIComponent(query)}`, active: true },
            { label: 'Shopping', path: `/market` },
          ].map(tab => (
            <button key={tab.label} onClick={() => navigate(tab.path)}
              className={`py-2.5 border-b-2 font-medium transition-colors ${tab.active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Searching for videos...</p>
          </div>
        ) : videos.length === 0 && userVideos.length === 0 && !loading ? (
          <div className="text-center py-20">
            <Play className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No videos found for "{query}"</p>
          </div>
        ) : (
          <>
            {userVideos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">📹 Naslum User Videos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {userVideos.map((video, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-primary/20 rounded-xl overflow-hidden group">
                      <video src={video.url} controls className="w-full aspect-video object-cover" />
                      <div className="p-3">
                        <p className="text-sm font-medium truncate">{video.title}</p>
                        <p className="text-xs text-muted-foreground">{video.channel}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.filter(v => !v.isNaslum).map((video, i) => (
                <motion.a key={i} href={video.url} target="_blank" rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="group block">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-3">
                    {video.thumbnail && (
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { e.target.style.display = 'none'; }} />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                      </div>
                    </div>
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-xs font-medium">{video.duration}</div>
                    )}
                  </div>
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1.5">{video.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/70">{video.channel}</span>
                    {video.views && <><span>•</span><span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {video.views}</span></>}
                    {video.published && <span>{video.published}</span>}
                  </div>
                  {video.platform && <span className="inline-block mt-1.5 text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{video.platform}</span>}
                </motion.a>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
              }
