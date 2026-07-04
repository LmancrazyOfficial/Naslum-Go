import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, Search, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NaslumLogo from '@/components/NaslumLogo';
import SearchBar from '@/components/search/SearchBar';
import { Button } from '@/components/ui/button';

export default function ImageSearch() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q') || '';
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  // Load approved public image uploads from Naslum users
  useEffect(() => {
    base44.entities.NaslumUpload.filter({ is_public: true, file_type: 'image', status: 'approved' }).then(uploads => {
      const userImgs = uploads.map(u => ({ url: u.file_url, title: u.file_name, source: 'Naslum User', isUser: true }));
      setImages(prev => [...userImgs, ...prev.filter(i => !i.isUser)]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setImages([]);
    base44.integrations.Core.InvokeLLM({
      prompt: `You are an image search engine. For the query "${query}", return 20 realistic image results. Each should be a real Unsplash image URL that actually works and is relevant to the query. Use format: https://images.unsplash.com/photo-[id]?w=800&q=80. Return varied, high quality image results.`,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          images: {
            type: "array",
            items: {
              type: "object",
              properties: {
                url: { type: "string" },
                title: { type: "string" },
                source: { type: "string" }
              }
            }
          }
        }
      }
    }).then(async data => {
      const webImgs = data.images || [];
      const uploads = await base44.entities.NaslumUpload.filter({ is_public: true, file_type: 'image', status: 'approved' }).catch(() => []);
      const userImgs = uploads.map(u => ({ url: u.file_url, title: u.file_name, source: 'Naslum User', isUser: true }));
      setImages([...userImgs, ...webImgs]);
    }).finally(() => setLoading(false));
  }, [query]);

  const handleSearch = (q) => {
    navigate(`/images?q=${encodeURIComponent(q)}`);
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
        {/* Search type tabs */}
        <div className="max-w-6xl mx-auto px-4 flex gap-6 text-sm border-t border-border/50">
          {[
            { label: 'All', path: `/search?q=${encodeURIComponent(query)}` },
            { label: 'Images', path: `/images?q=${encodeURIComponent(query)}`, active: true },
            { label: 'Videos', path: `/videos?q=${encodeURIComponent(query)}` },
            { label: 'Shopping', path: `/market` },
          ].map(tab => (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className={`py-2.5 border-b-2 font-medium transition-colors ${tab.active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Searching for images...</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 space-y-3">
            {images.map((img, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setPreview(img)}
                className="w-full break-inside-avoid rounded-xl overflow-hidden bg-muted group relative"
              >
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-auto object-cover group-hover:brightness-90 transition-all duration-200"
                  onError={(e) => { e.target.closest('button').style.display = 'none'; }}
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 flex items-end p-2">
                  <p className="text-white text-xs font-medium line-clamp-1">{img.title}</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </main>

      {/* Preview modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative max-w-3xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <img src={preview.url} alt={preview.title} className="w-full rounded-2xl shadow-2xl" />
              <div className="absolute top-3 right-3 flex gap-2">
                <a href={preview.url} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors">
                  <ExternalLink className="w-4 h-4 text-white" />
                </a>
                <button onClick={() => setPreview(null)}
                  className="w-9 h-9 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="mt-3 text-center">
                <p className="text-white font-medium">{preview.title}</p>
                <p className="text-white/60 text-sm">{preview.source}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
          }
