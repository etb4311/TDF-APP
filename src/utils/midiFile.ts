import { DeconstructedSong, NoteEvent } from '../types/music';
import { midiToNoteName } from './musicTheory';

function stringToBytes(str: string): number[] {
  return str.split('').map((c) => c.charCodeAt(0));
}

function numTo32Bit(n: number): number[] {
  return [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function numTo16Bit(n: number): number[] {
  return [(n >> 8) & 0xff, n & 0xff];
}

function writeVarLen(val: number): number[] {
  const bytes: number[] = [];
  let v = val & 0x7f;
  while ((val >>= 7)) {
    v <<= 8;
    v |= (val & 0x7f) | 0x80;
  }
  while (true) {
    bytes.push(v & 0xff);
    if (v & 0x80) v >>= 8;
    else break;
  }
  return bytes;
}

export function generateStandardMidi(song: DeconstructedSong): Uint8Array {
  const ticksPerBeat = 480;
  const ticksPer16th = ticksPerBeat / 4;

  const header = [
    ...stringToBytes('MThd'),
    ...numTo32Bit(6),
    ...numTo16Bit(1),
    ...numTo16Bit(4),
    ...numTo16Bit(ticksPerBeat),
  ];

  const tempoTrackEvents: number[] = [
    ...writeVarLen(0),
    0xff,
    0x51,
    0x03,
    ...numTo32Bit(Math.round(60000000 / song.rhythmicDNA.bpm)).slice(1),
    ...writeVarLen(ticksPerBeat * 4),
    0xff,
    0x2f,
    0x00,
  ];

  const buildNoteTrack = (notes: NoteEvent[], channel: number): number[] => {
    interface MEvent {
      tick: number;
      type: 'on' | 'off';
      pitch: number;
      vel: number;
    }
    const events: MEvent[] = [];

    notes.forEach((n) => {
      const startTick = n.startStep * ticksPer16th;
      const endTick = startTick + n.durationSteps * ticksPer16th;
      events.push({ tick: startTick, type: 'on', pitch: n.pitch, vel: n.velocity });
      events.push({ tick: endTick, type: 'off', pitch: n.pitch, vel: 0 });
    });

    events.sort((a, b) => a.tick - b.tick);

    const trackData: number[] = [];
    let lastTick = 0;

    events.forEach((ev) => {
      const delta = Math.max(0, ev.tick - lastTick);
      lastTick = ev.tick;
      trackData.push(...writeVarLen(delta));
      if (ev.type === 'on') {
        trackData.push(0x90 | (channel & 0x0f), ev.pitch, ev.vel);
      } else {
        trackData.push(0x80 | (channel & 0x0f), ev.pitch, 0);
      }
    });

    trackData.push(...writeVarLen(0), 0xff, 0x2f, 0x00);
    return [...stringToBytes('MTrk'), ...numTo32Bit(trackData.length), ...trackData];
  };

  const leadTrack = buildNoteTrack(song.stems.lead, 0);
  const chordsTrack = buildNoteTrack(song.stems.chords, 1);
  const bassTrack = buildNoteTrack(song.stems.bass, 2);

  const tempoTrack = [...stringToBytes('MTrk'), ...numTo32Bit(tempoTrackEvents.length), ...tempoTrackEvents];

  const allBytes = new Uint8Array([
    ...header,
    ...tempoTrack,
    ...leadTrack,
    ...chordsTrack,
    ...bassTrack,
  ]);

  return allBytes;
}

export function parseMidiFile(buffer: ArrayBuffer, fileName: string): Partial<DeconstructedSong> {
  const bytes = new Uint8Array(buffer);
  let bpm = 120;
  const leadNotes: NoteEvent[] = [];
  const bassNotes: NoteEvent[] = [];

  for (let i = 0; i < bytes.length - 6; i++) {
    if (bytes[i] === 0xff && bytes[i + 1] === 0x51 && bytes[i + 2] === 0x03) {
      const microsecondsPerBeat = (bytes[i + 3] << 16) | (bytes[i + 4] << 8) | bytes[i + 5];
      bpm = Math.round(60000000 / microsecondsPerBeat);
      break;
    }
  }

  let stepCounter = 0;
  for (let i = 0; i < bytes.length - 2; i++) {
    const status = bytes[i];
    if ((status & 0xf0) === 0x90) {
      const pitch = bytes[i + 1];
      const vel = bytes[i + 2];
      if (vel > 0 && pitch >= 24 && pitch <= 108) {
        const startStep = stepCounter % 16;
        const noteEvent: NoteEvent = {
          pitch,
          noteName: midiToNoteName(pitch),
          startStep,
          durationSteps: 2,
          velocity: vel,
        };
        if (pitch < 48) {
          bassNotes.push(noteEvent);
        } else {
          leadNotes.push(noteEvent);
        }
        stepCounter++;
      }
    }
  }

  return {
    id: `imported-${Date.now()}`,
    title: fileName.replace(/\.midi?$/i, ''),
    rhythmicDNA: {
      bpm: bpm || 120,
      timeSignature: [4, 4],
      swingPercent: 15,
      syncopationScore: 60,
      grooveFeel: 'straight',
      accentGrid: [1, 0.4, 0.8, 0.4, 0.9, 0.3, 0.8, 0.4, 1, 0.4, 0.8, 0.4, 0.9, 0.3, 0.8, 0.4],
      humanizeTimingMs: 6,
    },
    stems: {
      lead: leadNotes.slice(0, 32),
      chords: [],
      bass: bassNotes.slice(0, 16),
      drums: {
        kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
        snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
        perc: [false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false],
      },
    },
  };
}
