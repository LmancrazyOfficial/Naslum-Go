import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Plus, Search, Filter, Star, MapPin,
  Tag, ArrowLeft, X, Loader2, Upload, Heart,
  Eye, DollarSign, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NaslumLogo from '@/components/NaslumLogo';
import ListingForm from '@/components/market/ListingForm';
import ListingDetail from '@/components/market/ListingDetail';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Vehicles', 'Art', 'Music', 'Other'];

export default function NaslumMarket() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [user, setUser] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    const data = await base44.entities.Listing.filter({ is_available: true }, '-created_date', 60);
    setListings(data);
    setLoading(false);
  };

  const filtered = listings.filter(l => {
    const matchSearch = !search ||
      l.title?.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || l.category === category;
    return matchSearch && matchCat;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
    return 0;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/')} className="flex-shrink-0">
            <NaslumLogo size="sm" showText={false} />
          </button>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-lg">Naslum Market</span>
          </div>
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search listings..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full bg-muted text-sm outline-none"
              />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-sm bg-muted border-none rounded-lg px-3 py-1.5 outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <Button onClick={() => setShowForm(true)} className="rounded-full bg-primary text-primary-foreground gap-2">
              <Plus className="w-4 h-4" /> Sell
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-6 overflow-x-auto pb-1">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                category === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
          <span>{filtered.length} listings</span>
          {category !== 'All' && <Badge variant="secondary">{category}</Badge>}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <h3 className="font-heading font-bold text-lg mb-2">No listings yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Be the first to list something!</p>
            <Button onClick={() => setShowForm(true)} className="rounded-full bg-primary text-primary-foreground gap-2">
              <Plus className="w-4 h-4" /> Create listing
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} onClick={() => setSelected(listing)} />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ListingForm user={user} onClose={() => setShowForm(false)} onCreated={() => { setShowForm(false); loadListings(); }} />
      )}
      {selected && (
        <ListingDetail listing={selected} user={user} onClose={() => setSelected(null)} onDeleted={() => { setSelected(null); loadListings(); }} />
      )}
    </div>
  );
}

function ListingCard({ listing, index, onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className="text-left group"
    >
      <div className="aspect-square rounded-2xl bg-muted overflow-hidden mb-3 relative">
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur-sm">
            {listing.condition || 'New'}
          </Badge>
        </div>
      </div>
      <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">{listing.title}</h3>
      <p className="text-primary font-bold text-base mt-0.5">
        ${Number(listing.price).toFixed(2)}
        <span className="text-xs text-muted-foreground font-normal ml-1">{listing.currency || 'USD'}</span>
      </p>
      <div className="flex items-center gap-1 mt-1">
        <MapPin className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground truncate">{listing.location || 'Naslum Market'}</span>
      </div>
    </motion.button>
  );
              }
