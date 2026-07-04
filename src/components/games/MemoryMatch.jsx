import React, { useState, useEffect } from 'react';

const EMOJIS = ['🔥', '⭐', '🚀', '💎', '🎯', '👑', '🌊', '🎨'];
const SIZE = 8; // 4x4 grid = 8 pairs

function shuffle() {
  const cards = [...EMOJIS, ...EMOJIS];
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards.map((emoji, idx) => ({ id: idx, emoji, flipped: false, matched: false }));
}

export default function MemoryMatch({ onWin }) {
  const [cards, setCards] = useState(shuffle);
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [best, setBest] = useState(() => Number(localStorage.getItem('naslum-memory-best') || 0));

  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;
      setMoves(m => m + 1);
      if (cards[a].emoji === cards[b].emoji) {
        setCards(prev => prev.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)));
        setFlipped([]);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c)));
          setFlipped([]);
        }, 800);
      }
    }
  }, [flipped, cards]);

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched) && !won) {
      setWon(true);
      onWin?.(moves);
      if (best === 0 || moves < best) {
        setBest(moves);
        localStorage.setItem('naslum-memory-best', moves);
      }
    }
  }, [cards, won, moves, best, onWin]);

  const handleClick = (idx) => {
    if (flipped.length === 2 || cards[idx].flipped || cards[idx].matched) return;
    setCards(prev => prev.map((c, i) => (i === idx ? { ...c, flipped: true } : c)));
    setFlipped([...flipped, idx]);
  };

  const reset = () => {
    setCards(shuffle());
    setFlipped([]);
    setMoves(0);
    setWon(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4">
        <div className="px-4 py-2 rounded-xl bg-card border border-border text-center">
          <p className="text-xs text-muted-foreground">Moves</p>
          <p className="font-heading font-bold text-xl">{moves}</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-center">
          <p className="text-xs text-muted-foreground">Best</p>
          <p className="font-heading font-bold text-xl text-primary">{best || '—'}</p>
        </div>
      </div>
      <div className="relative">
        <div className="grid grid-cols-4 gap-3">
          {cards.map((card, idx) => (
            <button key={card.id} onClick={() => handleClick(idx)}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 ${
                card.matched ? 'bg-green-500/20 border-2 border-green-500/40' :
                card.flipped ? 'bg-card border-2 border-primary' : 'bg-muted border-2 border-border hover:border-primary/40'
              }`}>
              {card.flipped || card.matched ? card.emoji : '❓'}
            </button>
          ))}
        </div>
        {won && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3">
            <p className="font-heading font-bold text-2xl text-green-500">You Win! 🎉</p>
            <p className="text-sm text-muted-foreground">Completed in {moves} moves</p>
            <button onClick={reset} className="px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">Play Again</button>
          </div>
        )}
      </div>
      <button onClick={reset} className="px-6 py-2 rounded-full bg-muted text-sm font-medium hover:bg-muted/80">New Game</button>
    </div>
  );
                }
