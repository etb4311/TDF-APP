import {
  PersonaId,
  DockId,
  ComposedFolkSong,
  DrumStepGrid,
  NoteEvent,
  InterpersonalDynamicEffect,
  CompositionParameters,
} from '../types/musicBox';
import { PERSONAS, INTERPERSONAL_DYNAMICS } from './personaData';

export const DEFAULT_COMPOSITION_PARAMS: CompositionParameters = {
  bpmOverride: null,
  bpmMultiplier: 1.0,
  swingPercentOverride: null,
  keyRootOverride: null,
  scaleModeOverride: null,
  transpositionSemitones: 0,
  voicingComplexity: 'cowboy-open',
  soundTimbres: {
    stompPitchHz: 110,
    snareDecayMs: 120,
    washtubCutoffHz: 450,
    washtubResonance: 3,
    guitarBrightnessHz: 2200,
    fiddleVibratoRateHz: 5.8,
    fiddleVibratoDepthCents: 15,
    harmonicaBendMs: 60,
    campfireCrackleIntensity: 1.0,
  },
};

export function composeMusicBoxSong(
  docks: Record<DockId, PersonaId | null>,
  params: CompositionParameters = DEFAULT_COMPOSITION_PARAMS
): ComposedFolkSong {
  // Determine Band Leader: The persona in Dock 1 (Rhythm), or the first occupied dock
  const rhythmPersonaId = docks.rhythm;
  const activePersonas = Object.values(docks).filter((p): p is PersonaId => p !== null);
  const activeDocksCount = activePersonas.length;

  const bandLeaderId = rhythmPersonaId || activePersonas[0] || 'fox';
  const bandLeader = PERSONAS[bandLeaderId];

  // Detect Interpersonal Dynamics
  const activeDynamics: InterpersonalDynamicEffect[] = [];
  INTERPERSONAL_DYNAMICS.forEach((dyn) => {
    const allPresent = dyn.personasInvolved.every((p) => activePersonas.includes(p));
    if (allPresent) {
      activeDynamics.push(dyn);
    }
  });

  // Calculate BPM: Base BPM from Rhythm Persona + Interpersonal Dynamic modifiers
  const rawBaseBpm = rhythmPersonaId ? PERSONAS[rhythmPersonaId].rhythmPersona.bpm : 100;
  const tempoMod = activeDynamics.reduce((acc, d) => acc + d.tempoModifier, 0);
  const calculatedBpm = Math.max(50, Math.min(180, rawBaseBpm + tempoMod));
  const finalBpm = params.bpmOverride !== null
    ? Math.round(params.bpmOverride * params.bpmMultiplier)
    : Math.round(calculatedBpm * params.bpmMultiplier);

  // Calculate Swing
  const baseSwing = rhythmPersonaId ? PERSONAS[rhythmPersonaId].rhythmPersona.swingPercent : 20;
  const finalSwing = params.swingPercentOverride !== null ? params.swingPercentOverride : baseSwing;

  // Determine Harmonic Framework
  const harmonyPersonaId = docks.harmony;
  const naturalKey = harmonyPersonaId === 'eagle' ? 'D Major' : harmonyPersonaId === 'beetle' ? 'E Blues' : harmonyPersonaId === 'frog' ? 'A Blues' : harmonyPersonaId === 'salmon' ? 'C Major' : 'G Major';
  const naturalScale = harmonyPersonaId === 'beetle' || harmonyPersonaId === 'frog' ? 'Mixolydian/Blues' : 'Diatonic Folk';

  const key = params.keyRootOverride ? `${params.keyRootOverride} Folk` : naturalKey;
  const scale = params.scaleModeOverride || naturalScale;

  // 4-measure chord progression mapped to 16 steps (4 steps per chord)
  const baseChordProgression = getChordProgression(harmonyPersonaId);
  const chordProgression = baseChordProgression.map((chord) => ({
    ...chord,
    pitches: chord.pitches.map((p) => p + params.transpositionSemitones),
  }));

  // Generate Rhythm Stems
  const rhythmGrid = generateRhythmGrid(rhythmPersonaId, activeDynamics);

  // Generate Bass Notes with transposition
  const rawBassNotes = generateBassNotes(docks.bass, chordProgression, activeDynamics);
  const bassNotes = rawBassNotes.map((n) => ({
    ...n,
    pitch: n.pitch + params.transpositionSemitones,
  }));

  // Generate Harmony Notes with transposition
  const rawHarmonyNotes = generateHarmonyNotes(docks.harmony, chordProgression);
  const harmonyNotes = rawHarmonyNotes.map((n) => ({
    ...n,
    pitch: n.pitch + params.transpositionSemitones,
  }));

  // Generate Melody Notes with transposition
  const rawMelodyNotes = generateMelodyNotes(docks.melody, chordProgression, activeDynamics);
  const melodyNotes = rawMelodyNotes.map((n) => ({
    ...n,
    pitch: n.pitch + params.transpositionSemitones,
  }));

  // Generate Atmosphere Notes with transposition
  const rawAtmosphereNotes = generateAtmosphereNotes(docks.atmosphere, chordProgression);
  const atmosphereNotes = rawAtmosphereNotes.map((n) => ({
    ...n,
    pitch: n.pitch + params.transpositionSemitones,
  }));

  // Build Song Title
  const songTitle = getSongTitle(rhythmPersonaId, docks.melody, activeDynamics);

  return {
    title: songTitle,
    bandLeader,
    bpm: finalBpm,
    swingPercent: finalSwing,
    key,
    scale,
    activeDocksCount,
    dynamics: activeDynamics,
    stems: {
      rhythm: rhythmGrid,
      bass: bassNotes,
      harmony: harmonyNotes,
      melody: melodyNotes,
      atmosphere: atmosphereNotes,
    },
    chordProgression,
    parametersUsed: params,
  };
}

