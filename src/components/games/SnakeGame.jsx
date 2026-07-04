import React, { useState, useEffect, useRef, useCallback } from 'react';

const GRID = 20;
const CELL = 18;

function randomFood(snake) {
  let f;
  do {
    f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snake.some(s => s.x === f.x && s.y === f.y));
  return f;
}

export default function SnakeGame({ onWin }) {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [dir, setDir] = useState({ x: 0, y: 0 });
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [best, setBest] = useState(() => Number(localStorage.getItem('naslum-snake-best') || 0));
  const dirRef = useRef(dir);
  const snakeRef = useRef(snake);

  useEffect(() => { dirRef.current = dir; }, [dir]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);

  const reset = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(randomFood([{ x: 10, y: 10 }]));
    setDir({ x: 0, y: 0 });
    setScore(0);
    setOver(false);
    setRunning(false);
  }, []);

  const handleKey = useCallback((e) => {
    const key = e.key.toLowerCase();
    const d = dirRef.current;
    let nd = null;
    if ((key === 'arrowup' || key === 'w') && d.y === 0) nd = { x: 0, y: -1 };
    else if ((key === 'arrowdown' || key === 's') && d.y === 0) nd = { x: 0, y: 1 };
    else if ((key === 'arrowleft' || key === 'a') && d.x === 0) nd = { x: -1, y: 0 };
    else if ((key === 'arrowright' || key === 'd') && d.x === 0) nd = { x: 1, y: 0 };
    if (nd) {
      e.preventDefault();
      setDir(nd);
      if (!running && !over) setRunning(true);
    }
    if (key === ' ' && over) reset();
  }, [running, over, reset]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const d = dirRef.current;
      if (d.x === 0 && d.y === 0) return;
      const s = snakeRef.current;
      const head = { x: s[0].x + d.x, y: s[0].y + d.y };
      if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || s.some(seg => seg.x === head.x && seg.y === head.y)) {
        setRunning(false);
        setOver(true);
        setBest(b => { const nb = Math.max(b, score); localStorage.setItem('naslum-snake-best', nb); return nb; });
        onWin?.(score);
        return;
      }
      const newSnake = [head, ...s];
      if (head.x === food.x && head.y === food.y) {
        setScore(sc => sc + 10);
        setFood(randomFood(newSnake));
      } else {
        newSnake.pop();
      }
      setSnake(newSnake);
    }, 120);
    return () => clearInterval(interval);
  }, [running, food, score, over, onWin]);

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
      <p className="text-xs text-muted-foreground">
        {over ? 'Press Space to restart' : !running ? 'Press arrow keys to start' : 'Use arrow keys or WASD'}
      </p>
      <div className="relative bg-muted/30 rounded-2xl p-2 border border-border">
        <svg width={GRID * CELL} height={GRID * CELL} className="rounded-lg">
          <rect x={food.x * CELL} y={food.y * CELL} width={CELL - 2} height={CELL - 2} rx={4} fill="hsl(var(--primary))" />
          {snake.map((seg, i) => (
            <rect key={i} x={seg.x * CELL} y={seg.y * CELL} width={CELL - 2} height={CELL - 2} rx={3}
              fill={i === 0 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.7)'} />
          ))}
        </svg>
        {over && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3">
            <p className="font-heading font-bold text-2xl text-red-500">Game Over!</p>
            <p className="text-sm text-muted-foreground">Score: {score}</p>
            <button onClick={reset} className="px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">Restart</button>
          </div>
        )}
        {!running && !over && (
          <div className="absolute inset-0 bg-background/60 rounded-2xl flex items-center justify-center">
            <p className="text-sm text-muted-foreground font-medium">Press an arrow key to start</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 w-32">
        <div></div>
        <button onMouseDown={() => { setDir({ x: 0, y: -1 }); if (!running && !over) setRunning(true); }} className="p-2 rounded-xl bg-muted border border-border hover:border-primary/40">↑</button>
        <div></div>
        <button onMouseDown={() => { setDir({ x: -1, y: 0 }); if (!running && !over) setRunning(true); }} className="p-2 rounded-xl bg-muted border border-border hover:border-primary/40">←</button>
        <button onMouseDown={() => { setDir({ x: 0, y: 1 }); if (!running && !over) setRunning(true); }} className="p-2 rounded-xl bg-muted border border-border hover:border-primary/40">↓</button>
        <button onMouseDown={() => { setDir({ x: 1, y: 0 }); if (!running && !over) setRunning(true); }} className="p-2 rounded-xl bg-muted border border-border hover:border-primary/40">→</button>
      </div>
    </div>
  );
}
