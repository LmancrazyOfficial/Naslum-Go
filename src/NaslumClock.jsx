import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function NaslumClock({ format = '12h', compact = false }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = format === '12h' ? time.getHours() % 12 || 12 : time.getHours();
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const ampm = format === '12h' ? (time.getHours() >= 12 ? 'PM' : 'AM') : null;

  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr = `${days[time.getDay()]}, ${months[time.getMonth()]} ${time.getDate()}`;

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-sm font-mono font-medium text-muted-foreground">
        <span>{String(hours).padStart(2,'0')}:{minutes}</span>
        {ampm && <span className="text-xs">{ampm}</span>}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center"
    >
      <div className="flex items-end gap-2">
        <span className="text-6xl md:text-7xl font-display font-bold tabular-nums tracking-tight text-foreground">
          {String(hours).padStart(2,'0')}:{minutes}
        </span>
        <div className="flex flex-col items-start pb-2 gap-0.5">
          {ampm && <span className="text-xl font-semibold text-primary">{ampm}</span>}
          <span className="text-lg font-mono text-muted-foreground">{seconds}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-1">{dateStr}</p>
    </motion.div>
  );
}
