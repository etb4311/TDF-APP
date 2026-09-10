import React from 'react';
import { ComposedFolkSong, PersonaId, DockId } from '../types/musicBox';
import { PERSONAS, DOCKS } from '../utils/personaData';
import { Sparkles, Users, Activity, Music, MessageSquare } from 'lucide-react';

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
      return 'The campfire crackles softly in the silent prairie night. Place figurines on the log seats to hear their voices.';
    }
    if (activeDocks.length === 1) {
      const p = activeDocks[0].persona!;
      return `${p.name} sits alone by the glowing embers, quietly tuning up and humming: ${p.quote}`;
    }

    const names = activeDocks.map((d) => d.persona!.name.split(' ')[0]);
    if (dynamics.some((d) => d.id === 'fox-eagle-speed')) {
      return `Reynard winks across the flames: "Try to keep up, Aquila! This canyon track doesn’t wait for high fliers!" Aquila smiles down from the perch: "Every roll of my banjo lands exactly where your foot falls, fox."`;
    }
    if (dynamics.some((d) => d.id === 'beetle-frog-mud')) {
      return `Barnaby Beetle thumps the washtub into the soil: "Slow and heavy, frog. The earth holds the time." Ribbit chuckles through his harmonica: "That bottom end is so muddy you could catch catfish in it!"`;
    }
    if (dynamics.some((d) => d.id === 'eagle-salmon-mountain')) {
      return `Sari’s fingerpicking glides like cold river water, reflecting Aquila’s soaring drone: "From mountain headwater to open sky, our melody finds the sea."`;
    }
    if (dynamics.some((d) => d.id === 'full-camp-assembly')) {
      return `The full quintet gathers in unity. Fox drives the foot-stomp, Beetle anchors the foundation, Salmon weaves the chords, Eagle launches the banjo rolls, and Frog punctuates the night with soulful blues. A true frontier campfire masterwork!`;
    }

    return `${names.join(', ')} listen closely to one another across the fire pit, adjusting their tempo and timbre to find common ground.`;
  };

  return (
    <div
      id="interpersonal-dynamics-panel"
      className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-lg text-stone-200"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-400" />
          <span>Interpersonal Dynamics & Band Chemistry</span>
        </h3>
        <span className="text-xs font-mono text-stone-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
          {dynamics.length} Active Synergies
        </span>
      </div>

      {/* Band Leader Highlight */}
      <div className="bg-stone-950/80 border border-stone-800/80 rounded-lg p-3 mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            onClick={() => onSelectPersonaForInspection(bandLeader.id)}
            className="w-11 h-11 rounded-full flex items-center justify-center text-2xl shrink-0 cursor-pointer shadow border"
            style={{ backgroundColor: bandLeader.accentBg, borderColor: bandLeader.primaryColor }}
          >
            {bandLeader.avatarIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase px-1.5 py-0.2 bg-amber-950 text-amber-300 rounded border border-amber-800 font-bold">
                BAND CONDUCTOR
              </span>
              <span className="text-xs font-bold text-stone-100">{bandLeader.name}</span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Dictating master tempo at <strong className="text-amber-300">{composedSong.bpm} BPM</strong> with{' '}
              <span className="text-stone-300">{bandLeader.rhythmPersona.drumPatternName}</span>.
            </p>
          </div>
        </div>

        <div className="text-xs italic text-stone-400 max-w-xs bg-stone-900/60 p-2 rounded border border-stone-800">
          {bandLeader.quote}
        </div>
      </div>

      {/* Active Interpersonal Synergy Cards */}
      {dynamics.length > 0 && (
        <div className="space-y-2 mb-3">
          <h4 className="text-xs font-mono uppercase text-amber-300/80 tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Harmonic Synergies in Motion</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {dynamics.map((dyn) => (
              <div
                key={dyn.id}
                className="bg-stone-950/70 border border-amber-900/40 rounded-lg p-2.5 text-xs space-y-1 hover:border-amber-700/60 transition-colors"
              >
                <div className="flex items-center justify-between font-bold text-amber-300">
                  <span>{dyn.title}</span>
                  <div className="flex -space-x-1">
                    {dyn.personasInvolved.map((pId) => (
                      <span
                        key={pId}
                        className="w-5 h-5 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center text-[10px]"
                      >
                        {PERSONAS[pId].avatarIcon}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-stone-300 text-[11px] leading-relaxed">{dyn.description}</p>
                <div className="text-[10px] font-mono text-emerald-400 bg-stone-900/80 px-2 py-0.5 rounded border border-stone-800">
                  ⚡ Impact: {dyn.musicalImpact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campfire Banter & Role Perspective */}
      <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-3 text-xs">
        <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px] uppercase font-bold mb-1">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Campfire Dialogue & Interplay</span>
        </div>
        <p className="text-stone-300 text-xs italic leading-relaxed">{generateCampfireBanter()}</p>
      </div>
    </div>
  );
};
