import React from 'react';
import { PersonaId, DockId } from '../types/musicBox';
import { PERSONAS, DOCKS } from '../utils/personaData';
import { X, Activity, Flame, Layers, Music, Sparkles, Check } from 'lucide-react';

interface PersonaInspectorModalProps {
  personaId: PersonaId | null;
  docks: Record<DockId, PersonaId | null>;
  onClose: () => void;
  onDockPersona: (dockId: DockId, personaId: PersonaId) => void;
}

export const PersonaInspectorModal: React.FC<PersonaInspectorModalProps> = ({
  personaId,
  docks,
  onClose,
  onDockPersona,
}) => {
  if (!personaId) return null;

  const persona = PERSONAS[personaId];

  // Check which dock this persona currently occupies
  const currentDockEntry = Object.entries(docks).find(([_, pId]) => pId === personaId);
  const currentDockId = currentDockEntry ? (currentDockEntry[0] as DockId) : null;

  return (
    <div
      id="persona-inspector-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#382c26]/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-[#fffdf7] border-4 border-[#bc6c25] rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_12px_0_#8c5825] p-6 text-[#382c26] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header (Animal Crossing Passport / Card Style) */}
        <div className="flex items-start justify-between pb-4 border-b-2 border-[#ccd5ae]">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center text-4xl shadow-[0_3px_0_#936639] border-2"
              style={{ backgroundColor: persona.accentBg, borderColor: persona.primaryColor }}
            >
              {persona.avatarIcon}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#faedcd] text-[#bc6c25] border border-[#d4a373]">
                  {persona.species} Figurine
                </span>
                {currentDockId && (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#e9edc9] text-[#3a5a40] border border-[#ccd5ae]">
                    Seated: {DOCKS.find((d) => d.id === currentDockId)?.shortLabel}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-[#382c26] mt-0.5">{persona.name}</h2>
              <div className="text-xs font-bold text-[#bc6c25]">{persona.title}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#faedcd] hover:bg-[#f6deb5] text-[#7f4f24] hover:text-[#382c26] transition-transform active:scale-95 flex items-center justify-center border-2 border-[#d4a373]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quote & Lore */}
        <div className="py-4 border-b-2 border-[#ccd5ae] space-y-2">
          <div className="italic text-xs font-medium text-[#7f4f24] bg-[#faedcd] p-3 rounded-2xl border border-[#d4a373]">
            "{persona.quote}"
          </div>
          <p className="text-xs text-[#606c38] font-medium leading-relaxed">{persona.lore}</p>
        </div>

        {/* 5 Dock Perspectives */}
        <div className="py-4 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#382c26]">
            Docking Perspectives on the Campfire Music Box
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Dock 1: Rhythm */}
            <div className="bg-[#fefae0] p-3.5 rounded-2xl border-2 border-[#d4a373] text-xs space-y-1">
              <div className="flex items-center justify-between font-black text-[#382c26]">
                <span className="flex items-center gap-1.5 text-[#e76f51]">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Dock 1: Rhythm (Leader)</span>
                </span>
                <span className="text-[#bc6c25]">{persona.rhythmPersona.bpm} BPM</span>
              </div>
              <div className="text-[11px] font-bold text-[#382c26]">
                {persona.rhythmPersona.drumPatternName}
              </div>
              <p className="text-[11px] text-[#606c38] leading-normal font-medium">
                {persona.rhythmPersona.description}
              </p>
            </div>

            {/* Dock 2: Bass */}
            <div className="bg-[#fefae0] p-3.5 rounded-2xl border-2 border-[#d4a373] text-xs space-y-1">
              <div className="flex items-center justify-between font-black text-[#382c26]">
                <span className="flex items-center gap-1.5 text-[#588157]">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Dock 2: Foundation & Bass</span>
                </span>
                <span className="text-[#7f4f24]">{persona.bassPersona.instrument}</span>
              </div>
              <div className="text-[11px] font-bold text-[#382c26]">{persona.bassPersona.styleName}</div>
              <p className="text-[11px] text-[#606c38] leading-normal font-medium">{persona.bassPersona.description}</p>
            </div>

            {/* Dock 3: Harmony */}
            <div className="bg-[#fefae0] p-3.5 rounded-2xl border-2 border-[#d4a373] text-xs space-y-1">
              <div className="flex items-center justify-between font-black text-[#382c26]">
                <span className="flex items-center gap-1.5 text-[#3a86ff]">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Dock 3: Harmony & Chords</span>
                </span>
                <span className="text-[#7f4f24]">{persona.harmonyPersona.instrument}</span>
              </div>
              <div className="text-[11px] font-bold text-[#382c26]">{persona.harmonyPersona.styleName}</div>
              <p className="text-[11px] text-[#606c38] leading-normal font-medium">{persona.harmonyPersona.description}</p>
            </div>

            {/* Dock 4: Melody */}
            <div className="bg-[#fefae0] p-3.5 rounded-2xl border-2 border-[#d4a373] text-xs space-y-1">
              <div className="flex items-center justify-between font-black text-[#382c26]">
                <span className="flex items-center gap-1.5 text-[#ffb703]">
                  <Music className="w-3.5 h-3.5" />
                  <span>Dock 4: Melody & Lead</span>
                </span>
                <span className="text-[#7f4f24]">{persona.melodyPersona.instrument}</span>
              </div>
              <div className="text-[11px] font-bold text-[#382c26]">{persona.melodyPersona.styleName}</div>
              <p className="text-[11px] text-[#606c38] leading-normal font-medium">{persona.melodyPersona.description}</p>
            </div>

            {/* Dock 5: Atmosphere */}
            <div className="bg-[#fefae0] p-3.5 rounded-2xl border-2 border-[#d4a373] text-xs space-y-1 md:col-span-2">
              <div className="flex items-center justify-between font-black text-[#382c26]">
                <span className="flex items-center gap-1.5 text-[#7209b7]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dock 5: Atmosphere & Dialogue</span>
                </span>
                <span className="text-[#7f4f24]">{persona.atmospherePersona.textureType}</span>
              </div>
              <div className="text-[11px] font-bold text-[#382c26]">
                {persona.atmospherePersona.styleName}
              </div>
              <p className="text-[11px] text-[#606c38] leading-normal font-medium">
                {persona.atmospherePersona.description}
              </p>
            </div>
          </div>
        </div>

        {/* Action: Seat this persona on a chosen log stump */}
        <div className="pt-4 border-t-2 border-[#ccd5ae] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs font-bold text-[#7f4f24]">Seat {persona.name.split(' ')[0]} on a Stump:</span>
          <div className="flex flex-wrap items-center gap-2">
            {DOCKS.map((dock) => {
              const isHere = currentDockId === dock.id;
              return (
                <button
                  key={dock.id}
                  onClick={() => {
                    onDockPersona(dock.id, persona.id);
                    onClose();
                  }}
                  className={`ac-btn px-3 py-1.5 rounded-xl text-xs font-black transition-all border-2 flex items-center gap-1 ${
                    isHere
                      ? 'bg-[#e76f51] text-white border-[#bc4749]'
                      : 'bg-[#faedcd] hover:bg-[#f6deb5] text-[#7f4f24] border-[#d4a373]'
                  }`}
                >
                  {isHere && <Check className="w-3 h-3" />}
                  <span>{dock.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
