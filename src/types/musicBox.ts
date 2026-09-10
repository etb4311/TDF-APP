export type PersonaId = 'fox' | 'eagle' | 'beetle' | 'salmon' | 'frog';

export type DockId = 'rhythm' | 'bass' | 'harmony' | 'melody' | 'atmosphere';

export interface PersonaProfile {
  id: PersonaId;
  name: string;
  species: string;
  title: string;
  folkRole: string;
  avatarIcon: string;
  primaryColor: string; // Tailwind color class / hex
  secondaryColor: string;
  accentBg: string;
  quote: string;
  lore: string;
  
  // Dock-specific traits
  rhythmPersona: {
    bpm: number;
    timeFeel: 'fast-hoedown' | 'train-gallop' | 'heavy-porch-stomp' | 'flowing-waltz' | 'swamp-drag';
    swingPercent: number;
    drumPatternName: string;
    description: string;
  };
  bassPersona: {
    styleName: string;
    instrument: 'washtub-bass' | 'upright-acoustic' | 'hollow-jug' | 'walking-thumb';
    description: string;
  };
  harmonyPersona: {
    styleName: string;
    instrument: 'acoustic-guitar' | 'clawhammer-banjo' | 'campfire-accordion' | 'reed-harmonium';
    progressionType: string;
    description: string;
  };
  melodyPersona: {
    styleName: string;
    instrument: 'wild-fiddle' | 'soaring-banjo' | 'blues-harmonica' | 'fingerstyle-lead' | 'wooden-flute';
    description: string;
  };
  atmospherePersona: {
    styleName: string;
    textureType: 'pine-crackles' | 'canyon-wind' | 'nocturnal-crickets' | 'river-stream' | 'swamp-peepers';
    description: string;
  };
}

export interface DockDefinition {
  id: DockId;
  slotNumber: number;
  name: string;
  shortLabel: string;
  instrumentLabel: string;
  hardwarePin: string;
  description: string;
  governs: string;
  iconName: string;
}

export interface InterpersonalDynamicEffect {
  id: string;
  title: string;
  personasInvolved: PersonaId[];
  description: string;
  musicalImpact: string;
  tempoModifier: number; // e.g. +4 or -6 BPM
  specialTexture: string;
}

export interface NoteEvent {
  pitch: number; // MIDI note number
  noteName: string;
  startStep: number; // 0 to 15 (or 31)
  durationSteps: number;
  velocity: number; // 0 to 127
  instrumentVoice?: string;
  articulation?: 'staccato' | 'legato' | 'slide' | 'vibrato' | 'accent';
}

export interface DrumStepGrid {
  stomp: boolean[];
  brushOrSnare: boolean[];
  tambourineOrHat: boolean[];
  accentPerc: boolean[]; // spoons, jug, wood block
}

export interface CompositionParameters {
  bpmOverride: number | null; // null = use band leader's persona BPM
  bpmMultiplier: 0.5 | 1.0 | 1.5 | 2.0;
  swingPercentOverride: number | null; // null = use persona swing
  keyRootOverride: string | null; // e.g. 'C', 'D', 'E', 'G', 'A'
  scaleModeOverride: string | null; // e.g. 'Major Pentatonic', 'Appalachian Hexatonic', 'Dorian Folk', 'Mixolydian Blues', 'Natural Minor'
  transpositionSemitones: number; // -12 to +12
  voicingComplexity: 'cowboy-open' | 'extended-folk' | 'triads' | 'drone-fifth';
  soundTimbres: {
    stompPitchHz: number; // 70 to 160
    snareDecayMs: number; // 60 to 240
    washtubCutoffHz: number; // 250 to 900
    washtubResonance: number; // 1 to 6
    guitarBrightnessHz: number; // 1200 to 3800
    fiddleVibratoRateHz: number; // 3.5 to 8.0
    fiddleVibratoDepthCents: number; // 5 to 30
    harmonicaBendMs: number; // 20 to 120
    campfireCrackleIntensity: number; // 0.2 to 2.0
  };
}

export interface ComposedFolkSong {
  title: string;
  bandLeader: PersonaProfile;
  bpm: number;
  swingPercent: number;
  key: string;
  scale: string;
  activeDocksCount: number;
  dynamics: InterpersonalDynamicEffect[];
  stems: {
    rhythm: DrumStepGrid;
    bass: NoteEvent[];
    harmony: NoteEvent[];
    melody: NoteEvent[];
    atmosphere: NoteEvent[];
  };
  chordProgression: {
    root: string;
    quality: string;
    roman: string;
    pitches: number[];
  }[];
  parametersUsed: CompositionParameters;
}

export interface MusicBoxConfig {
  docks: Record<DockId, PersonaId | null>;
  lidState: 'open' | 'closed';
  isWoundUp: boolean;
  springTension: number; // 0 to 100
  peekDioramaWhileClosed: boolean;
  campfireEmbersSound: boolean;
}
