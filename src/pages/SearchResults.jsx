import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { AnimatePresence } from 'framer-motion';
import NaslumLogo from '@/components/NaslumLogo';
import SearchBar from '@/components/search/SearchBar';
import SearchResultCard from '@/components/search/SearchResultCard';
import AIOverview from '@/components/search/AIOverview';
import NaslumAIChat from '@/components/ai/NaslumAIChat';
import ThemeCustomizer from '@/components/settings/ThemeCustomizer';
import InAppBrowser from '@/components/search/InAppBrowser';

export default function SearchResults() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q') || '';
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [browserTabs, setBrowserTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const openInTab = ({ url, title }) => {
    const existing = browserTabs.find(t => t.url === url);
    if (existing) { setActiveTabId(existing.id); return; }
    const id = Date.now().toString();
    setBrowserTabs(prev => [...prev, { id, url, title: title || url }]);
    setActiveTabId(id);
  };

  const closeTab = (id) => {
    setBrowserTabs(prev => {
      const next = prev.filter(t => t.id !== id);
      if (activeTabId === id && next.length > 0) setActiveTabId(next[next.length - 1].id);
      if (next.length === 0) setActiveTabId(null);
      return next;
    });
  };

  useEffect(() => {
    if (!query) return;
    setIsLoading(true);
    setResults([]);

    base44.integrations.Core.InvokeLLM({
      prompt: `You are a search engine. Search the internet for: "${query}". 
Return exactly 10 real, relevant search results. Use actual existing websites (Wikipedia, YouTube, Reddit, news sites, official pages). 
Each result needs: a real title, a real working URL, and a 1-2 sentence description. 
IMPORTANT: Always return all 10 results. Never return fewer. Even for uncommon queries, find related real pages.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                url: { type: "string" },
                description: { type: "string" },
              }
            }
          }
        }
      }
    }).then((data) => {
      const res = data.results || [];
      setResults(res);
      // Save to search history
      base44.auth.me().then(u => {
        if (u) base44.entities.SearchHistory.create({ user_id: u.id, query, search_type: 'web', result_count: res.length });
      }).catch(() => {});
    }).catch(() => {
      // Fallback: provide helpful static results when integration limit is hit
      setResults([
        { title: `${query} - Wikipedia`, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`, description: `Encyclopedia article about ${query}. Wikipedia, the free encyclopedia.` },
        { title: `${query} - Google Search`, url: `https://google.com/search?q=${encodeURIComponent(query)}`, description: `See full Google results for "${query}".` },
        { title: `${query} - YouTube`, url: `https://youtube.com/results?search_query=${encodeURIComponent(query)}`, description: `Watch videos about ${query} on YouTube.` },
        { title: `${query} - Reddit`, url: `https://reddit.com/search/?q=${encodeURIComponent(query)}`, description: `Community discussions about ${query} on Reddit.` },
        { title: `${query} - News`, url: `https://news.google.com/search?q=${encodeURIComponent(query)}`, description: `Latest news about ${query} from Google News.` },
      ]);
    }).finally(() => {
      setIsLoading(false);
    });
  }, [query]);

  const handleSearch = (newQuery) => {
    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
    window.location.reload();
  };

  const TABS = [
    { label: 'All', path: `/search?q=${encodeURIComponent(query)}`, active: true },
    { label: 'Images', path: `/images?q=${encodeURIComponent(query)}` },
    { label: 'Videos', path: `/videos?q=${encodeURIComponent(query)}` },
    { label: 'Shopping', path: `/market` },
    { label: 'Music', path: `/music` },
    { label: 'Docs', path: `/docs` },
    { label: 'Slides', path: `/slides` },
    { label: 'Polls', path: `/polls` },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/')} className="flex-shrink-0">
            <NaslumLogo size="sm" showText={false} />
          </button>
          <div className="flex-1 max-w-2xl">
            <SearchBar
              query={query}
              onSearch={handleSearch}
              onAIClick={() => setShowAI(true)}
              variant="compact"
            />
          </div>
          <ThemeCustomizer onBgChange={() => {}} currentBg="" />
        </div>
        {/* Search type tabs */}
        <div className="max-w-5xl mx-auto px-4 flex gap-6 text-sm">
          {TABS.map(tab => (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className={`py-2.5 border-b-2 font-medium transition-colors ${tab.active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Results */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {query && <AIOverview query={query} />}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Searching the web for "{query}"</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-4">
              About {results.length} results for "<span className="font-medium text-foreground">{query}</span>"
            </p>
            <div className="space-y-1">
              {results.map((result, idx) => (
                <SearchResultCard key={idx} result={result} index={idx} onOpen={openInTab} />
              ))}
            </div>
            {results.length === 0 && !isLoading && query && (
              <div className="text-center py-20">
                <p className="text-lg font-heading font-semibold mb-2">No results found</p>
                <p className="text-sm text-muted-foreground">Try different keywords or ask Naslum AI</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center">
        <p className="text-xs text-muted-foreground">© 2026 Naslum Go™ — Powered by Gemini</p>
      </footer>

      <NaslumAIChat isOpen={showAI} onClose={() => setShowAI(false)} />

      <AnimatePresence>
        {browserTabs.length > 0 && activeTabId && (
          <InAppBrowser
            tabs={browserTabs}
            activeTabId={activeTabId}
            onTabChange={setActiveTabId}
            onTabClose={closeTab}
          />
        )}
      </AnimatePresence>
    </div>
  );
        }
