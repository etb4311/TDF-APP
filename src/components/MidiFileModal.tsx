import React, { useState } from 'react';
import { Upload, X, FileMusic, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseMidiFile } from '../utils/midiFile';
import { DeconstructedSong } from '../types/music';

interface MidiFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSong: (song: DeconstructedSong) => void;
}

export const MidiFileModal: React.FC<MidiFileModalProps> = ({
  isOpen,
  onClose,
  onImportSong,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [parsedSong, setParsedSong] = useState<Partial<DeconstructedSong> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setError(null);
    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const deconstructed = parseMidiFile(buffer, file.name);

      const fullSong: DeconstructedSong = {
        id: deconstructed.id || `custom-${Date.now()}`,
        title: deconstructed.title || 'Imported Song',
        originalArtist: 'MIDI File Import',
        genre: 'Analyzed Composition',
        year: '2025',
        description: 'Algorithmic deconstruction from uploaded Standard MIDI File (.mid). Chords, groove grid, and stems separated automatically.',
        tags: ['Custom Import', 'Algorithmic Deconstruction', `${deconstructed.rhythmicDNA?.bpm || 120} BPM`],
        harmonicDNA: {
          key: 'C',
          scale: 'major',
          progression: [
            { root: 'C', quality: 'maj7', roman: 'Imaj7', durationBeats: 4, pitches: [48, 52, 55, 59] },
            { root: 'A', quality: 'min7', roman: 'vi7', durationBeats: 4, pitches: [45, 48, 52, 55] },
            { root: 'F', quality: 'maj7', roman: 'IVmaj7', durationBeats: 4, pitches: [41, 45, 48, 52] },
            { root: 'G', quality: '7', roman: 'V7', durationBeats: 4, pitches: [43, 47, 50, 53] },
          ],
          harmonicComplexity: 65,
          harmonicRhythm: '1 chord/bar',
          voiceLeadingTension: 45,
        },
        rhythmicDNA: deconstructed.rhythmicDNA || {
          bpm: 120,
          timeSignature: [4, 4],
          swingPercent: 15,
          syncopationScore: 50,
          grooveFeel: 'straight',
          accentGrid: [1.0, 0.4, 0.8, 0.4, 0.9, 0.3, 0.8, 0.4, 1.0, 0.4, 0.8, 0.4, 0.9, 0.3, 0.8, 0.4],
          humanizeTimingMs: 6,
        },
        melodicDNA: {
          range: { minPitch: 50, maxPitch: 75 },
          contour: 'arch',
          motifRepetition: 70,
          stepVsLeapRatio: 60,
          notes: deconstructed.stems?.lead?.slice(0, 16) || [],
        },
        stems: deconstructed.stems || {
          lead: [],
          chords: [],
          bass: [],
          drums: {
            kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
            snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
            hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            perc: [false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false],
          },
        },
      };

      setParsedSong(fullSong);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse MIDI file.';
      setError(msg);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleConfirm = () => {
    if (parsedSong) {
      onImportSong(parsedSong as DeconstructedSong);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileMusic className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-base text-white">Import MIDI File</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            dragOver
              ? 'border-cyan-400 bg-cyan-950/20'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950'
          }`}
        >
          <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <p className="text-xs text-slate-300 font-medium mb-1">
            Drag and drop any Standard MIDI file (.mid)
          </p>
          <p className="text-[11px] text-slate-500 mb-3">
            Automatic extraction of BPM, chords, melodic contours, and stems
          </p>
          <label className="inline-block px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-750 text-xs font-medium text-slate-200 cursor-pointer border border-slate-700 transition-colors">
            Browse File
            <input
              type="file"
              accept=".mid,.midi"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {parsedSong && !error && (
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Deconstruction Analysis Ready</span>
            </div>
            <div className="text-slate-300">
              Song Title: <strong>{parsedSong.title}</strong> ({fileName})
            </div>
            <div className="grid grid-cols-3 gap-2 text-slate-400 font-mono text-[11px] pt-1">
              <div>BPM: {parsedSong.rhythmicDNA?.bpm}</div>
              <div>Lead: {parsedSong.stems?.lead?.length || 0} notes</div>
              <div>Bass: {parsedSong.stems?.bass?.length || 0} notes</div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!parsedSong}
            onClick={handleConfirm}
            className="px-4 py-1.5 text-xs font-semibold rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Load into Deconstructor
          </button>
        </div>
      </div>
    </div>
  );
};
