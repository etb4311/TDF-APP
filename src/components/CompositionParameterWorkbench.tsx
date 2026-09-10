import React, { useState, useRef } from 'react';
import { ComposedFolkSong, PersonaId, DockId, CompositionParameters } from '../types/musicBox';
import { PERSONAS, DOCKS } from '../utils/personaData';
import { exportSongToMidi } from '../utils/midiExport';
import { folkAudio } from '../utils/folkAudioEngine';
import {
  Sliders,
  Volume2,
  VolumeX,
  Music,
  Activity,
  Flame,
  Download,
  Code,
  Check,
  RotateCcw,
  Sparkles,
  Zap,
  Play,
  FileCode,
} from 'lucide-react';

interface CompositionParameterWorkbenchProps {
  docks: Record<DockId, PersonaId | null>;
  composedSong: ComposedFolkSong;
  currentStep: number;
  lidState: 'open' | 'closed';
  springTension: number;
  parameters: CompositionParameters;
  onUpdateParameters: (params: Partial<CompositionParameters>) => void;
  onResetParameters: () => void;
  stemMutes: {
    rhythm: boolean;
    bass: boolean;
    harmony: boolean;
    melody: boolean;
    atmosphere: boolean;
  };
  onToggleMute: (stem: 'rhythm' | 'bass' | 'harmony' | 'melody' | 'atmosphere') => void;
}

