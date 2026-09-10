import React from 'react';
import { X, Sparkles, Box, Disc, Activity, Layers, HeartHandshake } from 'lucide-react';
import { PERSONAS, DOCKS } from '../utils/personaData';

interface ConceptGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConceptGuideModal: React.FC<ConceptGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="concept-guide-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-stone-900 border-2 border-stone-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                Design & Prototyping Blueprint
              </span>
            </div>
            <h2 className="text-xl font-bold text-stone-100 mt-1 font-serif">
              The Campfire Toy Music Box
            </h2>
            <p className="text-xs text-stone-400">
              Exploration of physical-digital interactions, interpersonal dynamics, and campfire folk music.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs text-stone-300 leading-relaxed">
          {/* Core Toy Box Philosophy */}
          <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-400" />
              <span>1. The Physical Toy Mechanic</span>
            </h3>
            <p>
              The toy music box is designed as an engraved wooden campfire diorama. Around the central campfire
              are <strong>5 carved log docking sockets</strong> with embedded RFID/NFC or pin sensors.
            </p>
            <p>
              <strong>The Lid Switch:</strong> Unlike a standard music player, the song plays when the wooden lid is{' '}
              <strong className="text-amber-300">shut</strong>. When the lid is opened, the clockwork mechanism pauses,
              allowing the user to inspect the campfire, swap figurines into different log seats, and wind the spring.
            </p>
          </div>

          {/* 5 Animal Personas */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>2. The 5 Animal Personas</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.values(PERSONAS).map((p) => (
                <div key={p.id} className="bg-stone-950 p-2.5 rounded-lg border border-stone-800">
                  <div className="flex items-center gap-2 font-bold text-stone-200">
                    <span className="text-lg">{p.avatarIcon}</span>
                    <span>{p.name}</span>
                  </div>
                  <div className="text-[11px] text-amber-400 font-semibold">{p.title}</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">{p.folkRole}</div>
                  <div className="text-[10px] font-mono text-stone-400 mt-1">
                    Base Tempo: <strong className="text-amber-300">{p.rhythmPersona.bpm} BPM</strong> ({p.rhythmPersona.timeFeel})
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Docking Perspectives */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>3. How Docking Positions Determine Composition</span>
            </h3>
            <p>
              Each dock represents a distinct structural voice in the folk band. The figurine placed into that dock
              interprets that voice through their personality:
            </p>
            <ul className="space-y-1.5 pl-2">
              <li>
                <strong className="text-amber-300">Dock 1 (Rhythm & Pulse):</strong> The timekeeper & band leader.
                Determines the entire song’s <strong>BPM</strong>, swing percentage, and percussion pattern (e.g. Fox = 134 BPM
                Hoedown, Beetle = 82 BPM Porch Stomp).
              </li>
              <li>
                <strong className="text-emerald-300">Dock 2 (Foundation & Bass):</strong> Washtub or jug bassline style
                (e.g. Beetle = deep subterranean root thump, Fox = bouncing chromatic walk-up).
              </li>
              <li>
                <strong className="text-sky-300">Dock 3 (Harmony & Chords):</strong> Chord progression and rhythm strumming
                (e.g. Salmon = Travis-picking arpeggios, Fox = offbeat chop chords).
              </li>
              <li>
                <strong className="text-rose-300">Dock 4 (Melody & Lead):</strong> Primary storytelling voice (e.g. Eagle =
                cascading 5-string banjo rolls, Fox = blistering hoedown fiddle, Frog = blues harmonica).
              </li>
              <li>
                <strong className="text-amber-300">Dock 5 (Atmosphere & Dialogue):</strong> Nocturnal textures, pine ember
                crackles, river streams, and dynamic call-and-response banter.
              </li>
            </ul>
          </div>

          {/* Interpersonal Dynamics */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-amber-400" />
              <span>4. Interpersonal Dynamics & Chemistry</span>
            </h3>
            <p>
              When certain figurines sit together in the band, their personalities produce emergent synergies or tension:
            </p>
            <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 space-y-1 text-[11px]">
              <div>
                <strong className="text-amber-400">Fox + Eagle:</strong> Speed rush (+6 BPM) with fiery banjo & fiddle unisons.
              </div>
              <div>
                <strong className="text-amber-400">Beetle + Frog:</strong> Deep bayou swing (-4 BPM) with subterranean washtub & jug drops.
              </div>
              <div>
                <strong className="text-amber-400">Fox + Beetle:</strong> Tension between grounded porch stomps and lightning fiddle runs.
              </div>
              <div>
                <strong className="text-amber-400">Full 5 Ensemble:</strong> Unlocks "The Great Campfire Guild Ballad" with rich 5-voice counterpoint.
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Got It · Return to Music Box
          </button>
        </div>
      </div>
    </div>
  );
};
