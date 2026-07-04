// Naslum AI — Enhanced local engine. Self-contained, no external integrations.
// Capabilities: platform guidance, math, unit conversion, word tools, dates,
// general knowledge, conversation memory, and context-aware responses.

const PLATFORM_KB = [
  {
    keywords: ['search', 'web', 'google', 'find', 'look up', 'browse'],
    answer: `## Searching the Web 🔍

Naslum Go makes searching easy:
- Type your query in the **search bar** on the homepage
- Press Enter or click the search icon
- Switch between **All**, **Images**, **Videos**, and **Shopping** tabs
- Results are powered by Naslum AI with AI-generated overviews

**Tip:** Click "Ask Naslum AI" for an AI-powered answer instead of search results.`,
  },
  {
    keywords: ['market', 'sell', 'buy', 'listing', 'shopping', 'store'],
    answer: `## Naslum Market 🛒

The marketplace lets you buy and sell items:
- Go to **Market** from the homepage nav
- Click **"New Listing"** to sell something
- Add a title, price, category, condition, and images
- Browse listings by category
- Contact sellers or request purchases directly

**Selling tip:** Add clear photos and a detailed description for faster sales!`,
  },
  {
    keywords: ['mail', 'email', 'message', 'inbox', 'compose'],
    answer: `## Naslum Mail ✉️

Internal messaging between Naslum users:
- Go to **Mail** from the homepage
- Click **Compose** to write a new message
- Search for users by name or email
- Star important messages, organize with labels
- Check your Inbox, Sent, Drafts, and Trash folders`,
  },
  {
    keywords: ['friend', 'dm', 'direct message', 'chat with', 'connect'],
    answer: `## Friends & Direct Messages 💬

Connect with other Naslum users:
- Go to **Friends** from the homepage nav
- Browse user profiles and send friend requests
- Accept or decline incoming requests
- Once accepted, start a **DM conversation** instantly
- Real-time messages with read receipts

**Tip:** Add a bio and interests to your profile so others can find you!`,
  },
  {
    keywords: ['doc', 'document', 'write', 'text', 'edit'],
    answer: `## Naslum Docs 📝

Create and edit documents:
- Go to **Docs** from the homepage
- Click **New Document**
- Use the formatting toolbar (bold, italic, lists, alignment)
- Your documents are saved automatically
- Toggle **Public/Private** before saving to control visibility`,
  },
  {
    keywords: ['slide', 'presentation', 'deck', 'powerpoint'],
    answer: `## Naslum Slides 🎞️

Build presentations:
- Go to **Slides** from the homepage
- Create a new presentation with a title
- Add, reorder, and edit slides
- Each slide supports rich text content`,
  },
  {
    keywords: ['poll', 'vote', 'survey'],
    answer: `## Naslum Polls 📊

Create and vote on polls:
- Go to **Polls** from the homepage
- Click **New Poll**, add a question and options
- Toggle **Public/Private** — public polls appear for everyone
- Vote on active polls and see results in real time`,
  },
  {
    keywords: ['music', 'song', 'audio', 'track', 'play', 'listen'],
    answer: `## Naslum Music 🎵

Upload and listen to music:
- Go to **Music** from the homepage
- Upload audio files (MP3, WAV, etc.)
- Toggle **Public/Private** before uploading
- Play tracks with the built-in player
- Browse public music shared by other users`,
  },
  {
    keywords: ['upload', 'file', 'media', 'image', 'video', 'photo'],
    answer: `## Naslum Upload 📁

Upload and share media:
- Go to **Upload** from the homepage
- Choose Images, Videos, or Music
- Drag & drop or browse to select files
- Toggle **Public/Private** — public content appears in search results
- Files are moderated before going public

**Note:** File uploads currently require integration credits. If uploads aren't working, credits may need to reset.`,
  },
  {
    keywords: ['app', 'store', 'launch', 'application'],
    answer: `## Naslum App Store 📱

Browse 60+ integrated web apps:
- Go to **Apps** from the homepage
- Filter by category (Productivity, Design, Developer, etc.)
- Search for specific apps
- Click any app to launch it in a new tab`,
  },
  {
    keywords: ['stock', 'invest', 'trade', 'portfolio', 'market cap', 'dividend'],
    answer: `## Naslum Stocks 📈

Advanced simulated stock trading:
- Go to **Stocks** from the homepage
- Browse 20+ real ticker symbols with live-style charts
- **Buy and sell** shares with virtual money
- Use **market** or **limit** orders
- Track your portfolio, P&L, and full transaction history
- Star stocks to your watchlist
- View technical indicators (SMA, RSI) on each chart

It's a paper trading simulator — practice risk-free!`,
  },
  {
    keywords: ['drive', 'storage', 'save', 'cloud'],
    answer: `## Naslum Drive 💾

Your personal file storage:
- Go to **Drive** from the homepage
- Upload and organize files in folders
- View images, play videos, and listen to audio
- Access your files from anywhere`,
  },
  {
    keywords: ['video editor', 'edit video', 'export', 'filter'],
    answer: `## Naslum Video Editor 🎬

A powerful browser-based editor with 50+ tools:
- Upload any video file
- Adjust brightness, contrast, saturation, hue, and more
- Apply cinematic filters and LUT presets
- Add text overlays, emojis, watermarks, subtitles
- Trim, rotate, flip, zoom
- **Export** your edited frame as a PNG image
- Download the original video file

The editor runs entirely in your browser — no uploads needed!`,
  },
  {
    keywords: ['extension', 'addon', 'plugin', 'customize'],
    answer: `## Naslum Extensions 🧩

Browse and enable 40+ browser extensions:
- Go to **Extensions** from the homepage
- Filter by category
- Enable/disable extensions with one click
- Your preferences are saved automatically
- Click **Open** on enabled extensions to launch them directly

Also visit **Customize** to change your theme color, background, and clock format.`,
  },
  {
    keywords: ['customize', 'theme', 'color', 'background', 'dark mode', 'appearance'],
    answer: `## Customizing Naslum Go 🎨

Make Naslum yours:
- Click the **palette icon** (top right) for quick theme changes
- Or go to **Settings** from the homepage
- Choose from 15 preset accent colors or pick a custom color
- Set a background image (presets or upload your own)
- Toggle dark/light mode
- Change clock format (12h/24h) and text size`,
  },
  {
    keywords: ['game', 'play', 'fun', 'snake', '2048', 'tic tac toe', 'memory'],
    answer: `## Naslum Games 🎮

Play games right in your browser:
- Go to **Games** from the homepage nav
- **Tic-Tac-Toe** — challenge the AI
- **2048** — slide and combine tiles
- **Memory Match** — test your memory
- **Snake** — the classic arcade game

No downloads needed — all games run instantly!`,
  },
  {
    keywords: ['console', 'index', 'seo', 'sitemap', 'crawl', 'search console'],
    answer: `## Naslum Go Console 🔧

The indexing & SEO console for the Naslum platform:
- Go to **Console** from the homepage nav
- **Submit URLs** for indexing into the Naslum search engine
- Set page priority, type, and keywords
- View the full index of all submitted pages
- Generate a **sitemap** of indexed content
- Remove or exclude pages from search results

It works like Google Search Console — but for Naslum Go!`,
  },
  {
    keywords: ['settings', 'account', 'profile', 'preferences', 'site settings'],
    answer: `## Site Settings ⚙️

Manage your Naslum Go experience:
- Go to **Settings** from the homepage nav
- Update your profile name
- Change your theme color and background
- Toggle dark/light mode
- Set clock format and visibility
- Manage notifications, privacy, and accessibility
- Manage enabled extensions

All settings save automatically to your account.`,
  },
  {
    keywords: ['help', 'support', 'how do i', 'guide', 'tutorial'],
    answer: `## Naslum Go Help 🤝

I'm Naslum AI — I can help you with anything on the platform! Just ask me:
- "How do I sell on the Market?"
- "How do I use the Video Editor?"
- "How do I customize my homepage?"
- "How do I add friends?"
- "What can I do in Stocks?"

You can also explore: **Mail, Market, Docs, Slides, Polls, Music, Upload, Apps, Stocks, Drive, Video Editor, Extensions, Games, Friends, Console, and Settings.**`,
  },
];

