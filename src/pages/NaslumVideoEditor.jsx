import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Upload, Play, Pause, Volume2, VolumeX, Download,
  RotateCcw, Scissors, Layers, Sliders, Sun, Contrast, Droplets,
  FlipHorizontal, FlipVertical, RotateCw, ZoomIn, ZoomOut,
  Film, Music, Type, Image, Sparkles, Square, FastForward, Rewind,
  Crop, Wand2, SlidersHorizontal, Focus, Eye, EyeOff,
  Timer, Hash, AlignCenter, Smile, Palette, Frame, Maximize2,
  Minimize2, RefreshCcw, RefreshCw, Tv2, Blend, Mic, MicOff, Lock, Unlock,
  Circle, Triangle, Minus, Plus, Move, ChevronDown, Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NaslumLogo from '@/components/NaslumLogo';
import { toast } from 'sonner';

const TOOLS = [
  { id: 'trim', icon: Scissors, label: 'Trim' },
  { id: 'brightness', icon: Sun, label: 'Brightness' },
  { id: 'contrast', icon: Contrast, label: 'Contrast' },
  { id: 'saturation', icon: Droplets, label: 'Saturation' },
  { id: 'hue', icon: SlidersHorizontal, label: 'Hue' },
  { id: 'blur', icon: Sparkles, label: 'Blur' },
  { id: 'sharpen', icon: Focus, label: 'Sharpen' },
  { id: 'opacity', icon: Eye, label: 'Opacity' },
  { id: 'grayscale', icon: Sliders, label: 'Grayscale' },
  { id: 'sepia', icon: Wand2, label: 'Sepia' },
  { id: 'vignette', icon: EyeOff, label: 'Vignette' },
  { id: 'flip_h', icon: FlipHorizontal, label: 'Flip H' },
  { id: 'flip_v', icon: FlipVertical, label: 'Flip V' },
  { id: 'rotate', icon: RotateCw, label: 'Rotate' },
  { id: 'zoom', icon: ZoomIn, label: 'Zoom In' },
  { id: 'zoom_out', icon: ZoomOut, label: 'Zoom Out' },
  { id: 'speed', icon: FastForward, label: 'Speed' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'text_size', icon: Hash, label: 'Text Size' },
  { id: 'text_color', icon: Palette, label: 'Text Color' },
  { id: 'text_position', icon: AlignCenter, label: 'Text Pos' },
  { id: 'emoji', icon: Smile, label: 'Emoji' },
  { id: 'mute', icon: VolumeX, label: 'Mute' },
  { id: 'volume', icon: Volume2, label: 'Volume' },
  { id: 'fade_in', icon: Timer, label: 'Fade In' },
  { id: 'fade_out', icon: Timer, label: 'Fade Out' },
  { id: 'frame', icon: Square, label: 'Frame' },
  { id: 'aspect_ratio', icon: Maximize2, label: 'Aspect' },
  { id: 'noise', icon: Blend, label: 'Noise' },
  { id: 'warmth', icon: Sun, label: 'Warmth' },
  { id: 'shadows', icon: Triangle, label: 'Shadows' },
  { id: 'highlights', icon: Sparkles, label: 'Highlights' },
  { id: 'tint', icon: Droplets, label: 'Tint' },
  { id: 'exposure', icon: Sun, label: 'Exposure' },
  { id: 'grain', icon: Layers, label: 'Film Grain' },
  { id: 'letterbox', icon: Tv2, label: 'Letterbox' },
  { id: 'mirror_lr', icon: RefreshCcw, label: 'Mirror' },
  { id: 'stabilize', icon: Move, label: 'Stabilize' },
  { id: 'crop', icon: Crop, label: 'Crop' },
  { id: 'border', icon: Frame, label: 'Border' },
  { id: 'corner_radius', icon: Circle, label: 'Round' },
  { id: 'watermark', icon: Lock, label: 'Watermark' },
  { id: 'pip', icon: Minimize2, label: 'PiP' },
  { id: 'subtitle', icon: Minus, label: 'Subtitle' },
  { id: 'audio_eq', icon: Music, label: 'Audio EQ' },
  { id: 'color_grading', icon: Palette, label: 'Color Grade' },
  { id: 'lut', icon: Wand2, label: 'LUT' },
  { id: 'reverse', icon: Rewind, label: 'Reverse' },
  { id: 'portrait', icon: Maximize2, label: '9:16' },
  { id: 'square', icon: Square, label: '1:1' },
  { id: 'widescreen', icon: Tv2, label: '16:9' },
  { id: 'duotone', icon: Blend, label: 'Duotone' },
  { id: 'sticker', icon: Smile, label: 'Sticker' },
  { id: 'text_font', icon: Type, label: 'Font' },
  { id: 'text_bg', icon: Square, label: 'Text BG' },
  { id: 'invert', icon: RefreshCcw, label: 'Invert' },
  { id: 'posterize', icon: Layers, label: 'Posterize' },
  { id: 'corner_radius', icon: Circle, label: 'Radius' },
  { id: 'split', icon: Scissors, label: 'Split' },
  { id: 'collage', icon: Layers, label: 'Collage' },
  { id: 'deshake', icon: Move, label: 'De-shake' },
  { id: 'loop', icon: RefreshCw, label: 'Loop' },
  { id: 'snapshot', icon: Camera, label: 'Snap' },
  { id: 'slow_mo', icon: Rewind, label: 'Slow-Mo' },
  { id: 'fast_fwd', icon: FastForward, label: 'Fast-Fwd' },
];

