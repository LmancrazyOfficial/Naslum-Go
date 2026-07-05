import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gamepad2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NaslumLogo from '@/components/NaslumLogo';
import TicTacToe from '@/components/games/TicTacToe';
import Game2048 from '@/components/games/Game2048';
import MemoryMatch from '@/components/games/MemoryMatch';
import SnakeGame from '@/components/games/SnakeGame';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const GAMES = [
  { id: 'tictactoe', name: 'Tic-Tac-Toe', icon: '⭕', desc: 'Challenge the unbeatable AI', color: 'bg-blue-500/10 text-blue-500' },
  { id: '2048', name: '2048', icon: '🔢', desc: 'Combine tiles to reach 2048', color: 'bg-yellow-500/10 text-yellow-600' },
  { id: 'memory', name: 'Memory Match', icon: '🧠', desc: 'Test your memory with emoji pairs', color: 'bg-purple-500/10 text-purple-500' },
  { id: 'snake', name: 'Snake', icon: '🐍', desc: 'The classic arcade game', color: 'bg-green-500/10 text-green-600' },
];

export default function NaslumGames() {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);
  const [scores, setScores] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.GameScore.list('-score', 20).then(setScores).catch(() => {});
    }).catch(() => {});
  }, []);

  const recordScore = async (game, score) => {
    if (!user) return;
    try {
      await base44.entities.GameScore.create({ user_id: user.id, user_name: user.full_name || 'Anonymous', game, score });
      base44.entities.GameScore.list('-score', 20).then(setScores);
    } catch {}
  };

  const ActiveGame = active === 'tictactoe' ? (props) => <TicTacToe onWin={() => recordScore('tictactoe', 1)} /> :
                     active === '2048' ? (props) => <Game2048 onWin={(s) => { recordScore('2048', s); toast.success('You reached 2048! 🎉'); }} /> :
                     active === 'memory' ? (props) => <MemoryMatch onWin={(m) => { recordScore('memory', Math.max(100 - m * 5, 0)); }} /> :
                     active === 'snake' ? (props) => <SnakeGame onWin={(s) => recordScore('snake', s)} /> : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/')}><NaslumLogo size="sm" showText={false} /></button>
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-lg">Naslum Games</span>
          </div>
          <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="ml-auto rounded-full gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!active ? (
          <>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8">
              <h2 className="font-heading font-bold text-3xl mb-2">Play Games 🎮</h2>
              <p className="text-muted-foreground">Real games — no downloads, play instantly in your browser</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {GAMES.map((g, i) => (
                <motion.button key={g.id} onClick={() => setActive(g.id)}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all text-left">
                  <div className={`w-14 h-14 rounded-2xl ${g.color} flex items-center justify-center text-3xl mb-4`}>{g.icon}</div>
                  <h3 className="font-heading font-bold text-lg mb-1 group-hover:text-primary transition-colors">{g.name}</h3>
                  <p className="text-sm text-muted-foreground">{g.desc}</p>
                </motion.button>
              ))}
            </div>

            {/* Leaderboard */}
            {scores.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-heading font-bold text-lg">Leaderboard</h3>
                </div>
                <div className="space-y-2">
                  {scores.slice(0, 10).map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-600' : i === 1 ? 'bg-gray-400/20 text-gray-500' : i === 2 ? 'bg-orange-500/20 text-orange-600' : 'bg-muted text-muted-foreground'}`}>{i + 1}</span>
                      <span className="flex-1 text-sm font-medium">{s.user_name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{s.game}</span>
                      <span className="font-mono font-bold text-primary">{s.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setActive(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" /> All Games
                </button>
              </div>
              <h2 className="font-heading font-bold text-2xl text-center mb-8">{GAMES.find(g => g.id === active)?.name}</h2>
              <div className="flex justify-center">
                <ActiveGame />
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
                                                  }
