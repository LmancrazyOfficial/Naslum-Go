import React from 'react';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SearchResultCard({ result, index, onOpen }) {
  const { title, url, description } = result;

  let displayUrl = url;
  try { displayUrl = new URL(url).hostname.replace('www.', ''); } catch {}

  const handleClick = (e) => {
    e.preventDefault();
    if (onOpen) onOpen({ url, title });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="block group p-5 rounded-xl hover:bg-card border border-transparent hover:border-border transition-all duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                {displayUrl.charAt(0)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground truncate">{displayUrl}</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-primary group-hover:underline decoration-primary/30 underline-offset-2 mb-1.5 line-clamp-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