const GREETINGS = ['hi', 'hello', 'hey', 'yo', 'sup', 'greetings', 'howdy', 'hiya', 'hola', 'good morning', 'good afternoon', 'good evening'];
const THANKS = ['thanks', 'thank you', 'thx', 'appreciate', 'grateful'];
const BYE = ['bye', 'goodbye', 'see you', 'see ya', 'later', 'cya', 'farewell'];
const WHO_ARE_YOU = ['who are you', 'what are you', 'your name', 'about you', 'introduce yourself'];

const GENERAL_KB = [
  { keywords: ['weather'], answer: `I can't fetch live weather (that needs an internet integration), but you can search "weather [your city]" on the Naslum Go homepage to get current conditions! ☀️` },
  { keywords: ['time', 'date', 'today', 'clock'], answer: `Check the **clock** in the top-right corner of your homepage — it shows the current time and date. You can customize it to 12h or 24h format in **Settings**. ⏰` },
  { keywords: ['news', 'headlines', 'current events'], answer: `Search for "today's news" or "breaking news" on the Naslum Go homepage to get the latest headlines! 📰` },
  { keywords: ['joke', 'funny', 'laugh'], answer: `Here's one: Why did the developer go broke? Because they used up all their cache! 😄 Want another? Just ask!` },
  {
    keywords: ['recipe', 'cook', 'food', 'meal'],
    answer: `I'd love to help with recipes! Here's a quick idea:\n\n**Garlic Pasta** 🍝\n- Boil pasta, save 1 cup of pasta water\n- Sauté minced garlic in olive oil\n- Add pasta + a splash of water + parmesan\n- Season with salt, pepper, and red pepper flakes\n\nTell me what ingredients you have and I'll suggest more!`,
  },
  { keywords: ['motivat', 'inspire', 'quote', 'advice'], answer: `✨ "The best way to predict the future is to invent it." — Alan Kay\n\nYou've got this! Every expert was once a beginner. Keep going. 💪` },
  {
    keywords: ['color theory', 'colors that go', 'color combin', 'complementary color'],
    answer: `## Color Theory 🎨\n\n- **Complementary** — opposite on the wheel (blue/orange, red/green)\n- **Analogous** — next to each other (blue/blue-green/green)\n- **Triadic** — evenly spaced (red/yellow/blue)\n- **Monochromatic** — shades of one hue\n\nWarm colors (red/orange) feel energetic; cool colors (blue/green) feel calm. Use the 60-30-10 rule: 60% dominant, 30% secondary, 10% accent.`,
  },
  {
    keywords: ['productivity', 'focus', 'procrastinat', 'time management'],
    answer: `## Productivity Tips ⚡\n\n1. **Pomodoro** — 25 min work, 5 min break\n2. **Eat the frog** — do the hardest task first\n3. **Two-minute rule** — if it takes <2 min, do it now\n4. **Time-block** — assign tasks to calendar slots\n5. **Single-task** — multitasking reduces focus by 40%\n\nWhich one would you like to try?`,
  },
  {
    keywords: ['workout', 'exercise', 'fitness', 'gym'],
    answer: `## Quick Home Workout 💪\n\n**Beginner (15 min):**\n- 10 squats\n- 10 push-ups (or knee push-ups)\n- 20 sec plank\n- 10 lunges\n- 20 jumping jacks\n- Repeat 3x\n\nAlways warm up first and listen to your body!`,
  },
  {
    keywords: ['book recommend', 'what should i read', 'good book'],
    answer: `## Book Recommendations 📚\n\n**Fiction:** "Project Hail Mary" (sci-fi), "The Midnight Library" (contemporary)\n**Non-fiction:** "Atomic Habits" (self-help), "Sapiens" (history)\n**Classic:** "1984", "To Kill a Mockingbird"\n\nTell me your favorite genre and I'll narrow it down!`,
  },
  {
    keywords: ['movie recommend', 'what should i watch', 'good movie'],
    answer: `## Movie Picks 🎬\n\n**Thriller:** Parasite, Knives Out\n**Sci-fi:** Interstellar, Arrival\n**Comedy:** Everything Everywhere All At Once\n**Feel-good:** The Intouchables\n\nWhat genre are you in the mood for?`,
  },
];

