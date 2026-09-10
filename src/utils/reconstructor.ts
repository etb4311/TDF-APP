import {
  DeconstructedSong,
  ReconstructionParameters,
  NoteEvent,
  DrumStepPattern,
} from '../types/music';
import { buildChordPitches, midiToNoteName } from './musicTheory';

export interface ReconstructedArrangement {
  stems: {
    lead: NoteEvent[];
    chords: NoteEvent[];
    bass: NoteEvent[];
    drums: DrumStepPattern;
  };
  arpStem: NoteEvent[];
  chordPitchesAtStep: Map<number, number[]>;
}

export function reconstructArrangement(
  song: DeconstructedSong,
  params: ReconstructionParameters
): ReconstructedArrangement {
  const { transposeSemitones, voicingComplexity, bassStyle, arpPattern, targetStyle } = params;

  const chordProgression = song.harmonicDNA.progression;
  const chordPitchesAtStep = new Map<number, number[]>();

  const chordsStem: NoteEvent[] = [];
  const bassStem: NoteEvent[] = [];
  const arpStem: NoteEvent[] = [];

  chordProgression.forEach((chord, chordIdx) => {
    const startStep = chordIdx * 4;
    const basePitches = buildChordPitches(
      chord.root,
      chord.quality,
      3,
      0,
      voicingComplexity
    );
    const transposed = basePitches.map((p) => p + transposeSemitones);
    chordPitchesAtStep.set(startStep, transposed);

    // Chords rhythm according to style
    if (targetStyle === 'nu-disco' || targetStyle === 'bossa') {
      // Syncopated stab on step 0 and step 2
      [0, 2].forEach((subStep) => {
        transposed.forEach((pitch) => {
          chordsStem.push({
            pitch,
            noteName: midiToNoteName(pitch),
            startStep: startStep + subStep,
            durationSteps: 1,
            velocity: 80,
          });
        });
      });
    } else if (targetStyle === 'synthwave') {
      // Pumping off-beat pads
      [1, 3].forEach((subStep) => {
        transposed.forEach((pitch) => {
          chordsStem.push({
            pitch,
            noteName: midiToNoteName(pitch),
            startStep: startStep + subStep,
            durationSteps: 1,
            velocity: 75,
          });
        });
      });
    } else {
      // Sustained 4 steps
      transposed.forEach((pitch) => {
        chordsStem.push({
          pitch,
          noteName: midiToNoteName(pitch),
          startStep,
          durationSteps: 4,
          velocity: 78,
        });
      });
    }

    // Bassline according to bassStyle
    const rootPitch = transposed[0] - 12; // Octave lower for bass
    const fifthPitch = rootPitch + 7;

    if (bassStyle === 'pumping-octaves') {
      // Running 16ths alternating octaves
      for (let s = 0; s < 4; s++) {
        const p = s % 2 === 0 ? rootPitch : rootPitch + 12;
        bassStem.push({
          pitch: p,
          noteName: midiToNoteName(p),
          startStep: startStep + s,
          durationSteps: 1,
          velocity: s === 0 ? 110 : 95,
        });
      }
    } else if (bassStyle === 'walking') {
      // Walk root -> 3rd -> 5th -> chromatic lead-in
      const walkPitches = [rootPitch, rootPitch + 4, fifthPitch, rootPitch + 11];
      walkPitches.forEach((p, s) => {
        bassStem.push({
          pitch: p,
          noteName: midiToNoteName(p),
          startStep: startStep + s,
          durationSteps: 1,
          velocity: 95,
        });
      });
    } else if (bassStyle === 'syncopated') {
      // Funk syncopation on 0, 1.5, 3
      [0, 2].forEach((s) => {
        bassStem.push({
          pitch: rootPitch,
          noteName: midiToNoteName(rootPitch),
          startStep: startStep + s,
          durationSteps: 1,
          velocity: 105,
        });
      });
      bassStem.push({
        pitch: fifthPitch,
        noteName: midiToNoteName(fifthPitch),
        startStep: startStep + 3,
        durationSteps: 1,
        velocity: 90,
      });
    } else {
      // Sub-808 sustained root
      bassStem.push({
        pitch: rootPitch - 12,
        noteName: midiToNoteName(rootPitch - 12),
        startStep,
        durationSteps: 4,
        velocity: 110,
      });
    }

    // Arpeggiator Generator
    if (arpPattern !== 'none') {
      const arpNotes = transposed.slice(0, 4);
      for (let s = 0; s < 4; s++) {
        let arpIndex = s % arpNotes.length;
        if (arpPattern === 'down') {
          arpIndex = (arpNotes.length - 1 - s) % arpNotes.length;
        } else if (arpPattern === 'updown') {
          const cycle = [0, 1, 2, 1];
          arpIndex = cycle[s % cycle.length] % arpNotes.length;
        } else if (arpPattern === 'random') {
          arpIndex = Math.floor(Math.random() * arpNotes.length);
        }
        const p = arpNotes[arpIndex] + 12; // Octave above chords
        arpStem.push({
          pitch: p,
          noteName: midiToNoteName(p),
          startStep: startStep + s,
          durationSteps: 1,
          velocity: 85,
        });
      }
    }
  });

  // Lead Melody: Transpose from original song
  const leadStem: NoteEvent[] = song.stems.lead.map((n) => {
    const newPitch = n.pitch + transposeSemitones;
    return {
      ...n,
      pitch: newPitch,
      noteName: midiToNoteName(newPitch),
    };
  });

  // Drum Groove Matrix based on targetStyle
  const drums: DrumStepPattern = {
    kick: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    snare: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    hihat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    perc: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
  };

  if (targetStyle === 'synthwave' || targetStyle === 'nu-disco') {
    // 4-on-the-floor
    drums.kick = [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false];
    drums.snare = [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false];
    drums.hihat = [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false];
    drums.perc = [false, false, false, true, false, false, false, false, false, true, false, false, false, false, true, false];
  } else if (targetStyle === 'lofi') {
    // Boom bap swing kick
    drums.kick = [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false];
    drums.snare = [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false];
    drums.hihat = [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false];
    drums.perc = [false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false];
  } else if (targetStyle === 'bossa') {
    // Clave
    drums.kick = [true, false, false, false, false, false, true, false, true, false, false, false, false, false, true, false];
    drums.snare = [false, false, false, true, false, false, false, false, false, true, false, false, false, false, false, false];
    drums.hihat = [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true];
    drums.perc = [false, false, false, false, true, false, false, true, false, false, false, true, false, true, false, false];
  } else if (targetStyle === 'chiptune') {
    // Fast straight 16ths
    drums.kick = [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false];
    drums.snare = [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false];
    drums.hihat = [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true];
    drums.perc = [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false];
  } else {
    // Ambient / Cinematic
    drums.kick = [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
    drums.snare = [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false];
    drums.hihat = [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false];
    drums.perc = [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false];
  }

  return {
    stems: {
      lead: leadStem,
      chords: chordsStem,
      bass: bassStem,
      drums,
    },
    arpStem,
    chordPitchesAtStep,
  };
}
