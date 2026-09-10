import React from 'react';
import { ChordValue } from '../types/music';

interface DrumPadsProps {
  onTriggerDrum: (type: 'kick' | 'snare' | 'hihat' | 'perc') => void;
  onTriggerChord: (chord: ChordValue) => void;
  chords: ChordValue[];
}

export const DrumPads: React.FC<DrumPadsProps> = ({
  onTriggerDrum,
  onTriggerChord,
  chords,
}) => {
  const drumPads = [
    { type: 'kick' as const, label: 'Kick Drum', sub: 'Sub Punch' },
    { type: 'snare' as const, label: 'Snare Drum', sub: 'Crisp Clap' },
    { type: 'hihat' as const, label: 'Closed Hat', sub: 'Metallic' },
    { type: 'perc' as const, label: 'Perc / Rim', sub: 'Tonal Pop' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* 4 Drum Trigger Pads */}
      {drumPads.map((pad) => (
        <button
          key={pad.type}
          onClick={() => onTriggerDrum(pad.type)}
          className="h-20 bg-slate-950 hover:bg-slate-850 active:scale-[0.98] border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3 text-left transition-all duration-75 flex flex-col justify-between group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="w-2 h-2 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
            <span className="text-[10px] font-mono text-slate-500 uppercase">PAD</span>
          </div>
          <div>
            <div className="font-semibold text-xs text-slate-100 group-hover:text-cyan-300">
              {pad.label}
            </div>
            <div className="text-[10px] text-slate-500">{pad.sub}</div>
          </div>
        </button>
      ))}

      {/* 4 Chord Harmonic Trigger Pads */}
      {chords.slice(0, 4).map((chord, idx) => (
        <button
          key={idx}
          onClick={() => onTriggerChord(chord)}
          className="h-20 bg-slate-950 hover:bg-slate-850 active:scale-[0.98] border border-slate-800 hover:border-amber-500/50 rounded-xl p-3 text-left transition-all duration-75 flex flex-col justify-between group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="w-2 h-2 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
            <span className="text-[10px] font-mono text-amber-400/80 font-bold">
              {chord.roman}
            </span>
          </div>
          <div>
            <div className="font-semibold text-xs text-slate-100 group-hover:text-amber-300">
              {chord.root}{chord.quality}
            </div>
            <div className="text-[10px] text-slate-500">Chord Stab</div>
          </div>
        </button>
      ))}
    </div>
  );
};