// ── Math ──────────────────────────────────────────────
function tryMath(input) {
  const cleaned = input.replace(/[^0-9+\-*/().%\s^]/g, '').replace(/\^/g, '**');
  if (!cleaned || !/[0-9]/.test(cleaned) || !/[+\-*/%]/.test(cleaned)) return null;
  try {
    const result = Function('"use strict";return (' + cleaned + ')')();
    if (typeof result === 'number' && isFinite(result)) {
      const rounded = Math.round(result * 1e8) / 1e8;
      return `## Math Result 🔢\n\n\`\`\`\n${cleaned.replace(/\*\*/g, '^')} = ${rounded}\n\`\`\``;
    }
  } catch { return null; }
  return null;
}

// Percentage calculations: "what is 15% of 200", "20 is what percent of 80"
function tryPercent(input) {
  const pctMatch = input.match(/what\s+is\s+([\d.]+)%\s+of\s+([\d.]+)/i);
  if (pctMatch) {
    const pct = parseFloat(pctMatch[1]); const val = parseFloat(pctMatch[2]);
    const result = (pct / 100) * val;
    return `## Percentage 🔢\n\n**${pct}% of ${val}** = **${result}**`;
  }
  const whatPct = input.match(/([\d.]+)\s+is\s+what\s+percent(?:age)?\s+of\s+([\d.]+)/i);
  if (whatPct) {
    const a = parseFloat(whatPct[1]); const b = parseFloat(whatPct[2]);
    if (b === 0) return "Can't divide by zero!";
    return `## Percentage 🔢\n\n**${a} is ${((a / b) * 100).toFixed(2)}% of ${b}**`;
  }
  return null;
}

