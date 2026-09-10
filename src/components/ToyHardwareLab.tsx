import React, { useState } from 'react';
import { ComposedFolkSong, PersonaId, DockId } from '../types/musicBox';
import { PERSONAS, DOCKS } from '../utils/personaData';
import { exportSongToMidi } from '../utils/midiExport';
import {
  Cpu,
  Download,
  Code,
  VolumeX,
  Volume2,
  Check,
  Radio,
  Sliders,
  FileCode,
} from 'lucide-react';

interface ToyHardwareLabProps {
  docks: Record<DockId, PersonaId | null>;
  composedSong: ComposedFolkSong;
  currentStep: number;
  lidState: 'open' | 'closed';
  springTension: number;
  stemMutes: {
    rhythm: boolean;
    bass: boolean;
    harmony: boolean;
    melody: boolean;
    atmosphere: boolean;
  };
  onToggleMute: (stem: 'rhythm' | 'bass' | 'harmony' | 'melody' | 'atmosphere') => void;
}

export const ToyHardwareLab: React.FC<ToyHardwareLabProps> = ({
  docks,
  composedSong,
  currentStep,
  lidState,
  springTension,
  stemMutes,
  onToggleMute,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'sequencer' | 'firmware' | 'telemetry'>('sequencer');

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
      app: 'Campfire Toy Music Box',
      timestamp: new Date().toISOString(),
      docks,
      songTitle: composedSong.title,
      bandLeader: composedSong.bandLeader.name,
      bpm: composedSong.bpm,
      key: composedSong.key,
      activeDynamics: composedSong.dynamics.map((d) => d.title),
      hardwareTelemetry: {
        lidSwitch: lidState === 'closed' ? 'HIGH_LATCHED' : 'LOW_OPEN',
        springTensionPercent: springTension,
        dockSensors: DOCKS.map((d) => ({
          pin: d.hardwarePin,
          occupiedPersona: docks[d.id] || 'NONE',
        })),
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toy_musicbox_config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate Arduino / ESP32 C++ Struct Code
  const generateCppStruct = (): string => {
    const pFox = docks.rhythm === 'fox' ? 'PERSONA_FOX' : 'PERSONA_EMPTY';
    return `// ===============================================
// Campfire Toy Music Box - Microcontroller Firmware Mapping
// Target: ESP32 / Teensy 4.0 / Arduino Nano ESP32
// ===============================================

#include <Arduino.h>

struct MusicBoxState {
  uint8_t dock_rhythm_persona;   // ${docks.rhythm || 'EMPTY'}
  uint8_t dock_bass_persona;     // ${docks.bass || 'EMPTY'}
  uint8_t dock_harmony_persona;  // ${docks.harmony || 'EMPTY'}
  uint8_t dock_melody_persona;   // ${docks.melody || 'EMPTY'}
  uint8_t dock_atmo_persona;     // ${docks.atmosphere || 'EMPTY'}
  uint16_t master_bpm;           // ${composedSong.bpm} BPM
  bool lid_latched;              // ${lidState === 'closed'}
};

const MusicBoxState currentArrangement = {
  .dock_rhythm_persona  = ${docks.rhythm ? `0x0${DOCKS.findIndex((d) => d.id === 'rhythm') + 1}` : '0x00'},
  .dock_bass_persona    = ${docks.bass ? `0x0${DOCKS.findIndex((d) => d.id === 'bass') + 1}` : '0x00'},
  .dock_harmony_persona = ${docks.harmony ? `0x0${DOCKS.findIndex((d) => d.id === 'harmony') + 1}` : '0x00'},
  .dock_melody_persona  = ${docks.melody ? `0x0${DOCKS.findIndex((d) => d.id === 'melody') + 1}` : '0x00'},
  .dock_atmo_persona    = ${docks.atmosphere ? `0x0${DOCKS.findIndex((d) => d.id === 'atmosphere') + 1}` : '0x00'},
  .master_bpm           = ${composedSong.bpm},
  .lid_latched          = ${lidState === 'closed' ? 'true' : 'false'}
};`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateCppStruct());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      id="toy-hardware-lab-container"
      className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-xl text-stone-200"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-800">
        <div>
          <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>Toy Hardware Developer Lab & Telemetry</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Real-time multi-track stem diagnostics, simulated physical dock sensors, and MIDI firmware export.
          </p>
        </div>

        {/* Tab Switcher & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-stone-950 p-1 border border-stone-800 text-xs">
            <button
              onClick={() => setActiveTab('sequencer')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === 'sequencer' ? 'bg-amber-700 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              16-Step Stems
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === 'telemetry' ? 'bg-amber-700 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Dock Pins
            </button>
            <button
              onClick={() => setActiveTab('firmware')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === 'firmware' ? 'bg-amber-700 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              C++ Firmware
            </button>
          </div>

          <button
            onClick={handleDownloadMidi}
            className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Download Standard MIDI file (.mid)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .MID</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Download JSON Config"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* TAB 1: 16-Step Sequencer Multi-track */}
      {activeTab === 'sequencer' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
            <span>MULTI-TRACK ARRANGEMENT SEQUENCER (16 STEPS · 4 CHORDS)</span>
            <span className="text-amber-400">Step {currentStep + 1} / 16</span>
          </div>

          {/* Stems Table */}
          <div className="space-y-2">
            {/* Stem Row: Rhythm */}
            <div className="bg-stone-950 p-2 rounded-lg border border-stone-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleMute('rhythm')}
                    className={`p-1 rounded text-xs ${
                      stemMutes.rhythm ? 'text-red-400 bg-red-950/40' : 'text-stone-400 hover:text-stone-200'
                    }`}
                    title={stemMutes.rhythm ? 'Unmute Rhythm' : 'Mute Rhythm'}
                  >
                    {stemMutes.rhythm ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-xs font-bold text-stone-200 font-mono">RHYTHM / PERCUSSION</span>
                  {docks.rhythm && (
                    <span className="text-[10px] text-amber-400 font-mono bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/60">
                      {PERSONAS[docks.rhythm].name.split(' ')[0]} ({composedSong.bpm} BPM)
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-stone-500 font-mono">Channel 10</span>
              </div>

              {/* 16 Steps Grid */}
              <div className="grid grid-cols-16 gap-1">
                {Array.from({ length: 16 }).map((_, step) => {
                  const isCurrent = currentStep === step;
                  const hasStomp = composedSong.stems.rhythm.stomp[step];
                  const hasBrush = composedSong.stems.rhythm.brushOrSnare[step];
                  const hasTamb = composedSong.stems.rhythm.tambourineOrHat[step];
                  const hasAccent = composedSong.stems.rhythm.accentPerc[step];
                  const hasAny = hasStomp || hasBrush || hasTamb || hasAccent;

                  return (
                    <div
                      key={step}
                      className={`h-7 rounded flex flex-col items-center justify-center text-[9px] font-mono border transition-all ${
                        isCurrent
                          ? 'ring-2 ring-amber-400 scale-105 z-10'
                          : step % 4 === 0
                          ? 'border-stone-700'
                          : 'border-stone-800'
                      } ${
                        hasAny
                          ? isCurrent
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'bg-amber-950/60 text-amber-300'
                          : 'bg-stone-900/50 text-stone-600'
                      }`}
                    >
                      {hasStomp ? '●' : hasBrush ? '✕' : hasAccent ? '▲' : '·'}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stem Row: Bass */}
            <div className="bg-stone-950 p-2 rounded-lg border border-stone-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleMute('bass')}
                    className={`p-1 rounded text-xs ${
                      stemMutes.bass ? 'text-red-400 bg-red-950/40' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {stemMutes.bass ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-xs font-bold text-stone-200 font-mono">BASS / FOUNDATION</span>
                  {docks.bass && (
                    <span className="text-[10px] text-amber-400 font-mono bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/60">
                      {PERSONAS[docks.bass].name.split(' ')[0]} ({PERSONAS[docks.bass].bassPersona.instrument})
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-stone-500 font-mono">Channel 1</span>
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
                      className={`h-7 rounded flex items-center justify-center text-[9px] font-mono border transition-all ${
                        isCurrent ? 'ring-2 ring-amber-400 scale-105 z-10' : 'border-stone-800'
                      } ${
                        activeNote
                          ? isCurrent
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'bg-emerald-950/70 text-emerald-300 border-emerald-800/50'
                          : 'bg-stone-900/50 text-stone-600'
                      }`}
                    >
                      {activeNote ? activeNote.noteName.slice(0, 3) : '·'}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stem Row: Harmony */}
            <div className="bg-stone-950 p-2 rounded-lg border border-stone-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleMute('harmony')}
                    className={`p-1 rounded text-xs ${
                      stemMutes.harmony ? 'text-red-400 bg-red-950/40' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {stemMutes.harmony ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-xs font-bold text-stone-200 font-mono">HARMONY / GUITAR</span>
                  {docks.harmony && (
                    <span className="text-[10px] text-amber-400 font-mono bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/60">
                      {PERSONAS[docks.harmony].name.split(' ')[0]} ({PERSONAS[docks.harmony].harmonyPersona.styleName})
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-stone-500 font-mono">Channel 2</span>
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
                      className={`h-7 rounded flex items-center justify-center text-[9px] font-mono border transition-all ${
                        isCurrent ? 'ring-2 ring-amber-400 scale-105 z-10' : 'border-stone-800'
                      } ${
                        activeNote
                          ? isCurrent
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'bg-sky-950/70 text-sky-300 border-sky-800/50'
                          : 'bg-stone-900/50 text-stone-600'
                      }`}
                    >
                      {activeNote ? activeNote.noteName.slice(0, 3) : '·'}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stem Row: Melody */}
            <div className="bg-stone-950 p-2 rounded-lg border border-stone-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleMute('melody')}
                    className={`p-1 rounded text-xs ${
                      stemMutes.melody ? 'text-red-400 bg-red-950/40' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {stemMutes.melody ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-xs font-bold text-stone-200 font-mono">MELODY / HOEDOWN</span>
                  {docks.melody && (
                    <span className="text-[10px] text-amber-400 font-mono bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/60">
                      {PERSONAS[docks.melody].name.split(' ')[0]} ({PERSONAS[docks.melody].melodyPersona.instrument})
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-stone-500 font-mono">Channel 3</span>
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
                      className={`h-7 rounded flex items-center justify-center text-[9px] font-mono border transition-all ${
                        isCurrent ? 'ring-2 ring-amber-400 scale-105 z-10' : 'border-stone-800'
                      } ${
                        activeNote
                          ? isCurrent
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'bg-rose-950/70 text-rose-300 border-rose-800/50'
                          : 'bg-stone-900/50 text-stone-600'
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

      {/* TAB 2: Physical Sensor Pin Telemetry */}
      {activeTab === 'telemetry' && (
        <div className="space-y-3">
          <div className="text-xs font-mono text-stone-400">
            SIMULATED PHYSICAL SENSOR PINS & RFID BUS (BOX HARDWARE)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {DOCKS.map((dock) => {
              const personaId = docks[dock.id];
              const persona = personaId ? PERSONAS[personaId] : null;

              return (
                <div key={dock.id} className="bg-stone-950 p-3 rounded-lg border border-stone-800 text-xs">
                  <div className="flex items-center justify-between mb-1 text-stone-400 font-mono text-[10px]">
                    <span>PIN: {dock.hardwarePin}</span>
                    <span className={persona ? 'text-emerald-400' : 'text-stone-600'}>
                      {persona ? 'TAG_DETECTED' : 'OPEN_SOCKET'}
                    </span>
                  </div>

                  <div className="font-bold text-stone-200">{dock.name}</div>

                  <div className="mt-2 p-2 rounded bg-stone-900/80 border border-stone-800 font-mono text-[11px]">
                    {persona ? (
                      <div className="space-y-0.5">
                        <div className="text-amber-300 font-bold">
                          {persona.name} ({persona.species})
                        </div>
                        <div className="text-stone-400 text-[10px]">RFID: 0x{persona.id.toUpperCase()}</div>
                        <div className="text-stone-300 text-[10px]">Role: {dock.governs}</div>
                      </div>
                    ) : (
                      <div className="text-stone-600 italic">No figurine seated</div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Lid & Crank Sensor Pin */}
            <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 text-xs">
              <div className="flex items-center justify-between mb-1 text-stone-400 font-mono text-[10px]">
                <span>PIN: GPIO_12_REED_SWITCH</span>
                <span className={lidState === 'closed' ? 'text-emerald-400' : 'text-amber-400'}>
                  {lidState === 'closed' ? 'LID_SHUT (HIGH)' : 'LID_OPEN (LOW)'}
                </span>
              </div>
              <div className="font-bold text-stone-200">Box Lid Reed Magnetic Switch</div>
              <div className="mt-2 p-2 rounded bg-stone-900/80 border border-stone-800 font-mono text-[11px] space-y-0.5">
                <div className="text-stone-300">
                  Status: <strong>{lidState === 'closed' ? 'PLAYING MUSIC' : 'PAUSED FOR DOCKING'}</strong>
                </div>
                <div className="text-stone-400 text-[10px]">
                  Spring Key Tension: {springTension}% (Rotary Encoder)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: C++ Firmware Snippet */}
      {activeTab === 'firmware' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-stone-400">
              C++ CODE FOR MICROCONTROLLER FIRMWARE (ESP32 / ARDUINO)
            </span>
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-mono border border-stone-700 flex items-center gap-1.5 transition-colors"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Code className="w-3 h-3" />}
              <span>{copiedCode ? 'Copied to Clipboard' : 'Copy C++ Struct'}</span>
            </button>
          </div>

          <pre className="bg-stone-950 p-3 rounded-lg border border-stone-800 text-xs font-mono text-amber-300/90 overflow-x-auto max-h-60">
            {generateCppStruct()}
          </pre>
        </div>
      )}
    </div>
  );
};
