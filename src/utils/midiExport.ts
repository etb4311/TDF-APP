import { ComposedFolkSong } from '../types/musicBox';

// Exports the composed folk music box song as a standard multi-track MIDI file (.mid)
export function exportSongToMidi(song: ComposedFolkSong): Blob {
  const ticksPerBeat = 480;
  const ticksPerStep = ticksPerBeat / 4; // 16th notes = 120 ticks

  // Collect all events with their absolute tick time
  interface MidiEventItem {
    tick: number;
    type: 'noteOn' | 'noteOff';
    channel: number;
    pitch: number;
    velocity: number;
  }

  const events: MidiEventItem[] = [];

  // 1. Rhythm Track (Channel 9 = standard MIDI percussion)
  const rhythm = song.stems.rhythm;
  for (let step = 0; step < 16; step++) {
    const tick = step * ticksPerStep;
    if (rhythm.stomp[step]) {
      events.push({ tick, type: 'noteOn', channel: 9, pitch: 36, velocity: 100 }); // Bass drum / stomp
      events.push({ tick: tick + ticksPerStep - 10, type: 'noteOff', channel: 9, pitch: 36, velocity: 0 });
    }
    if (rhythm.brushOrSnare[step]) {
      events.push({ tick, type: 'noteOn', channel: 9, pitch: 38, velocity: 85 }); // Snare / brush
      events.push({ tick: tick + ticksPerStep - 10, type: 'noteOff', channel: 9, pitch: 38, velocity: 0 });
    }
    if (rhythm.tambourineOrHat[step]) {
      events.push({ tick, type: 'noteOn', channel: 9, pitch: 54, velocity: 75 }); // Tambourine
      events.push({ tick: tick + ticksPerStep - 10, type: 'noteOff', channel: 9, pitch: 54, velocity: 0 });
    }
    if (rhythm.accentPerc[step]) {
      events.push({ tick, type: 'noteOn', channel: 9, pitch: 76, velocity: 90 }); // Woodblock / spoons
      events.push({ tick: tick + ticksPerStep - 10, type: 'noteOff', channel: 9, pitch: 76, velocity: 0 });
    }
  }

  // 2. Bass (Channel 0)
  song.stems.bass.forEach((note) => {
    const startTick = note.startStep * ticksPerStep;
    const endTick = startTick + note.durationSteps * ticksPerStep - 10;
    events.push({ tick: startTick, type: 'noteOn', channel: 0, pitch: note.pitch, velocity: note.velocity });
    events.push({ tick: endTick, type: 'noteOff', channel: 0, pitch: note.pitch, velocity: 0 });
  });

  // 3. Harmony (Channel 1)
  song.stems.harmony.forEach((note) => {
    const startTick = note.startStep * ticksPerStep;
    const endTick = startTick + note.durationSteps * ticksPerStep - 10;
    events.push({ tick: startTick, type: 'noteOn', channel: 1, pitch: note.pitch, velocity: note.velocity });
    events.push({ tick: endTick, type: 'noteOff', channel: 1, pitch: note.pitch, velocity: 0 });
  });

  // 4. Melody (Channel 2)
  song.stems.melody.forEach((note) => {
    const startTick = note.startStep * ticksPerStep;
    const endTick = startTick + note.durationSteps * ticksPerStep - 10;
    events.push({ tick: startTick, type: 'noteOn', channel: 2, pitch: note.pitch, velocity: note.velocity });
    events.push({ tick: endTick, type: 'noteOff', channel: 2, pitch: note.pitch, velocity: 0 });
  });

  // Sort events chronologically
  events.sort((a, b) => a.tick - b.tick);

  // Encode to binary SMF Format 0
  const trackBytes: number[] = [];

  // Meta Event: Set Tempo (microsec per quarter note)
  // 60,000,000 / BPM
  const microsecPerQuarter = Math.round(60000000 / song.bpm);
  trackBytes.push(
    0x00, // Delta time 0
    0xff,
    0x51,
    0x03, // Set tempo meta event length 3
    (microsecPerQuarter >> 16) & 0xff,
    (microsecPerQuarter >> 8) & 0xff,
    microsecPerQuarter & 0xff
  );

  let currentTick = 0;
  events.forEach((ev) => {
    const delta = Math.max(0, ev.tick - currentTick);
    currentTick = ev.tick;

    // Write Variable Length Quantity (VLQ) for delta time
    writeVLQ(delta, trackBytes);

    const status = (ev.type === 'noteOn' ? 0x90 : 0x80) | (ev.channel & 0x0f);
    trackBytes.push(status, ev.pitch & 0x7f, ev.velocity & 0x7f);
  });

  // End of track meta event
  trackBytes.push(0x00, 0xff, 0x2f, 0x00);

  // Build complete SMF container
  const headerBytes = [
    0x4d, 0x54, 0x68, 0x64, // 'MThd'
    0x00, 0x00, 0x00, 0x06, // Header chunk length: 6 bytes
    0x00, 0x00,             // Format 0 (single multichannel track)
    0x00, 0x01,             // 1 track
    (ticksPerBeat >> 8) & 0xff, ticksPerBeat & 0xff, // Ticks per quarter note
  ];

  const trackChunkHeader = [
    0x4d, 0x54, 0x72, 0x6b, // 'MTrk'
    (trackBytes.length >> 24) & 0xff,
    (trackBytes.length >> 16) & 0xff,
    (trackBytes.length >> 8) & 0xff,
    trackBytes.length & 0xff,
  ];

  const fullFileBytes = new Uint8Array([...headerBytes, ...trackChunkHeader, ...trackBytes]);
  return new Blob([fullFileBytes], { type: 'audio/midi' });
}

function writeVLQ(value: number, output: number[]) {
  let buffer = value & 0x7f;
  while ((value >>= 7)) {
    buffer <<= 8;
    buffer |= (value & 0x7f) | 0x80;
  }
  while (true) {
    output.push(buffer & 0xff);
    if (buffer & 0x80) buffer >>= 8;
    else break;
  }
}
