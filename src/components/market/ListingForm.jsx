import React, { useState, useRef } from 'react';
import { X, Upload, Plus, Loader2, DollarSign, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Vehicles', 'Art', 'Music', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Parts Only'];

export default function ListingForm({ user, onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', price: '', category: 'Other', condition: 'Good', location: '', currency: 'USD', accepts_card: false });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const urls = await Promise.all(files.map(f => base44.integrations.Core.UploadFile({ file: f }).then(r => r.file_url)));
    setImages(prev => [...prev, ...urls].slice(0, 6));
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.category) { setError('Title, price, and category are required.'); return; }
    setSaving(true);
    await base44.entities.Listing.create({
      ...form,
      price: parseFloat(form.price),
      images,
      seller_id: user?.id,
      seller_name: user?.full_name || user?.email || 'Anonymous',
      is_available: true,
    });
    onCreated();
  };

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading font-bold text-lg">Create Listing</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><X className="w-4 h-4" /></Button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {/* Images */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Photos</label>
            <div className="grid grid-cols-4 gap-2">
              {images.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {images.length < 6 && (
                <button onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-muted/50 flex flex-col items-center justify-center gap-1 transition-colors">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <><Plus className="w-5 h-5 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">Add</span></>}
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Title *</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="What are you selling?" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary/50" />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe your item..." rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary/50 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Price *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                  placeholder="0.00" min="0" step="0.01"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary/50" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Condition</label>
              <select value={form.condition} onChange={e => set('condition', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary/50">
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Category *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary/50">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Location</label>
            <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
              placeholder="City, State" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary/50" />
          </div>

          {/* Accept card payment */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
            <CreditCard className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Accept Card Payments</p>
              <p className="text-xs text-muted-foreground">Allow buyers to pay with a credit card</p>
            </div>
            <button
              onClick={() => set('accepts_card', !form.accepts_card)}
              className={`w-10 h-6 rounded-full transition-colors relative ${form.accepts_card ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.accepts_card ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-full">Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving} className="rounded-full bg-primary text-primary-foreground gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? 'Publishing...' : 'Publish Listing'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
                  }
