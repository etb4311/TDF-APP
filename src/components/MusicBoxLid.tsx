import React from 'react';
import { RotateCw, Eye, Sparkles } from 'lucide-react';
import { folkAudio } from '../utils/folkAudioEngine';

interface MusicBoxLidProps {
  lidState: 'open' | 'closed';
  isPlaying: boolean;
  springTension: number;
  peekDioramaWhileClosed: boolean;
  activeDocksCount: number;
  songTitle: string;
  bpm: number;
  onToggleLid: () => void;
  onWindSpring: () => void;
  onTogglePeek: () => void;
}

export const MusicBoxLid: React.FC<MusicBoxLidProps> = ({
  lidState,
  isPlaying,
  springTension,
  peekDioramaWhileClosed,
  activeDocksCount,
  songTitle,
  bpm,
  onToggleLid,
  onWindSpring,
  onTogglePeek,
}) => {
  const isClosed = lidState === 'closed';

  return (
    <div
      id="music-box-lid-controller"
      className="bg-[#fefae0] border-4 border-[#bc6c25] rounded-[2rem] p-4 sm:p-5 shadow-[0_6px_0_#936639] text-[#382c26] relative overflow-hidden"
    >
      {/* Decorative Wooden Planks & Rivets */}
      <div className="absolute top-2 left-6 right-6 flex justify-between pointer-events-none opacity-30">
        <span className="w-2.5 h-2.5 rounded-full bg-[#6f4518] shadow-inner" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#6f4518] shadow-inner" />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Physical Lid Latch Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full md:w-auto">
          <button
            id="btn-toggle-lid"
            onClick={onToggleLid}
            className={`ac-btn px-6 py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all flex items-center gap-3 border-2 ${
              isClosed
                ? 'bg-[#e76f51] border-[#bc4749] text-white shadow-[0_4px_0_#bc4749]'
                : 'bg-[#588157] border-[#3a5a40] text-[#fefae0] shadow-[0_4px_0_#3a5a40]'
            }`}
            title={isClosed ? 'Click to Open Box Lid (Pauses Music Box)' : 'Click to Shut Box Lid (Starts Music Box)'}
          >
            <span className="text-xl">{isClosed ? '🔒' : '🔓'}</span>
            <span className="uppercase tracking-wider font-extrabold text-xs sm:text-sm">
              {isClosed ? 'Lid Shut (Song Playing!)' : 'Lid Open (Arrange Figurines)'}
            </span>
          </button>

          <div className="text-center sm:text-left">
            <div className="text-xs font-bold text-[#606c38] flex items-center justify-center sm:justify-start gap-1.5">
              <span>{isClosed ? '✨ GEARS SPINNING' : '🍃 CLOCKWORK RESTING'}</span>
            </div>
            <div className="text-base font-extrabold text-[#382c26] flex items-center justify-center sm:justify-start gap-2 mt-0.5">
              <span>{songTitle}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#faedcd] text-[#bc6c25] font-black border border-[#d4a373]">
                {bpm} BPM
              </span>
            </div>
          </div>
        </div>

        {/* Center: Tactile Wind-Up Spring Key */}
        <div className="flex items-center gap-3 bg-[#faedcd] px-4 py-2.5 rounded-2xl border-2 border-[#d4a373] shadow-inner">
          <div className="text-right">
            <div className="text-[11px] font-bold text-[#7f4f24] uppercase">Spring Key</div>
            <div className="text-xs font-black text-[#bc6c25]">{springTension}% Wound</div>
          </div>

          <div className="w-20 sm:w-28 bg-[#d4a373]/40 h-3 rounded-full overflow-hidden border border-[#bc6c25]/40 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                springTension > 40 ? 'bg-[#588157]' : springTension > 15 ? 'bg-[#fca311]' : 'bg-[#e76f51]'
              }`}
              style={{ width: `${springTension}%` }}
            />
          </div>

          <button
            id="btn-wind-spring"
            onClick={() => {
              folkAudio.playRatchetClick();
              onWindSpring();
            }}
            className="ac-btn px-3 py-1.5 rounded-xl bg-[#bc6c25] border-2 border-[#8c5825] text-[#fefae0] text-xs font-black flex items-center gap-1.5 shadow-sm"
            title="Wind up the music box clockwork spring"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            <span>Wind</span>
          </button>
        </div>

        {/* Right: Peep-Hole & Figurines Count */}
        <div className="flex items-center gap-2">
          {isClosed && (
            <button
              id="btn-peek-diorama"
              onClick={onTogglePeek}
              className={`ac-btn px-3.5 py-2 rounded-xl text-xs font-black border-2 flex items-center gap-1.5 transition-all ${
                peekDioramaWhileClosed
                  ? 'bg-[#e9edc9] border-[#ccd5ae] text-[#3a5a40]'
                  : 'bg-[#faedcd] border-[#d4a373] text-[#7f4f24]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{peekDioramaWhileClosed ? 'Peep-Hole: Open' : 'Peep-Hole: Shut'}</span>
            </button>
          )}

          <div className="px-3.5 py-1.5 rounded-2xl bg-[#e9edc9] border border-[#ccd5ae] text-center">
            <span className="text-[10px] font-bold text-[#606c38] block uppercase">Campfire Docks</span>
            <span className="text-xs font-extrabold text-[#3a5a40]">{activeDocksCount} / 5 Seated</span>
          </div>
        </div>
      </div>

      {/* Cheerful Animal Crossing Style Instruction Strip */}
      <div className="mt-3.5 pt-2.5 border-t-2 border-[#ccd5ae] flex items-center justify-between text-xs text-[#606c38] font-medium">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#fca311] shrink-0" />
          <span>
            <strong>Toy Box Principle:</strong> The song plays when the wooden lid is{' '}
            <strong className="text-[#e76f51]">shut</strong>! Arrange your animal figurines on their log stumps, then shut
            the lid to let the folk band perform!
          </span>
        </span>
      </div>
    </div>
  );
};