function getChordProgression(harmonyPersona: PersonaId | null) {
  if (harmonyPersona === 'eagle') {
    // D - G - A - D (Frontier Modal)
    return [
      { root: 'D', quality: 'Major', roman: 'I', pitches: [50, 54, 57, 62] },
      { root: 'G', quality: 'Major', roman: 'IV', pitches: [47, 55, 59, 62] },
      { root: 'A', quality: 'Major', roman: 'V', pitches: [45, 52, 57, 61] },
      { root: 'D', quality: 'Major', roman: 'I', pitches: [50, 54, 57, 62] },
    ];
  }
  if (harmonyPersona === 'beetle') {
    // E - A - B7 - E (Deep Delta Blues)
    return [
      { root: 'E', quality: 'Minor/Blues', roman: 'i', pitches: [40, 47, 52, 55] },
      { root: 'A', quality: 'Dominant 7th', roman: 'IV7', pitches: [45, 52, 55, 61] },
      { root: 'B', quality: 'Dominant 7th', roman: 'V7', pitches: [47, 53, 57, 59] },
      { root: 'E', quality: 'Minor/Blues', roman: 'i', pitches: [40, 47, 52, 55] },
    ];
  }
  if (harmonyPersona === 'salmon') {
    // C - Am - F - G (Campfire Ballad)
    return [
      { root: 'C', quality: 'Major', roman: 'I', pitches: [48, 52, 55, 60] },
      { root: 'Am', quality: 'Minor', roman: 'vi', pitches: [45, 48, 52, 57] },
      { root: 'F', quality: 'Major', roman: 'IV', pitches: [41, 48, 53, 57] },
      { root: 'G', quality: 'Major', roman: 'V', pitches: [43, 47, 50, 55] },
    ];
  }
  if (harmonyPersona === 'frog') {
    // A7 - D7 - E7 - A7 (Swamp Rag)
    return [
      { root: 'A', quality: 'Dom 7', roman: 'I7', pitches: [45, 49, 52, 55] },
      { root: 'D', quality: 'Dom 7', roman: 'IV7', pitches: [50, 54, 57, 60] },
      { root: 'E', quality: 'Dom 7', roman: 'V7', pitches: [52, 56, 59, 62] },
      { root: 'A', quality: 'Dom 7', roman: 'I7', pitches: [45, 49, 52, 55] },
    ];
  }
  // Default Fox / Generic Folk: G - C - D - G (Folk Hoe-down)
  return [
    { root: 'G', quality: 'Major', roman: 'I', pitches: [43, 47, 50, 55] },
    { root: 'C', quality: 'Major', roman: 'IV', pitches: [48, 52, 55, 60] },
    { root: 'D', quality: 'Major', roman: 'V', pitches: [50, 54, 57, 62] },
    { root: 'G', quality: 'Major', roman: 'I', pitches: [43, 47, 50, 55] },
  ];
}

