import React, { useState } from 'react';
import { PersonaId, DockId } from '../types/musicBox';
import { PERSONAS, DOCKS, PRESET_CONFIGURATIONS } from '../utils/personaData';
import { Sparkles, RotateCcw, Shuffle, BookmarkCheck } from 'lucide-react';

interface FigurineTrayProps {
  docks: Record<DockId, PersonaId | null>;
  onDockPersona: (dockId: DockId, personaId: PersonaId) => void;
  onUndockPersona: (dockId: DockId) => void;
  onSelectPersonaForInspection: (personaId: PersonaId) => void;
  onLoadPreset: (presetDocks: Record<DockId, PersonaId | null>) => void;
  onClearAllDocks: () => void;
}

export const FigurineTray: React.FC<FigurineTrayProps> = ({
  docks,
  onDockPersona,
  onUndockPersona,
  onSelectPersonaForInspection,
  onLoadPreset,
  onClearAllDocks,
}) => {
  const [selectedPersonaForPlacement, setSelectedPersonaForPlacement] = useState<PersonaId | null>(null);

  const personaList = Object.values(PERSONAS);

  // Find which dock a persona is in (if any)
  const getDockForPersona = (personaId: PersonaId): DockId | null => {
    const entry = Object.entries(docks).find(([_, pId]) => pId === personaId);
    return entry ? (entry[0] as DockId) : null;
  };

  const handleQuickDock = (personaId: PersonaId) => {
    // If already docked, undock it
    const currentDock = getDockForPersona(personaId);
    if (currentDock) {
      onUndockPersona(currentDock);
      return;
    }

    // Find first empty dock
    const emptyDock = DOCKS.find((d) => !docks[d.id]);
    if (emptyDock) {
      onDockPersona(emptyDock.id, personaId);
    } else {
      // Toggle placement picker
      setSelectedPersonaForPlacement(selectedPersonaForPlacement === personaId ? null : personaId);
    }
  };

  return (
    <div
      id="figurine-tray-container"
      className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-lg text-stone-200"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
            <span>Carved Wooden Figurine Tray</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
              5 Folk Band Personas
            </span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Place figurines on log docks around the campfire. Each persona brings unique tempo, groove, and voice.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Auto-dock all 5 into standard order (Fox -> Rhythm, Eagle -> Harmony, etc.)
              onLoadPreset({
                rhythm: 'fox',
                bass: 'beetle',
                harmony: 'salmon',
                melody: 'eagle',
                atmosphere: 'frog',
              });
            }}
            className="px-2.5 py-1.5 rounded-lg bg-amber-900/40 hover:bg-amber-900/70 border border-amber-700/60 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Auto-dock all 5 personas around the campfire"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Assemble Band</span>
          </button>

          <button
            onClick={onClearAllDocks}
            className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-stone-700"
            title="Return all figurines to the tray"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Docks</span>
          </button>
        </div>
      </div>

      {/* 5 Figurine Cards in Tray */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {personaList.map((persona) => {
          const currentDockId = getDockForPersona(persona.id);
          const currentDock = currentDockId ? DOCKS.find((d) => d.id === currentDockId) : null;
          const isSelected = selectedPersonaForPlacement === persona.id;

          return (
            <div
              key={persona.id}
              className={`relative rounded-xl p-3 border transition-all ${
                currentDock
                  ? 'bg-stone-950/80 border-amber-900/40 shadow-sm opacity-95'
                  : 'bg-stone-950 border-stone-800 hover:border-amber-600/70 shadow-md'
              } ${isSelected ? 'ring-2 ring-amber-500' : ''}`}
            >
              {/* Top Row: Avatar & Status */}
              <div className="flex items-center justify-between mb-2">
                <div
                  onClick={() => onSelectPersonaForInspection(persona.id)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-2xl shadow cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: persona.accentBg, border: `2px solid ${persona.primaryColor}` }}
                  title="Click to view musical dossier"
                >
                  {persona.avatarIcon}
                </div>

                <div className="text-right">
                  {currentDock ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-950 border border-amber-800 text-amber-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Docked: {currentDock.shortLabel}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-stone-500 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                      In Tray
                    </span>
                  )}
                </div>
              </div>

              {/* Persona Titles */}
              <div className="mb-2">
                <h4
                  onClick={() => onSelectPersonaForInspection(persona.id)}
                  className="text-xs font-bold text-stone-100 cursor-pointer hover:text-amber-400 transition-colors truncate"
                >
                  {persona.name}
                </h4>
                <div className="text-[11px] text-amber-400/90 font-medium truncate">{persona.title}</div>
                <div className="text-[10px] text-stone-400 truncate mt-0.5">{persona.folkRole}</div>
              </div>

              {/* Musical Impact Summary */}
              <div className="text-[10px] bg-stone-900/90 p-1.5 rounded border border-stone-800/80 text-stone-300 mb-2.5">
                <span className="font-mono text-amber-300 font-bold block">
                  On Rhythm: {persona.rhythmPersona.bpm} BPM
                </span>
                <span className="text-stone-400 block truncate">{persona.rhythmPersona.timeFeel}</span>
              </div>

              {/* Placement Control */}
              <div className="space-y-1.5">
                {currentDock ? (
                  <button
                    onClick={() => onUndockPersona(currentDock.id)}
                    className="w-full py-1.5 px-2 rounded-lg text-[11px] font-medium bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-red-300 border border-stone-800 transition-colors"
                  >
                    Undock to Tray
                  </button>
                ) : (
                  <div className="space-y-1">
                    <button
                      onClick={() => handleQuickDock(persona.id)}
                      className="w-full py-1.5 px-2 rounded-lg text-[11px] font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Dock at Campfire</span>
                    </button>

                    {/* Specific Dock Target Selector */}
                    <div className="grid grid-cols-5 gap-1 pt-1">
                      {DOCKS.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => onDockPersona(d.id, persona.id)}
                          className={`text-[9px] py-1 font-mono rounded border transition-colors ${
                            docks[d.id]
                              ? 'bg-stone-900 text-stone-500 border-stone-800 hover:text-stone-300'
                              : 'bg-stone-800 hover:bg-amber-900/60 text-stone-300 hover:text-amber-200 border-stone-700'
                          }`}
                          title={`Dock to ${d.name}`}
                        >
                          D{d.slotNumber}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Campfire Preset Arrangements */}
      <div className="mt-4 pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-stone-400 font-mono flex items-center gap-1.5">
          <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>Folk Band Presets:</span>
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {PRESET_CONFIGURATIONS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onLoadPreset(preset.docks)}
              className="px-2.5 py-1 rounded-lg bg-stone-800/70 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-700/80 text-[11px] transition-colors"
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