// ── Unit Conversion ───────────────────────────────────
const UNITS = {
  length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, ft: 0.3048, in: 0.0254, yd: 0.9144 },
  weight: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495, ton: 907.185 },
  temp: ['c', 'f', 'k'],
  volume: { l: 1, ml: 0.001, gal: 3.78541, qt: 0.946353, cup: 0.236588, floz: 0.0295735 },
  speed: { ms: 1, kmh: 0.277778, mph: 0.44704 },
};
const UNIT_ALIASES = { meters: 'm', meter: 'm', kilometer: 'km', kilometers: 'km', kilometre: 'km', centimeter: 'cm', centimeters: 'cm', millimeter: 'mm', millimeters: 'mm', miles: 'mi', mile: 'mi', feet: 'ft', foot: 'ft', inches: 'in', inch: 'in', yards: 'yd', yard: 'yd', kilograms: 'kg', kilogram: 'kg', grams: 'g', gram: 'g', milligrams: 'mg', milligram: 'mg', pounds: 'lb', pound: 'lb', lbs: 'lb', ounces: 'oz', ounce: 'oz', tons: 'ton', tonne: 'ton', liters: 'l', liter: 'l', litre: 'l', litres: 'l', milliliters: 'ml', milliliter: 'ml', gallons: 'gal', gallon: 'gal', cups: 'cup', quart: 'qt', quarts: 'qt' };

function tryConvert(input) {
  // Temperature
  const tempMatch = input.match(/([\d.]+)\s*(c|celsius|f|fahrenheit|k|kelvin)\s*(?:to|in)\s*(c|celsius|f|fahrenheit|k|kelvin)/i);
  if (tempMatch) {
    const val = parseFloat(tempMatch[1]);
    const from = tempMatch[2][0].toLowerCase();
    const to = tempMatch[3][0].toLowerCase();
    let celsius;
    if (from === 'c') celsius = val;
    else if (from === 'f') celsius = (val - 32) * 5 / 9;
    else celsius = val - 273.15;
    let result;
    if (to === 'c') result = celsius;
    else if (to === 'f') result = celsius * 9 / 5 + 32;
    else result = celsius + 273.15;
    const fromLabel = { c: '°C', f: '°F', k: 'K' }[from];
    const toLabel = { c: '°C', f: '°F', k: 'K' }[to];
    return `## Temperature 🌡️\n\n**${val}${fromLabel} = ${result.toFixed(2)}${toLabel}**`;
  }
  // Length/weight/volume
  const convMatch = input.match(/([\d.]+)\s*([a-z]+)\s*(?:to|in)\s*([a-z]+)/i);
  if (convMatch) {
    const val = parseFloat(convMatch[1]);
    const fromUnit = (UNIT_ALIASES[convMatch[2].toLowerCase()] || convMatch[2].toLowerCase());
    const toUnit = (UNIT_ALIASES[convMatch[3].toLowerCase()] || convMatch[3].toLowerCase());
    for (const [category, units] of Object.entries(UNITS)) {
      if (category === 'temp') continue;
      if (typeof units === 'object' && units[fromUnit] && units[toUnit]) {
        const result = (val * units[fromUnit]) / units[toUnit];
        return `## Conversion 📐\n\n**${val} ${fromUnit} = ${result.toFixed(4)} ${toUnit}**\n\n*(${category})*`;
      }
    }
  }
  return null;
}