function generateRhythmGrid(rhythmPersona: PersonaId | null, dynamics: InterpersonalDynamicEffect[]): DrumStepGrid {
  const stomp = new Array(16).fill(false);
  const brushOrSnare = new Array(16).fill(false);
  const tambourineOrHat = new Array(16).fill(false);
  const accentPerc = new Array(16).fill(false);

  if (!rhythmPersona) {
    // No rhythm docked -> silent percussion
    return { stomp, brushOrSnare, tambourineOrHat, accentPerc };
  }

  if (rhythmPersona === 'fox') {
    // Fast Barn Hoedown: Stomp on 0, 4, 8, 12; Snare brush on 2, 6, 10, 14; Wood block syncopations
    [0, 4, 8, 12].forEach((s) => (stomp[s] = true));
    [2, 6, 10, 14].forEach((s) => (brushOrSnare[s] = true));
    [0, 2, 4, 6, 8, 10, 12, 14, 15].forEach((s) => (tambourineOrHat[s] = true));
    [3, 7, 11, 14].forEach((s) => (accentPerc[s] = true)); // Wood block syncopations
  } else if (rhythmPersona === 'eagle') {
    // Frontier Locomotive Gallop: Driving kick on 0, 4, 8, 12 with brisk tambourine on all 16ths
    [0, 4, 8, 12].forEach((s) => (stomp[s] = true));
    [4, 12].forEach((s) => (brushOrSnare[s] = true));
    for (let i = 0; i < 16; i++) tambourineOrHat[i] = true;
    [2, 6, 10, 14].forEach((s) => (accentPerc[s] = true)); // Train chug spoons
  } else if (rhythmPersona === 'beetle') {
    // Deliberate Porch Chug: Heavy wooden porch stomp on 0 and 8, lazy brush on 4 and 12
    [0, 8].forEach((s) => (stomp[s] = true));
    [4, 12].forEach((s) => (brushOrSnare[s] = true));
    [2, 6, 10, 14].forEach((s) => (tambourineOrHat[s] = true));
    [0, 7, 8, 15].forEach((s) => (accentPerc[s] = true)); // Heavy wood thud
  } else if (rhythmPersona === 'salmon') {
    // Rolling River Brush Lilt: Rolling brush patter, cajon tap
    [0, 6, 12].forEach((s) => (stomp[s] = true));
    [2, 4, 8, 10, 14].forEach((s) => (brushOrSnare[s] = true));
    [0, 3, 6, 9, 12, 15].forEach((s) => (tambourineOrHat[s] = true));
    [5, 11].forEach((s) => (accentPerc[s] = true)); // River stone click
  } else if (rhythmPersona === 'frog') {
    // Bayou Half-Time Drag: Stomp on 0, 8, 11; Dragged spoons on 5, 13; Clay jug pops
    [0, 8, 11].forEach((s) => (stomp[s] = true));
    [5, 13].forEach((s) => (brushOrSnare[s] = true));
    [2, 6, 10, 14].forEach((s) => (tambourineOrHat[s] = true));
    [3, 7, 9, 15].forEach((s) => (accentPerc[s] = true)); // Hollow clay jug pop & spoons
  }

  // Interpersonal dynamic adjustments
  if (dynamics.some((d) => d.id === 'frog-fox-mischief')) {
    accentPerc[14] = true;
    accentPerc[15] = true;
  }

  return { stomp, brushOrSnare, tambourineOrHat, accentPerc };
}

