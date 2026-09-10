import React from 'react';
import {
  DeconstructedSong,
  ChordValue,
} from '../types/music';
import {
  Volume2,
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface SongDeconstructorProps {
  songs: DeconstructedSong[];
  activeSong: DeconstructedSong;
  onSelectSong: (song: DeconstructedSong) => void;
  currentStep: number;
  isPlaying: boolean;
  onAuditionChord: (chord: ChordValue) => void;
}

export const SongDeconstructor: React.FC<SongDeconstructorProps> = ({
  songs,
  activeSong,
  onSelectSong,
  currentStep,
  isPlaying,
  onAuditionChord,
}) => {
  const { harmonicDNA, rhythmicDNA, melodicDNA, stems } = activeSong;

  const auditionStem = (stemType: 'lead' | 'chords' | 'bass' | 'drums') => {
    audioEngine.init();
    if (stemType === 'drums') {
      audioEngine.playDrum('kick');
      setTimeout(() => audioEngine.playDrum('snare'), 200);
      setTimeout(() => audioEngine.playDrum('hihat'), 350);
    } else {
      const notes = stems[stemType];
      if (notes.length > 0) {
        notes.slice(0, 4).forEach((n, idx) => {
          setTimeout(() => {
            audioEngine.playSynthNote(
              n.pitch,
              0.4,
              n.velocity / 127,
              stemType === 'bass' ? 'bass' : stemType === 'lead' ? 'lead' : 'poly'
            );
          }, idx * 180);
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Song Selection & Editorial Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-2">
              <span>Source Composition</span>
              <span aria-hidden="true">·</span>
              <span>{activeSong.genre}</span>
              {activeSong.year && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{activeSong.year}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {activeSong.title}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {activeSong.description}
            </p>
          </div>

          {/* Song Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Library:</span>
            <select
              value={activeSong.id}
              onChange={(e) => {
                const s = songs.find((song) => song.id === e.target.value);
                if (s) onSelectSong(s);
              }}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              {songs.map((song) => (
                <option key={song.id} value={song.id}>
                  {song.title} ({song.genre})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quiet unboxed metadata tags */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
          <span className="text-slate-500">Extracted Signatures:</span>
          {activeSong.tags.map((tag, i) => (
            <React.Fragment key={tag}>
              <span className="text-slate-300 font-medium">{tag}</span>
              {i < activeSong.tags.length - 1 && <span aria-hidden="true">·</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 4 Core Musical Values Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. HARMONIC DNA */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                <h2 className="font-semibold text-base text-white">Harmonic DNA</h2>
              </div>
              <div className="text-xs text-slate-400">
                Key: <strong className="text-cyan-300">{harmonicDNA.key} {harmonicDNA.scale}</strong>
              </div>
            </div>

            {/* Chord Progression Cards with Roman Numerals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {harmonicDNA.progression.map((chord, idx) => (
                <button
                  key={idx}
                  onClick={() => onAuditionChord(chord)}
                  className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 rounded-lg p-3 text-left transition-all group flex flex-col justify-between"
                  title="Click to audition chord"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs text-cyan-400 font-bold group-hover:text-cyan-300">
                      {chord.roman}
                    </span>
                    <Volume2 className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <div className="mt-2">
                    <div className="text-base font-bold text-slate-100">
                      {chord.root}{chord.quality}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {chord.pitches.length} notes · {chord.durationBeats} beats
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Harmonic Metrics */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Harmonic Complexity</span>
                <span className="font-mono text-slate-200">{harmonicDNA.harmonicComplexity}%</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${harmonicDNA.harmonicComplexity}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-slate-400 pt-1">
                <span>Harmonic Rhythm</span>
                <span className="text-slate-300">{harmonicDNA.harmonicRhythm}</span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Voice Leading Tension</span>
                <span className="font-mono text-slate-200">{harmonicDNA.voiceLeadingTension}%</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-3 mt-3 border-t border-slate-800">
            Click any chord to audition its harmonic voicing and observe pitch distribution.
          </div>
        </div>

        {/* 2. RHYTHMIC DNA */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                <h2 className="font-semibold text-base text-white">Rhythmic DNA</h2>
              </div>
              <div className="text-xs text-slate-400">
                {rhythmicDNA.bpm} BPM · {rhythmicDNA.timeSignature[0]}/{rhythmicDNA.timeSignature[1]}
              </div>
            </div>

            {/* 16-Step Accent Grid */}
            <div className="mb-4">
              <div className="text-xs text-slate-400 mb-2 flex items-center justify-between">
                <span>16-Step Dynamic Accent Profile</span>
                <span className="text-[11px] text-amber-400 font-mono">{rhythmicDNA.grooveFeel}</span>
              </div>
              <div className="grid grid-cols-16 gap-1 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                {rhythmicDNA.accentGrid.map((accent, step) => {
                  const isCurrent = isPlaying && currentStep === step;
                  const heightPercent = Math.max(15, Math.round(accent * 100));
                  return (
                    <div
                      key={step}
                      className="h-14 flex flex-col justify-end items-center"
                    >
                      <div
                        className={`w-full rounded-sm transition-all duration-75 ${
                          isCurrent
                            ? 'bg-amber-400 shadow-md shadow-amber-400/50'
                            : step % 4 === 0
                            ? 'bg-amber-600/70'
                            : 'bg-slate-800'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[9px] font-mono text-slate-600 mt-1">
                        {step + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rhythmic Metrics */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Syncopation Index</span>
                <span className="font-mono text-slate-200">{rhythmicDNA.syncopationScore}%</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${rhythmicDNA.syncopationScore}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-slate-400 pt-1">
                <span>Swing Factor</span>
                <span className="font-mono text-slate-300">{rhythmicDNA.swingPercent}%</span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Micro-Timing Humanize</span>
                <span className="font-mono text-slate-300">±{rhythmicDNA.humanizeTimingMs}ms</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-3 mt-3 border-t border-slate-800">
            Accent values dictate velocity distribution when reconstructing arrangements.
          </div>
        </div>

        {/* 3. MELODIC CONTOUR */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <h2 className="font-semibold text-base text-white">Melodic Contour</h2>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Pitch Range: {melodicDNA.range.minPitch} - {melodicDNA.range.maxPitch}
              </div>
            </div>

            {/* Visual SVG Contour Curve */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mb-4 h-28 flex items-center justify-center relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="melodicGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <line x1="0" y1="25" x2="400" y2="25" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="0" y1="50" x2="400" y2="50" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="0" y1="75" x2="400" y2="75" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />

                {(() => {
                  const pts = melodicDNA.notes.map((n, i) => {
                    const x = (i / Math.max(1, melodicDNA.notes.length - 1)) * 380 + 10;
                    const normPitch = (n.pitch - melodicDNA.range.minPitch) / Math.max(1, (melodicDNA.range.maxPitch - melodicDNA.range.minPitch));
                    const y = 90 - normPitch * 75;
                    return { x, y, note: n.noteName };
                  });

                  if (pts.length < 2) return null;
                  const pathData = pts.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
                  const fillData = `${pathData} L ${pts[pts.length - 1].x} 100 L ${pts[0].x} 100 Z`;

                  return (
                    <>
                      <path d={fillData} fill="url(#melodicGradient)" />
                      <path d={pathData} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
                      {pts.map((p, idx) => (
                        <g key={idx}>
                          <circle cx={p.x} cy={p.y} r="3.5" fill="#34d399" />
                          <text x={p.x} y={p.y - 8} fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">
                            {p.note}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Melodic Stats */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
                <span className="text-slate-500 block text-[10px]">Contour Shape</span>
                <span className="font-semibold text-emerald-300 capitalize">{melodicDNA.contour}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
                <span className="text-slate-500 block text-[10px]">Motif Repetition</span>
                <span className="font-mono text-slate-200">{melodicDNA.motifRepetition}%</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
                <span className="text-slate-500 block text-[10px]">Step vs Leap</span>
                <span className="font-mono text-slate-200">{melodicDNA.stepVsLeapRatio}%</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-3 mt-3 border-t border-slate-800">
            Contour defines melodic shape preserved when transposing or voice-leading.
          </div>
        </div>

        {/* 4. STEM ANATOMY */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
                <h2 className="font-semibold text-base text-white">Extracted Stems & Layers</h2>
              </div>
              <div className="text-xs text-slate-400">4 Stems Isolated</div>
            </div>

            <div className="space-y-2 mb-4">
              {/* Lead Stem */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    L
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Lead Melody</div>
                    <div className="text-[10px] text-slate-500 font-mono">{stems.lead.length} events · Monophonic</div>
                  </div>
                </div>
                <button
                  onClick={() => auditionStem('lead')}
                  className="px-2.5 py-1 text-xs text-emerald-400 hover:bg-emerald-950/40 rounded border border-emerald-500/30 transition-colors"
                >
                  Audition
                </button>
              </div>

              {/* Chords Stem */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs">
                    C
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Harmonic Chords</div>
                    <div className="text-[10px] text-slate-500 font-mono">{stems.chords.length} events · Polyphonic</div>
                  </div>
                </div>
                <button
                  onClick={() => auditionStem('chords')}
                  className="px-2.5 py-1 text-xs text-cyan-400 hover:bg-cyan-950/40 rounded border border-cyan-500/30 transition-colors"
                >
                  Audition
                </button>
              </div>

              {/* Bass Stem */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                    B
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Bassline</div>
                    <div className="text-[10px] text-slate-500 font-mono">{stems.bass.length} events · Low-register</div>
                  </div>
                </div>
                <button
                  onClick={() => auditionStem('bass')}
                  className="px-2.5 py-1 text-xs text-amber-400 hover:bg-amber-950/40 rounded border border-amber-500/30 transition-colors"
                >
                  Audition
                </button>
              </div>

              {/* Drums Stem */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                    D
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Drums / Groove</div>
                    <div className="text-[10px] text-slate-500 font-mono">Kick, Snare, Hihat, Percussion</div>
                  </div>
                </div>
                <button
                  onClick={() => auditionStem('drums')}
                  className="px-2.5 py-1 text-xs text-purple-400 hover:bg-purple-950/40 rounded border border-purple-500/30 transition-colors"
                >
                  Audition
                </button>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-3 mt-3 border-t border-slate-800">
            Switch to the <strong>Arrangement Morph</strong> tab to morph these values into entirely new musical styles.
          </div>
        </div>
      </div>
    </div>
  );
};