// ── Word Tools ────────────────────────────────────────
function tryWordTools(input) {
  const lower = input.toLowerCase();
  // Word count
  const wcMatch = lower.match(/(?:word count|count words|how many words)/);
  if (wcMatch) {
    const text = input.replace(/.*(?:of |in |: )/, '').trim();
    if (text && text.length > 3) {
      const count = text.split(/\s+/).filter(Boolean).length;
      return `## Word Count ✍️\n\n**${count} words**, ${text.length} characters.\n\n\`\`\`\n${text.slice(0, 100)}${text.length > 100 ? '...' : ''}\n\`\`\``;
    }
    return `To count words, paste your text after "word count:" — e.g. \`word count: the quick brown fox\``;
  }
  // Reverse
  if (lower.match(/reverse(?:\s+this)?:?\s/)) {
    const text = input.replace(/.*reverse(?:\s+this)?:?\s*/i, '').trim();
    if (text) return `## Reversed 🔄\n\n\`\`\`\n${text.split('').reverse().join('')}\n\`\`\``;
  }
  // Pig latin
  if (lower.match(/pig latin:?\s/)) {
    const text = input.replace(/.*pig latin:?\s*/i, '').trim();
    if (text) {
      const translated = text.split(/\s+/).map(w => {
        if (/^[aeiou]/i.test(w)) return w + 'ay';
        const m = w.match(/^([^aeiou]+)(.*)/i);
        return m ? m[2] + m[1] + 'ay' : w;
      }).join(' ');
      return `## Pig Latin 🐷\n\n**${translated}**`;
    }
  }
  // Uppercase / lowercase
  if (lower.match(/uppercase:?\s/) || lower.match(/to upper:?\s/)) {
    const text = input.replace(/.*(?:uppercase|to upper):?\s*/i, '').trim();
    if (text) return `## UPPERCASE 🔠\n\n\`\`\`\n${text.toUpperCase()}\n\`\`\``;
  }
  if (lower.match(/lowercase:?\s/) || lower.match(/to lower:?\s/)) {
    const text = input.replace(/.*(?:lowercase|to lower):?\s*/i, '').trim();
    if (text) return `## lowercase 🔡\n\n\`\`\`\n${text.toLowerCase()}\n\`\`\``;
  }
  return null;
}

// ── List / Idea Generation ────────────────────────────
const LIST_KB = [
  {
    keywords: ['team names', 'name for a team', 'team name ideas'],
    answer: `## Team Name Ideas 🏆\n\n1. The Neural Nets\n2. Quantum Leap\n3. Byte Me\n4. Ctrl+Alt+Defeat\n5. The Syntax Squad\n6. Error 404: Name Not Found\n7. Data Dragons\n8. The Algorithm Avengers`,
  },
  {
    keywords: ['startup ideas', 'business ideas', 'app ideas'],
    answer: `## Startup Ideas 💡\n\n1. **AI meal planner** — recipes from what's in your fridge\n2. **Local skill swap** — trade services with neighbors\n3. **Subscription tracker** — manage recurring payments\n4. **Focus pod** — virtual co-working with strangers\n5. **Plant care AI** — diagnose houseplant issues by photo`,
  },
  {
    keywords: ['gift ideas', 'present ideas', 'what to gift'],
    answer: `## Gift Ideas 🎁\n\n1. A personalized photo book\n2. A nice notebook + fountain pen\n3. A subscription box (coffee, books, snacks)\n4. An experience (cooking class, escape room)\n5. A smart mug or desk lamp\n\nTell me the occasion & budget and I'll refine!`,
  },
  {
    keywords: ['bucket list', 'things to do'],
    answer: `## Bucket List Ideas 🌍\n\n1. See the Northern Lights\n2. Learn to play an instrument\n3. Run a marathon (or 5K)\n4. Visit a new continent\n5. Write a short story\n6. Cook a meal from 10 different countries\n7. Go stargazing in a dark-sky park`,
  },
];

// ── Date helpers ──────────────────────────────────────
function tryDate(input) {
  const lower = input.toLowerCase();
  const daysFromNow = lower.match(/(?:what(?:'s| is) the date|what day)\s+(?:in|after)\s+(\d+)\s+days/);
  if (daysFromNow) {
    const days = parseInt(daysFromNow[1]);
    const date = new Date();
    date.setDate(date.getDate() + days);
    return `## Date Calculator 📅\n\n**In ${days} days** it will be **${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**`;
  }
  if (lower.match(/days until|days between/)) {
    const dates = input.match(/(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2})/g);
    if (dates && dates.length === 2) {
      const d1 = new Date(dates[0]); const d2 = new Date(dates[1]);
      const diff = Math.round(Math.abs(d2 - d1) / 86400000);
      return `## Date Math 📅\n\n**${diff} days** between ${dates[0]} and ${dates[1]}`;
    }
  }
  return null;
}

function matc
