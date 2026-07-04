import React, { useState } from 'react';
import { X, MapPin, Tag, User, ChevronLeft, ChevronRight, Heart, MessageCircle, Trash2, CreditCard, Check, Loader2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ListingDetail({ listing, user, onClose, onDeleted }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showBuyConfirm, setShowBuyConfirm] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [message, setMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [buyRequested, setBuyRequested] = useState(false);

  const images = listing.images?.length ? listing.images : [];
  const isOwner = user && listing.created_by_id === user.id;

  const handleDelete = async () => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    setDeleting(true);
    await base44.entities.Listing.delete(listing.id);
    toast.success('Listing deleted successfully');
    setDeleting(false);
    onDeleted?.();
    onClose();
  };

  const handleContact = async () => {
    if (!message.trim()) return;
    setSendingMsg(true);
    const sellerId = listing.seller_id || listing.created_by_id;

    // Send mail to seller
    await base44.entities.Mail.create({
      from_user_id: user?.id,
      from_name: user?.full_name || 'Naslum User',
      from_email: user?.email || '',
      to_user_id: sellerId,
      to_email: '',
      subject: `Inquiry about "${listing.title}" on Naslum Market`,
      body: `${message}\n\n— Sent via Naslum Market`,
      folder: 'inbox',
    });

    // Notify the seller
    await base44.entities.Notification.create({
      user_id: sellerId,
      title: 'New message about your listing',
      message: `${user?.full_name || 'Someone'} sent a message about "${listing.title}": "${message.substring(0, 80)}..."`,
      type: 'info',
    });

    toast.success('Message sent to seller!');
    setSendingMsg(false);
    setShowContact(false);
    setMessage('');
  };

  const handleBuyRequest = async () => {
    if (!user) return;
    const sellerId = listing.seller_id || listing.created_by_id;

    // Notify the seller with accept/reject info in the notification
    await base44.entities.Notification.create({
      user_id: sellerId,
      title: `Purchase request for "${listing.title}"`,
      message: `${user?.full_name || 'A buyer'} wants to buy "${listing.title}" for $${Number(listing.price).toFixed(2)}. Check your mail to accept or decline.`,
      type: 'info',
    });

    // Send a mail to seller with action instructions
    await base44.entities.Mail.create({
      from_user_id: user?.id,
      from_name: user?.full_name || 'Naslum Buyer',
      from_email: user?.email || '',
      to_user_id: sellerId,
      to_email: '',
      subject: `Purchase Request: "${listing.title}"`,
      body: `Hi,\n\n${user?.full_name || 'A buyer'} (${user?.email}) has requested to purchase your listing:\n\n📦 Item: ${listing.title}\n💰 Price: $${Number(listing.price).toFixed(2)}\n\nReply to this message to ACCEPT or DECLINE this purchase request.\n\n— Naslum Market`,
      folder: 'inbox',
    });

    setBuyRequested(true);
    setShowBuyConfirm(false);
    toast.success('Purchase request sent! The seller has been notified and will respond via mail.');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative md:w-80 bg-muted flex-shrink-0 aspect-square md:aspect-auto">
          {images.length > 0 ? (
            <>
              <img src={images[imgIdx]} alt={listing.title} className="w-full h-full object-cover" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(p => (p - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                  <button onClick={() => setImgIdx(p => (p + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`} />)}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tag className="w-16 h-16 text-muted-foreground/20" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">{listing.category}</Badge>
              <Badge variant="outline">{listing.condition}</Badge>
              {listing.accepts_card && <Badge className="bg-green-100 text-green-700 text-xs"><CreditCard className="w-3 h-3 mr-1 inline" />Cards OK</Badge>}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><X className="w-4 h-4" /></Button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <h2 className="font-heading font-bold text-xl mb-1">{listing.title}</h2>
            <p className="text-3xl font-bold text-primary mb-4">
              ${Number(listing.price).toFixed(2)}
              <span className="text-sm text-muted-foreground font-normal ml-2">{listing.currency}</span>
            </p>

            {listing.description && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Description</h4>
                <p className="text-sm leading-relaxed">{listing.description}</p>
              </div>
            )}

            <div className="space-y-2 text-sm mb-4">
              {listing.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{listing.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Sold by <span className="text-foreground font-medium">{listing.seller_name || 'Naslum Seller'}</span></span>
              </div>
              {listing.created_date && (
                <p className="text-xs text-muted-foreground">
                  Listed {format(new Date(listing.created_date), 'MMM d, yyyy')}
                </p>
              )}
            </div>

            {buyRequested && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400 flex items-center gap-2 mb-3">
                <Check className="w-4 h-4" />
                Purchase request sent! The seller will respond via mail.
              </div>
            )}

            {/* Contact form */}
            {showContact && (
              <div className="p-4 bg-muted rounded-xl mb-3">
                <h4 className="text-sm font-semibold mb-2">Message the seller</h4>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Hi, I'm interested in this item..."
                  className="w-full bg-background rounded-lg p-3 text-sm outline-none border border-border resize-none h-24" />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => setShowContact(false)} className="rounded-full">Cancel</Button>
                  <Button size="sm" onClick={handleContact} disabled={sendingMsg || !message.trim()} className="rounded-full">
                    {sendingMsg ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Send'}
                  </Button>
                </div>
              </div>
            )}

            {/* Buy confirm */}
            {showBuyConfirm && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mb-3">
                <h4 className="text-sm font-semibold mb-1">Confirm Purchase Request</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  The seller will be notified and can accept or decline your request via mail. You will receive their response in your inbox.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowBuyConfirm(false)} className="rounded-full">Cancel</Button>
                  <Button size="sm" onClick={handleBuyRequest} className="rounded-full gap-1">
                    <ShoppingCart className="w-3 h-3" /> Send Request
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-border flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="icon" onClick={() => setLiked(p => !p)} className="rounded-full flex-shrink-0">
              <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>

            {isOwner ? (
              <Button variant="destructive" className="rounded-full gap-2 flex-1" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Listing
              </Button>
            ) : (
              <>
                <Button variant="outline" className="rounded-full gap-2 flex-1"
                  onClick={() => { setShowContact(v => !v); setShowBuyConfirm(false); }}>
                  <MessageCircle className="w-4 h-4" /> Contact
                </Button>
                <Button className="rounded-full flex-1 font-semibold gap-2"
                  disabled={buyRequested}
                  onClick={() => { setShowBuyConfirm(v => !v); setShowContact(false); }}>
                  {listing.accepts_card ? <CreditCard className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                  {buyRequested ? 'Requested' : 'Buy Now'}
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
      }
