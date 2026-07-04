import React, { useState } from 'react';
import { X, ArrowLeft, ArrowRight, RefreshCw, ExternalLink, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function InAppBrowser({ tabs, activeTabId, onTabChange, onTabClose, onNewTab }) {
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const [loading, setLoading] = useState(false);

  if (!tabs.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed inset-0 z-50 flex flex-col bg-background"
    >
      {/* Tab bar */}
      <div className="flex items-center bg-card border-b border-border overflow-x-auto flex-shrink-0">
        <div className="flex items-center gap-0.5 px-2 py-1.5 flex-1 overflow-x-auto">
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg min-w-[120px] max-w-[200px] cursor-pointer flex-shrink-0 group transition-colors ${
                tab.id === activeTabId
                  ? 'bg-background border border-b-background border-border -mb-px'
                  : 'hover:bg-muted/60 text-muted-foreground'
              }`}
            >
              <Globe className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
              <span className="text-xs font-medium truncate flex-1">{tab.title || tab.url}</span>
              <button
                onClick={e => { e.stopPropagation(); onTabClose(tab.id); }}
                className="opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center px-2 gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => onTabClose(activeTabId)} className="text-xs gap-1.5 rounded-full">
            <X className="w-3.5 h-3.5" /> Close
          </Button>
        </div>
      </div>

      {/* Address bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background flex-shrink-0">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-4 py-1.5">
          <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground truncate flex-1">{activeTab?.url}</span>
        </div>
        <a
          href={activeTab?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-full hover:bg-muted flex-shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Open externally</span>
        </a>
      </div>

      {/* iframe */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
        <iframe
          key={activeTab?.url}
          src={activeTab?.url}
          title={activeTab?.title || 'Page'}
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          onLoadStart={() => setLoading(true)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </motion.div>
  );
            }
