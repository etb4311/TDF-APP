import React from 'react';
import { Volume2, VolumeX, Flame, Music, Sparkles, HelpCircle } from 'lucide-react';

interface MusicBoxHeaderProps {
  masterVolume: number;
  campfireEmbersActive: boolean;
  onVolumeChange: (vol: number) => void;
  onToggleCampfireEmbers: () => void;
  onOpenInfo: () => void;
}

export const MusicBoxHeader: React.FC<MusicBoxHeaderProps> = ({
  masterVolume,
  campfireEmbersActive,
  onVolumeChange,
  onToggleCampfireEmbers,
  onOpenInfo,
}) => {
  return (
    <header
      id="music-box-top-header"
      className="bg-[#19130d] border-b border-stone-800/90 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-stone-200"
    >
      {/* Brand & Concept Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-xl shadow-lg border border-amber-500/50">
          🪵
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-amber-100 tracking-tight font-serif">
              Campfire Music Box
            </h1>
            <span className="text-[10px] font-mono uppercase bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
              Toy Prototyping Lab
            </span>
          </div>
          <p className="text-xs text-stone-400">
            5 Animal Personas · Wild West Folk Band · Physical Digital Music Box Simulator
          </p>
        </div>
      </div>

      {/* Audio & Ambience Controls */}
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        {/* Campfire Ambience Toggle */}
        <button
          onClick={onToggleCampfireEmbers}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
            campfireEmbersActive
              ? 'bg-amber-950/80 border-amber-600 text-amber-300 shadow-sm'
              : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
          }`}
          title="Toggle ambient background campfire embers & night sounds"
        >
          <Flame className={`w-3.5 h-3.5 ${campfireEmbersActive ? 'text-amber-400 animate-pulse' : ''}`} />
          <span>{campfireEmbersActive ? 'Embers: Active' : 'Embers: Off'}</span>
        </button>

        {/* Master Volume Slider */}
        <div className="flex items-center gap-2 bg-stone-900/80 px-3 py-1.5 rounded-lg border border-stone-800">
          <button
            onClick={() => onVolumeChange(masterVolume > 0 ? 0 : 0.8)}
            className="text-stone-400 hover:text-stone-200 transition-colors"
          >
            {masterVolume > 0 ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={masterVolume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-16 sm:w-20 accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            title={`Volume: ${Math.round(masterVolume * 100)}%`}
          />
        </div>

        {/* Info / Concept Modal Toggle */}
        <button
          onClick={onOpenInfo}
          className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-amber-300 border border-stone-800 transition-colors"
          title="Music Box Concept & Figurine Guide"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
