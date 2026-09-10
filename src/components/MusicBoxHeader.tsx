import React from 'react';
import { Volume2, VolumeX, Flame, Sparkles, BookOpen } from 'lucide-react';

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
      className="bg-[#fefae0] border-b-4 border-[#d4a373] px-4 sm:px-6 py-3 shadow-md text-[#382c26]"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Brand & Animal Crossing Style Title */}
        <div className="flex items-center gap-3">
          {/* Whimsical Leaf/Wood Token */}
          <div className="w-11 h-11 rounded-2xl bg-[#588157] border-2 border-[#3a5a40] flex items-center justify-center text-2xl shadow-[0_3px_0_#344e41] text-amber-100">
            🍃
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-[#344e41] tracking-tight">
                Campfire Music Box
              </h1>
              <span className="text-[11px] font-bold uppercase bg-[#e9edc9] text-[#3a5a40] px-2.5 py-0.5 rounded-full border border-[#ccd5ae] shadow-xs">
                Toy Workshop
              </span>
            </div>
            <p className="text-xs text-[#606c38] font-medium">
              5 Animal Figurines · Campfire Wild West Band · Physical Interaction Lab
            </p>
          </div>
        </div>

        {/* Audio & Ambience Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Campfire Ambience Toggle (Chunky 3D Button) */}
          <button
            onClick={onToggleCampfireEmbers}
            className={`ac-btn px-3 py-1.5 rounded-full text-xs font-bold border-2 flex items-center gap-1.5 ${
              campfireEmbersActive
                ? 'bg-[#e76f51] border-[#bc4749] text-white'
                : 'bg-[#faedcd] border-[#d4a373] text-[#7f4f24]'
            }`}
            title="Toggle ambient background campfire embers & night sounds"
          >
            <Flame className={`w-3.5 h-3.5 ${campfireEmbersActive ? 'text-amber-200 animate-bounce' : ''}`} />
            <span>{campfireEmbersActive ? 'Embers: On' : 'Embers: Off'}</span>
          </button>

          {/* Master Volume Slider (Cute Wooden Pod) */}
          <div className="flex items-center gap-2 bg-[#faedcd] px-3.5 py-1.5 rounded-full border-2 border-[#d4a373] shadow-inner">
            <button
              onClick={() => onVolumeChange(masterVolume > 0 ? 0 : 0.85)}
              className="text-[#7f4f24] hover:text-[#382c26] transition-transform active:scale-95"
            >
              {masterVolume > 0 ? <Volume2 className="w-4 h-4 text-[#e76f51]" /> : <VolumeX className="w-4 h-4 text-[#936639]" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-[#e76f51] h-2 bg-[#d4a373] rounded-full cursor-pointer"
              title={`Master Volume: ${Math.round(masterVolume * 100)}%`}
            />
          </div>

          {/* Guide / Field Guide Button */}
          <button
            onClick={onOpenInfo}
            className="ac-btn px-3 py-1.5 rounded-full bg-[#fca311] border-2 border-[#d48b04] text-[#382c26] text-xs font-bold flex items-center gap-1.5 shadow-sm"
            title="Music Box Field Guide & Rules"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Field Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
