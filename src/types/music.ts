export type ScaleMode =
  | 'major'
  | 'minor'
  | 'dorian'
  | 'mixolydian'
  | 'lydian'
  | 'phrygian'
  | 'blues'
  | 'pentatonic';

export type ChordQuality =
  | 'maj'
  | 'min'
  | '7'
  | 'maj7'
  | 'min7'
  | 'dim'
  | 'sus4'
  | '9'
  | 'min9'
  | '11'
  | 'm7b5';

export interface ChordValue {
  root: string;
  quality: ChordQuality;
  roman: string;
  durationBeats: number;
  bassNote?: string;
  pitches: number[]; // MIDI note numbers
}

export interface HarmonicDNA {
  key: string; // e.g. "C", "F#", "Eb"
  scale: ScaleMode;
  progression: ChordValue[];
  harmonicComplexity: number; // 0-100
  harmonicRhythm: '1 chord/bar' | '2 chords/bar' | 'syncopated' | 'modal-drone';
  voiceLeadingTension: number; // 0-100
}

export type GrooveStyle =
  | 'straight'
  | 'laidback-swing'
  | 'dilla-push-pull'
  | 'bossa-clave'
  | 'funky-16th'
  | 'four-on-floor';

export interface RhythmicDNA {
  bpm: number;
  timeSignature: [number, number];
  swingPercent: number; // 0-100
  syncopationScore: number; // 0-100
  grooveFeel: GrooveStyle;
  accentGrid: number[]; // 16 steps, values 0.0 - 1.0
  humanizeTimingMs: number; // micro-timing offset jitter
}

export interface NoteEvent {
  pitch: number; // MIDI number 0-127
  noteName: string; // e.g. "C4"
  startStep: number; // 0-15 or 0-31
  durationSteps: number;
  velocity: number; // 0-127
}

export interface MelodicDNA {
  range: { minPitch: number; maxPitch: number };
  contour: 'ascending' | 'descending' | 'arch' | 'wave' | 'stepwise' | 'angular';
  motifRepetition: number; // 0-100
  stepVsLeapRatio: number; // 0-100
  notes: NoteEvent[];
}

export interface DrumStepPattern {
  kick: boolean[];
  snare: boolean[];
  hihat: boolean[];
  perc: boolean[];
}

export interface StemLayers {
  lead: NoteEvent[];
  chords: NoteEvent[];
  bass: NoteEvent[];
  drums: DrumStepPattern;
}

export interface DeconstructedSong {
  id: string;
  title: string;
  originalArtist: string;
  genre: string;
  year?: string;
  harmonicDNA: HarmonicDNA;
  rhythmicDNA: RhythmicDNA;
  melodicDNA: MelodicDNA;
  stems: StemLayers;
  tags: string[];
  description: string;
}

export type ReconstructStyle =
  | 'synthwave'
  | 'lofi'
  | 'nu-disco'
  | 'cinematic'
  | 'bossa'
  | 'chiptune';

export interface ReconstructionParameters {
  targetStyle: ReconstructStyle;
  targetBpm: number;
  transposeSemitones: number;
  targetScale: ScaleMode;
  voicingComplexity: 'simple' | 'extended' | 'open' | 'power';
  swingFactor: number; // 0-100
  density: number; // 0-100
  arpPattern: 'none' | 'up' | 'down' | 'updown' | 'random' | 'stab';
  arpRate: '1/4' | '1/8' | '1/16' | '1/32';
  bassStyle: 'walking' | 'sub-808' | 'pumping-octaves' | 'syncopated' | 'arpeggiated';
  drumGroove: 'electronic' | 'acoustic-brush' | 'four-floor' | 'trap-half' | 'bossa-rim';
  activeStems: {
    drums: boolean;
    bass: boolean;
    chords: boolean;
    lead: boolean;
    arp: boolean;
  };
}

export type MidiInteractionMode =
  | 'conductor' // play keys to trigger transposed progression
  | 'scale-snap' // any key pressed snaps to current song scale/chord
  | 'arp-jam' // hold keys to run reconstructed arps
  | 'stem-trigger'; // pads/keys trigger individual stem loops

export interface MidiNoteMessage {
  type: 'noteOn' | 'noteOff';
  note: number;
  velocity: number;
  channel: number;
  timestamp: number;
}
