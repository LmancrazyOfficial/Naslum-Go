import React, { useState, useRef, useEffect } from 'react';
import { Search, Mic, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchBar({ 
  query = '', 
  onSearch, 
  onAIClick, 
  variant = 'home',
  autoFocus = false 
}) {
  const [value, setValue] = useState(query);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setValue(query);
  }, [query]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  const isHome = variant === 'home';

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <motion.div
        className={`
          relative flex items-center w-full rounded-full border transition-all duration-300
          ${isHome ? 'h-14 md:h-16' : 'h-12'}
          ${isFocused 
            ? 'border-primary/50 shadow-lg shadow-primary/10 bg-card' 
            : 'border-border bg-card hover:shadow-md'
          }
        `}
        whileHover={{ scale: isHome ? 1.01 : 1 }}
      >
        <div className="flex items-center justify-center pl-5">
          <Search className={`${isHome ? 'w-5 h-5' : 'w-4 h-4'} text-muted-foreground`} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search the web with Naslum Go..."
          className={`
            flex-1 bg-transparent border-none outline-none px-4 font-body
            ${isHome ? 'text-base md:text-lg' : 'text-sm'}
            text-foreground placeholder:text-muted-foreground/60
          `}
        />

        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={() => { setValue(''); inputRef.current?.focus(); }}
              className="p-1.5 mr-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-1 pr-2">
          {onAIClick && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onAIClick}
              className="rounded-full hover:bg-primary/10 hover:text-primary"
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          )}
          <Button
            type="submit"
            size={isHome ? 'default' : 'sm'}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-5"
          >
            Search
          </Button>
        </div>
      </motion.div>
    </form>
  );
}