function generateBassNotes(
  bassPersona: PersonaId | null,
  progression: ReturnType<typeof getChordProgression>,
  dynamics: InterpersonalDynamicEffect[]
): NoteEvent[] {
  if (!bassPersona) return [];

  const notes: NoteEvent[] = [];
  const instrument = PERSONAS[bassPersona].bassPersona.instrument;

  progression.forEach((chord, chordIdx) => {
    const startOffset = chordIdx * 4;
    const rootPitch = chord.pitches[0] - 12; // Transpose to bass register
    const fifthPitch = chord.pitches[2] - 12;

    if (bassPersona === 'beetle') {
      // Deep Subterranean Washtub Bass: Heavy sustaining root on beat 1, solid 5th on beat 3
      notes.push({
        pitch: rootPitch,
        noteName: chord.root,
        startStep: startOffset,
        durationSteps: 2,
        velocity: 110,
        instrumentVoice: instrument,
        articulation: 'accent',
      });
      notes.push({
        pitch: fifthPitch,
        noteName: `${chord.root} (5th)`,
        startStep: startOffset + 2,
        durationSteps: 2,
        velocity: 95,
        instrumentVoice: instrument,
      });
    } else if (bassPersona === 'fox') {
      // Bouncing Chromatic Walk: Alternating root-5th with playful passing notes
      notes.push({
        pitch: rootPitch,
        noteName: chord.root,
        startStep: startOffset,
        durationSteps: 1,
        velocity: 100,
        instrumentVoice: instrument,
        articulation: 'staccato',
      });
      notes.push({
        pitch: fifthPitch,
        noteName: `${chord.root} (5th)`,
        startStep: startOffset + 2,
        durationSteps: 1,
        velocity: 90,
        instrumentVoice: instrument,
        articulation: 'staccato',
      });
      // Chromatic passing note on step 3
      notes.push({
        pitch: rootPitch + (chordIdx % 2 === 0 ? 1 : -1),
        noteName: 'Walk',
        startStep: startOffset + 3,
        durationSteps: 1,
        velocity: 80,
        instrumentVoice: instrument,
      });
    } else if (bassPersona === 'eagle') {
      // Soaring Tenor Bass: Root, octave leap, high tenor sustain
      notes.push({
        pitch: rootPitch,
        noteName: chord.root,
        startStep: startOffset,
        durationSteps: 2,
        velocity: 105,
        instrumentVoice: instrument,
      });
      notes.push({
        pitch: rootPitch + 12, // Octave leap
        noteName: `${chord.root} 8va`,
        startStep: startOffset + 2,
        durationSteps: 2,
        velocity: 90,
        instrumentVoice: instrument,
        articulation: 'legato',
      });
    } else if (bassPersona === 'salmon') {
      // Liquid Walking Melodies: Smooth 4-step scalar connection
      notes.push({
        pitch: rootPitch,
        noteName: chord.root,
        startStep: startOffset,
        durationSteps: 1,
        velocity: 95,
        instrumentVoice: instrument,
      });
      notes.push({
        pitch: rootPitch + 4,
        noteName: '3rd',
        startStep: startOffset + 1,
        durationSteps: 1,
        velocity: 85,
        instrumentVoice: instrument,
      });
      notes.push({
        pitch: fifthPitch,
        noteName: '5th',
        startStep: startOffset + 2,
        durationSteps: 1,
        velocity: 90,
        instrumentVoice: instrument,
      });
      notes.push({
        pitch: fifthPitch + 2,
        noteName: '6th',
        startStep: startOffset + 3,
        durationSteps: 1,
        velocity: 85,
        instrumentVoice: instrument,
      });
    } else if (bassPersona === 'frog') {
      // Hollow Clay Jug Drops: Syncopated scoops on beat 1 and upbeat of 2
      notes.push({
        pitch: rootPitch,
        noteName: chord.root,
        startStep: startOffset,
        durationSteps: 1.5,
        velocity: 105,
        instrumentVoice: instrument,
        articulation: 'slide',
      });
      notes.push({
        pitch: fifthPitch,
        noteName: 'Jug Pop',
        startStep: startOffset + 3,
        durationSteps: 1,
        velocity: 95,
        instrumentVoice: instrument,
        articulation: 'accent',
      });
    }
  });

  return notes;
}

