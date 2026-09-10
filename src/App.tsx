import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  DeconstructedSong,
  ReconstructionParameters,
  MidiInteractionMode,
  ChordValue,
} from './types/music';
import { PRESET_SONGS } from './utils/presetSongs';
import { reconstructArrangement } from './utils/reconstructor';
import { audioEngine } from './utils/audioEngine';
import { midiDeviceManager } from './utils/midiDevice';
import { quantizeToScale } from './utils/musicTheory';
import { TopNavbar } from './components/TopNavbar';
import { TransportBar } from './components/TransportBar';
import { SongDeconstructor } from './components/SongDeconstructor';
import { ArrangementReconstructor } from './components/ArrangementReconstructor';
import { MidiPerformanceHub } from './components/MidiPerformanceHub';
import { MidiFileModal } from './components/MidiFileModal';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'deconstruct' | 'reconstruct' | 'midi-jam'>('deconstruct');

  // Song Library & Active Song
  const [songs, setSongs] = useState<DeconstructedSong[]>(PRESET_SONGS);
  const [activeSong, setActiveSong] = useState<DeconstructedSong>(PRESET_SONGS[0]);

  // Reconstruction Parameters
  const [reconstructionParams, setReconstructionParams] = useState<ReconstructionParameters>({
    targetStyle: 'nu-disco',
    targetBpm: PRESET_SONGS[0].rhythmicDNA.bpm,
    transposeSemitones: 0,
    targetScale: PRESET_SONGS[0].harmonicDNA.scale,
    voicingComplexity: 'extended',
    swingFactor: PRESET_SONGS[0].rhythmicDNA.swingPercent,
    density: 80,
    arpPattern: 'none',
    arpRate: '1/16',
    bassStyle: 'syncopated',
    drumGroove: 'four-floor',
    activeStems: {
      drums: true,
      bass: true,
      chords: true,
      lead: true,
      arp: true,
    },
  });

  // Transport State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [filterCutoff, setFilterCutoff] = useState(12000);
  const [delayAmount, setDelayAmount] = useState(0.18);
  const [isRecording, setIsRecording] = useState(false);

  // Web MIDI & Hardware State
  const [isMidiConnected, setIsMidiConnected] = useState(false);
  const [midiDevices, setMidiDevices] = useState<string[]>([]);
  const [midiMode, setMidiMode] = useState<MidiInteractionMode>('scale-snap');
  const [lastMidiEvent, setLastMidiEvent] = useState<{ note: number; velocity: number; channel: number } | null>(null);
  const [activeVisualNotes, setActiveVisualNotes] = useState<Set<number>>(new Set());

  // Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Refs for scheduler
  const currentStepRef = useRef(0);
  const isPlayingRef = useRef(false);
  const nextNoteTimeRef = useRef(0);
  const timerIdRef = useRef<number | null>(null);

  // Derive Reconstructed Arrangement
  const reconstructed = useMemo(() => {
    return reconstructArrangement(activeSong, reconstructionParams);
  }, [activeSong, reconstructionParams]);

  // Handle Song Switch
  const handleSelectSong = (song: DeconstructedSong) => {
    setActiveSong(song);
    setReconstructionParams((prev) => ({
      ...prev,
      targetBpm: song.rhythmicDNA.bpm,
      targetScale: song.harmonicDNA.scale,
      swingFactor: song.rhythmicDNA.swingPercent,
      transposeSemitones: 0,
    }));
  };

  // --- AUDIO TRANSPORT & LOOKAHEAD SCHEDULER ---

  const scheduleStep = useCallback(
    (step: number, time: number) => {
      // 1. Drums
      const { drums } = reconstructed.stems;
      if (reconstructionParams.activeStems.drums) {
        if (drums.kick[step]) audioEngine.playDrum('kick', 0.85, time);
        if (drums.snare[step]) audioEngine.playDrum('snare', 0.8, time);
        if (drums.hihat[step]) audioEngine.playDrum('hihat', 0.65, time);
        if (drums.perc[step]) audioEngine.playDrum('perc', 0.7, time);
      }

      // 2. Bassline
      if (reconstructionParams.activeStems.bass) {
        reconstructed.stems.bass.forEach((note) => {
          if (note.startStep === step) {
            const stepDurationSec = (60 / reconstructionParams.targetBpm) / 4;
            audioEngine.playSynthNote(
              note.pitch,
              note.durationSteps * stepDurationSec * 0.9,
              note.velocity / 127,
              'bass',
              time
            );
          }
        });
      }

      // 3. Chords
      if (reconstructionParams.activeStems.chords) {
        reconstructed.stems.chords.forEach((note) => {
          if (note.startStep === step) {
            const stepDurationSec = (60 / reconstructionParams.targetBpm) / 4;
            audioEngine.playSynthNote(
              note.pitch,
              note.durationSteps * stepDurationSec * 0.9,
              note.velocity / 127,
              'poly',
              time
            );
          }
        });
      }

      // 4. Lead Melody
      if (reconstructionParams.activeStems.lead) {
        reconstructed.stems.lead.forEach((note) => {
          if (note.startStep === step) {
            const stepDurationSec = (60 / reconstructionParams.targetBpm) / 4;
            audioEngine.playSynthNote(
              note.pitch,
              note.durationSteps * stepDurationSec * 0.85,
              note.velocity / 127,
              'lead',
              time
            );
          }
        });
      }

      // 5. Arpeggio
      if (reconstructionParams.activeStems.arp && reconstructionParams.arpPattern !== 'none') {
        reconstructed.arpStem.forEach((note) => {
          if (note.startStep === step) {
            const stepDurationSec = (60 / reconstructionParams.targetBpm) / 4;
            audioEngine.playSynthNote(
              note.pitch,
              stepDurationSec * 0.8,
              note.velocity / 127,
              'lead',
              time
            );
          }
        });
      }
    },
    [reconstructed, reconstructionParams]
  );

  const scheduler = useCallback(() => {
    const ctx = audioEngine.getContext();
    if (!ctx) return;

    const secondsPerBeat = 60.0 / reconstructionParams.targetBpm;
    const secondsPer16th = secondsPerBeat / 4.0;
    const swingOffset = (reconstructionParams.swingFactor / 100) * (secondsPer16th * 0.45);

    while (nextNoteTimeRef.current < ctx.currentTime + 0.1) {
      let stepTime = nextNoteTimeRef.current;
      if (currentStepRef.current % 2 === 1) {
        stepTime += swingOffset;
      }

      scheduleStep(currentStepRef.current, stepTime);

      currentStepRef.current = (currentStepRef.current + 1) % 16;
      setCurrentStep(currentStepRef.current);
      nextNoteTimeRef.current += secondsPer16th;
    }

    if (isPlayingRef.current) {
      timerIdRef.current = window.setTimeout(scheduler, 25);
    }
  }, [reconstructionParams.targetBpm, reconstructionParams.swingFactor, scheduleStep]);

  const handleTogglePlay = () => {
    audioEngine.init();
    audioEngine.resume();

    if (isPlaying) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      if (timerIdRef.current) clearTimeout(timerIdRef.current);
    } else {
      const ctx = audioEngine.getContext();
      if (!ctx) return;
      isPlayingRef.current = true;
      setIsPlaying(true);
      nextNoteTimeRef.current = ctx.currentTime + 0.05;
      scheduler();
    }
  };

  const handleStop = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (timerIdRef.current) clearTimeout(timerIdRef.current);
    currentStepRef.current = 0;
    setCurrentStep(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        handleTogglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleTogglePlay]);

  useEffect(() => {
    audioEngine.setMasterVolume(volume);
  }, [volume]);

  useEffect(() => {
    audioEngine.setFilterCutoff(filterCutoff);
  }, [filterCutoff]);

  useEffect(() => {
    audioEngine.setDelayAmount(delayAmount);
  }, [delayAmount]);

  // --- MIDI HANDLING ---

  const handleRequestMidi = async () => {
    const success = await midiDeviceManager.requestAccess();
    setIsMidiConnected(success);
    setMidiDevices(midiDeviceManager.inputDevices);
  };

  const handleLiveNoteOn = useCallback(
    (midiNote: number, velocity = 0.85) => {
      audioEngine.init();
      audioEngine.resume();

      setActiveVisualNotes((prev) => {
        const next = new Set(prev);
        next.add(midiNote);
        return next;
      });

      if (midiMode === 'scale-snap') {
        const snappedPitch = quantizeToScale(
          midiNote,
          activeSong.harmonicDNA.key,
          reconstructionParams.targetScale
        );
        audioEngine.noteOn(snappedPitch, velocity, 'poly');
      } else if (midiMode === 'conductor') {
        const semitoneOffset = (midiNote % 12) - 60 % 12;
        setReconstructionParams((p) => ({ ...p, transposeSemitones: semitoneOffset }));
        const firstChord = activeSong.harmonicDNA.progression[0];
        if (firstChord) {
          firstChord.pitches.forEach((p) => {
            audioEngine.playSynthNote(p + semitoneOffset, 0.6, velocity, 'poly');
          });
          audioEngine.playDrum('kick', velocity);
        }
      } else if (midiMode === 'arp-jam') {
        [0, 1, 2, 3].forEach((_, idx) => {
          setTimeout(() => {
            const stepPitch = midiNote + (idx % 2 === 0 ? 0 : 7);
            audioEngine.playSynthNote(stepPitch, 0.15, velocity, 'lead');
          }, idx * 120);
        });
      } else {
        audioEngine.noteOn(midiNote, velocity, 'poly');
      }
    },
    [midiMode, activeSong, reconstructionParams.targetScale]
  );

  const handleLiveNoteOff = useCallback((midiNote: number) => {
    setActiveVisualNotes((prev) => {
      const next = new Set(prev);
      next.delete(midiNote);
      return next;
    });
    audioEngine.noteOff(midiNote);
  }, []);

  useEffect(() => {
    const unsubscribe = midiDeviceManager.subscribe((msg) => {
      setLastMidiEvent({ note: msg.note, velocity: msg.velocity, channel: msg.channel });
      if (msg.type === 'noteOn') {
        handleLiveNoteOn(msg.note, msg.velocity);
      } else {
        handleLiveNoteOff(msg.note);
      }
    });
    return unsubscribe;
  }, [handleLiveNoteOn, handleLiveNoteOff]);

  const handleToggleRecording = async () => {
    if (!isRecording) {
      audioEngine.startRecording();
      setIsRecording(true);
    } else {
      setIsRecording(false);
      const blob = await audioEngine.stopRecording();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeSong.title.toLowerCase().replace(/\s+/g, '-')}-arrangement.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  };

  const handleToggleDrumStep = (instrument: 'kick' | 'snare' | 'hihat' | 'perc', step: number) => {
    const newStems = { ...activeSong.stems };
    newStems.drums[instrument][step] = !newStems.drums[instrument][step];
    setActiveSong({ ...activeSong, stems: newStems });
  };

  const handleTriggerDrum = (type: 'kick' | 'snare' | 'hihat' | 'perc') => {
    audioEngine.playDrum(type, 0.9);
  };

  const handleTriggerChord = (chord: ChordValue) => {
    audioEngine.init();
    chord.pitches.forEach((p) => {
      audioEngine.playSynthNote(p + reconstructionParams.transposeSemitones, 0.8, 0.8, 'poly');
    });
  };

  const currentChordPitches = reconstructed.chordPitchesAtStep.get(Math.floor(currentStep / 4) * 4) || [60, 64, 67];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation */}
      <TopNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSong={activeSong}
        isMidiConnected={isMidiConnected}
        midiDevices={midiDevices}
        onRequestMidiAccess={handleRequestMidi}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        isRecording={isRecording}
        onToggleRecording={handleToggleRecording}
      />

      {/* Transport & Studio Control Bar */}
      <TransportBar
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onStop={handleStop}
        bpm={reconstructionParams.targetBpm}
        onBpmChange={(bpm) => setReconstructionParams((p) => ({ ...p, targetBpm: bpm }))}
        currentStep={currentStep}
        swingPercent={reconstructionParams.swingFactor}
        onSwingChange={(swing) => setReconstructionParams((p) => ({ ...p, swingFactor: swing }))}
        volume={volume}
        onVolumeChange={setVolume}
        filterCutoff={filterCutoff}
        onFilterChange={setFilterCutoff}
        delayAmount={delayAmount}
        onDelayChange={setDelayAmount}
        isRecording={isRecording}
      />

      {/* Main Workspace Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'deconstruct' && (
          <SongDeconstructor
            songs={songs}
            activeSong={activeSong}
            onSelectSong={handleSelectSong}
            currentStep={currentStep}
            isPlaying={isPlaying}
            onAuditionChord={handleTriggerChord}
          />
        )}

        {activeTab === 'reconstruct' && (
          <ArrangementReconstructor
            params={reconstructionParams}
            onUpdateParams={setReconstructionParams}
            reconstructed={reconstructed}
            currentStep={currentStep}
            isPlaying={isPlaying}
            onToggleDrumStep={handleToggleDrumStep}
          />
        )}

        {activeTab === 'midi-jam' && (
          <MidiPerformanceHub
            mode={midiMode}
            onSelectMode={setMidiMode}
            onNoteOn={handleLiveNoteOn}
            onNoteOff={handleLiveNoteOff}
            onTriggerDrum={handleTriggerDrum}
            onTriggerChord={handleTriggerChord}
            activeNotes={activeVisualNotes}
            scaleNotes={activeSong.harmonicDNA.progression[0]?.pitches || []}
            currentChordNotes={currentChordPitches}
            currentChords={activeSong.harmonicDNA.progression}
            lastMidiEvent={lastMidiEvent}
            isMidiConnected={isMidiConnected}
            onRequestMidiAccess={handleRequestMidi}
          />
        )}
      </main>

      {/* Standard MIDI File Import Modal */}
      <MidiFileModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSong={(importedSong) => {
          setSongs((prev) => [importedSong, ...prev]);
          handleSelectSong(importedSong);
        }}
      />
    </div>
  );
}
