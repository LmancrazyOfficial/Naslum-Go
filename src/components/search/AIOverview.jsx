import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIOverview({ query }) {
  const [overview, setOverview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!query || hasLoaded) return;
    setIsLoading(true);
    setHasLoaded(true);

    base44.integrations.Core.InvokeLLM({
      prompt: `You are Naslum AI, a highly intelligent search assistant. For the query "${query}", provide a rich, informative overview. Include: a clear explanation of the topic, key facts and context, any important nuances or distinctions, and practical takeaways. Use markdown formatting with **bold**, bullet points, and brief headers where helpful. Aim for 5-8 sentences of substantive content — not just a surface-level summary.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
    }).then((result) => {
      setOverview(result);
    }).catch(() => {
      setOverview('');
    }).finally(() => {
      setIsLoading(false);
    });
  }, [query, hasLoaded]);

  if (!overview && !isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-3.5"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-heading font-semibold text-sm">Naslum AI Overview</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-5 pb-4"
          >
            {isLoading ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Generating overview...</span>
              </div>
            ) : (
              <ReactMarkdown className="text-sm prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 leading-relaxed">
                {overview}
              </ReactMarkdown>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