function generateHarmonyNotes(
  harmonyPersona: PersonaId | null,
  progression: ReturnType<typeof getChordProgression>
): NoteEvent[] {
  if (!harmonyPersona) return [];

  const notes: NoteEvent[] = [];
  const instrument = PERSONAS[harmonyPersona].harmonyPersona.instrument;

  progression.forEach((chord, chordIdx) => {
    const startOffset = chordIdx * 4;

    if (harmonyPersona === 'fox') {
      // Offbeat Chop Chords: Sharp stabs on backbeats (steps 1 and 3 of the measure)
      [1, 3].forEach((offbeat) => {
        chord.pitches.forEach((pitch) => {
          notes.push({
            pitch,
            noteName: chord.root,
            startStep: startOffset + offbeat,
            durationSteps: 0.8,
            velocity: 85,
            instrumentVoice: instrument,
            articulation: 'staccato',
          });
        });
      });
    } else if (harmonyPersona === 'eagle') {
      // Resonant Open-String Drones: Sustaining chord with ringing 5th drone string (G4 or A4)
      chord.pitches.forEach((pitch, pIdx) => {
        notes.push({
          pitch,
          noteName: chord.root,
          startStep: startOffset + (pIdx * 0.5), // slight strum roll
          durationSteps: 3.5,
          velocity: 80,
          instrumentVoice: instrument,
          articulation: 'legato',
        });
      });
    } else if (harmonyPersona === 'salmon') {
      // Travis-Picked Acoustic Arpeggios: Cascading 4-step fingerpick roll
      chord.pitches.forEach((pitch, pIdx) => {
        notes.push({
          pitch,
          noteName: chord.root,
          startStep: startOffset + pIdx,
          durationSteps: 1,
          velocity: 78,
          instrumentVoice: instrument,
        });
      });
    } else if (harmonyPersona === 'frog') {
      // Reed Harmonium & Swamp Organ: Long warm breathy chords with dynamic swell
      chord.pitches.slice(0, 3).forEach((pitch) => {
        notes.push({
          pitch,
          noteName: chord.root,
          startStep: startOffset,
          durationSteps: 3.8,
          velocity: 70,
          instrumentVoice: instrument,
        });
      });
    } else if (harmonyPersona === 'beetle') {
      // Heavy Thumbed Blues Strums: Low-register down-stroke on step 0 and 2
      [0, 2].forEach((beat) => {
        chord.pitches.forEach((pitch) => {
          notes.push({
            pitch,
            noteName: chord.root,
            startStep: startOffset + beat,
            durationSteps: 1.6,
            velocity: 90,
            instrumentVoice: instrument,
            articulation: 'accent',
          });
        });
      });
    }
  });

  return notes;
}