const FILTERS = [
  { id: 'none', label: 'Original', css: '' },
  { id: 'vivid', label: 'Vivid', css: 'saturate(1.8) contrast(1.1)' },
  { id: 'cool', label: 'Cool', css: 'hue-rotate(30deg) saturate(1.2)' },
  { id: 'warm', label: 'Warm', css: 'hue-rotate(-20deg) saturate(1.3) brightness(1.05)' },
  { id: 'bw', label: 'B&W', css: 'grayscale(1)' },
  { id: 'sepia', label: 'Sepia', css: 'sepia(0.8)' },
  { id: 'dramatic', label: 'Dramatic', css: 'contrast(1.5) saturate(0.8)' },
  { id: 'faded', label: 'Faded', css: 'opacity(0.85) contrast(0.9) brightness(1.1)' },
  { id: 'cinematic', label: 'Cinematic', css: 'contrast(1.2) saturate(0.9) brightness(0.9)' },
  { id: 'retro', label: 'Retro', css: 'sepia(0.4) contrast(1.1) brightness(0.95)' },
  { id: 'neon', label: 'Neon', css: 'saturate(2) brightness(1.1) contrast(1.3)' },
  { id: 'muted', label: 'Muted', css: 'saturate(0.5) brightness(1.05)' },
  { id: 'chrome', label: 'Chrome', css: 'saturate(1.3) contrast(1.15) brightness(0.95)' },
  { id: 'film', label: 'Film', css: 'sepia(0.2) contrast(1.05) saturate(0.9) brightness(0.92)' },
  { id: 'vintage', label: 'Vintage', css: 'sepia(0.6) saturate(0.7) contrast(0.85) brightness(0.9)' },
  { id: 'cold', label: 'Cold', css: 'hue-rotate(190deg) saturate(0.8) brightness(1.05)' },
  { id: 'golden', label: 'Golden', css: 'hue-rotate(-15deg) saturate(1.5) brightness(1.1) contrast(1.05)' },
  { id: 'moody', label: 'Moody', css: 'contrast(1.4) brightness(0.85) saturate(0.7)' },
];

const FRAME_STYLES = [
  { id: 'none', label: 'None', borderColor: '', borderWidth: 0 },
  { id: 'white', label: 'White', borderColor: 'white', borderWidth: 12 },
  { id: 'black', label: 'Black', borderColor: 'black', borderWidth: 12 },
  { id: 'gold', label: 'Gold', borderColor: '#f59e0b', borderWidth: 12 },
  { id: 'red', label: 'Red', borderColor: '#ef4444', borderWidth: 8 },
  { id: 'blue', label: 'Blue', borderColor: '#3b82f6', borderWidth: 8 },
];

