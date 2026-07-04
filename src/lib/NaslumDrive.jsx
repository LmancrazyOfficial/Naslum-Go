import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Upload, Folder, File, Image, Video, Music, FileText,
  Trash2, Download, Search, Grid, List, Plus, Loader2, MoreVertical, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import NaslumLogo from '@/components/NaslumLogo';
import { toast } from 'sonner';

function getFileIcon(type) {
  if (type?.startsWith('image/')) return Image;
  if (type?.startsWith('video/')) return Video;
  if (type?.startsWith('audio/')) return Music;
  if (type?.includes('pdf') || type?.includes('text') || type?.includes('document')) return FileText;
  return File;
}

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function NaslumDrive() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedFile, setSelectedFile] = useState(null);
  const [user, setUser] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      loadFiles(u.id);
    }).catch(() => setLoading(false));
  }, []);

  const loadFiles = async (userId) => {
    setLoading(true);
    const data = await base44.entities.NaslumUpload.filter({ user_id: userId });
    setFiles(data);
    setLoading(false);
  };

  const handleUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;
    setUploading(true);
    for (const file of selectedFiles) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'image';
      await base44.entities.NaslumUpload.create({
        user_id: user?.id,
        file_url,
        file_name: file.name,
        file_type: type,
        status: 'approved',
        is_public: false,
      });
      toast.success(`${file.name} uploaded`);
    }
    loadFiles(user?.id);
    setUploading(false);
  };

  const handleDelete = async (file) => {
    await base44.entities.NaslumUpload.delete(file.id);
    setFiles(prev => prev.filter(f => f.id !== file.id));
    if (selectedFile?.id === file.id) setSelectedFile(null);
    toast.success('File deleted');
  };

  const filteredFiles = files.filter(f =>
    !search || f.file_name?.toLowerCase().includes(search.toLowerCase())
  );

  const usedStorage = files.reduce((acc) => acc + 0.5, 0); // approximate
  const maxStorage = 15;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/')}><NaslumLogo size="sm" showText={false} /></button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Folder className="w-4 h-4 text-primary" />
            </div>
            <span className="font-heading font-bold text-lg">Naslum Drive</span>
          </div>
          <div className="flex-1 max-w-xs ml-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..."
              className="w-full pl-9 pr-4 py-2 rounded-full bg-muted border border-border text-sm outline-none focus:border-primary/50" />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-lg hover:bg-muted transition-colors">
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
            <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="rounded-full gap-1.5">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Upload
            </Button>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={handleUpload} />
            <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="rounded-full gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-6xl mx-auto w-full px-4 py-6 gap-6">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 hidden md:block">
          <div className="bg-card border border-border rounded-2xl p-4 mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Storage</p>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-1">
              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((usedStorage / maxStorage) * 100, 100)}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">{usedStorage.toFixed(1)} GB of {maxStorage} GB used</p>
          </div>
          <nav className="space-y-1">
            {[
              { label: 'My Files', icon: Folder, count: files.length },
              { label: 'Images', icon: Image, count: files.filter(f => f.file_type === 'image').length },
              { label: 'Videos', icon: Video, count: files.filter(f => f.file_type === 'video').length },
              { label: 'Audio', icon: Music, count: files.filter(f => f.file_type === 'audio').length },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button key={item.label} className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-muted transition-colors text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs py-0 px-1.5">{item.count}</Badge>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-border rounded-2xl"
              onClick={() => fileRef.current?.click()}>
              <Upload className="w-12 h-12 mb-3 opacity-30" />
              <p className="font-semibold mb-1">No files yet</p>
              <p className="text-sm">Click to upload your first file</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredFiles.map((file, i) => {
                const Icon = getFileIcon(file.file_type);
                return (
                  <motion.div key={file.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                    className="group relative bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/40 hover:shadow-md transition-all"
                    onClick={() => setSelectedFile(file)}>
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      {file.file_type === 'image' && file.file_url
                        ? <img src={file.file_url} alt={file.file_name} className="w-full h-full object-cover" />
                        : <Icon className="w-10 h-10 text-muted-foreground/50" />}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">{file.file_name || 'Untitled'}</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); handleDelete(file); }}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-xs text-muted-foreground">
                    <th className="text-left px-4 py-3 font-medium">Name</th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file, i) => {
                    const Icon = getFileIcon(file.file_type);
                    return (
                      <motion.tr key={file.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        className="border-b border-border/50 hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedFile(file)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <span className="truncate max-w-[200px]">{file.file_name || 'Untitled'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 capitalize text-muted-foreground">{file.file_type}</td>
                        <td className="px-4 py-3">
                          <Badge variant={file.is_public ? 'default' : 'secondary'} className="text-xs">
                            {file.is_public ? 'Public' : 'Private'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={e => { e.stopPropagation(); handleDelete(file); }}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* File preview modal */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedFile(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-card border border-border rounded-2xl max-w-2xl w-full overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <p className="font-semibold truncate">{selectedFile.file_name}</p>
                <div className="flex items-center gap-2">
                  <a href={selectedFile.file_url} download={selectedFile.file_name} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="rounded-full gap-1.5">
                      <Download className="w-3.5 h-3.5" /> Download
                    </Button>
                  </a>
                  <button onClick={() => setSelectedFile(null)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-4">
                {selectedFile.file_type === 'image' && <img src={selectedFile.file_url} alt="" className="w-full rounded-xl max-h-[60vh] object-contain" />}
                {selectedFile.file_type === 'video' && <video src={selectedFile.file_url} controls className="w-full rounded-xl max-h-[60vh]" />}
                {selectedFile.file_type === 'audio' && <audio src={selectedFile.file_url} controls className="w-full mt-2" />}
                {!['image', 'video', 'audio'].includes(selectedFile.file_type) && (
                  <div className="flex flex-col items-center py-8 text-muted-foreground">
                    <File className="w-16 h-16 mb-3 opacity-30" />
                    <p>Preview not available</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
    }
