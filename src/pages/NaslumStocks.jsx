import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, Search, Star, StarOff, Wallet, Plus, Minus, RefreshCw, Loader2, DollarSign, History, BarChart2, Activity, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import NaslumLogo from '@/components/NaslumLogo';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { toast } from 'sonner';

const STOCKS_DATA = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', price: 214.32, change: 2.15, change_pct: 1.01, market_cap: '$3.28T', volume: '58.4M', high_52w: 237.49, low_52w: 164.08, pe: 34.2, dividend: 0.48 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', price: 178.54, change: -1.23, change_pct: -0.68, market_cap: '$2.21T', volume: '22.1M', high_52w: 201.42, low_52w: 130.67, pe: 25.1, dividend: 0 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', price: 431.87, change: 3.44, change_pct: 0.80, market_cap: '$3.21T', volume: '19.7M', high_52w: 468.35, low_52w: 344.79, pe: 36.5, dividend: 3.0 },
  { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', price: 248.60, change: -5.82, change_pct: -2.29, market_cap: '$793B', volume: '89.2M', high_52w: 358.64, low_52w: 138.80, pe: 65.3, dividend: 0 },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer', price: 197.12, change: 1.78, change_pct: 0.91, market_cap: '$2.08T', volume: '34.5M', high_52w: 225.40, low_52w: 151.61, pe: 44.8, dividend: 0 },
  { ticker: 'META', name: 'Meta Platforms', sector: 'Technology', price: 562.44, change: 7.31, change_pct: 1.32, market_cap: '$1.42T', volume: '14.8M', high_52w: 602.95, low_52w: 414.50, pe: 28.4, dividend: 2.0 },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', price: 1087.50, change: 22.40, change_pct: 2.10, market_cap: '$2.68T', volume: '41.3M', high_52w: 1152.40, low_52w: 462.41, pe: 72.1, dividend: 0.04 },
  { ticker: 'NFLX', name: 'Netflix Inc.', sector: 'Media', price: 698.22, change: -3.18, change_pct: -0.45, market_cap: '$298B', volume: '3.1M', high_52w: 741.80, low_52w: 488.63, pe: 48.2, dividend: 0 },
  { ticker: 'AMD', name: 'AMD Inc.', sector: 'Technology', price: 168.44, change: 4.10, change_pct: 2.50, market_cap: '$272B', volume: '52.6M', high_52w: 227.30, low_52w: 121.81, pe: 180.5, dividend: 0 },
  { ticker: 'INTC', name: 'Intel Corp.', sector: 'Technology', price: 30.57, change: -0.43, change_pct: -1.39, market_cap: '$129B', volume: '37.8M', high_52w: 51.28, low_52w: 18.84, pe: 0, dividend: 0.5 },
  { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Financials', price: 215.34, change: 1.12, change_pct: 0.52, market_cap: '$612B', volume: '8.9M', high_52w: 225.48, low_52w: 142.98, pe: 12.3, dividend: 4.6 },
  { ticker: 'V', name: 'Visa Inc.', sector: 'Financials', price: 281.45, change: 0.87, change_pct: 0.31, market_cap: '$541B', volume: '6.2M', high_52w: 290.96, low_52w: 227.78, pe: 31.2, dividend: 2.08 },
  { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', price: 152.18, change: -0.34, change_pct: -0.22, market_cap: '$366B', volume: '7.1M', high_52w: 168.85, low_52w: 143.02, pe: 22.1, dividend: 4.8 },
  { ticker: 'WMT', name: 'Walmart Inc.', sector: 'Consumer', price: 72.45, change: 0.92, change_pct: 1.29, market_cap: '$582B', volume: '15.3M', high_52w: 75.45, low_52w: 55.41, pe: 41.3, dividend: 1.24 },
  { ticker: 'DIS', name: 'Walt Disney Co.', sector: 'Media', price: 95.67, change: -1.45, change_pct: -1.49, market_cap: '$173B', volume: '12.4M', high_52w: 112.18, low_52w: 83.91, pe: 38.5, dividend: 1.0 },
  { ticker: 'KO', name: 'Coca-Cola Co.', sector: 'Consumer', price: 62.34, change: 0.21, change_pct: 0.34, market_cap: '$268B', volume: '14.2M', high_52w: 69.34, low_52w: 57.01, pe: 28.4, dividend: 3.2 },
  { ticker: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', price: 28.76, change: -0.18, change_pct: -0.62, market_cap: '$163B', volume: '21.3M', high_52w: 31.85, low_52w: 24.25, pe: 0, dividend: 5.6 },
  { ticker: 'XOM', name: 'Exxon Mobil', sector: 'Energy', price: 116.43, change: 1.87, change_pct: 1.63, market_cap: '$513B', volume: '18.1M', high_52w: 126.34, low_52w: 95.77, pe: 14.2, dividend: 3.3 },
  { ticker: 'BA', name: 'Boeing Co.', sector: 'Industrial', price: 178.22, change: -2.34, change_pct: -1.30, market_cap: '$107B', volume: '9.8M', high_52w: 267.51, low_52w: 137.03, pe: 0, dividend: 0 },
  { ticker: 'SHOP', name: 'Shopify Inc.', sector: 'Technology', price: 78.45, change: 2.13, change_pct: 2.79, market_cap: '$101B', volume: '11.2M', high_52w: 91.57, low_52w: 48.61, pe: 75.3, dividend: 0 },
];

const SECTORS = ['All', 'Technology', 'Financials', 'Healthcare', 'Consumer', 'Media', 'Automotive', 'Energy', 'Industrial'];
const TIMEFRAMES = [
  { key: '1D', days: 1, points: 24 },
  { key: '1W', days: 7, points: 7 },
  { key: '1M', days: 30, points: 30 },
  { key: '3M', days: 90, points: 30 },
];

function generateChartData(basePrice, points = 30) {
  const data = [];
  let price = basePrice * 0.92;
  for (let i = points - 1; i >= 0; i--) {
    price = price + (Math.random() - 0.45) * basePrice * 0.02;
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({ day: `${date.getMonth() + 1}/${date.getDate()}`, price: parseFloat(price.toFixed(2)) });
  }
  // Ensure last point is close to current price
  if (data.length) data[data.length - 1].price = parseFloat(basePrice.toFixed(2));
  return data;
}

// Simple Moving Average
function calcSMA(data, period = 7) {
  return data.map((d, i) => {
    if (i < period - 1) return { ...d, sma: null };
    const slice = data.slice(i - period + 1, i + 1);
    const avg = slice.reduce((s, x) => s + x.price, 0) / period;
    return { ...d, sma: parseFloat(avg.toFixed(2)) };
  });
}

// RSI (simplified)
function calcRSI(data, period = 14) {
  if (data.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = data.length - period; i < data.length; i++) {
    const change = data[i].price - data[i - 1].price;
    if (change > 0) gains += change; else losses -= change;
  }
  const rs = gains / (losses || 1);
  return parseFloat((100 - 100 / (1 + rs)).toFixed(1));
}

export default function NaslumStocks() {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState(STOCKS_DATA);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('All');
  const [selectedStock, setSelectedStock] = useState(STOCKS_DATA[0]);
  const [timeframe, setTimeframe] = useState('1M');
  const [chartData, setChartData] = useState(() => generateChartData(STOCKS_DATA[0].price, 30));
  const [portfolio, setPortfolio] = useState({ cash: 10000, positions: [], watchlist: ['AAPL', 'NVDA'] });
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tradeAmount, setTradeAmount] = useState(1);
  const [orderType, setOrderType] = useState('market');
  const [limitPrice, setLimitPrice] = useState(STOCKS_DATA[0].price);
  const [showTrade, setShowTrade] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [view, setView] = useState('trade'); // trade, history

  const chartWithSMA = useMemo(() => calcSMA(chartData, 7), [chartData]);
  const rsi = useMemo(() => calcRSI(chartData), [chartData]);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const existing = await base44.entities.StockPortfolio.filter({ user_id: u.id });
      if (existing[0]) {
        setPortfolio({ cash: existing[0].cash ?? 10000, positions: existing[0].positions || [], watchlist: existing[0].watchlist || ['AAPL', 'NVDA'] });
      } else {
        await base44.entities.StockPortfolio.create({ user_id: u.id, cash: 10000, positions: [], watchlist: ['AAPL', 'NVDA'] });
      }
      const txns = await base44.entities.StockTransaction.filter({ user_id: u.id }, '-created_date', 100);
      setTransactions(txns);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const savePortfolio = async (newPortfolio) => {
    if (!user) return;
    const existing = await base44.entities.StockPortfolio.filter({ user_id: user.id });
    if (existing[0]) await base44.entities.StockPortfolio.update(existing[0].id, newPortfolio);
  };

  const logTransaction = async (tx) => {
    if (!user) return;
    await base44.entities.StockTransaction.create({ user_id: user.id, ...tx });
    setTransactions(prev => [{ ...tx, id: 'tmp' + Date.now(), created_date: new Date().toISOString() }, ...prev]);
  };

  const selectStock = (stock) => {
    setSelectedStock(stock);
    setLimitPrice(stock.price);
    const tf = TIMEFRAMES.find(t => t.key === timeframe);
    setChartData(generateChartData(stock.price, tf.points));
    setShowTrade(true);
  };

  const changeTimeframe = (key) => {
    setTimeframe(key);
    const tf = TIMEFRAMES.find(t => t.key === key);
    setChartData(generateChartData(selectedStock.price, tf.points));
  };

  const toggleWatchlist = (ticker) => {
    setPortfolio(prev => {
      const wl = prev.watchlist.includes(ticker) ? prev.watchlist.filter(t => t !== ticker) : [...prev.watchlist, ticker];
      const np = { ...prev, watchlist: wl };
      savePortfolio(np);
      return np;
    });
  };

  const buyStock = () => {
    const execPrice = orderType === 'limit' ? limitPrice : selectedStock.price;
    if (orderType === 'limit' && limitPrice >= selectedStock.price) { toast.error('Limit buy must be below current price'); return; }
    const cost = execPrice * tradeAmount;
    if (cost > portfolio.cash) { toast.error('Not enough cash!'); return; }
    const existing = portfolio.positions.find(p => p.ticker === selectedStock.ticker);
    let positions;
    if (existing) {
      const totalShares = existing.shares + tradeAmount;
      const totalCost = existing.avg_price * existing.shares + cost;
      positions = portfolio.positions.map(p => p.ticker === selectedStock.ticker ? { ...p, shares: totalShares, avg_price: totalCost / totalShares } : p);
    } else {
      positions = [...portfolio.positions, { ticker: selectedStock.ticker, shares: tradeAmount, avg_price: execPrice }];
    }
    const np = { ...portfolio, cash: portfolio.cash - cost, positions };
    setPortfolio(np);
    savePortfolio(np);
    logTransaction({ ticker: selectedStock.ticker, type: 'buy', shares: tradeAmount, price: execPrice, total: -cost, order_type: orderType, status: 'filled' });
    toast.success(`Bought ${tradeAmount} ${selectedStock.ticker} @ $${execPrice.toFixed(2)}`);
    setTradeAmount(1);
  };

  const sellStock = () => {
    const execPrice = orderType === 'limit' ? limitPrice : selectedStock.price;
    if (orderType === 'limit' && limitPrice <= selectedStock.price) { toast.error('Limit sell must be above current price'); return; }
    const existing = portfolio.positions.find(p => p.ticker === selectedStock.ticker);
    if (!existing || existing.shares < tradeAmount) { toast.error('Not enough shares to sell!'); return; }
    const proceeds = execPrice * tradeAmount;
    let positions;
    if (existing.shares === tradeAmount) {
      positions = portfolio.positions.filter(p => p.ticker !== selectedStock.ticker);
    } else {
      positions = portfolio.positions.map(p => p.ticker === selectedStock.ticker ? { ...p, shares: p.shares - tradeAmount } : p);
    }
    const np = { ...portfolio, cash: portfolio.cash + proceeds, positions };
    setPortfolio(np);
    savePortfolio(np);
    logTransaction({ ticker: selectedStock.ticker, type: 'sell', shares: tradeAmount, price: execPrice, total: proceeds, order_type: orderType, status: 'filled' });
    toast.success(`Sold ${tradeAmount} ${selectedStock.ticker} @ $${execPrice.toFixed(2)}`);
    setTradeAmount(1);
  };

  const resetPortfolio = async () => {
    const np = { cash: 10000, positions: [], watchlist: portfolio.watchlist };
    setPortfolio(np);
    savePortfolio(np);
    if (user) await base44.entities.StockTransaction.deleteMany({ user_id: user.id });
    setTransactions([]);
    toast.success('Portfolio reset to $10,000');
  };

  const collectDividends = async () => {
    let total = 0;
    for (const pos of portfolio.positions) {
      const stock = stocks.find(s => s.ticker === pos.ticker);
      if (stock && stock.dividend > 0) {
        total += stock.dividend * pos.shares;
      }
    }
    if (total <= 0) { toast.info('No dividend-paying positions to collect'); return; }
    const np = { ...portfolio, cash: portfolio.cash + total };
    setPortfolio(np);
    savePortfolio(np);
    logTransaction({ ticker: 'DIV', type: 'dividend', shares: 0, price: 0, total, order_type: 'market', status: 'filled' });
    toast.success(`Collected $${total.toFixed(2)} in dividends!`);
  };

  const refreshPrices = () => {
    setStocks(prev => prev.map(s => ({ ...s, price: parseFloat((s.price * (1 + (Math.random() - 0.5) * 0.03)).toFixed(2)) })));
    const tf = TIMEFRAMES.find(t => t.key === timeframe);
    setChartData(generateChartData(selectedStock.price, tf.points));
    toast.success('Prices refreshed');
  };

  const filteredStocks = stocks.filter(s =>
    (sector === 'All' || s.sector === sector) &&
    (!search || s.ticker.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase()))
  );

  const totalValue = portfolio.cash + portfolio.positions.reduce((sum, p) => {
    const stock = stocks.find(s => s.ticker === p.ticker);
    return sum + (stock ? stock.price * p.shares : p.avg_price * p.shares);
  }, 0);

  const totalPnL = portfolio.positions.reduce((sum, p) => {
    const stock = stocks.find(s => s.ticker === p.ticker);
    const currentPrice = stock ? stock.price : p.avg_price;
    return sum + (currentPrice - p.avg_price) * p.shares;
  }, 0);

  const currentPosition = portfolio.positions.find(p => p.ticker === selectedStock?.ticker);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center gap-4 px-4 py-3 flex-wrap">
          <button onClick={() => navigate('/')}><NaslumLogo size="sm" showText={false} /></button>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-lg">Naslum Stocks</span>
          </div>
          <div className="relative ml-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ticker..."
              className="pl-9 pr-4 py-2 rounded-full bg-muted border border-border text-sm outline-none focus:border-primary/50 w-44" />
          </div>
          <Button onClick={refreshPrices} variant="outline" size="sm" className="rounded-full gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="rounded-full gap-1.5 ml-auto">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>
      </header>

      {/* Portfolio bar */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1"><Wallet className="w-4 h-4 text-muted-foreground" /><p className="text-xs text-muted-foreground">Cash</p></div>
            <p className="font-heading font-bold text-xl">${portfolio.cash.toFixed(2)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-muted-foreground" /><p className="text-xs text-muted-foreground">Total Value</p></div>
            <p className="font-heading font-bold text-xl">${totalValue.toFixed(2)}</p>
          </div>
          <div className={`bg-card border rounded-xl p-4 ${totalPnL >= 0 ? 'border-green-500/30' : 'border-red-500/30'}`}>
            <div className="flex items-center gap-2 mb-1"><TrendingUp className={`w-4 h-4 ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`} /><p className="text-xs text-muted-foreground">Total P&L</p></div>
            <p className={`font-heading font-bold text-xl ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>{totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1"><BarChart2 className="w-4 h-4 text-muted-foreground" /><p className="text-xs text-muted-foreground">Positions</p></div>
            <p className="font-heading font-bold text-xl">{portfolio.positions.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-1"><Activity className="w-4 h-4 text-primary" /><p className="text-xs text-muted-foreground">Dividends</p></div>
            <button onClick={collectDividends} className="font-heading font-bold text-sm text-primary hover:underline text-left">Collect</button>
          </div>
        </div>
      </div>

      {/* Sector filter */}
      <div className="max-w-6xl mx-auto px-4 pb-2 flex gap-2 overflow-x-auto">
        {SECTORS.map(s => (
          <button key={s} onClick={() => setSector(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${sector === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {s}
          </button>
        ))}
      </div>

      <main className="max-w-6xl mx-auto px-4 pb-6 flex flex-col lg:flex-row gap-6">
        {/* Stock list */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-2">
          <h3 className="font-heading font-semibold text-xs mb-3 text-muted-foreground uppercase tracking-wider">Market</h3>
          <div className="max-h-[600px] overflow-y-auto space-y-2 pr-1">
            {filteredStocks.map((stock, i) => {
              const up = stock.change >= 0;
              const pos = portfolio.positions.find(p => p.ticker === stock.ticker);
              return (
                <motion.button key={stock.ticker} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                  onClick={() => selectStock(stock)}
                  className={`w-full p-3 rounded-xl border transition-all text-left ${selectedStock?.ticker === stock.ticker ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm">{stock.ticker}</span>
                      {pos && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">{pos.shares}</span>}
                      <button onClick={e => { e.stopPropagation(); toggleWatchlist(stock.ticker); }} className="text-muted-foreground hover:text-yellow-500 transition-colors">
                        {portfolio.watchlist.includes(stock.ticker) ? <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> : <StarOff className="w-3.5 h-3.5
