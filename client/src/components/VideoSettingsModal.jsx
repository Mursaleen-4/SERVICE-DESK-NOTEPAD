import React from 'react';
import { X, Film, Play, Pause, Sliders, Check } from 'lucide-react';

export default function VideoSettingsModal({
  isOpen,
  onClose,
  videoTheme,
  setVideoTheme,
  opacity,
  setOpacity,
  isPlaying,
  setIsPlaying,
}) {
  if (!isOpen) return null;

  const presets = [
    {
      id: 'ambient',
      name: 'Deep Ambient Ocean (HD)',
      desc: 'High-definition relaxing deep ocean current loop',
    },
    {
      id: 'jellyfish',
      name: 'Bioluminescent 1080p',
      desc: 'Ultra-crisp 1080p atmospheric bioluminescence',
    },
    {
      id: 'cyber-canvas',
      name: 'Tactical Cyber Telemetry',
      desc: 'Real-time 60fps operations network node grid (zero bandwidth)',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-xl bg-[#0c1017] border border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-sky-400">
              <Film className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                HD Video Background Settings
              </h2>
              <p className="text-xs text-slate-400">
                Customize live ambient background & opacity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Section 1: Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Select Background Video
            </label>
            <div className="space-y-2">
              {presets.map((p) => {
                const isSelected = videoTheme === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setVideoTheme(p.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-zinc-900 border-sky-500 text-white'
                        : 'bg-zinc-950/60 border-zinc-800 text-slate-300 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-100 flex items-center gap-2">
                        <span>{p.name}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{p.desc}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Playback & Opacity Controls */}
          <div className="space-y-3 pt-2 border-t border-zinc-800">
            {/* Play/Pause toggle */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-400" /> Video Playback
              </span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold cursor-pointer border transition-colors ${
                  isPlaying
                    ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
                    : 'bg-zinc-800 border-zinc-700 text-slate-300'
                }`}
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isPlaying ? 'Playing' : 'Paused'}</span>
              </button>
            </div>

            {/* Dark Overlay Opacity Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-300 font-medium">Dark Contrast Overlay</span>
                <span className="font-mono text-sky-400 font-bold">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.95"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>More Transparent</span>
                <span>Darker / High Contrast</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 flex items-center justify-end bg-zinc-950/60">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
