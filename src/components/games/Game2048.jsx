import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const SIZE = 4;

function initGrid() {
  const grid = Array(SIZE).fill(0).map(() => Array(SIZE).fill(0));
  addRandom(grid);
  addRandom(grid);
  return grid;
}

function addRandom(grid) {
  const empty = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (grid[r][c] === 0) empty.push([r, c]);
  if (empty.length === 0) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function slide(row) {
  const filtered = row.filter(v => v !== 0);
  const merged = [];
  let gained = 0;
  for (let i = 0; i < filtered.length; i++) {
    if (filtered[i] === filtered[i + 1]) {
      merged.push(filtered[i] * 2);
      gained += filtered[i] * 2;
      i++;
    } else {
      merged.push(filtered[i]);
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return { row: merged, gained };
}

function rotate(grid) {
  const n = grid.length;
  const result = Array(n).fill(0).map(() => Array(n).fill(0));
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      result[c][n - 1 - r] = grid[r][c];
  return result;
}

function move(grid, dir) {
  let g = grid.map(r => [...r]);
  for (let i = 0; i < dir; i++) g = rotate(g);
  let gained = 0;
  g = g.map(row => { const res = slide(row); gained += res.gained; return res.row; });
  for (let i = 0; i < (4 - dir) % 4; i++) g = rotate(g);
  return { grid: g, gained };
}

function isEqual(a, b) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (a[r][c] !== b[r][c]) return false;
  return true;
}

function canMove(grid) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return true;
      if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return true;
      if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return true;
    }
  return false;
}

const TILE_COLORS = {
  0: 'bg-muted/30', 2: 'bg-yellow-100 text-yellow-800', 4: 'bg-yellow-200 text-yellow-900',
  8: 'bg-orange-200 text-orange-900', 16: 'bg-orange-300 text-orange-900',
  32: 'bg-red-300 text-red-900', 64: 'bg-red-400 text-white',
  128: 'bg-purple-300 text-purple-900', 256: 'bg-purple-400 text-white',
  512: 'bg-indigo-400 text-white', 1024: 'bg-indigo-500 text-white',
  2048: 'bg-primary text-primary-foreground',
};

export default function Game2048({ onWin }) {
  const [grid, setGrid] = useState(initGrid);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('naslum-2048-best') || 0));
  const [over, setOver] = useState(false);

  const handleKey = useCallback((e) => {
    if (over) return;
    const dirs = { ArrowLeft: 0, ArrowUp: 1, ArrowRight: 2, ArrowDown: 3, a: 0, w: 1, d: 2, s: 3 };
    const dir = dirs[e.key];
    if (dir === undefined) return;
    e.preventDefault();
    setGrid(prev => {
      const { grid: newGrid, gained } = move(prev, dir);
      if (isEqual(prev, newGrid)) return prev;
      addRandom(newGrid);
      setScore(s => {
        const ns = s + gained;
        if (ns > best) { setBest(ns); localStorage.setItem('naslum-2048-best', ns); }
        return ns;
      });
      if (newGrid.some(row => row.includes(2048))) onWin?.(score + gained);
      if (!canMove(newGrid)) setOver(true);
      return newGrid;
    });
  }, [over, score, best, onWin]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const reset = () => {
    setGrid(initGrid());
    setScore(0);
    setOver(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4">
        <div className="px-4 py-2 rounded-xl bg-card border border-border text-center">
          <p className="text-xs text-muted-foreground">Score</p>
          <p className="font-heading font-bold text-xl">{score}</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-center">
          <p className="text-xs text-muted-foreground">Best</p>
          <p className="font-heading font-bold text-xl text-primary">{best}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Use arrow keys or WASD to play</p>
      <div className="relative">
        <div className="grid grid-cols-4 gap-2 p-3 bg-muted/50 rounded-2xl">
          {grid.flat().map((val, i) => (
            <div key={i} className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl transition-all ${TILE_COLORS[val] || 'bg-primary text-white'}`}>
              {val !== 0 && val}
            </div>
          ))}
        </div>
        {over && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3">
            <p className="font-heading font-bold text-2xl text-red-500">Game Over!</p>
            <p className="text-sm text-muted-foreground">Score: {score}</p>
            <button onClick={reset} className="px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">Try Again</button>
          </div>
        )}
      </div>
      <button onClick={reset} className="px-6 py-2 rounded-full bg-muted text-sm font-medium hover:bg-muted/80">New Game</button>
    </div>
  );
    }
