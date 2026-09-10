import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PersonaId, DockId, ComposedFolkSong } from './types/musicBox';
import { composeMusicBoxSong } from './utils/compositionEngine';
import { folkAudio } from './utils/folkAudioEngine';
import { MusicBoxHeader } from './components/MusicBoxHeader';
import { MusicBoxLid } from './components/MusicBoxLid';
import { CampfireDiorama } from './components/CampfireDiorama';
import { FigurineTray } from './components/FigurineTray';
import { InterpersonalDynamicsPanel } from './components/InterpersonalDynamicsPanel';
import { ToyHardwareLab } from './components/ToyHardwareLab';
import { PersonaInspectorModal } from './components/PersonaInspectorModal';
import { ConceptGuideModal } from './components/ConceptGuideModal';

export default function App() {
  // Physical Toy State: 5 Docks around the campfire
  const [docks, setDocks] = useState<Record<DockId, PersonaId | null>>({
    rhythm: 'fox',
    melody: 'eagle',
    bass: 'beetle',
    harmony: 'salmon',
    atmosphere: 'frog',
  });

  // Physical Lid & Spring Mechanism
  const [lidState, setLidState] = useState<'open' | 'closed'>('open');
  const [isPlaying, setIsPlaying] = useState(false);
  const [springTension, setSpringTension] = useState(100);
  const [peekDioramaWhileClosed, setPeekDioramaWhileClosed] = useState(true);
  const [masterVolume, setMasterVolume] = useState(0.85);
  const [campfireEmbersActive, setCampfireEmbersActive] = useState(true);

  // Sequencer & Audio Step Tracking
  const [currentStep, setCurrentStep] = useState(0);
  const [activeStemsThisStep, setActiveStemsThisStep] = useState({
    rhythm: false,
    bass: false,
    harmony: false,
    melody: false,
    atmosphere: false,
  });

  // Stem Mutes for Hardware Testing
  const [stemMutes, setStemMutes] = useState({
    rhythm: false,
    bass: false,
    harmony: false,
    melody: false,
    atmosphere: false,
  });

  // Modals
  const [inspectingPersonaId, setInspectingPersonaId] = useState<PersonaId | null>(null);
  const [isConceptGuideOpen, setIsConceptGuideOpen] = useState(false);

  // Scheduler Refs
  const currentStepRef = useRef(0);
  const isPlayingRef = useRef(false);
  const nextStepTimeRef = useRef(0);
  const timerIdRef = useRef<number | null>(null);

  // Compose Arrangement based on docked figurines
  const composedSong = useMemo(() => {
    return composeMusicBoxSong(docks);
  }, [docks]);

  const activeDocksCount = useMemo(() => {
    return Object.values(docks).filter((p) => p !== null).length;
  }, [docks]);

  // Audio Step Scheduling
  const scheduleStep = useCallback(
    (step: number) => {
      const { stems, bpm } = composedSong;
      const stepDurationSec = (60 / bpm) / 4;

      const stemTriggers = {
        rhythm: false,
        bass: false,
        harmony: false,
        melody: false,
        atmosphere: false,
      };

      // 1. Rhythm
      if (!stemMutes.rhythm && docks.rhythm) {
        let didTrigger = false;
        if (stems.rhythm.stomp[step]) {
          folkAudio.triggerPorchStomp(0.85, docks.rhythm === 'beetle' ? 0.8 : 1.1);
          didTrigger = true;
        }
        if (stems.rhythm.brushOrSnare[step]) {
          folkAudio.triggerBrushOrSnare(0.7, stepDurationSec * 0.8);
          didTrigger = true;
        }
        if (stems.rhythm.tambourineOrHat[step]) {
          folkAudio.triggerTambourine(0.65);
          didTrigger = true;
        }
        if (stems.rhythm.accentPerc[step]) {
          const percType = docks.rhythm === 'frog' ? 'jug-pop' : docks.rhythm === 'fox' ? 'wood-block' : 'spoons';
          folkAudio.triggerAccentPercussion(percType, 0.75);
          didTrigger = true;
        }
        stemTriggers.rhythm = didTrigger;
      }

      // 2. Bass
      if (!stemMutes.bass && docks.bass) {
        const bassNote = stems.bass.find((n) => n.startStep === step);
        if (bassNote) {
          folkAudio.triggerBassNote(
            bassNote.pitch,
            bassNote.durationSteps * stepDurationSec * 0.9,
            bassNote.velocity / 127,
            bassNote.instrumentVoice as 'washtub-bass' | 'upright-acoustic' | 'hollow-jug' | 'walking-thumb'
          );
          stemTriggers.bass = true;
        }
      }

      // 3. Harmony
      if (!stemMutes.harmony && docks.harmony) {
        const harmonyNotes = stems.harmony.filter((n) => n.startStep === step);
        if (harmonyNotes.length > 0) {
          harmonyNotes.forEach((n) => {
            folkAudio.triggerHarmonyNote(
              n.pitch,
              n.durationSteps * stepDurationSec * 0.9,
              n.velocity / 127,
              n.instrumentVoice as 'acoustic-guitar' | 'clawhammer-banjo' | 'campfire-accordion' | 'reed-harmonium'
            );
          });
          stemTriggers.harmony = true;
        }
      }

      // 4. Melody
      if (!stemMutes.melody && docks.melody) {
        const melodyNote = stems.melody.find((n) => n.startStep === step);
        if (melodyNote) {
          folkAudio.triggerMelodyNote(
            melodyNote.pitch,
            melodyNote.durationSteps * stepDurationSec * 0.9,
            melodyNote.velocity / 127,
            melodyNote.instrumentVoice as 'wild-fiddle' | 'soaring-banjo' | 'blues-harmonica' | 'fingerstyle-lead' | 'wooden-flute'
          );
          stemTriggers.melody = true;
        }
      }

      // 5. Atmosphere
      if (!stemMutes.atmosphere && docks.atmosphere) {
        const atmoNote = stems.atmosphere.find((n) => n.startStep === step);
        if (atmoNote) {
          folkAudio.triggerAtmosphereVoice(
            atmoNote.pitch,
            atmoNote.durationSteps * stepDurationSec * 0.95,
            atmoNote.velocity / 127,
            atmoNote.instrumentVoice
          );
          stemTriggers.atmosphere = true;
        }
      }

      setActiveStemsThisStep(stemTriggers);
    },
    [composedSong, stemMutes, docks]
  );

  // Lookahead Scheduler loop
  const runScheduler = useCallback(() => {
    if (!isPlayingRef.current) return;

    const secondsPerBeat = 60.0 / composedSong.bpm;
    const secondsPer16th = secondsPerBeat / 4.0;

    // Execute current step
    scheduleStep(currentStepRef.current);

    // Advance step
    currentStepRef.current = (currentStepRef.current + 1) % 16;
    setCurrentStep(currentStepRef.current);

    // Spring tension unwinds very slowly (takes ~240 measures to wind down completely)
    setSpringTension((prev) => {
      if (prev <= 1) {
        // Spring unwound! Stop playback
        setIsPlaying(false);
        isPlayingRef.current = false;
        return 0;
      }
      return Math.max(0, +(prev - 0.08).toFixed(1));
    });

    // Schedule next 16th note
    timerIdRef.current = window.setTimeout(runScheduler, secondsPer16th * 1000);
  }, [composedSong.bpm, scheduleStep]);

  // Start Playback
  const startPlaying = useCallback(() => {
    folkAudio.init();
    if (springTension <= 0) {
      setSpringTension(100);
    }
    isPlayingRef.current = true;
    setIsPlaying(true);
    runScheduler();
  }, [springTension, runScheduler]);

  // Stop Playback
  const stopPlaying = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
    setActiveStemsThisStep({
      rhythm: false,
      bass: false,
      harmony: false,
      melody: false,
      atmosphere: false,
    });
  }, []);

  // Physical Lid Toggle Mechanic:
  // "the song that plays when the lid of the music box is shut"
  const handleToggleLid = () => {
    folkAudio.init();
    if (lidState === 'open') {
      // Shut the lid -> Play song!
      folkAudio.playLidShutSound();
      setLidState('closed');
      startPlaying();
    } else {
      // Open the lid -> Pause music box & allow docking
      folkAudio.playLidOpenSound();
      setLidState('open');
      stopPlaying();
    }
  };

  // Wind spring key
  const handleWindSpring = () => {
    setSpringTension(100);
    if (lidState === 'closed' && !isPlaying) {
      startPlaying();
    }
  };

  // Master Volume
  const handleVolumeChange = (vol: number) => {
    setMasterVolume(vol);
    folkAudio.setMasterVolume(vol);
  };

  // Campfire Embers toggle
  const handleToggleCampfireEmbers = () => {
    if (campfireEmbersActive) {
      folkAudio.stopCampfireAmbience();
      setCampfireEmbersActive(false);
    } else {
      folkAudio.startCampfireAmbience();
      setCampfireEmbersActive(true);
    }
  };

  // Start campfire embers on first interaction
  useEffect(() => {
    if (campfireEmbersActive) {
      folkAudio.startCampfireAmbience();
    }
    return () => {
      folkAudio.stopCampfireAmbience();
      if (timerIdRef.current) clearTimeout(timerIdRef.current);
    };
  }, [campfireEmbersActive]);

  // Docking actions
  const handleDockPersona = (dockId: DockId, personaId: PersonaId) => {
    folkAudio.playRatchetClick();
    setDocks((prev) => {
      const next = { ...prev };
      // If persona was already in another dock, clear that dock
      Object.keys(next).forEach((key) => {
        if (next[key as DockId] === personaId) {
          next[key as DockId] = null;
        }
      });
      next[dockId] = personaId;
      return next;
    });
  };

  const handleUndockPersona = (dockId: DockId) => {
    folkAudio.playRatchetClick();
    setDocks((prev) => ({
      ...prev,
      [dockId]: null,
    }));
  };

  const handleClearAllDocks = () => {
    folkAudio.playRatchetClick();
    setDocks({
      rhythm: null,
      bass: null,
      harmony: null,
      melody: null,
      atmosphere: null,
    });
  };

  const handleLoadPreset = (presetDocks: Record<DockId, PersonaId | null>) => {
    folkAudio.playRatchetClick();
    setDocks(presetDocks);
  };

  const handleToggleStemMute = (stem: 'rhythm' | 'bass' | 'harmony' | 'melody' | 'atmosphere') => {
    setStemMutes((prev) => ({ ...prev, [stem]: !prev[stem] }));
  };

  return (
    <div className="min-h-screen bg-[#0f0c09] text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Top Header */}
      <MusicBoxHeader
        masterVolume={masterVolume}
        campfireEmbersActive={campfireEmbersActive}
        onVolumeChange={handleVolumeChange}
        onToggleCampfireEmbers={handleToggleCampfireEmbers}
        onOpenInfo={() => setIsConceptGuideOpen(true)}
      />

      {/* Main Diorama Workbench */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Physical Lid Controller */}
        <MusicBoxLid
          lidState={lidState}
          isPlaying={isPlaying}
          springTension={springTension}
          peekDioramaWhileClosed={peekDioramaWhileClosed}
          activeDocksCount={activeDocksCount}
          songTitle={composedSong.title}
          bpm={composedSong.bpm}
          onToggleLid={handleToggleLid}
          onWindSpring={handleWindSpring}
          onTogglePeek={() => setPeekDioramaWhileClosed(!peekDioramaWhileClosed)}
        />

        {/* Campfire Diorama Stage */}
        <CampfireDiorama
          docks={docks}
          currentStep={currentStep}
          isPlaying={isPlaying}
          lidState={lidState}
          peekDioramaWhileClosed={peekDioramaWhileClosed}
          composedSong={composedSong}
          activeStemsThisStep={activeStemsThisStep}
          onDockPersona={handleDockPersona}
          onUndockPersona={handleUndockPersona}
          onSelectPersonaForInspection={(pId) => setInspectingPersonaId(pId)}
        />

        {/* Figurine Storage Tray */}
        <FigurineTray
          docks={docks}
          onDockPersona={handleDockPersona}
          onUndockPersona={handleUndockPersona}
          onSelectPersonaForInspection={(pId) => setInspectingPersonaId(pId)}
          onLoadPreset={handleLoadPreset}
          onClearAllDocks={handleClearAllDocks}
        />

        {/* Interpersonal Dynamics & Chemistry */}
        <InterpersonalDynamicsPanel
          composedSong={composedSong}
          docks={docks}
          onSelectPersonaForInspection={(pId) => setInspectingPersonaId(pId)}
        />

        {/* Toy Hardware Developer Lab (Telemetry, Stems, Firmware) */}
        <ToyHardwareLab
          docks={docks}
          composedSong={composedSong}
          currentStep={currentStep}
          lidState={lidState}
          springTension={springTension}
          stemMutes={stemMutes}
          onToggleMute={handleToggleStemMute}
        />
      </main>

      {/* Modals */}
      <PersonaInspectorModal
        personaId={inspectingPersonaId}
        docks={docks}
        onClose={() => setInspectingPersonaId(null)}
        onDockPersona={handleDockPersona}
      />

      <ConceptGuideModal
        isOpen={isConceptGuideOpen}
        onClose={() => setIsConceptGuideOpen(false)}
      />
    </div>
  );
}
