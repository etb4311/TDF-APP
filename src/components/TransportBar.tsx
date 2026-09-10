import React from 'react';
import {
  Play,
  Square,
  Volume2,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Visualizer } from './Visualizer';

interface TransportBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  bpm: number;
  onBpmChange: (newBpm: number) => void;
  currentStep: number;
  swingPercent: number;
  onSwingChange: (swing: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  filterCutoff: number;
  onFilterChange: (cutoff: number) => void;
  delayAmount: number;
  onDelayChange: (delay: number) => void;
  isRecording: boolean;
}

export const TransportBar: React.FC<TransportBarProps> = ({
  isPlaying,
  onTogglePlay,
  onStop,
  bpm,
  onBpmChange,
  currentStep,
  swingPercent,
  onSwingChange,
  volume,
  onVolumeChange,
  filterCutoff,
  onFilterChange,
  delayAmount,
  onDelayChange,
}) => {
  const currentBar = Math.floor(currentStep / 4) + 1;
  const currentBeat = (currentStep % 4) + 1;
  const current16th = (currentStep % 4) + 1;

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Playback Controls & Counter */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium shadow-sm transition-all duration-75 ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-2 ring-amber-400/50'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 ring-1 ring-cyan-400/30'
            }`}
            title={isPlaying ? 'Pause playback (Space)' : 'Start playback (Space)'}
          >
            {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={onStop}
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-750 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            title="Stop and return to step 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Time Position Display */}
          <div className="bg-slate-950 border border-slate-800 rounded-md px-3 py-1 font-mono text-xs flex items-center gap-2">
            <span className="text-slate-500">POS</span>
            <span className="text-cyan-400 font-semibold tracking-wider">
              {currentBar} : {currentBeat} : {current16th}
            </span>
            <span className="text-[10px] text-slate-500 border-l border-slate-800 pl-2">
              STEP {currentStep + 1}/16
            </span>
          </div>
        </div>

        {/* BPM and Groove Controls */}
        <div className="flex items-center gap-4 text-xs">
          {/* BPM */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1">
            <span className="text-slate-400 font-mono">BPM</span>
            <button
              onClick={() => onBpmChange(Math.max(60, bpm - 2))}
              className="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold"
            >
              -
            </button>
            <span className="font-mono text-slate-200 w-8 text-center font-semibold">
              {bpm}
            </span>
            <button
              onClick={() => onBpmChange(Math.min(180, bpm + 2))}
              className="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold"
            >
              +
            </button>
          </div>

          {/* Swing Control */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
            <span className="text-slate-400">Swing:</span>
            <input
              type="range"
              min="0"
              max="75"
              step="5"
              value={swingPercent}
              onChange={(e) => onSwingChange(Number(e.target.value))}
              className="w-16 accent-amber-400 h-1 cursor-pointer"
            />
            <span className="font-mono text-slate-300 w-7 text-right">{swingPercent}%</span>
          </div>
        </div>

        {/* Real-time Spectrum Visualizer */}
        <div className="hidden lg:flex items-center">
          <Visualizer isPlaying={isPlaying} />
        </div>

        {/* Master Sound FX Sliders (Filter, Delay, Master Vol) */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          {/* Master Filter */}
          <div className="hidden md:flex items-center gap-1.5" title="Master Lowpass Filter Cutoff">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Cutoff</span>
            <input
              type="range"
              min="300"
              max="16000"
              step="200"
              value={filterCutoff}
              onChange={(e) => onFilterChange(Number(e.target.value))}
              className="w-18 accent-cyan-400 h-1 cursor-pointer"
            />
          </div>

          {/* Master Delay Mix */}
          <div className="hidden xl:flex items-center gap-1.5" title="Stereo Delay Send">
            <span>Echo</span>
            <input
              type="range"
              min="0"
              max="0.6"
              step="0.05"
              value={delayAmount}
              onChange={(e) => onDelayChange(Number(e.target.value))}
              className="w-16 accent-cyan-400 h-1 cursor-pointer"
            />
          </div>

          {/* Master Volume */}
          <div className="flex items-center gap-2" title="Master Output Volume">
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-16 sm:w-20 accent-emerald-400 h-1 cursor-pointer"
            />
            <span className="font-mono text-[11px] text-slate-400 w-7">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
