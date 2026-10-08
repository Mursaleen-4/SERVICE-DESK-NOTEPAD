import React, { useState, useEffect } from 'react';
import {
  Headphones,
  Plus,
  RefreshCw,
  Download,
  Film,
  Database,
  Clock,
  UserCheck,
  UserX
} from 'lucide-react';

export default function Header({
  dbStatus,
  onOpenNewCall,
  onRefresh,
  onOpenVideoSettings,
  onExportCSV,
  isRefreshing,
  officers = [],
  currentOfficer = null,
  onSelectOfficer
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="w-full bg-[#0b0e14]/90 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-30 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Officer Identification Dropdown (replacing static text) */}
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-sky-400 shadow-sm flex-shrink-0">
            <Headphones className="w-5 h-5 text-sky-400" />
          </div>
          <div className="flex flex-col min-w-[240px]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                OFFICER:
              </span>
              <select
                value={currentOfficer ? currentOfficer.email : ''}
                onChange={(e) => onSelectOfficer(e.target.value)}
                className={`px-2 py-0.5 rounded text-xs font-bold font-mono tracking-wide cursor-pointer focus:outline-none transition-colors ${
                  currentOfficer
                    ? 'bg-zinc-900 border border-sky-600/70 text-sky-300'
                    : 'bg-zinc-900 border border-amber-600 text-amber-300 animate-pulse'
                }`}
              >
                <option value="" disabled className="bg-zinc-900 text-slate-400">
                  -- CHOOSE YOUR NAME --
                </option>
                {officers.map((off) => (
                  <option key={off.email} value={off.email} className="bg-zinc-900 text-slate-200">
                    {off.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-1.5">
              {currentOfficer ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  <span className="text-slate-300">{currentOfficer.email}</span>
                </>
              ) : (
                <span className="text-amber-400/90 text-[10px]">
                  Please select your name to activate session & email
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Live Digital Clock & MongoDB Atlas Connection Status */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-center">
          {/* Atlas Connection Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900/90 border border-zinc-800 text-xs font-mono">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 hidden sm:inline">ATLAS:</span>
            {dbStatus?.connected ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE (Cluster0)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                CONNECTING...
              </span>
            )}
          </div>

          {/* Real-time Clock */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-slate-200">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold tracking-wider">{formattedTime}</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">{formattedDate}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh database records"
            className="p-2 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          {/* Video BG Settings Button */}
          <button
            onClick={onOpenVideoSettings}
            title="Background Video Controls"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Film className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Video BG</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            title="Export calls to CSV"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Log Call Button */}
          <button
            onClick={onOpenNewCall}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold tracking-wide transition-colors shadow-sm cursor-pointer border border-sky-400/40"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>LOG CALL</span>
          </button>
        </div>
      </div>
    </header>
  );
}