export const CompositionParameterWorkbench: React.FC<CompositionParameterWorkbenchProps> = ({
  docks,
  composedSong,
  currentStep,
  lidState,
  springTension,
  parameters,
  onUpdateParameters,
  onResetParameters,
  stemMutes,
  onToggleMute,
}) => {
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState<'timbre' | 'tempo-key' | 'sequencer' | 'firmware'>('tempo-key');
  const [copiedCode, setCopiedCode] = useState(false);

  // Tap tempo state
  const tapTimesRef = useRef<number[]>([]);
  const [lastTapBpm, setLastTapBpm] = useState<number | null>(null);

  const handleTapTempo = () => {
    const now = performance.now();
    const taps = tapTimesRef.current.filter((t) => now - t < 3000);
    taps.push(now);
    tapTimesRef.current = taps;

    if (taps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgIntervalMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpm = Math.round(60000 / avgIntervalMs);
      const clampedBpm = Math.max(50, Math.min(200, bpm));
      setLastTapBpm(clampedBpm);
      onUpdateParameters({ bpmOverride: clampedBpm });
    }
  };

  // Handle Auditioning an Instrument
  const handleAudition = (type: 'stomp' | 'snare' | 'tambourine' | 'spoons' | 'washtub' | 'guitar' | 'banjo' | 'fiddle' | 'harmonica' | 'flute' | 'jug') => {
    folkAudio.auditionInstrument(type);
  };

  // Handle Timbre Change
  const handleTimbreChange = (key: keyof CompositionParameters['soundTimbres'], value: number) => {
    const updated = { ...parameters.soundTimbres, [key]: value };
    onUpdateParameters({ soundTimbres: updated });
    folkAudio.setTimbreParams({ [key]: value });
  };

  // Handle MIDI file download
  const handleDownloadMidi = () => {
    const blob = exportSongToMidi(composedSong);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `music_box_${composedSong.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mid`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle JSON config download
  const handleDownloadJson = () => {
    const payload = {
      product: 'Campfire Toy Music Box',
      targetMCU: 'ESP32 / Teensy 4.0',
      timestamp: new Date().toISOString(),
      docks,
      songTitle: composedSong.title,
      bandLeader: composedSong.bandLeader.name,
      parameters: {
        effectiveBpm: composedSong.bpm,
        swingPercent: composedSong.swingPercent,
        key: composedSong.key,
        scale: composedSong.scale,
        transpositionSemitones: parameters.transpositionSemitones,
        voicingComplexity: parameters.voicingComplexity,
        timbres: parameters.soundTimbres,
      },
      hardwareSensors: {
        lidSwitch: lidState === 'closed' ? 'HIGH_LATCHED' : 'LOW_OPEN',
        springTension: `${springTension}%`,
        dockPins: DOCKS.map((d) => ({
          dock: d.id,
          pin: d.hardwarePin,
          occupiedPersona: docks[d.id] || 'EMPTY',
        })),
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `musicbox_parameter_profile.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate Arduino / C++ Firmware Code
  const generateCppCode = (): string => {
    return `// ====================================================
// CAMPFIRE TOY MUSIC BOX - HARDWARE FIRMWARE PARAMETERS
// Auto-generated for Microcontroller Flash (ESP32/Teensy)
// ====================================================

#pragma once
#include <Arduino.h>

// MEASURABLE COMPOSITION CONSTANTS
#define MUSICBOX_BPM               ${composedSong.bpm}
#define MUSICBOX_SWING_PERCENT     ${composedSong.swingPercent}
#define MUSICBOX_KEY               "${composedSong.key}"
#define MUSICBOX_TRANSPOSE         ${parameters.transpositionSemitones}

// PHYSICAL SOUND TIMBRE CALIBRATION
#define STOMP_PITCH_HZ             ${parameters.soundTimbres.stompPitchHz}
#define SNARE_DECAY_MS             ${parameters.soundTimbres.snareDecayMs}
#define WASHTUB_CUTOFF_HZ          ${parameters.soundTimbres.washtubCutoffHz}
#define WASHTUB_RESONANCE_Q        ${parameters.soundTimbres.washtubResonance}.0
#define GUITAR_BRIGHTNESS_HZ       ${parameters.soundTimbres.guitarBrightnessHz}
#define FIDDLE_VIBRATO_RATE_HZ     ${parameters.soundTimbres.fiddleVibratoRateHz}
#define FIDDLE_VIBRATO_DEPTH_CENTS ${parameters.soundTimbres.fiddleVibratoDepthCents}
#define HARMONICA_BEND_MS          ${parameters.soundTimbres.harmonicaBendMs}

// PIN SENSOR ASSIGNMENTS
#define PIN_DOCK_RHYTHM            A0  // ${docks.rhythm || 'EMPTY'}
#define PIN_DOCK_BASS              A1  // ${docks.bass || 'EMPTY'}
#define PIN_DOCK_HARMONY           A2  // ${docks.harmony || 'EMPTY'}
#define PIN_DOCK_MELODY            A3  // ${docks.melody || 'EMPTY'}
#define PIN_DOCK_ATMOSPHERE        A4  // ${docks.atmosphere || 'EMPTY'}
#define PIN_LID_REED_SWITCH        12  // ${lidState === 'closed' ? 'HIGH' : 'LOW'}
`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateCppCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const SCALES = [
    'Major Pentatonic',
    'Appalachian Hexatonic',
    'Dorian Folk',
    'Mixolydian Blues',
    'Delta Blues',
    'Natural Minor',
  ];

  return (
    <div
      id="composition-parameter-workbench"
      className="bg-[#fffdf7] border-4 border-[#bc6c25] rounded-[2.5rem] p-5 sm:p-6 shadow-[0_8px_0_#8c5825] text-[#382c26] relative overflow-hidden"
    >
      {/* Playful Washi-Tape Corner Stamp */}
      <div className="absolute top-0 right-10 w-28 h-6 bg-[#ffb703]/80 -rotate-3 border-x-2 border-[#d48b04] shadow-xs flex items-center justify-center text-[10px] font-black uppercase text-[#382c26] tracking-wider pointer-events-none">
        DIY RECIPE BENCH
      </div>

      {/* Workbench Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b-2 border-[#ccd5ae]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#ffb703] border-2 border-[#d48b04] flex items-center justify-center text-2xl shadow-[0_3px_0_#b57602]">
            🛠️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-[#382c26] tracking-tight">
                Composition Parameter Workbench
              </h2>
              <span className="text-[10px] font-bold bg-[#e9edc9] text-[#3a5a40] px-2.5 py-0.5 rounded-full border border-[#ccd5ae]">
                Hardware Prototype Mode
              </span>
            </div>
            <p className="text-xs text-[#606c38] font-medium">
              Calibrate measurable BPM, microtiming swing, key transposition, and physical instrument sound timbres.
            </p>
          </div>
        </div>

        {/* Tab Switcher (Animal Crossing Chunky Pills) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full bg-[#faedcd] p-1 border-2 border-[#d4a373]">
            <button
              onClick={() => setActiveWorkbenchTab('tempo-key')}
              className={`px-3.5 py-1 rounded-full text-xs font-black transition-all ${
                activeWorkbenchTab === 'tempo-key'
                  ? 'bg-[#bc6c25] text-white shadow-xs'
                  : 'text-[#7f4f24] hover:text-[#382c26]'
              }`}
            >
              ⏱️ Tempo & Key
            </button>
            <button
              onClick={() => setActiveWorkbenchTab('timbre')}
              className={`px-3.5 py-1 rounded-full text-xs font-black transition-all ${
                activeWorkbenchTab === 'timbre'
                  ? 'bg-[#bc6c25] text-white shadow-xs'
                  : 'text-[#7f4f24] hover:text-[#382c26]'
              }`}
            >
              🎻 Sound Timbres
            </button>
            <button
              onClick={() => setActiveWorkbenchTab('sequencer')}
              className={`px-3.5 py-1 rounded-full text-xs font-black transition-all ${
                activeWorkbenchTab === 'sequencer'
                  ? 'bg-[#bc6c25] text-white shadow-xs'
                  : 'text-[#7f4f24] hover:text-[#382c26]'
              }`}
            >
              🎼 16-Step Stems
            </button>
            <button
              onClick={() => setActiveWorkbenchTab('firmware')}
              className={`px-3.5 py-1 rounded-full text-xs font-black transition-all ${
                activeWorkbenchTab === 'firmware'
                  ? 'bg-[#bc6c25] text-white shadow-xs'
                  : 'text-[#7f4f24] hover:text-[#382c26]'
              }`}
            >
              💾 C++ / MIDI
            </button>
          </div>

          <button
            onClick={onResetParameters}
            className="ac-btn px-3 py-1.5 rounded-full bg-[#e9edc9] border-2 border-[#ccd5ae] text-[#3a5a40] text-xs font-black flex items-center gap-1"
            title="Reset all parameter overrides to persona defaults"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TEMPO, SWING, KEY & MODES */}
      {activeWorkbenchTab === 'tempo-key' && (
        <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Module A: Measurable BPM & Microtiming Swing */}
          <div className="bg-[#fefae0] rounded-3xl p-4 border-2 border-[#d4a373] space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#7f4f24] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#e76f51]" />
                <span>1. Measurable Tempo & Groove Engine</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#faedcd] text-[#bc6c25] font-black border border-[#d4a373]">
                {composedSong.bpm} BPM
              </span>
            </div>

            {/* BPM Slider with Live Feed */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#606c38] font-bold">
                <span>Tempo Rate:</span>
                <span className="text-[#382c26]">
                  {parameters.bpmOverride ? `${parameters.bpmOverride} BPM (Manual Override)` : `Auto (${composedSong.bandLeader.name.split(' ')[0]}'s Persona)`}
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="180"
                value={parameters.bpmOverride || composedSong.bpm}
                onChange={(e) => onUpdateParameters({ bpmOverride: parseInt(e.target.value, 10) })}
                className="w-full accent-[#e76f51] h-2.5 bg-[#d4a373] rounded-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-bold text-[#8c5825]">
                <span>50 Slow Bayou</span>
                <span>115 Gallop</span>
                <span>180 Fast Hoedown</span>
              </div>
            </div>

            {/* Tap Tempo & Multipliers */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleTapTempo}
                className="ac-btn px-3 py-1.5 rounded-xl bg-[#ffb703] border-2 border-[#d48b04] text-[#382c26] text-xs font-black shadow-xs flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5 text-[#e76f51]" />
                <span>Tap Tempo {lastTapBpm ? `(${lastTapBpm})` : ''}</span>
              </button>

              <div className="flex items-center rounded-xl bg-[#faedcd] p-0.5 border border-[#d4a373] text-[11px] font-bold">
                {[0.5, 1.0, 1.5, 2.0].map((mult) => (
                  <button
                    key={mult}
                    onClick={() => onUpdateParameters({ bpmMultiplier: mult as 0.5 | 1.0 | 1.5 | 2.0 })}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      parameters.bpmMultiplier === mult
                        ? 'bg-[#bc6c25] text-white font-black'
                        : 'text-[#7f4f24] hover:text-[#382c26]'
                    }`}
                  >
                    {mult}x
                  </button>
                ))}
              </div>

              {parameters.bpmOverride && (
                <button
                  onClick={() => onUpdateParameters({ bpmOverride: null })}
                  className="text-[11px] text-[#e76f51] font-bold underline ml-auto hover:text-[#bc4749]"
                >
                  Clear Lock
                </button>
              )}
            </div>

            {/* Microtiming Swing Slider */}
            <div className="space-y-1.5 pt-2 border-t border-[#ccd5ae]">
              <div className="flex justify-between text-xs text-[#606c38] font-bold">
                <span>Folk Swing & Pocket:</span>
                <span className="text-[#382c26] font-black">{composedSong.swingPercent}% Swing</span>
              </div>
              <input
                type="range"
                min="0"
                max="75"
                step="5"
                value={parameters.swingPercentOverride !== null ? parameters.swingPercentOverride : composedSong.swingPercent}
                onChange={(e) => onUpdateParameters({ swingPercentOverride: parseInt(e.target.value, 10) })}
                className="w-full accent-[#588157] h-2.5 bg-[#d4a373] rounded-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-bold text-[#8c5825]">
                <span>0% Straight 16ths</span>
                <span>25% Wild West Shuffle</span>
                <span>65% Heavy Bayou Drag</span>
              </div>
            </div>
          </div>

          {/* Module B: Key Root, Transposition & Scale Flavor */}
          <div className="bg-[#fefae0] rounded-3xl p-4 border-2 border-[#d4a373] space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#7f4f24] uppercase tracking-wider flex items-center gap-1.5">
                <Music className="w-4 h-4 text-[#3a86ff]" />
                <span>2. Key & Harmonic Architecture</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e9edc9] text-[#3a5a40] font-black border border-[#ccd5ae]">
                {composedSong.key} · {composedSong.scale}
              </span>
            </div>

            {/* Root Note Picker */}
            <div className="space-y-1.5">
              <span className="text-xs text-[#606c38] font-bold block">Root Key Center:</span>
              <div className="grid grid-cols-6 gap-1.5">
                {ROOT_NOTES.map((note) => {
                  const isSelected = parameters.keyRootOverride === note || (!parameters.keyRootOverride && composedSong.key.startsWith(note));
                  return (
                    <button
                      key={note}
                      onClick={() => onUpdateParameters({ keyRootOverride: note })}
                      className={`py-1.5 rounded-xl text-xs font-black transition-all border ${
                        isSelected
                          ? 'bg-[#e76f51] border-[#bc4749] text-white shadow-xs'
                          : 'bg-[#faedcd] border-[#d4a373] text-[#7f4f24] hover:bg-[#f6deb5]'
                      }`}
                    >
                      {note}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Octave Transposition Stepper */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#606c38] font-bold">Semitone Transposition:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateParameters({ transpositionSemitones: Math.max(-12, parameters.transpositionSemitones - 1) })}
                  className="w-7 h-7 rounded-lg bg-[#faedcd] border border-[#d4a373] text-sm font-black text-[#382c26] flex items-center justify-center hover:bg-[#f6deb5]"
                >
                  -
                </button>
                <span className="text-xs font-mono font-black text-[#bc6c25] w-12 text-center">
                  {parameters.transpositionSemitones > 0 ? `+${parameters.transpositionSemitones}` : parameters.transpositionSemitones} st
                </span>
                <button
                  onClick={() => onUpdateParameters({ transpositionSemitones: Math.min(12, parameters.transpositionSemitones + 1) })}
                  className="w-7 h-7 rounded-lg bg-[#faedcd] border border-[#d4a373] text-sm font-black text-[#382c26] flex items-center justify-center hover:bg-[#f6deb5]"
                >
                  +
                </button>
              </div>
            </div>

            {/* Scale & Mode Flavor */}
            <div className="space-y-1.5 pt-2 border-t border-[#ccd5ae]">
              <span className="text-xs text-[#606c38] font-bold block">Scale & Voicing Flavor:</span>
              <div className="flex flex-wrap gap-1.5">
                {SCALES.map((scale) => {
                  const isSelected = parameters.scaleModeOverride === scale || (!parameters.scaleModeOverride && composedSong.scale === scale);
                  return (
                    <button
                      key={scale}
                      onClick={() => onUpdateParameters({ scaleModeOverride: scale })}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                        isSelected
                          ? 'bg-[#588157] border-[#3a5a40] text-white shadow-xs'
                          : 'bg-[#faedcd] border-[#d4a373] text-[#7f4f24] hover:bg-[#f6deb5]'
                      }`}
                    >
                      {scale}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SOUND TIMBRES & PHYSICAL ACOUSTIC MODELING */}
      {activeWorkbenchTab === 'timbre' && (
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#606c38] uppercase tracking-wider">
              Physical Acoustic Timbre Modeling & Instant Auditioning
            </span>
            <span className="text-[11px] text-[#7f4f24] font-medium">
              Click the audition buttons to test sound wave response immediately!
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Porch Stomp Timbre */}
            <div className="bg-[#fefae0] p-3.5 rounded-2xl border-2 border-[#d4a373] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#382c26] flex items-center gap-1.5">
                  <span>🪵 Porch Stomp</span>
                </span>
                <button
                  onClick={() => handleAudition('stomp')}
                  className="ac-btn px-2.5 py-1 rounded-lg bg-[#e76f51] text-white text-[10px] font-black border border-[#bc4749]"
                >
                  Audition 💥
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-[#606c38]">
                  <span>Resonant Thump:</span>
                  <span className="text-[#382c26]">{parameters.soundTimbres.stompPitchHz} Hz</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="160"
                  value={parameters.soundTimbres.stompPitchHz}
                  onChange={(e) => handleTimbreChange('stompPitchHz', parseInt(e.target.value, 10))}
                  className="w-full accent-[#e76f51] h-2 bg-[#d4a373] rounded-full cursor-pointer"
                />
              </div>
            </div>

            {/* Brushed Snare Timbre */}
            <div className="bg-[#fefae0] p-3.5 rounded-2xl border-2 border-[#d4a373] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#382c26] flex items-center gap-1.5">
                  <span>🌾 Brushed Snare</span>
                </span>
                <button
                  onClick={() => handleAudition('snare')}
                  className="ac-btn px-2.5 py-1 rounded-lg bg-[#fca311] text-[#382c26] text-[10px] font-black border border-[#d48b04]"
                >
                  Audition 🥢
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-[#606c38]">
                  <span>Brush Decay Length:</span>
                  <span className="text-[#382c26]">{parameters.soundTimbres.snareDecayMs} ms</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="240"
                  value={parameters.soundTimbres.snareDecayMs}
                  onChange={(e) => handleTimbreChange('snareDecayMs', parseInt(e.target.value, 10))}
                  className="w-full accent-[#fca311] h-2 bg-[#d4a373] rounded-full cursor-pointer"
                />
              </div>
            </div>

            {/* Washtub Bass Timbre */}
            <div className="bg-[#fefae0] p-3.5 rounded-2xl border-2 border-[#d4a373] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#382c26] flex items-center gap-1.5">
                  <span>🪣 Washtub Bass</span>
                </span>
                <button
                  onClick={() => handleAudition('washtub')}
                  className="ac-btn px-2.5 py-1 rounded-lg bg-[#588157] text-white text-[10px] font-black border border-[#3a5a40]"
                >
                  Audition 🎸
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-[#606c38]">
                  <span>Lowpass Cutoff:</span>
                  <span className="text-[#382c26]">{parameters.soundTimbres.washtubCutoffHz} Hz</span>
                </div>
                <input
                  type="range"
                  min="250"
                  max="900"
                  value={parameters.soundTimbres.washtubCutoffHz}
                  onChange={(e) => handleTimbreChange('washtubCutoffHz', parseInt(e.target.value, 10))}
                  className="w-full accent-[#588157] h-2 bg-[#d4a373] rounded-full cursor-pointer"
                />
              </div>
            </div>

            {/* Campfire Guitar Timbre */}
            <div className="bg-[#fefae0] p-3.5 rounded-2xl border-2 border-[#d4a373] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#382c26] flex items-center gap-1.5">
                  <span>🪕 Parlor Guitar / Banjo</span>
                </span>
                <button
                  onClick={() => handleAudition('guitar')}
                  className="ac-btn px-2.5 py-1 rounded-lg bg-[#3a86ff] text-white text-[10px] font-black border border-[#2667d4]"
                >
                  Audition 🎶
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-[#606c38]">
                  <span>Strum Brightness:</span>
                  <span className="text-[#382c26]">{parameters.soundTimbres.guitarBrightnessHz} Hz</span>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="3800"
                  value={parameters.soundTimbres.guitarBrightnessHz}
                  onChange={(e) => handleTimbreChange('guitarBrightnessHz', parseInt(e.target.value, 10))}
                  className="w-full accent-[#3a86ff] h-2 bg-[#d4a373] rounded-full cursor-pointer"
                />
              </div>
            </div>

            {/* Hoedown Fiddle Timbre */}
            <div className="bg-[#fefae0] p-3.5 rounded-2xl border-2 border-[#d4a373] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#382c26] flex items-center gap-1.5">
                  <span>🎻 Hoedown Fiddle</span>
                </span>
                <button
                  onClick={() => handleAudition('fiddle')}
                  className="ac-btn px-2.5 py-1 rounded-lg bg-[#e76f51] text-white text-[10px] font-black border border-[#bc4749]"
                >
                  Audition 🎻
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-[#606c38]">
                  <span>Vibrato Rate:</span>
                  <span className="text-[#382c26]">{parameters.soundTimbres.fiddleVibratoRateHz} Hz</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="80"
                  value={Math.round(parameters.soundTimbres.fiddleVibratoRateHz * 10)}
                  onChange={(e) => handleTimbreChange('fiddleVibratoRateHz', parseInt(e.target.value, 10) / 10)}
                  className="w-full accent-[#e76f51] h-2 bg-[#d4a373] rounded-full cursor-pointer"
                />
              </div>
            </div>

            {/* Blues Harmonica Timbre */}
            <div className="bg-[#fefae0] p-3.5 rounded-2xl border-2 border-[#d4a373] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#382c26] flex items-center gap-1.5">
                  <span>🌬️ Blues Harmonica</span>
                </span>
                <button
                  onClick={() => handleAudition('harmonica')}
                  className="ac-btn px-2.5 py-1 rounded-lg bg-[#3a5a40] text-white text-[10px] font-black border border-[#283d2c]"
                >
                  Audition 🌬️
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-[#606c38]">
                  <span>Pitch Bend Scoop:</span>
                  <span className="text-[#382c26]">{parameters.soundTimbres.harmonicaBendMs} ms</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="120"
                  value={parameters.soundTimbres.harmonicaBendMs}
                  onChange={(e) => handleTimbreChange('harmonicaBendMs', parseInt(e.target.value, 10))}
                  className="w-full accent-[#3a5a40] h-2 bg-[#d4a373] rounded-full cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 16-STEP SEQUENCER STEM MATRIX */}
      {activeWorkbenchTab === 'sequencer' && (
        <div className="py-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#606c38] font-bold">
            <span>MULTI-VOICE STEM MATRIX (4 MEASURES · 16 STEPS)</span>
            <span className="text-[#e76f51] font-black">Step {currentStep + 1} / 16</span>
          </div>

          <div className="space-y-2.5">
            {/* Stem Row 1: Rhythm */}
            <div className="bg-[#fefae0] p-2.5 rounded-2xl border-2 border-[#d4a373]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleMute('rhythm')}
                    className={`p-1 rounded-lg text-xs ${
                      stemMutes.rhythm ? 'text-red-500 bg-red-100' : 'text-[#7f4f24] hover:text-[#382c26]'
                    }`}
                    title={stemMutes.rhythm ? 'Unmute Rhythm' : 'Mute Rhythm'}
                  >
                    {stemMutes.rhythm ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-xs font-black text-[#382c26]">RHYTHM & PERCUSSION</span>
                  {docks.rhythm && (
                    <span className="text-[10px] font-bold bg-[#faedcd] text-[#bc6c25] px-2 py-0.5 rounded-full border border-[#d4a373]">
                      {PERSONAS[docks.rhythm].name.split(' ')[0]}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-[#606c38]">MIDI Channel 10</span>
              </div>

              {/* 16 Steps Grid (Organic Rounded Pebbles) */}
              <div className="grid grid-cols-16 gap-1">
                {Array.from({ length: 16 }).map((_, step) => {
                  const isCurrent = currentStep === step;
                  const hasStomp = composedSong.stems.rhythm.stomp[step];
                  const hasSnare = composedSong.stems.rhythm.brushOrSnare[step];
                  const hasTamb = composedSong.stems.rhythm.tambourineOrHat[step];
                  const hasAny = hasStomp || hasSnare || hasTamb;

                  return (
                    <div
                      key={step}
                      className={`h-7 rounded-xl flex items-center justify-center text-[9px] font-black border transition-all ${
                        isCurrent
                          ? 'ring-2 ring-[#e76f51] scale-110 z-10 bg-[#e76f51] text-white'
                          : hasAny
                          ? 'bg-[#ffb703] border-[#d48b04] text-[#382c26]'
                          : 'bg-[#faedcd] border-[#d4a373]/50 text-[#8c5825]'
                      }`}
                    >
                      {hasStomp ? '●' : hasSnare ? '✕' : hasTamb ? '▲' : '·'}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stem Row 2: Bass */}
            <div className="bg-[#fefae0] p-2.5 rounded-2xl border-2 border-[#d4a373]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleMute('bass')}
                    className={`p-1 rounded-lg text-xs ${
                      stemMutes.bass ? 'text-red-500 bg-red-100' : 'text-[#7f4f24] hover:text-[#382c26]'
                    }`}
                  >
                    {stemMutes.bass ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-xs font-black text-[#382c26]">BASS / FOUNDATION</span>
                  {docks.bass && (
                    <span className="text-[10px] font-bold bg-[#e9edc9] text-[#3a5a40] px-2 py-0.5 rounded-full border border-[#ccd5ae]">
                      {PERSONAS[docks.bass].name.split(' ')[0]}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-[#606c38]">MIDI Channel 1</span>
              </div>

              <div className="grid grid-cols-16 gap-1">
                {Array.from({ length: 16 }).map((_, step) => {
                  const isCurrent = currentStep === step;
                  const activeNote = composedSong.stems.bass.find(
                    (n) => step >= n.startStep && step < n.startStep + n.durationSteps
                  );

                  return (
                    <div
                      key={step}
                      className={`h-7 rounded-xl flex items-center justify-center text-[9px] font-black border transition-all ${
                        isCurrent
                          ? 'ring-2 ring-[#e76f51] scale-110 z-10 bg-[#e76f51] text-white'
                          : activeNote
                          ? 'bg-[#588157] border-[#3a5a40] text-white'
                          : 'bg-[#faedcd] border-[#d4a373]/50 text-[#8c5825]'
                      }`}
                    >
                      {activeNote ? activeNote.noteName.slice(0, 3) : '·'}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stem Row 3: Harmony */}
            <div className="bg-[#fefae0] p-2.5 rounded-2xl border-2 border-[#d4a373]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleMute('harmony')}
                    className={`p-1 rounded-lg text-xs ${
                      stemMutes.harmony ? 'text-red-500 bg-red-100' : 'text-[#7f4f24] hover:text-[#382c26]'
                    }`}
                  >
                    {stemMutes.harmony ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-xs font-black text-[#382c26]">HARMONY / GUITAR</span>
                  {docks.harmony && (
                    <span className="text-[10px] font-bold bg-[#faedcd] text-[#bc6c25] px-2 py-0.5 rounded-full border border-[#d4a373]">
                      {PERSONAS[docks.harmony].name.split(' ')[0]}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-[#606c38]">MIDI Channel 2</span>
              </div>

              <div className="grid grid-cols-16 gap-1">
                {Array.from({ length: 16 }).map((_, step) => {
                  const isCurrent = currentStep === step;
                  const activeNote = composedSong.stems.harmony.find(
                    (n) => step >= n.startStep && step < n.startStep + n.durationSteps
                  );

                  return (
                    <div
                      key={step}
                      className={`h-7 rounded-xl flex items-center justify-center text-[9px] font-black border transition-all ${
                        isCurrent
                          ? 'ring-2 ring-[#e76f51] scale-110 z-10 bg-[#e76f51] text-white'
                          : activeNote
                          ? 'bg-[#3a86ff] border-[#2667d4] text-white'
                          : 'bg-[#faedcd] border-[#d4a373]/50 text-[#8c5825]'
                      }`}
                    >
                      {activeNote ? activeNote.noteName.slice(0, 3) : '·'}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stem Row 4: Melody */}
            <div className="bg-[#fefae0] p-2.5 rounded-2xl border-2 border-[#d4a373]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleMute('melody')}
                    className={`p-1 rounded-lg text-xs ${
                      stemMutes.melody ? 'text-red-500 bg-red-100' : 'text-[#7f4f24] hover:text-[#382c26]'
                    }`}
                  >
                    {stemMutes.melody ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-xs font-black text-[#382c26]">MELODY / FIDDLE & BANJO</span>
                  {docks.melody && (
                    <span className="text-[10px] font-bold bg-[#faedcd] text-[#bc6c25] px-2 py-0.5 rounded-full border border-[#d4a373]">
                      {PERSONAS[docks.melody].name.split(' ')[0]}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-[#606c38]">MIDI Channel 3</span>
              </div>

              <div className="grid grid-cols-16 gap-1">
                {Array.from({ length: 16 }).map((_, step) => {
                  const isCurrent = currentStep === step;
                  const activeNote = composedSong.stems.melody.find(
                    (n) => step >= n.startStep && step < n.startStep + n.durationSteps
                  );

                  return (
                    <div
                      key={step}
                      className={`h-7 rounded-xl flex items-center justify-center text-[9px] font-black border transition-all ${
                        isCurrent
                          ? 'ring-2 ring-[#e76f51] scale-110 z-10 bg-[#e76f51] text-white'
                          : activeNote
                          ? 'bg-[#e76f51] border-[#bc4749] text-white'
                          : 'bg-[#faedcd] border-[#d4a373]/50 text-[#8c5825]'
                      }`}
                    >
                      {activeNote ? activeNote.noteName.slice(0, 3) : '·'}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FIRMWARE CODE & MIDI EXPORT */}
      {activeWorkbenchTab === 'firmware' && (
        <div className="py-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-black text-[#606c38] uppercase tracking-wider">
              Microcontroller Firmware Export (ESP32 / Arduino C++ & MIDI)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="ac-btn px-3 py-1.5 rounded-xl bg-[#588157] text-white text-xs font-black flex items-center gap-1.5"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied C++ Code' : 'Copy C++ Code'}</span>
              </button>

              <button
                onClick={handleDownloadMidi}
                className="ac-btn px-3 py-1.5 rounded-xl bg-[#ffb703] text-[#382c26] text-xs font-black flex items-center gap-1.5"
                title="Download Standard MIDI file (.mid) containing all 4 stems"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .MID File</span>
              </button>

              <button
                onClick={handleDownloadJson}
                className="ac-btn px-3 py-1.5 rounded-xl bg-[#faedcd] border border-[#d4a373] text-[#7f4f24] text-xs font-black flex items-center gap-1.5"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Save JSON</span>
              </button>
            </div>
          </div>

          <pre className="bg-[#faedcd] p-4 rounded-2xl border-2 border-[#d4a373] text-xs font-mono text-[#382c26] overflow-x-auto max-h-64 shadow-inner">
            {generateCppCode()}
          </pre>
        </div>
      )}
    </div>
  );
};
