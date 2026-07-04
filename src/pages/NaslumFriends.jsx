import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, UserPlus, Check, X, MessageCircle, Loader2, Users, UserCheck, UserCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import NaslumLogo from '@/components/NaslumLogo';
import { toast } from 'sonner';

export default function NaslumFriends() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [friendships, setFriendships] = useState([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('discover'); // discover, friends, requests
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      await loadProfile(u);
      await loadFriendships(u);
      await loadProfiles();
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const loadProfile = async (u) => {
    const existing = await base44.entities.UserProfile.filter({ user_id: u.id });
    if (existing[0]) {
      setMyProfile(existing[0]);
    } else {
      const created = await base44.entities.UserProfile.create({
        user_id: u.id, display_name: u.full_name || u.email, bio: '', avatar_url: '', interests: []
      });
      setMyProfile(created);
    }
  };

  const loadFriendships = async (u) => {
    const sent = await base44.entities.Friendship.filter({ requester_id: u.id });
    const received = await base44.entities.Friendship.filter({ addressee_id: u.id });
    setFriendships([...sent, ...received]);
  };

  const loadProfiles = async () => {
    const all = await base44.entities.UserProfile.list('-created_date', 100);
    setProfiles(all);
  };

  const isFriend = (otherId) => friendships.some(f =>
    ((f.requester_id === user.id && f.addressee_id === otherId) ||
     (f.addressee_id === user.id && f.requester_id === otherId)) &&
    f.status === 'accepted'
  );
  const hasPending = (otherId) => friendships.some(f =>
    ((f.requester_id === user.id && f.addressee_id === otherId) ||
     (f.addressee_id === user.id && f.requester_id === otherId)) &&
    f.status === 'pending'
  );
  const incomingRequest = (otherId) => friendships.find(f =>
    f.requester_id === otherId && f.addressee_id === user.id && f.status === 'pending'
  );

  const sendRequest = async (profile) => {
    if (!user) return;
    await base44.entities.Friendship.create({
      requester_id: user.id, requester_name: myProfile?.display_name || user.full_name || user.email,
      addressee_id: profile.user_id, addressee_name: profile.display_name, status: 'pending'
    });
    // Create a notification for the addressee
    await base44.entities.Notification.create({
      user_id: profile.user_id, title: 'New Friend Request',
      message: `${myProfile?.display_name || user.full_name} wants to connect with you!`,
      type: 'info', link: '/friends'
    });
    await loadFriendships(user);
    toast.success(`Friend request sent to ${profile.display_name}`);
  };

  const acceptRequest = async (friendship) => {
    await base44.entities.Friendship.update(friendship.id, { status: 'accepted' });
    await base44.entities.Notification.create({
      user_id: friendship.requester_id, title: 'Friend Request Accepted',
      message: `${myProfile?.display_name || user.full_name} accepted your request!`,
      type: 'success', link: '/messages'
    });
    await loadFriendships(user);
    toast.success('Friend request accepted!');
  };

  const declineRequest = async (friendship) => {
    await base44.entities.Friendship.update(friendship.id, { status: 'declined' });
    await loadFriendships(user);
    toast.success('Request declined');
  };

  const startDM = (profile) => {
    navigate(`/messages?u=${profile.user_id}&n=${encodeURIComponent(profile.display_name)}`);
  };

  const friendIds = new Set(friendships.filter(f => f.status === 'accepted').flatMap(f => [f.requester_id, f.addressee_id]));
  const myFriends = profiles.filter(p => p.user_id !== user?.id && friendIds.has(p.user_id));
  const pendingRequests = friendships.filter(f => f.addressee_id === user?.id && f.status === 'pending');
  const discoverable = profiles.filter(p =>
    p.user_id !== user?.id && !friendIds.has(p.user_id) &&
    (!search || (p.display_name || '').toLowerCase().includes(search.toLowerCase()) ||
     (p.bio || '').toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/')}><NaslumLogo size="sm" showText={false} /></button>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-lg">Friends</span>
          </div>
          <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="rounded-full gap-1.5 ml-auto">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <div className="flex gap-2 mb-4">
          {[
            { key: 'discover', label: 'Discover', icon: Search },
            { key: 'friends', label: `My Friends (${myFriends.length})`, icon: UserCheck },
            { key: 'requests', label: `Requests (${pendingRequests.length})`, icon: Clock },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 pb-8">
        {tab === 'discover' && (
          <>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search people by name or bio..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-primary/50" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {discoverable.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> :
                      <UserCircle className="w-10 h-10 text-primary" />}
                  </div>
                  <p className="font-heading font-semibold text-sm">{p.display_name}</p>
                  {p.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.bio}</p>}
                  {hasPending(p.user_id) ? (
                    <span className="mt-3 text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Request sent</span>
                  ) : (
                    <Button onClick={() => sendRequest(p)} size="sm" variant="outline" className="mt-3 rounded-full gap-1.5">
                      <UserPlus className="w-3.5 h-3.5" /> Add Friend
                    </Button>
                  )}
                </motion.div>
              ))}
              {discoverable.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
                  {search ? 'No profiles match your search.' : 'No new people to discover. Invite friends to join Naslum Go!'}
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'friends' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {myFriends.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                  {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> :
                    <UserCircle className="w-10 h-10 text-green-500" />}
                </div>
                <p className="font-heading font-semibold text-sm">{p.display_name}</p>
                {p.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.bio}</p>}
                <Button onClick={() => startDM(p)} size="sm" className="mt-3 rounded-full gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" /> Message
                </Button>
              </motion.div>
            ))}
            {myFriends.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
                No friends yet. Head to **Discover** to find people to connect with!
              </div>
            )}
          </div>
        )}

        {tab === 'requests' && (
          <div className="space-y-3">
            {pendingRequests.map((f) => (
              <motion.div key={f.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <UserCircle className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-sm">{f.requester_name}</p>
                  <p className="text-xs text-muted-foreground">wants to connect with you</p>
                </div>
                <Button onClick={() => acceptRequest(f)} size="sm" className="rounded-full gap-1.5">
                  <Check className="w-4 h-4" /> Accept
                </Button>
                <Button onClick={() => declineRequest(f)} size="sm" variant="outline" className="rounded-full gap-1.5">
                  <X className="w-4 h-4" /> Decline
                </Button>
              </motion.div>
            ))}
            {pendingRequests.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No pending friend requests. 🎉
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
                                                        }
