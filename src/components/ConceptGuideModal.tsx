import React from 'react';
import { X, Sparkles, Box, Activity, HeartHandshake } from 'lucide-react';
import { PERSONAS } from '../utils/personaData';

interface ConceptGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConceptGuideModal: React.FC<ConceptGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="concept-guide-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#382c26]/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-[#fffdf7] border-4 border-[#bc6c25] rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_12px_0_#8c5825] p-6 text-[#382c26] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b-2 border-[#ccd5ae]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-[#faedcd] text-[#bc6c25] px-2.5 py-0.5 rounded-full border border-[#d4a373]">
                Campfire Music Box Field Guide
              </span>
            </div>
            <h2 className="text-xl font-black text-[#382c26] mt-1">
              Toy Music Box Physical Digital Manual
            </h2>
            <p className="text-xs text-[#606c38] font-medium">
              A tactile exploration of physical figurine docks, interpersonal music dynamics, and frontier campfire folk bands.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#faedcd] hover:bg-[#f6deb5] text-[#7f4f24] hover:text-[#382c26] transition-transform active:scale-95 flex items-center justify-center border-2 border-[#d4a373]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs text-[#382c26] leading-relaxed">
          {/* Core Toy Box Philosophy */}
          <div className="bg-[#faedcd] border-2 border-[#d4a373] rounded-3xl p-4 space-y-2">
            <h3 className="text-sm font-black text-[#bc6c25] flex items-center gap-2">
              <Box className="w-4 h-4 text-[#e76f51]" />
              <span>1. The Physical Toy Mechanic</span>
            </h3>
            <p className="font-medium text-[#382c26]">
              The physical toy is crafted as an engraved wooden campfire diorama. Around the central stone fire pit
              are <strong>5 carved log docking stumps</strong> equipped with RFID sensors.
            </p>
            <p className="font-medium text-[#382c26]">
              <strong>The Closed Lid Rule:</strong> The music box plays when the wooden lid is{' '}
              <strong className="text-[#e76f51]">shut</strong>! When opened, the mechanical spring pauses so you can
              rearrange your animal figurines and wind the clockwork key.
            </p>
          </div>

          {/* 5 Animal Personas */}
          <div className="space-y-2">
            <h3 className="text-sm font-black text-[#382c26] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ffb703]" />
              <span>2. The 5 Animal Personas</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.values(PERSONAS).map((p) => (
                <div key={p.id} className="bg-[#fefae0] p-3 rounded-2xl border-2 border-[#d4a373]">
                  <div className="flex items-center gap-2 font-black text-[#382c26]">
                    <span className="text-xl">{p.avatarIcon}</span>
                    <span>{p.name}</span>
                  </div>
                  <div className="text-[11px] text-[#bc6c25] font-bold">{p.title}</div>
                  <div className="text-[10px] text-[#606c38] mt-0.5">{p.folkRole}</div>
                  <div className="text-[10px] text-[#7f4f24] font-bold mt-1">
                    Base Tempo: <strong className="text-[#e76f51]">{p.rhythmPersona.bpm} BPM</strong> ({p.rhythmPersona.timeFeel})
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Docking Perspectives */}
          <div className="space-y-2">
            <h3 className="text-sm font-black text-[#382c26] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#588157]" />
              <span>3. How Log Docks Determine Song Composition</span>
            </h3>
            <p className="font-medium text-[#606c38]">
              Each stump represents a musical voice. The figurine seated there expresses that role:
            </p>
            <ul className="space-y-1.5 pl-2 font-medium">
              <li>
                <strong className="text-[#e76f51]">Stump 1 (Rhythm & Pulse):</strong> The band leader.
                Sets the entire song's <strong>BPM</strong>, swing microtiming, and drum pattern!
              </li>
              <li>
                <strong className="text-[#588157]">Stump 2 (Foundation & Bass):</strong> Washtub or jug bassline style.
              </li>
              <li>
                <strong className="text-[#3a86ff]">Stump 3 (Harmony & Chords):</strong> Acoustic guitar chord voicing and strumming pattern.
              </li>
              <li>
                <strong className="text-[#ffb703]">Stump 4 (Melody & Lead):</strong> Storytelling lead instrument (5-string banjo, hoedown fiddle, or blues harmonica).
              </li>
              <li>
                <strong className="text-[#7209b7]">Stump 5 (Atmosphere & Banter):</strong> Night ember crackles, stream ripples, and campfire call-and-response.
              </li>
            </ul>
          </div>

          {/* Interpersonal Dynamics */}
          <div className="space-y-2">
            <h3 className="text-sm font-black text-[#382c26] flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-[#e76f51]" />
              <span>4. Interpersonal Dynamics & Synergy</span>
            </h3>
            <p className="font-medium text-[#606c38]">
              When certain figurines sit together around the campfire, their musical personalities create emergent synergies:
            </p>
            <div className="bg-[#fefae0] p-3 rounded-2xl border-2 border-[#d4a373] space-y-1.5 text-[11px] font-medium">
              <div>
                <strong className="text-[#e76f51]">Fox + Eagle:</strong> Speed rush (+6 BPM) with fiery banjo and fiddle unisons.
              </div>
              <div>
                <strong className="text-[#588157]">Beetle + Frog:</strong> Deep bayou drag (-4 BPM) with subterranean washtub and jug drops.
              </div>
              <div>
                <strong className="text-[#3a86ff]">Eagle + Salmon:</strong> Mountain creek glide with sparkling acoustic arpeggios.
              </div>
              <div>
                <strong className="text-[#bc6c25]">Full 5 Figurines:</strong> Unlocks "The Great Campfire Guild Ballad" with 5-voice counterpoint!
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t-2 border-[#ccd5ae] flex justify-end">
          <button
            onClick={onClose}
            className="ac-btn px-5 py-2 rounded-2xl bg-[#ffb703] border-2 border-[#d48b04] text-[#382c26] font-black text-xs uppercase tracking-wider"
          >
            Got It · Back to Campfire
          </button>
        </div>
      </div>
    </div>
  );
};
