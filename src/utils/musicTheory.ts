import { ChordQuality, ScaleMode } from '../types/music';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALE_INTERVALS: Record<ScaleMode, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  blues: [0, 3, 5, 6, 7, 10],
  pentatonic: [0, 2, 4, 7, 9],
};

export const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  '7': [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dim: [0, 3, 6],
  sus4: [0, 5, 7],
  '9': [0, 4, 7, 10, 14],
  min9: [0, 3, 7, 10, 14],
  '11': [0, 4, 7, 10, 14, 17],
  m7b5: [0, 3, 6, 10],
};

export function midiToFreq(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

export function midiToNoteName(midiNote: number): string {
  const note = NOTE_NAMES[((midiNote % 12) + 12) % 12];
  const octave = Math.floor(midiNote / 12) - 1;
  return `${note}${octave}`;
}

export function noteNameToMidi(name: string, defaultOctave = 4): number {
  const match = name.match(/^([A-G][#b]?)(-?\d+)?$/i);
  if (!match) return 60;
  let root = match[1].toUpperCase();
  if (root === 'DB') root = 'C#';
  else if (root === 'EB') root = 'D#';
  else if (root === 'GB') root = 'F#';
  else if (root === 'AB') root = 'G#';
  else if (root === 'BB') root = 'A#';

  const noteIndex = NOTE_NAMES.indexOf(root);
  const octave = match[2] !== undefined ? parseInt(match[2], 10) : defaultOctave;
  return (octave + 1) * 12 + (noteIndex !== -1 ? noteIndex : 0);
}

export function getScaleNotes(rootNote: string, mode: ScaleMode, octave = 4): number[] {
  const rootMidi = noteNameToMidi(rootNote, octave);
  const intervals = SCALE_INTERVALS[mode] || SCALE_INTERVALS.major;
  return intervals.map((int) => rootMidi + int);
}

export function isNoteInScale(midiNote: number, rootNote: string, mode: ScaleMode): boolean {
  const rootIndex = NOTE_NAMES.indexOf(rootNote.toUpperCase().replace('B', '#'));
  const noteIndex = midiNote % 12;
  const relativeInterval = (noteIndex - rootIndex + 12) % 12;
  const intervals = SCALE_INTERVALS[mode] || SCALE_INTERVALS.major;
  return intervals.includes(relativeInterval);
}

export function quantizeToScale(midiNote: number, rootNote: string, mode: ScaleMode): number {
  if (isNoteInScale(midiNote, rootNote, mode)) return midiNote;
  for (let offset = 1; offset <= 6; offset++) {
    if (isNoteInScale(midiNote + offset, rootNote, mode)) return midiNote + offset;
    if (isNoteInScale(midiNote - offset, rootNote, mode)) return midiNote - offset;
  }
  return midiNote;
}

export function buildChordPitches(
  root: string,
  quality: ChordQuality,
  octave = 4,
  inversion = 0,
  voicing: 'simple' | 'extended' | 'open' | 'power' = 'simple'
): number[] {
  const rootMidi = noteNameToMidi(root, octave);
  let intervals = [...(CHORD_INTERVALS[quality] || CHORD_INTERVALS.maj)];

  if (voicing === 'power') {
    intervals = [0, 7, 12];
  } else if (voicing === 'extended') {
    if (quality === 'maj' || quality === 'maj7') intervals = [0, 4, 7, 11, 14];
    else if (quality === 'min' || quality === 'min7') intervals = [0, 3, 7, 10, 14];
    else if (quality === '7') intervals = [0, 4, 7, 10, 14];
  } else if (voicing === 'open') {
    if (intervals.length >= 3) {
      const dropNote = intervals[1];
      intervals.splice(1, 1);
      intervals.unshift(dropNote - 12);
    }
  }

  let pitches = intervals.map((int) => rootMidi + int);

  for (let i = 0; i < inversion && i < pitches.length; i++) {
    const bottom = pitches.shift()!;
    pitches.push(bottom + 12);
  }

  return pitches;
}
