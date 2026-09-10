import React from 'react';
import { ComposedFolkSong, PersonaId, DockId } from '../types/musicBox';
import { PERSONAS, DOCKS } from '../utils/personaData';
import { Sparkles, Users, MessageSquare } from 'lucide-react';

interface InterpersonalDynamicsPanelProps {
  composedSong: ComposedFolkSong;
  docks: Record<DockId, PersonaId | null>;
  onSelectPersonaForInspection: (personaId: PersonaId) => void;
}

export const InterpersonalDynamicsPanel: React.FC<InterpersonalDynamicsPanelProps> = ({
  composedSong,
  docks,
  onSelectPersonaForInspection,
}) => {
  const { bandLeader, dynamics } = composedSong;

  // Active personas list
  const activeDocks = DOCKS.map((dock) => ({
    dock,
    persona: docks[dock.id] ? PERSONAS[docks[dock.id]!] : null,
  })).filter((item) => item.persona !== null);

  // Generate dynamic campfire dialogue based on docked members
  const generateCampfireBanter = (): string => {
    if (activeDocks.length === 0) {
      return 'The campfire crackles softly under the starry sky. Seat animal figurines on their log stumps to start their songs and conversations!';
    }
    if (activeDocks.length === 1) {
      const p = activeDocks[0].persona!;
      return `${p.name} sits alone by the glowing embers, tuning up and humming softly: "${p.quote}"`;
    }

    if (dynamics.some((d) => d.id === 'fox-eagle-speed')) {
      return `Reynard winks across the fire: "Try to keep up, Aquila! This canyon trail doesn't wait for soaring eagles!" Aquila chuckles down from his tree perch: "Every roll of my banjo lands right where your boot kicks the porch, fox!"`;
    }
    if (dynamics.some((d) => d.id === 'beetle-frog-mud')) {
      return `Barnaby Beetle plants his washtub deep into the moss: "Steady and deep, frog. The earth holds the beat." Ribbit laughs through his harmonica: "That bottom end is so rich and muddy you could catch prize catfish in it!"`;
    }
    if (dynamics.some((d) => d.id === 'eagle-salmon-mountain')) {
      return `Sari's acoustic guitar glides like cold river ripples: "From mountain headwaters down through canyon falls, our song flows to the open sea."`;
    }
    if (dynamics.some((d) => d.id === 'full-camp-assembly')) {
      return `The full animal folk quintet is gathered in harmony! Fox stomps the wooden porch, Beetle lays the rumbling bass, Salmon weaves melodic acoustic chords, Eagle drives the soaring banjo, and Frog wails on the blues harmonica!`;
    }

    const names = activeDocks.map((d) => d.persona!.name.split(' ')[0]);
    return `${names.join(', ')} exchange smiles across the warm campfire, blending their unique rhythms and acoustic timbres into a spirited frontier tune.`;
  };

  return (
    <div
      id="interpersonal-dynamics-panel"
      className="bg-[#fffdf7] border-4 border-[#bc6c25] rounded-[2.5rem] p-5 sm:p-6 shadow-[0_8px_0_#8c5825] text-[#382c26]"
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#ccd5ae]">
        <div className="flex items-center gap-2">
          <span className="text-xl">🪵</span>
          <h3 className="text-base font-black text-[#382c26]">
            Band Dynamics & Animal Chemistry
          </h3>
        </div>
        <span className="text-xs font-bold text-[#588157] bg-[#e9edc9] px-3 py-1 rounded-full border border-[#ccd5ae]">
          {dynamics.length} Active Synergies
        </span>
      </div>

      {/* Band Leader Highlight (Animal Crossing Town Mayor Card) */}
      <div className="bg-[#faedcd] border-2 border-[#d4a373] rounded-3xl p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div
            onClick={() => onSelectPersonaForInspection(bandLeader.id)}
            className="w-13 h-13 rounded-2xl flex items-center justify-center text-3xl shrink-0 cursor-pointer shadow-[0_2px_0_#936639] border-2 hover:scale-105 transition-transform"
            style={{ backgroundColor: bandLeader.accentBg, borderColor: bandLeader.primaryColor }}
            title="Inspect band leader"
          >
            {bandLeader.avatarIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-[#e76f51] text-white rounded-full">
                BAND CONDUCTOR
              </span>
              <span className="text-sm font-black text-[#382c26]">{bandLeader.name}</span>
            </div>
            <p className="text-xs text-[#606c38] font-medium mt-0.5">
              Seated at <strong>Rhythm Dock</strong>: sets master tempo to <strong className="text-[#bc6c25]">{composedSong.bpm} BPM</strong> with{' '}
              <span className="text-[#382c26] font-bold">{bandLeader.rhythmPersona.drumPatternName}</span>.
            </p>
          </div>
        </div>

        <div className="text-xs italic text-[#7f4f24] font-medium max-w-xs bg-[#fefae0] p-2.5 rounded-2xl border border-[#d4a373]">
          "{bandLeader.quote}"
        </div>
      </div>

      {/* Active Interpersonal Synergy Cards (Polaroid / Recipe Cards) */}
      {dynamics.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="text-xs font-black uppercase text-[#606c38] tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#ffb703]" />
            <span>Harmonic Synergies in Motion</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dynamics.map((dyn) => (
              <div
                key={dyn.id}
                className="bg-[#fefae0] border-2 border-[#d4a373] rounded-2xl p-3 text-xs space-y-1.5 shadow-xs"
              >
                <div className="flex items-center justify-between font-black text-[#382c26]">
                  <span className="flex items-center gap-1.5">
                    <span>✨</span>
                    <span>{dyn.title}</span>
                  </span>
                  <div className="flex -space-x-1.5">
                    {dyn.personasInvolved.map((pId) => (
                      <span
                        key={pId}
                        className="w-6 h-6 rounded-full bg-[#faedcd] border border-[#bc6c25] flex items-center justify-center text-xs shadow-xs"
                      >
                        {PERSONAS[pId].avatarIcon}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-[#606c38] text-[11px] leading-relaxed font-medium">{dyn.description}</p>
                <div className="text-[10px] font-black text-[#588157] bg-[#e9edc9] px-2.5 py-1 rounded-xl border border-[#ccd5ae]">
                  ⚡ Impact: {dyn.musicalImpact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campfire Banter Speech Bubble */}
      <div className="bg-[#faedcd] border-2 border-[#d4a373] rounded-3xl p-4 text-xs">
        <div className="flex items-center gap-1.5 text-[#bc6c25] text-xs font-black uppercase mb-1.5">
          <MessageSquare className="w-4 h-4 text-[#e76f51]" />
          <span>Campfire Dialogue & Banter</span>
        </div>
        <p className="text-[#382c26] text-xs font-medium leading-relaxed italic">{generateCampfireBanter()}</p>
      </div>
    </div>
  );
};
