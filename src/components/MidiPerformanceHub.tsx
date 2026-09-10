import React, { useState } from 'react';
import {
  MidiInteractionMode,
  ChordValue,
} from '../types/music';
import { InteractiveKeyboard } from './InteractiveKeyboard';
import { DrumPads } from './DrumPads';
import { Radio, Keyboard, Zap, Sparkles, Sliders } from 'lucide-react';

interface MidiPerformanceHubProps {
  mode: MidiInteractionMode;
  onSelectMode: (mode: MidiInteractionMode) => void;
  onNoteOn: (midiNote: number, velocity?: number) => void;
  onNoteOff: (midiNote: number) => void;
  onTriggerDrum: (type: 'kick' | 'snare' | 'hihat' | 'perc') => void;
  onTriggerChord: (chord: ChordValue) => void;
  activeNotes: Set<number>;
  scaleNotes: number[];
  currentChordNotes: number[];
  currentChords: ChordValue[];
  lastMidiEvent: { note: number; velocity: number; channel: number } | null;
  isMidiConnected: boolean;
  onRequestMidiAccess: () => void;
}

export const MidiPerformanceHub: React.FC<MidiPerformanceHubProps> = ({
  mode,
  onSelectMode,
  onNoteOn,
  onNoteOff,
  onTriggerDrum,
  onTriggerChord,
  activeNotes,
  scaleNotes,
  currentChordNotes,
  currentChords,
  lastMidiEvent,
  isMidiConnected,
  onRequestMidiAccess,
}) => {
  const [activeSynthType, setActiveSynthType] = useState<'poly' | 'lead' | 'bass'>('poly');

  const modes: { id: MidiInteractionMode; name: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'scale-snap',
      name: 'Harmonic Scale Snap',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      desc: 'Freeform MIDI keys auto-quantize to the song’s scale DNA. You can never hit a wrong note.',
    },
    {
      id: 'conductor',
      name: 'Chord Conductor',
      icon: <Keyboard className="w-4 h-4 text-cyan-400" />,
      desc: 'Single keys live-transpose the deconstructed chord progression with full harmonic voicing.',
    },
    {
      id: 'arp-jam',
      name: 'Rhythmic Arp Jammer',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      desc: 'Hold notes to fire synchronized arpeggios that inherit the song’s rhythmic DNA and swing.',
    },
    {
      id: 'stem-trigger',
      name: 'Stem & Pad Jammer',
      icon: <Sliders className="w-4 h-4 text-purple-400" />,
      desc: '8 MPC pads trigger drum hits and chord voicings for live beatmaking and finger drumming.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* MIDI Interaction Modes Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h2 className="font-semibold text-base text-white">
                MIDI Interaction & Performance Engine
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select how your incoming MIDI or keyboard triggers reconstruct and interact with the musical values
            </p>
          </div>

          {/* Web MIDI Status Badge */}
          <div className="flex items-center gap-2">
            {!isMidiConnected ? (
              <button
                onClick={onRequestMidiAccess}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 transition-colors flex items-center gap-1.5"
              >
                <div className="w-2 h-2 rounded-full bg-slate-500" />
                <span>Connect Hardware MIDI</span>
              </button>
            ) : (
              <div className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 font-mono">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Hardware Connected</span>
              </div>
            )}
          </div>
        </div>

        {/* Mode Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {modes.map((m) => {
            const isSelected = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMode(m.id)}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-950 border-cyan-500 text-white ring-1 ring-cyan-400/40 shadow-sm'
                    : 'bg-slate-950/60 hover:bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {m.icon}
                  <span className={`text-xs font-semibold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {m.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {m.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time MIDI Monitor Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Target Voice Engine:</span>
          <div className="flex items-center bg-slate-950 p-1 rounded-md border border-slate-800">
            <button
              onClick={() => setActiveSynthType('poly')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                activeSynthType === 'poly'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Poly Synth Chords
            </button>
            <button
              onClick={() => setActiveSynthType('lead')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                activeSynthType === 'lead'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mono Lead
            </button>
            <button
              onClick={() => setActiveSynthType('bass')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                activeSynthType === 'bass'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sub Bass
            </button>
          </div>
        </div>

        {/* Live MIDI input monitor */}
        <div className="flex items-center gap-3 font-mono text-[11px] bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800">
          <span className="text-slate-500">MIDI IN:</span>
          {lastMidiEvent ? (
            <div className="flex items-center gap-3 text-cyan-400">
              <span>Note {lastMidiEvent.note}</span>
              <span>·</span>
              <span>Vel {Math.round(lastMidiEvent.velocity * 127)}</span>
              <span>·</span>
              <span>Ch {lastMidiEvent.channel + 1}</span>
            </div>
          ) : (
            <span className="text-slate-600">Awaiting MIDI or Keyboard input...</span>
          )}
        </div>
      </div>

      {/* MPC Trigger Pads */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-white">
            Performance Launch Pads (Drums & Chords)
          </h3>
          <span className="text-xs text-slate-400">
            Click or tap to audition drum hits and reconstructed chords
          </span>
        </div>
        <DrumPads
          onTriggerDrum={onTriggerDrum}
          onTriggerChord={onTriggerChord}
          chords={currentChords}
        />
      </div>

      {/* Interactive Piano Keyboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-white">
            Interactive Piano Keyboard
          </h3>
          <span className="text-xs text-slate-400">
            Play with mouse, touch, computer keyboard (A-W-S-E...), or Web MIDI
          </span>
        </div>

        <InteractiveKeyboard
          onNoteOn={(note, vel) => onNoteOn(note, vel)}
          onNoteOff={(note) => onNoteOff(note)}
          activeNotes={activeNotes}
          scaleNotes={scaleNotes}
          chordNotes={currentChordNotes}
        />
      </div>
    </div>
  );
};
