import React from 'react';
import {
  FileUp,
  Download,
  Activity,
  Layers,
  Sparkles,
  Radio,
  Circle,
} from 'lucide-react';
import { DeconstructedSong } from '../types/music';
import { generateStandardMidi } from '../utils/midiFile';

interface TopNavbarProps {
  activeTab: 'deconstruct' | 'reconstruct' | 'midi-jam';
  setActiveTab: (tab: 'deconstruct' | 'reconstruct' | 'midi-jam') => void;
  activeSong: DeconstructedSong;
  isMidiConnected: boolean;
  midiDevices: string[];
  onRequestMidiAccess: () => void;
  onOpenImportModal: () => void;
  isRecording: boolean;
  onToggleRecording: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  setActiveTab,
  activeSong,
  isMidiConnected,
  midiDevices,
  onRequestMidiAccess,
  onOpenImportModal,
  isRecording,
  onToggleRecording,
}) => {
  const handleExportMidi = () => {
    const bytes = generateStandardMidi(activeSong);
    const blob = new Blob([bytes as unknown as BlobPart], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSong.title.toLowerCase().replace(/\s+/g, '-')}-arrangement.mid`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Active Song Context */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm tracking-wider">
            MM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">
                MIDI Morph
              </span>
              <span className="text-xs text-slate-500">v1.0</span>
            </div>
            <div className="text-xs text-slate-400">
              Song Deconstruction & MIDI Reconstruction
            </div>
          </div>
        </div>

        {/* Studio View Navigation */}
        <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('deconstruct')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'deconstruct'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Deconstructed Values</span>
          </button>

          <button
            onClick={() => setActiveTab('reconstruct')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'reconstruct'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Arrangement Morph</span>
          </button>

          <button
            onClick={() => setActiveTab('midi-jam')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'midi-jam'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>MIDI Performance</span>
          </button>
        </nav>

        {/* Global Utilities: Web MIDI status, File import, MIDI export, Record */}
        <div className="flex items-center gap-2">
          {/* MIDI Connection Indicator */}
          <button
            onClick={onRequestMidiAccess}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
              isMidiConnected
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
            title={
              isMidiConnected
                ? `MIDI Active: ${midiDevices.join(', ') || 'Connected'}`
                : 'Click to scan and connect USB/Web MIDI devices'
            }
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isMidiConnected ? 'MIDI On' : 'MIDI In'}
            </span>
          </button>

          {/* Import MIDI File */}
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 transition-colors"
            title="Import and analyze Standard MIDI file (.mid)"
          >
            <FileUp className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Import MIDI</span>
          </button>

          {/* Export Reconstructed MIDI */}
          <button
            onClick={handleExportMidi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 transition-colors"
            title="Download reconstructed arrangement as multi-track .mid file"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Export .MID</span>
          </button>

          {/* Direct Audio Capture / Record */}
          <button
            onClick={onToggleRecording}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isRecording
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 animate-pulse'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={isRecording ? 'Stop Recording' : 'Record live master output to audio file'}
          >
            <Circle
              className={`w-3 h-3 ${isRecording ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`}
            />
            <span>{isRecording ? 'Rec' : 'Capture'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
