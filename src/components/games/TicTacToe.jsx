import React, { useState, useEffect } from 'react';

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

// Minimax AI for unbeatable tic-tac-toe
function minimax(board, isAI) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a] === 'O' ? { score: 10 } : { score: -10 };
  }
  if (board.every(c => c)) return { score: 0 };
  const moves = [];
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const newBoard = [...board];
      newBoard[i] = isAI ? 'O' : 'X';
      const result = minimax(newBoard, !isAI);
      moves.push({ index: i, score: result.score });
    }
  }
  let best = isAI ? { score: -Infinity } : { score: Infinity };
  for (const m of moves) {
    if (isAI ? m.score > best.score : m.score < best.score) best = m;
  }
  return best;
}

function checkWinner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every(c => c)) return 'draw';
  return null;
}

export default function TicTacToe({ onWin }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [status, setStatus] = useState('Your turn (X)');
  const [scores, setScores] = useState({ wins: 0, losses: 0, draws: 0 });

  const winner = checkWinner(board);

  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const timer = setTimeout(() => {
        const best = minimax(board, true);
        if (best.index !== undefined) {
          const newBoard = [...board];
          newBoard[best.index] = 'O';
          setBoard(newBoard);
          setIsPlayerTurn(true);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, board, winner]);

  useEffect(() => {
    if (winner === 'X') {
      setStatus('You win! 🎉');
      setScores(s => ({ ...s, wins: s.wins + 1 }));
      onWin?.(1);
    } else if (winner === 'O') {
      setStatus('AI wins! 🤖');
      setScores(s => ({ ...s, losses: s.losses + 1 }));
    } else if (winner === 'draw') {
      setStatus("It's a draw! 🤝");
      setScores(s => ({ ...s, draws: s.draws + 1 }));
    } else {
      setStatus(isPlayerTurn ? 'Your turn (X)' : 'AI thinking…');
    }
  }, [winner, isPlayerTurn]);

  const handleClick = (i) => {
    if (board[i] || !isPlayerTurn || winner) return;
    const newBoard = [...board];
    newBoard[i] = 'X';
    setBoard(newBoard);
    setIsPlayerTurn(false);
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setStatus('Your turn (X)');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4 text-sm">
        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 font-semibold">Wins: {scores.wins}</span>
        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-600 font-semibold">Losses: {scores.losses}</span>
        <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground font-semibold">Draws: {scores.draws}</span>
      </div>
      <p className={`font-heading font-bold text-lg ${winner === 'X' ? 'text-green-500' : winner === 'O' ? 'text-red-500' : 'text-foreground'}`}>{status}</p>
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <button key={i} onClick={() => handleClick(i)}
            className="w-20 h-20 rounded-2xl border-2 border-border bg-card text-4xl font-bold flex items-center justify-center hover:border-primary/40 transition-colors disabled:cursor-not-allowed">
            <span className={cell === 'X' ? 'text-primary' : 'text-blue-500'}>{cell}</span>
          </button>
        ))}
      </div>
      <button onClick={reset} className="px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        New Game
      </button>
    </div>
  );
                       }
