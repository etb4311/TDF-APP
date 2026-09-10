import React from 'react';
import {
  ReconstructStyle,
  ReconstructionParameters,
  ScaleMode,
} from '../types/music';
import { ReconstructedArrangement } from '../utils/reconstructor';
import {
  Wand2,
  Sliders,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface ArrangementReconstructorProps {
  params: ReconstructionParameters;
  onUpdateParams: (params: ReconstructionParameters) => void;
  reconstructed: ReconstructedArrangement;
  currentStep: number;
  isPlaying: boolean;
  onToggleDrumStep: (instrument: 'kick' | 'snare' | 'hihat' | 'perc', step: number) => void;
}

const STYLE_PRESETS: { id: ReconstructStyle; name: string; bpm: number; desc: string }[] = [
  { id: 'synthwave', name: 'Synthwave 80s', bpm: 126, desc: 'Driving 16th saw pulse, bright arpeggiators, retro gated drums' },
  { id: 'lofi', name: 'Lofi Jazzhop', bpm: 84, desc: 'Relaxed swing, warm extended 9th/11th chords, acoustic jazz brush rhythm' },
  { id: 'nu-disco', name: 'Nu-Disco Funk', bpm: 118, desc: 'Syncopated octave bass, 4-on-the-floor kick, rhythmic off-beat chops' },
  { id: 'cinematic', name: 'Cinematic Ambient', bpm: 72, desc: 'Wide open drop-2 chord voicings, deep sub swell, delicate ostinato' },
  { id: 'bossa', name: 'Bossa Nova', bpm: 124, desc: 'Latin clave syncopation, walking root-fifth bass, nylon acoustic strum' },
  { id: 'chiptune', name: 'Chiptune 8-Bit', bpm: 136, desc: 'Rapid square-wave arpeggio runs, fast noise percussions, staccato' },
];

const SCALES: ScaleMode[] = ['major', 'minor', 'dorian', 'mixolydian', 'lydian', 'phrygian', 'blues', 'pentatonic'];

export const ArrangementReconstructor: React.FC<ArrangementReconstructorProps> = ({
  params,
  onUpdateParams,
  reconstructed,
  currentStep,
  isPlaying,
  onToggleDrumStep,
}) => {
  const handleSelectStyle = (style: ReconstructStyle) => {
    const preset = STYLE_PRESETS.find((p) => p.id === style);
    const newBpm = preset ? preset.bpm : params.targetBpm;

    let newSwing = params.swingFactor;
    let newBassStyle = params.bassStyle;
    let newVoicing = params.voicingComplexity;
    let newArp = params.arpPattern;

    if (style === 'synthwave') {
      newSwing = 0;
      newBassStyle = 'pumping-octaves';
      newArp = 'updown';
    } else if (style === 'lofi') {
      newSwing = 62;
      newBassStyle = 'sub-808';
      newVoicing = 'extended';
      newArp = 'none';
    } else if (style === 'nu-disco') {
      newSwing = 35;
      newBassStyle = 'syncopated';
      newVoicing = 'extended';
      newArp = 'stab';
    } else if (style === 'cinematic') {
      newSwing = 0;
      newBassStyle = 'sub-808';
      newVoicing = 'open';
      newArp = 'up';
    } else if (style === 'bossa') {
      newSwing = 40;
      newBassStyle = 'walking';
      newVoicing = 'extended';
      newArp = 'none';
    } else if (style === 'chiptune') {
      newSwing = 0;
      newBassStyle = 'pumping-octaves';
      newVoicing = 'simple';
      newArp = 'updown';
    }

    onUpdateParams({
      ...params,
      targetStyle: style,
      targetBpm: newBpm,
      swingFactor: newSwing,
      bassStyle: newBassStyle,
      voicingComplexity: newVoicing,
      arpPattern: newArp,
    });
  };

  const toggleStem = (stem: keyof typeof params.activeStems) => {
    onUpdateParams({
      ...params,
      activeStems: {
        ...params.activeStems,
        [stem]: !params.activeStems[stem],
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Arrangement Morph Presets */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-cyan-400" />
            <h2 className="font-semibold text-base text-white">
              Target Arrangement Archetypes
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Transforms song values into distinct musical arrangements
          </span>
        </div>

        {/* Style Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {STYLE_PRESETS.map((style) => {
            const isSelected = params.targetStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => handleSelectStyle(style.id)}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-28 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500 text-white ring-1 ring-cyan-400/40'
                    : 'bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className={`font-semibold text-xs ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {style.name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                    {style.desc}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {style.bpm} BPM
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Parameter Fine-Tuning Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h2 className="font-semibold text-base text-white">
            Arrangement Mutation Controls
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Key Transpose */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Harmonic Transposition</span>
              <span className="font-mono text-cyan-400 font-semibold">
                {params.transposeSemitones > 0 ? `+${params.transposeSemitones}` : params.transposeSemitones} ST
              </span>
            </div>
            <input
              type="range"
              min="-7"
              max="7"
              step="1"
              value={params.transposeSemitones}
              onChange={(e) =>
                onUpdateParams({ ...params, transposeSemitones: Number(e.target.value) })
              }
              className="w-full accent-cyan-400 h-1 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>-7 ST (5th Down)</span>
              <span>0 (Root)</span>
              <span>+7 ST (5th Up)</span>
            </div>
          </div>

          {/* Scale Mutation */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Target Scale Mode</span>
              <span className="font-mono text-emerald-400 capitalize font-semibold">
                {params.targetScale}
              </span>
            </div>
            <select
              value={params.targetScale}
              onChange={(e) =>
                onUpdateParams({ ...params, targetScale: e.target.value as ScaleMode })
              }
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded p-1.5 focus:outline-none"
            >
              {SCALES.map((sc) => (
                <option key={sc} value={sc}>
                  {sc.charAt(0).toUpperCase() + sc.slice(1)} Mode
                </option>
              ))}
            </select>
          </div>

          {/* Voicing Complexity */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Harmonic Voicing</span>
              <span className="font-mono text-amber-400 capitalize font-semibold">
                {params.voicingComplexity}
              </span>
            </div>
            <select
              value={params.voicingComplexity}
              onChange={(e) =>
                onUpdateParams({
                  ...params,
                  voicingComplexity: e.target.value as ReconstructionParameters['voicingComplexity'],
                })
              }
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded p-1.5 focus:outline-none"
            >
              <option value="simple">Simple Triads (Root-3-5)</option>
              <option value="extended">Extended (7ths, 9ths, 11ths)</option>
              <option value="open">Open Voicing (Drop 2)</option>
              <option value="power">Power Chords (Root-5th)</option>
            </select>
          </div>

          {/* Arpeggiator Mode */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Arp Pattern Generator</span>
              <span className="font-mono text-violet-400 capitalize font-semibold">
                {params.arpPattern}
              </span>
            </div>
            <select
              value={params.arpPattern}
              onChange={(e) =>
                onUpdateParams({
                  ...params,
                  arpPattern: e.target.value as ReconstructionParameters['arpPattern'],
                })
              }
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded p-1.5 focus:outline-none"
            >
              <option value="none">Disabled (No Arp)</option>
              <option value="up">Ascending Arp</option>
              <option value="down">Descending Arp</option>
              <option value="updown">Up & Down Cycle</option>
              <option value="random">Randomized Stabs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Multi-Track Sequencer Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-base text-white">
              Multi-Track Reconstructed Sequencer
            </h2>
            <div className="text-xs text-slate-400 mt-0.5">
              16-step synchronized playback matrix with real-time stem synthesis
            </div>
          </div>

          <div className="font-mono text-xs text-cyan-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            Active Step: {currentStep + 1} / 16
          </div>
        </div>

        {/* Sequencer Grid */}
        <div className="space-y-2 select-none overflow-x-auto pb-2">
          {/* Step Header Numbers with animated playhead */}
          <div className="flex items-center gap-2 min-w-[640px]">
            <div className="w-28 text-[11px] font-medium text-slate-400">Track</div>
            <div className="w-14 text-[10px] text-slate-500">Mute</div>
            <div className="flex-1 grid grid-cols-16 gap-1">
              {Array.from({ length: 16 }).map((_, step) => (
                <div
                  key={step}
                  className={`text-center font-mono text-[10px] py-1 rounded transition-colors ${
                    isPlaying && currentStep === step
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : step % 4 === 0
                      ? 'text-slate-300 font-bold'
                      : 'text-slate-600'
                  }`}
                >
                  {step + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Track 1: Kick */}
          <div className="flex items-center gap-2 min-w-[640px] bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
            <div className="w-28 text-xs font-semibold text-purple-300 truncate">
              Kick Drum
            </div>
            <button
              onClick={() => toggleStem('drums')}
              className="w-14 flex items-center justify-center text-xs text-slate-400 hover:text-white"
            >
              {params.activeStems.drums ? (
                <Volume2 className="w-3.5 h-3.5 text-purple-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-600" />
              )}
            </button>
            <div className="flex-1 grid grid-cols-16 gap-1">
              {reconstructed.stems.drums.kick.map((active, step) => (
                <button
                  key={step}
                  onClick={() => onToggleDrumStep('kick', step)}
                  className={`h-7 rounded transition-all ${
                    active
                      ? 'bg-purple-500 shadow-sm shadow-purple-500/30'
                      : 'bg-slate-900 hover:bg-slate-850'
                  } ${isPlaying && currentStep === step ? 'ring-2 ring-white scale-105' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Track 2: Snare */}
          <div className="flex items-center gap-2 min-w-[640px] bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
            <div className="w-28 text-xs font-semibold text-purple-300 truncate">
              Snare / Clap
            </div>
            <div className="w-14" />
            <div className="flex-1 grid grid-cols-16 gap-1">
              {reconstructed.stems.drums.snare.map((active, step) => (
                <button
                  key={step}
                  onClick={() => onToggleDrumStep('snare', step)}
                  className={`h-7 rounded transition-all ${
                    active
                      ? 'bg-purple-400 shadow-sm shadow-purple-400/30'
                      : 'bg-slate-900 hover:bg-slate-850'
                  } ${isPlaying && currentStep === step ? 'ring-2 ring-white scale-105' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Track 3: Hi-Hat */}
          <div className="flex items-center gap-2 min-w-[640px] bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
            <div className="w-28 text-xs font-semibold text-purple-300 truncate">
              Hi-Hat
            </div>
            <div className="w-14" />
            <div className="flex-1 grid grid-cols-16 gap-1">
              {reconstructed.stems.drums.hihat.map((active, step) => (
                <button
                  key={step}
                  onClick={() => onToggleDrumStep('hihat', step)}
                  className={`h-7 rounded transition-all ${
                    active
                      ? 'bg-purple-400/80'
                      : 'bg-slate-900 hover:bg-slate-850'
                  } ${isPlaying && currentStep === step ? 'ring-2 ring-white scale-105' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Track 4: Bass */}
          <div className="flex items-center gap-2 min-w-[640px] bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
            <div className="w-28 text-xs font-semibold text-amber-300 truncate">
              Bassline
            </div>
            <button
              onClick={() => toggleStem('bass')}
              className="w-14 flex items-center justify-center text-xs text-slate-400 hover:text-white"
            >
              {params.activeStems.bass ? (
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-600" />
              )}
            </button>
            <div className="flex-1 grid grid-cols-16 gap-1">
              {Array.from({ length: 16 }).map((_, step) => {
                const note = reconstructed.stems.bass.find((n) => n.startStep === step);
                return (
                  <div
                    key={step}
                    className={`h-7 rounded flex items-center justify-center text-[10px] font-mono transition-all ${
                      note
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20'
                        : 'bg-slate-900'
                    } ${isPlaying && currentStep === step ? 'ring-2 ring-white scale-105' : ''}`}
                  >
                    {note?.noteName}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Track 5: Chords */}
          <div className="flex items-center gap-2 min-w-[640px] bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
            <div className="w-28 text-xs font-semibold text-cyan-300 truncate">
              Chords / Pad
            </div>
            <button
              onClick={() => toggleStem('chords')}
              className="w-14 flex items-center justify-center text-xs text-slate-400 hover:text-white"
            >
              {params.activeStems.chords ? (
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-600" />
              )}
            </button>
            <div className="flex-1 grid grid-cols-16 gap-1">
              {Array.from({ length: 16 }).map((_, step) => {
                const note = reconstructed.stems.chords.find((n) => n.startStep === step);
                return (
                  <div
                    key={step}
                    className={`h-7 rounded flex items-center justify-center text-[10px] font-mono transition-all ${
                      note
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                        : 'bg-slate-900'
                    } ${isPlaying && currentStep === step ? 'ring-2 ring-white scale-105' : ''}`}
                  >
                    {note ? 'CH' : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Track 6: Lead */}
          <div className="flex items-center gap-2 min-w-[640px] bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
            <div className="w-28 text-xs font-semibold text-emerald-300 truncate">
              Lead Melody
            </div>
            <button
              onClick={() => toggleStem('lead')}
              className="w-14 flex items-center justify-center text-xs text-slate-400 hover:text-white"
            >
              {params.activeStems.lead ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-600" />
              )}
            </button>
            <div className="flex-1 grid grid-cols-16 gap-1">
              {Array.from({ length: 16 }).map((_, step) => {
                const note = reconstructed.stems.lead.find((n) => n.startStep === step);
                return (
                  <div
                    key={step}
                    className={`h-7 rounded flex items-center justify-center text-[10px] font-mono transition-all ${
                      note
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-900'
                    } ${isPlaying && currentStep === step ? 'ring-2 ring-white scale-105' : ''}`}
                  >
                    {note?.noteName}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Track 7: Arp */}
          {params.arpPattern !== 'none' && (
            <div className="flex items-center gap-2 min-w-[640px] bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
              <div className="w-28 text-xs font-semibold text-pink-300 truncate">
                Arpeggio
              </div>
              <button
                onClick={() => toggleStem('arp')}
                className="w-14 flex items-center justify-center text-xs text-slate-400 hover:text-white"
              >
                {params.activeStems.arp ? (
                  <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-600" />
                )}
              </button>
              <div className="flex-1 grid grid-cols-16 gap-1">
                {Array.from({ length: 16 }).map((_, step) => {
                  const note = reconstructed.arpStem.find((n) => n.startStep === step);
                  return (
                    <div
                      key={step}
                      className={`h-7 rounded flex items-center justify-center text-[10px] font-mono transition-all ${
                        note
                          ? 'bg-pink-500 text-slate-950 font-bold shadow-sm shadow-pink-500/20'
                          : 'bg-slate-900'
                      } ${isPlaying && currentStep === step ? 'ring-2 ring-white scale-105' : ''}`}
                    >
                      {note?.noteName}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
