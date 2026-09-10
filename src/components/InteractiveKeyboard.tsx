import React, { useState, useEffect, useCallback } from 'react';
import { midiToNoteName } from '../utils/musicTheory';

interface InteractiveKeyboardProps {
  onNoteOn: (midiNote: number, velocity?: number) => void;
  onNoteOff: (midiNote: number) => void;
  activeNotes: Set<number>;
  scaleNotes?: number[];
  chordNotes?: number[];
  startOctave?: number;
  octaveCount?: number;
}

const COMPUTER_KEY_MAP: Record<string, number> = {
  KeyA: 0,
  KeyW: 1,
  KeyS: 2,
  KeyE: 3,
  KeyD: 4,
  KeyF: 5,
  KeyT: 6,
  KeyG: 7,
  KeyY: 8,
  KeyH: 9,
  KeyU: 10,
  KeyJ: 11,
  KeyK: 12,
  KeyO: 13,
  KeyL: 14,
  KeyP: 15,
  Semicolon: 16,
};

export const InteractiveKeyboard: React.FC<InteractiveKeyboardProps> = ({
  onNoteOn,
  onNoteOff,
  activeNotes,
  scaleNotes = [],
  chordNotes = [],
  startOctave = 4,
}) => {
  const [octaveShift, setOctaveShift] = useState(0);
  const effectiveStartOctave = startOctave + octaveShift;
  const baseMidi = (effectiveStartOctave + 1) * 12;

  const isBlackKey = (noteIndex: number) => {
    const mod = noteIndex % 12;
    return [1, 3, 6, 8, 10].includes(mod);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'KeyZ') {
        setOctaveShift((prev) => Math.max(-2, prev - 1));
        return;
      }
      if (e.code === 'KeyX') {
        setOctaveShift((prev) => Math.min(2, prev + 1));
        return;
      }

      const offset = COMPUTER_KEY_MAP[e.code];
      if (offset !== undefined) {
        const note = baseMidi + offset;
        onNoteOn(note, 0.85);
      }
    },
    [baseMidi, onNoteOn]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const offset = COMPUTER_KEY_MAP[e.code];
      if (offset !== undefined) {
        const note = baseMidi + offset;
        onNoteOff(note);
      }
    },
    [baseMidi, onNoteOff]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const totalKeys = 25;
  const keys = Array.from({ length: totalKeys }, (_, i) => {
    const midi = baseMidi + i;
    const black = isBlackKey(i);
    const name = midiToNoteName(midi);
    const isActive = activeNotes.has(midi);
    const isScaleTone = scaleNotes.some((n) => n % 12 === midi % 12);
    const isChordTone = chordNotes.some((n) => n % 12 === midi % 12);

    let compKeyLabel = '';
    for (const [code, val] of Object.entries(COMPUTER_KEY_MAP)) {
      if (val === i) {
        compKeyLabel = code.replace('Key', '').replace('Semicolon', ';');
        break;
      }
    }

    return {
      midi,
      name,
      black,
      isActive,
      isScaleTone,
      isChordTone,
      compKeyLabel,
    };
  });

  return (
    <div className="flex flex-col select-none">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <div className="flex items-center gap-2">
          <span>Octave:</span>
          <button
            onClick={() => setOctaveShift((p) => Math.max(-2, p - 1))}
            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
            title="Shift octave down [Z]"
          >
            -
          </button>
          <span className="font-mono text-slate-200">C{effectiveStartOctave}</span>
          <button
            onClick={() => setOctaveShift((p) => Math.min(2, p + 1))}
            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
            title="Shift octave up [X]"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
            <span>Scale Tone</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span>Chord Tone</span>
          </span>
        </div>
      </div>

      <div className="relative flex h-36 bg-slate-950 p-2 rounded-xl border border-slate-800 overflow-x-auto">
        <div className="relative flex flex-1 h-full min-w-[500px]">
          {keys.map((k) => {
            if (k.black) {
              return (
                <button
                  key={k.midi}
                  onMouseDown={() => onNoteOn(k.midi, 0.85)}
                  onMouseUp={() => onNoteOff(k.midi)}
                  onMouseLeave={() => {
                    if (k.isActive) onNoteOff(k.midi);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    onNoteOn(k.midi, 0.85);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    onNoteOff(k.midi);
                  }}
                  className={`absolute z-10 w-7 h-20 -ml-3.5 rounded-b-md transition-all flex flex-col justify-between items-center pb-1 text-[10px] font-mono shadow-md ${
                    k.isActive
                      ? 'bg-cyan-400 text-slate-950 shadow-cyan-400/50'
                      : k.isChordTone
                      ? 'bg-amber-950 border border-amber-400/60 text-amber-300'
                      : 'bg-slate-900 hover:bg-slate-850 border border-slate-750 text-slate-400'
                  }`}
                  style={{
                    left: `${(keys.filter((item, idx) => !item.black && idx < keys.indexOf(k)).length) * (100 / 15)}%`,
                  }}
                >
                  <span className="text-[9px] opacity-70 mt-1">{k.compKeyLabel}</span>
                  {k.isScaleTone && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mb-0.5" />}
                </button>
              );
            }

            return (
              <button
                key={k.midi}
                onMouseDown={() => onNoteOn(k.midi, 0.85)}
                onMouseUp={() => onNoteOff(k.midi)}
                onMouseLeave={() => {
                  if (k.isActive) onNoteOff(k.midi);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  onNoteOn(k.midi, 0.85);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  onNoteOff(k.midi);
                }}
                className={`relative flex-1 h-full rounded-b-lg border-r border-slate-800 transition-all flex flex-col justify-between items-center pb-2 text-[11px] font-mono ${
                  k.isActive
                    ? 'bg-cyan-300 text-slate-950 shadow-inner'
                    : k.isChordTone
                    ? 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/40'
                    : 'bg-slate-950 hover:bg-slate-900 text-slate-300'
                }`}
              >
                <div className="pt-2 text-[9px] text-slate-500 font-sans">
                  {k.compKeyLabel && `[${k.compKeyLabel}]`}
                </div>
                <div className="flex flex-col items-center gap-1">
                  {k.isScaleTone && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                  <span className="text-[10px] font-semibold">{k.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