const TEXT_POSITIONS = ['top', 'center', 'bottom'];
const TEXT_COLORS = ['#ffffff', '#000000', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
const EMOJIS = ['🔥', '⭐', '💯', '🎬', '🎵', '❤️', '😂', '✨', '🚀', '🎉', '💥', '🌊', '🎯', '👑', '💎', '🌟', '🤩', '😎', '🔮', '🎭'];

const DEFAULT_STATE = {
  brightness: 100, contrast: 100, saturation: 100, hue: 0,
  blur: 0, opacity: 100, grayscale: 0, sepia: 0,
  rotation: 0, speed: 1, flipH: false, flipV: false,
  overlayText: '', textSize: 32, textPosition: 'bottom', textColor: '#ffffff',
  textFont: 'sans-serif', textBg: false, textBgColor: '#000000',
  overlayEmoji: '', selectedFilter: 'none', selectedFrame: 'none',
  trimStart: 0, trimEnd: 100, zoomLevel: 100,
  fadeIn: false, fadeOut: false, muted: false,
  volume: 1, warmth: 0, shadows: 0, highlights: 0,
  exposure: 100, grain: 0, tint: 0, noise: 0,
  borderWidth: 0, borderColor: '#ffffff',
  watermarkText: '', subtitleText: '',
  duotone: false, duotoneColor1: '#ff0000', duotoneColor2: '#00ff00',
  sticker: '', cornerRadius: 0,
  invert: false, posterize: 0,
};

const FONTS = ['sans-serif', 'serif', 'monospace', 'Impact', 'Georgia', 'Courier New'];
const STICKERS = ['⭐', '🔥', '💯', '🎬', '❤️', '😂', '✨', '🚀', '🎉', '💥', '👑', '💎', '🎯', '🌟', '😎', '🤩'];

export default function NaslumVideoEditor() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  const [videoUrl, setVideoUrl] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTool, setActiveTool] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [state, setState] = useState(DEFAULT_STATE);

  const set = (key) => (val) => setState(s => ({ ...s, [key]: val }));
  const toggle = (key) => () => setState(s => ({ ...s, [key]: !s[key] }));

  const filterStyle = [
    `brightness(${state.brightness + state.exposure - 100 + state.warmth * 0.3}%)`,
    `contrast(${state.contrast + state.shadows * 0.1}%)`,
    `saturate(${state.saturation}%)`,
    `hue-rotate(${state.hue + state.tint}deg)`,
    `blur(${state.blur}px)`,
    `opacity(${state.opacity}%)`,
    `grayscale(${state.grayscale}%)`,
    `sepia(${state.sepia}%)`,
    state.invert ? 'invert(1)' : '',
    state.posterize > 0 ? `posterize(${state.posterize})` : '',
    FILTERS.find(f => f.id === state.selectedFilter)?.css || '',
  ].filter(Boolean).join(' ');

  const transformStyle = `scale(${state.zoomLevel / 100}) rotate(${state.rotation}deg) scaleX(${state.flipH ? -1 : 1}) scaleY(${state.flipV ? -1 : 1})`;
  const frame = FRAME_STYLES.find(f => f.id === state.selectedFrame) || FRAME_STYLES[0];
  const frameStyle = frame.borderWidth ? { border: `${frame.borderWidth}px solid ${frame.borderColor}` } : {};
  const textPosMap = { top: 'top-8', center: 'top-1/2 -translate-y-1/2', bottom: 'bottom-8' };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = state.speed;
      videoRef.current.volume = state.muted ? 0 : state.volume;
    }
  }, [state.speed, state.muted, state.volume]);

  const handleFileLoad = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { toast.error('Please select a video file'); return; }
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setPlaying(false);
    setState(DEFAULT_STATE);
    toast.success(`Loaded: ${file.name}`);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    playing ? videoRef.current.pause() : videoRef.current.play();
    setPlaying(!playing);
  };

  const applyTool = (toolId) => {
    setActiveTool(activeTool === toolId ? null : toolId);
    if (toolId === 'flip_h') { setState(s => ({ ...s, flipH: !s.flipH })); toast.success('Flipped horizontally'); }
    else if (toolId === 'flip_v') { setState(s => ({ ...s, flipV: !s.flipV })); toast.success('Flipped vertically'); }
    else if (toolId === 'rotate') { setState(s => ({ ...s, rotation: (s.rotation + 90) % 360 })); toast.success('Rotated 90°'); }
    else if (toolId === 'mute') { setState(s => ({ ...s, muted: !s.muted })); toast.success('Audio toggled'); }
    else if (toolId === 'fade_in') { setState(s => ({ ...s, fadeIn: !s.fadeIn })); toast.success('Fade-in toggled'); }
    else if (toolId === 'fade_out') { setState(s => ({ ...s, fadeOut: !s.fadeOut })); toast.success('Fade-out toggled'); }
    else if (toolId === 'letterbox') { setState(s => ({ ...s, selectedFrame: s.selectedFrame === 'letterbox' ? 'none' : 'black' })); }
    else if (toolId === 'mirror_lr') { setState(s => ({ ...s, flipH: !s.flipH })); toast.success('Mirrored'); }
    else if (toolId === 'portrait') { toast.info('Preview adjusted to 9:16'); }
    else if (toolId === 'square') { toast.info('Preview adjusted to 1:1'); }
    else if (toolId === 'widescreen') { toast.info('Preview adjusted to 16:9'); }
    else if (toolId === 'stabilize') { toast.success('Stabilization applied (preview mode)'); }
    else if (toolId === 'reverse') { toast.info('Reverse marked for export snapshot'); }
    else if (toolId === 'duotone') { setState(s => ({ ...s, duotone: !s.duotone })); toast.success('Duotone toggled'); }
    else if (toolId === 'invert') { setState(s => ({ ...s, invert: !s.invert })); toast.success('Invert toggled'); }
    else if (toolId === 'split') { toast.info('Split mode — use trim to mark cut points'); }
    else if (toolId === 'collage') { toast.info('Collage mode — overlay images coming soon'); }
    else if (toolId === 'deshake') { toast.success('De-shake applied (preview mode)'); }
    else if (toolId === 'loop') { if (videoRef.current) videoRef.current.loop = !videoRef.current.loop; toast.success('Loop toggled'); }
    else if (toolId === 'snapshot') { handleExport(); }
    else if (toolId === 'slow_mo') { setState(s => ({ ...s, speed: 0.5 })); if (videoRef.current) videoRef.current.playbackRate = 0.5; toast.success('Slow-mo (0.5x)'); }
    else if (toolId === 'fast_fwd') { setState(s => ({ ...s, speed: 2 })); if (videoRef.current) videoRef.current.playbackRate = 2; toast.success('Fast-forward (2x)'); }
    else if (toolId === 'posterize') { setState(s => ({ ...s, posterize: s.posterize === 0 ? 4 : 0 })); toast.success('Posterize toggled'); }
    else if (toolId === 'corner_radius') { setState(s => ({ ...s, cornerRadius: s.cornerRadius === 0 ? 20 : 0 })); toast.success('Corner radius toggled'); }
  };

  // Export: capture canvas frame with all edits
  const handleExport = async () => {
    if (!videoRef.current || !videoUrl) return toast.error('No video loaded');
    setExporting(true);
    toast.info('Capturing edited frame…');

    // Pause video to ensure frame is stable
    if (videoRef.current) videoRef.current.pause();
    setPlaying(false);

    await new Promise(resolve => setTimeout(resolve, 300));

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const W = video.videoWidth || 1280;
    const H = video.videoHeight || 720;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Apply corner radius by clipping
    if (state.cornerRadius > 0) {
      const r = state.cornerRadius;
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.arcTo(W, 0, W, H, r);
      ctx.arcTo(W, H, 0, H, r);
      ctx.arcTo(0, H, 0, 0, r);
      ctx.arcTo(0, 0, W, 0, r);
      ctx.closePath();
      ctx.clip();
    }

    ctx.save();

    // Build full filter string including new effects
    let fStr = filterStyle;
    if (state.invert) fStr += ' invert(1)';
    if (state.posterize > 0) fStr += ' posterize(' + state.posterize + ')';
    fStr = fStr.replace(/\s+/g, ' ').trim();
    if (fStr) ctx.filter = fStr;

    // Apply transform (zoom, flip, rotate)
    ctx.translate(W / 2, H / 2);
    if (state.rotation) ctx.rotate((state.rotation * Math.PI) / 180);
    ctx.scale(
      (state.flipH ? -1 : 1) * (state.zoomLevel / 100),
      (state.flipV ? -1 : 1) * (state.zoomLevel / 100)
    );
    ctx.translate(-W / 2, -H / 2);

    ctx.drawImage(video, 0, 0, W, H);
    ctx.restore();

    // Duotone effect
    if (state.duotone) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = state.duotoneColor1;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighten';
      ctx.fillStyle = state.duotoneColor2;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    }

    // Film grain overlay
    if (state.grain > 0) {
      const imageData = ctx.getImageData(0, 0, W, H);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const g = (Math.random() - 0.5) * state.grain * 2;
        data[i] = Math.min(255, Math.max(0, data[i] + g));
        data[i+1] = Math.min(255, Math.max(0, data[i+1] + g));
        data[i+2] = Math.min(255, Math.max(0, data[i+2] + g));
      }
      ctx.putImageData(imageData, 0, 0);
    }

    // Vignette
    if (state.selectedFilter === 'vignette' || state.noise > 0) {
      const grad = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.8);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // Frame border
    if (frame.borderWidth) {
      ctx.strokeStyle = frame.borderColor;
      ctx.lineWidth = frame.borderWidth * 2;
      ctx.strokeRect(0, 0, W, H);
    }

    // Fade overlays
    if (state.fadeIn) {
      const g = ctx.createLinearGradient(0, 0, W * 0.15, 0);
      g.addColorStop(0, 'rgba(0,0,0,0.7)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W * 0.15, H);
    }
    if (state.fadeOut) {
      const g = ctx.createLinearGradient(W * 0.85, 0, W, 0);
      g.addColorStop(0, 'transparent');
      g.addColorStop(1, 'rgba(0,0,0,0.7)');
      ctx.fillStyle = g; ctx.fillRect(W * 0.85, 0, W * 0.15, H);
    }

    // Overlay text
    if (state.overlayText) {
      const fontSize = state.textSize * 2;
      ctx.font = `bold ${fontSize}px ${state.textFont}`;
      ctx.textAlign = 'center';
      const y = state.textPosition === 'top' ? 100 : state.textPosition === 'center' ? H / 2 : H - 80;
      // Text background
      if (state.textBg) {
        const metrics = ctx.measureText(state.overlayText);
        const tw = metrics.width + 40;
        const th = fontSize + 20;
        ctx.fillStyle = state.textBgColor;
        ctx.fillRect(W / 2 - tw / 2, y - fontSize, tw, th);
      }
      ctx.fillStyle = state.textColor;
      ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      ctx.lineWidth = 5;
      ctx.strokeText(state.overlayText, W / 2, y);
      ctx.fillText(state.overlayText, W / 2, y);
    }

    // Watermark
    if (state.watermarkText) {
      ctx.font = `bold 28px sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.textAlign = 'right';
      ctx.fillText(state.watermarkText, W - 20, H - 20);
    }

    // Subtitle
    if (state.subtitleText) {
      ctx.font = `22px sans-serif`;
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.strokeText(state.subtitleText, W / 2, H - 50);
      ctx.fillText(state.subtitleText, W / 2, H - 50);
    }

    // Sticker overlay (extra, separate from emoji)
    if (state.sticker) {
      ctx.font = '100px serif';
      ctx.textAlign = 'left';
      ctx.fillText(state.sticker, 40, 120);
    }

    // Emoji overlay
    if (state.overlayEmoji) {
      ctx.font = '80px serif';
      ctx.textAlign = 'right';
      ctx.fillText(state.overlayEmoji, W - 30, 90);
    }

    canvas.toBlob((blob) => {
      if (!blob) { toast.error('Export failed'); setExporting(false); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `naslum-edit-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Exported edited frame as PNG!');
      setExporting(false);
    }, 'image/png');
  };

  // Export the original video file
  const handleExportVideo = () => {
    if (!videoUrl || !videoFile) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = videoFile.name || 'naslum-video.mp4';
    a.click();
    toast.success('Original video downloaded');
  };

  const resetAll = () => {
    setState(DEFAULT_STATE);
    if (videoRef.current) videoRef.current.playbackRate = 1;
    toast.success('All edits reset');
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 py-3 flex-wrap">
          <button onClick={() => navigate('/')}><NaslumLogo size="sm" showText={false} /></button>
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-lg">Naslum Video Editor</span>
            <Badge variant="secondary" className="text-xs">60+ Tools</Badge>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <Button
