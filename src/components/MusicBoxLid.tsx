import React from 'react';
import { Play, Pause, RotateCw, Eye, Sparkles, Volume2, ShieldAlert } from 'lucide-react';
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
      className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-xl text-stone-200"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Physical Lid Mechanism Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              id="btn-toggle-lid"
              onClick={onToggleLid}
              className={`relative px-5 py-3 rounded-lg font-bold text-sm tracking-wide transition-all shadow-lg flex items-center gap-3 border ${
                isClosed
                  ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 border-amber-400 shadow-amber-900/40'
                  : 'bg-stone-800 hover:bg-stone-700 text-amber-400 border-amber-600/60 shadow-black/60'
              }`}
              title={isClosed ? 'Click to Open Box Lid (Pauses Music Box)' : 'Click to Shut Box Lid (Starts Music Box)'}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full transition-colors ${
                  isClosed ? 'bg-amber-200 animate-pulse' : 'bg-stone-600'
                }`}
              />
              <span className="uppercase font-mono text-xs tracking-wider">
                {isClosed ? 'Lid Shut (Playing Music Box)' : 'Lid Open (Diorama Setup)'}
              </span>
            </button>
          </div>

          <div>
            <div className="text-xs font-mono text-stone-400 flex items-center gap-2">
              <span>MECHANISM:</span>
              <span className={`font-bold ${isClosed ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isClosed ? 'LATCH ENGAGED · GEARS CYCLING' : 'SPRING PAUSED · READY'}
              </span>
            </div>
            <div className="text-sm font-semibold text-stone-100 flex items-center gap-2 mt-0.5">
              <span>{songTitle}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-stone-800 text-amber-300 font-mono border border-stone-700">
                {bpm} BPM
              </span>
            </div>
          </div>
        </div>

        {/* Center: Wind-up Key & Spring Tension */}
        <div className="flex items-center gap-4 bg-stone-950/80 px-4 py-2.5 rounded-lg border border-stone-800/80">
          <div className="text-right">
            <div className="text-[11px] font-mono text-stone-400 uppercase">Clockwork Spring</div>
            <div className="text-xs font-bold text-amber-400 font-mono">{springTension}% Tension</div>
          </div>

          <div className="w-24 bg-stone-800 h-2 rounded-full overflow-hidden border border-stone-700">
            <div
              className={`h-full transition-all duration-300 ${
                springTension > 40 ? 'bg-amber-500' : springTension > 15 ? 'bg-orange-500' : 'bg-red-500'
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
            className="p-2 rounded-lg bg-amber-900/30 hover:bg-amber-900/60 text-amber-400 border border-amber-700/50 hover:border-amber-500 transition-all flex items-center gap-1 text-xs font-medium"
            title="Wind up the music box mechanical spring key"
          >
            <RotateCw className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span>Wind Key</span>
          </button>
        </div>

        {/* Right: Peek Hole & Controls */}
        <div className="flex items-center gap-2">
          {isClosed && (
            <button
              id="btn-peek-diorama"
              onClick={onTogglePeek}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                peekDioramaWhileClosed
                  ? 'bg-amber-950/70 border-amber-600 text-amber-300'
                  : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:text-stone-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{peekDioramaWhileClosed ? 'Diorama Peep-Hole: ON' : 'Look Through Peep-Hole'}</span>
            </button>
          )}

          <div className="text-right pl-2 hidden sm:block">
            <span className="text-[11px] font-mono text-stone-400 block">DOCKS OCCUPIED</span>
            <span className="text-xs font-bold text-amber-400 font-mono">{activeDocksCount} / 5 Figurine(s)</span>
          </div>
        </div>
      </div>

      {/* Reminder Banner for Physical Toy Concept */}
      <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
        <span className="flex items-center gap-1.5 text-stone-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong>Toy Music Box Rule:</strong> The song performs when the wooden lid is{' '}
            <strong className="text-amber-400">shut</strong>. Dock figurines around the campfire below, then shut the lid
            to hear their collective composition!
          </span>
        </span>
        <span className="text-stone-400 font-mono text-[11px] hidden lg:inline">5 Personas · Campfire Wild West Band</span>
      </div>
    </div>
  );
};
