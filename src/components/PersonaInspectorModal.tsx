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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-stone-900 border-2 border-stone-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner border-2"
              style={{ backgroundColor: persona.accentBg, borderColor: persona.primaryColor }}
            >
              {persona.avatarIcon}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-stone-950 text-amber-400 border border-stone-800">
                  {persona.species} Figurine
                </span>
                {currentDockId && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    Currently in {DOCKS.find((d) => d.id === currentDockId)?.shortLabel} Dock
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-stone-100 mt-0.5">{persona.name}</h2>
              <div className="text-sm font-semibold text-amber-400">{persona.title}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quote & Lore */}
        <div className="py-4 border-b border-stone-800 space-y-2">
          <div className="italic text-amber-200/90 text-sm bg-amber-950/20 p-3 rounded-xl border border-amber-900/30">
            {persona.quote}
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">{persona.lore}</p>
        </div>

        {/* 5 Dock Perspectives (What this persona brings to each position) */}
        <div className="py-4 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold">
            Docking Perspectives on the Campfire Music Box
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Dock 1: Rhythm */}
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-stone-200">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Dock 1: Rhythm & Pulse</span>
                </span>
                <span className="font-mono text-amber-300">{persona.rhythmPersona.bpm} BPM</span>
              </div>
              <div className="text-[11px] font-semibold text-stone-300">
                {persona.rhythmPersona.drumPatternName}
              </div>
              <p className="text-[11px] text-stone-400 leading-normal">
                {persona.rhythmPersona.description}
              </p>
            </div>

            {/* Dock 2: Bass */}
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-stone-200">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Dock 2: Foundation & Bass</span>
                </span>
                <span className="font-mono text-stone-400">{persona.bassPersona.instrument}</span>
              </div>
              <div className="text-[11px] font-semibold text-stone-300">{persona.bassPersona.styleName}</div>
              <p className="text-[11px] text-stone-400 leading-normal">{persona.bassPersona.description}</p>
            </div>

            {/* Dock 3: Harmony */}
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-stone-200">
                <span className="flex items-center gap-1.5 text-sky-400">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Dock 3: Harmony & Chords</span>
                </span>
                <span className="font-mono text-stone-400">{persona.harmonyPersona.instrument}</span>
              </div>
              <div className="text-[11px] font-semibold text-stone-300">{persona.harmonyPersona.styleName}</div>
              <p className="text-[11px] text-stone-400 leading-normal">{persona.harmonyPersona.description}</p>
            </div>

            {/* Dock 4: Melody */}
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-stone-200">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <Music className="w-3.5 h-3.5" />
                  <span>Dock 4: Melody & Lead</span>
                </span>
                <span className="font-mono text-stone-400">{persona.melodyPersona.instrument}</span>
              </div>
              <div className="text-[11px] font-semibold text-stone-300">{persona.melodyPersona.styleName}</div>
              <p className="text-[11px] text-stone-400 leading-normal">{persona.melodyPersona.description}</p>
            </div>

            {/* Dock 5: Atmosphere */}
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs space-y-1 md:col-span-2">
              <div className="flex items-center justify-between font-bold text-stone-200">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dock 5: Atmosphere & Dialogue</span>
                </span>
                <span className="font-mono text-stone-400">{persona.atmospherePersona.textureType}</span>
              </div>
              <div className="text-[11px] font-semibold text-stone-300">
                {persona.atmospherePersona.styleName}
              </div>
              <p className="text-[11px] text-stone-400 leading-normal">
                {persona.atmospherePersona.description}
              </p>
            </div>
          </div>
        </div>

        {/* Action: Dock this persona into a chosen log seat */}
        <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-stone-400">Place {persona.name.split(' ')[0]} in a dock:</span>
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors border flex items-center gap-1 ${
                    isHere
                      ? 'bg-amber-600 text-stone-950 font-bold border-amber-500'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
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