function generateMelodyNotes(
  melodyPersona: PersonaId | null,
  progression: ReturnType<typeof getChordProgression>,
  dynamics: InterpersonalDynamicEffect[]
): NoteEvent[] {
  if (!melodyPersona) return [];

  const notes: NoteEvent[] = [];
  const instrument = PERSONAS[melodyPersona].melodyPersona.instrument;

  progression.forEach((chord, chordIdx) => {
    const startOffset = chordIdx * 4;
    const basePitch = chord.pitches[1] + 12; // Lead octave

    if (melodyPersona === 'fox') {
      // Blistering Hoedown Fiddle: Rapid double stops and ornamented arpeggios
      notes.push({
        pitch: basePitch,
        noteName: 'Fiddle Lead',
        startStep: startOffset,
        durationSteps: 0.9,
        velocity: 100,
        instrumentVoice: instrument,
        articulation: 'accent',
      });
      notes.push({
        pitch: basePitch + 2,
        noteName: 'Fiddle Run',
        startStep: startOffset + 1,
        durationSteps: 0.9,
        velocity: 90,
        instrumentVoice: instrument,
      });
      notes.push({
        pitch: basePitch + 4,
        noteName: 'Double Stop',
        startStep: startOffset + 2,
        durationSteps: 0.9,
        velocity: 95,
        instrumentVoice: instrument,
      });
      notes.push({
        pitch: basePitch + 7,
        noteName: 'High Hook',
        startStep: startOffset + 3,
        durationSteps: 0.9,
        velocity: 105,
        instrumentVoice: instrument,
        articulation: 'vibrato',
      });
    } else if (melodyPersona === 'eagle') {
      // Cascading 5-String Banjo Rolls: High soaring 3-finger rolls
      [0, 1, 2, 3].forEach((step, sIdx) => {
        const rollPitch = basePitch + (sIdx === 0 ? 0 : sIdx === 1 ? 4 : sIdx === 2 ? 7 : 12);
        notes.push({
          pitch: rollPitch,
          noteName: 'Banjo Roll',
          startStep: startOffset + step,
          durationSteps: 0.8,
          velocity: 90,
          instrumentVoice: instrument,
        });
      });
    } else if (melodyPersona === 'beetle') {
      // Soulful Campfire Harmonica Riffs: Long, brooding bends and soulful holds
      notes.push({
        pitch: basePitch - 2,
        noteName: 'Harp Bend',
        startStep: startOffset,
        durationSteps: 2.2,
        velocity: 95,
        instrumentVoice: instrument,
        articulation: 'slide',
      });
      notes.push({
        pitch: basePitch,
        noteName: 'Harp Hold',
        startStep: startOffset + 2.5,
        durationSteps: 1.4,
        velocity: 90,
        instrumentVoice: instrument,
        articulation: 'vibrato',
      });
    } else if (melodyPersona === 'salmon') {
      // Lyrical River Flute & Guitar: Graceful, cascading folk ballad phrasing
      notes.push({
        pitch: basePitch + 4,
        noteName: 'Lyrical Flute',
        startStep: startOffset,
        durationSteps: 1.5,
        velocity: 85,
        instrumentVoice: instrument,
        articulation: 'legato',
      });
      notes.push({
        pitch: basePitch + 2,
        noteName: 'River Turn',
        startStep: startOffset + 2,
        durationSteps: 1,
        velocity: 80,
        instrumentVoice: instrument,
      });
      notes.push({
        pitch: basePitch,
        noteName: 'Cadence',
        startStep: startOffset + 3,
        durationSteps: 1,
        velocity: 85,
        instrumentVoice: instrument,
      });
    } else if (melodyPersona === 'frog') {
      // Wailing Bayou Blues Harp: Eccentric, bent notes with syncopated ribbits
      notes.push({
        pitch: basePitch - 3,
        noteName: 'Blues Ribbit',
        startStep: startOffset + 0.5,
        durationSteps: 1.2,
        velocity: 95,
        instrumentVoice: instrument,
        articulation: 'slide',
      });
      notes.push({
        pitch: basePitch + 3,
        noteName: 'Overblow Wail',
        startStep: startOffset + 2,
        durationSteps: 1.8,
        velocity: 100,
        instrumentVoice: instrument,
        articulation: 'vibrato',
      });
    }
  });

  return notes;
}

function generateAtmosphereNotes(
  atmospherePersona: PersonaId | null,
  progression: ReturnType<typeof getChordProgression>
): NoteEvent[] {
  if (!atmospherePersona) return [];

  const notes: NoteEvent[] = [];
  const texture = PERSONAS[atmospherePersona].atmospherePersona.textureType;

  // Atmosphere events on measure boundaries
  progression.forEach((chord, chordIdx) => {
    const startOffset = chordIdx * 4;
    const chimePitch = chord.pitches[2] + 24; // High chime octave

    notes.push({
      pitch: chimePitch,
      noteName: `${atmospherePersona} texture`,
      startStep: startOffset,
      durationSteps: 3.5,
      velocity: 60,
      instrumentVoice: texture,
    });
  });

  return notes;
}

function getSongTitle(
  rhythmPersona: PersonaId | null,
  melodyPersona: PersonaId | null,
  dynamics: InterpersonalDynamicEffect[]
): string {
  if (dynamics.some((d) => d.id === 'full-camp-assembly')) {
    return 'The Great Campfire Guild Ballad';
  }
  if (dynamics.some((d) => d.id === 'fox-eagle-speed')) {
    return 'Canyon Wind Hoedown';
  }
  if (dynamics.some((d) => d.id === 'beetle-frog-mud')) {
    return 'Bayou Bottom Blues';
  }
  if (dynamics.some((d) => d.id === 'eagle-salmon-mountain')) {
    return 'Glacial River Reverie';
  }
  if (dynamics.some((d) => d.id === 'fox-beetle-tension')) {
    return 'The Porch & The Pine';
  }

  const leaderName = rhythmPersona ? PERSONAS[rhythmPersona].name.split(' ')[0] : 'Midnight';
  const melodyName = melodyPersona ? PERSONAS[melodyPersona].name.split(' ')[0] : 'Embers';
  return `${leaderName} & ${melodyName}’s Campfire Song`;
}
