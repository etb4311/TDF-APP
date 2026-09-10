import React, { useState } from 'react';
import { PersonaId, DockId } from '../types/musicBox';
import { PERSONAS, DOCKS, PRESET_CONFIGURATIONS } from '../utils/personaData';
import { Sparkles, RotateCcw, BookmarkCheck } from 'lucide-react';

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

  const getDockForPersona = (personaId: PersonaId): DockId | null => {
    const entry = Object.entries(docks).find(([_, pId]) => pId === personaId);
    return entry ? (entry[0] as DockId) : null;
  };

  const handleQuickDock = (personaId: PersonaId) => {
    const currentDock = getDockForPersona(personaId);
    if (currentDock) {
      onUndockPersona(currentDock);
      return;
    }

    const emptyDock = DOCKS.find((d) => !docks[d.id]);
    if (emptyDock) {
      onDockPersona(emptyDock.id, personaId);
    } else {
      setSelectedPersonaForPlacement(selectedPersonaForPlacement === personaId ? null : personaId);
    }
  };

  return (
    <div
      id="figurine-tray-container"
      className="bg-[#fffdf7] border-4 border-[#bc6c25] rounded-[2.5rem] p-5 sm:p-6 shadow-[0_8px_0_#8c5825] text-[#382c26]"
    >
      {/* Tray Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-[#ccd5ae]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-[#382c26] flex items-center gap-2">
              <span>Carved Wooden Figurine Tray</span>
            </h3>
            <span className="text-[10px] font-bold bg-[#faedcd] text-[#bc6c25] px-2.5 py-0.5 rounded-full border border-[#d4a373]">
              5 Animal Figurines
            </span>
          </div>
          <p className="text-xs text-[#606c38] font-medium mt-0.5">
            Tap a figurine to seat them on a campfire log stump. When placed in the <strong>Rhythm</strong> dock, they set the entire band's BPM!
          </p>
        </div>

        {/* Action Buttons (Chunky 3D AC Style) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onLoadPreset({
                rhythm: 'fox',
                bass: 'beetle',
                harmony: 'salmon',
                melody: 'eagle',
                atmosphere: 'frog',
              });
            }}
            className="ac-btn px-3.5 py-1.5 rounded-full bg-[#588157] border-2 border-[#3a5a40] text-[#fefae0] text-xs font-black flex items-center gap-1.5"
            title="Auto-seat all 5 personas around the campfire"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Assemble Band</span>
          </button>

          <button
            onClick={onClearAllDocks}
            className="ac-btn px-3 py-1.5 rounded-full bg-[#faedcd] hover:bg-[#f6deb5] text-[#7f4f24] text-xs font-black flex items-center gap-1.5 border-2 border-[#d4a373]"
            title="Return all figurines to the tray"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Stumps</span>
          </button>
        </div>
      </div>

      {/* 5 Figurine Amiibo Tokens in Tray */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {personaList.map((persona) => {
          const currentDockId = getDockForPersona(persona.id);
          const currentDock = currentDockId ? DOCKS.find((d) => d.id === currentDockId) : null;
          const isSelected = selectedPersonaForPlacement === persona.id;

          return (
            <div
              key={persona.id}
              className={`relative rounded-[2rem] p-3.5 border-3 transition-all duration-200 flex flex-col justify-between ${
                currentDock
                  ? 'bg-[#faedcd]/90 border-[#bc6c25] shadow-sm'
                  : 'bg-[#fefae0] border-[#d4a373] hover:border-[#bc6c25] shadow-[0_4px_0_#d4a373] hover:scale-102'
              } ${isSelected ? 'ring-4 ring-[#ffb703]' : ''}`}
            >
              {/* Top Row: Animal Avatar & Seated Dock Tag */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    onClick={() => onSelectPersonaForInspection(persona.id)}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-[0_2px_0_#936639] cursor-pointer hover:scale-110 transition-transform border-2"
                    style={{ backgroundColor: persona.accentBg, borderColor: persona.primaryColor }}
                    title="Click to view musical profile"
                  >
                    {persona.avatarIcon}
                  </div>

                  <div className="text-right">
                    {currentDock ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#588157] text-[#fefae0] border border-[#3a5a40]">
                        <span>Seated: {currentDock.shortLabel}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#8c5825] bg-[#faedcd] px-2 py-0.5 rounded-full border border-[#d4a373]">
                        In Pockets
                      </span>
                    )}
                  </div>
                </div>

                {/* Persona Names & Title */}
                <div className="mb-2">
                  <h4
                    onClick={() => onSelectPersonaForInspection(persona.id)}
                    className="text-sm font-black text-[#382c26] cursor-pointer hover:text-[#bc6c25] transition-colors truncate"
                  >
                    {persona.name}
                  </h4>
                  <div className="text-xs font-bold text-[#bc6c25] truncate">{persona.title}</div>
                  <div className="text-[11px] text-[#606c38] font-medium truncate mt-0.5">{persona.folkRole}</div>
                </div>

                {/* Measurable Persona Traits */}
                <div className="text-[10px] bg-[#faedcd] p-2 rounded-xl border border-[#d4a373] text-[#382c26] mb-3">
                  <span className="font-black text-[#bc6c25] block">
                    ⚡ Sets Rhythm: {persona.rhythmPersona.bpm} BPM
                  </span>
                  <span className="text-[#606c38] font-bold block truncate">{persona.rhythmPersona.timeFeel}</span>
                </div>
              </div>

              {/* Placement Control Buttons */}
              <div className="space-y-1.5">
                {currentDock ? (
                  <button
                    onClick={() => onUndockPersona(currentDock.id)}
                    className="ac-btn w-full py-1.5 px-2 rounded-xl text-xs font-black bg-[#faedcd] hover:bg-[#f6deb5] text-[#bc4749] border-2 border-[#d4a373]"
                  >
                    Return to Tray
                  </button>
                ) : (
                  <div className="space-y-1">
                    <button
                      onClick={() => handleQuickDock(persona.id)}
                      className="ac-btn w-full py-2 px-2 rounded-xl text-xs font-black bg-[#ffb703] hover:bg-[#fca311] text-[#382c26] border-2 border-[#d48b04] flex items-center justify-center gap-1 shadow-xs"
                    >
                      <span>Seat at Campfire</span>
                    </button>

                    {/* Specific Stump Selector */}
                    <div className="grid grid-cols-5 gap-1 pt-1">
                      {DOCKS.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => onDockPersona(d.id, persona.id)}
                          className={`text-[9px] py-1 font-bold rounded-lg border transition-all ${
                            docks[d.id]
                              ? 'bg-[#faedcd] text-[#936639] border-[#d4a373] opacity-60'
                              : 'bg-[#e9edc9] hover:bg-[#ccd5ae] text-[#3a5a40] border-[#ccd5ae]'
                          }`}
                          title={`Seat at ${d.name}`}
                        >
                          S{d.slotNumber}
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

      {/* Quick Campfire Preset Arrangements (Animal Crossing Recipe Style) */}
      <div className="mt-4 pt-3 border-t-2 border-[#ccd5ae] flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[#606c38] font-bold flex items-center gap-1.5">
          <BookmarkCheck className="w-4 h-4 text-[#e76f51]" />
          <span>Folk Band Recipes:</span>
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {PRESET_CONFIGURATIONS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onLoadPreset(preset.docks)}
              className="ac-btn px-3 py-1 rounded-full bg-[#faedcd] hover:bg-[#f6deb5] text-[#7f4f24] hover:text-[#382c26] border-2 border-[#d4a373] text-[11px] font-bold transition-all"
              title={preset.description}
            >
              📜 {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
