import React from 'react';
import { PersonaId, DockId, ComposedFolkSong } from '../types/musicBox';
import { DOCKS, PERSONAS } from '../utils/personaData';
import { X, Sparkles, Activity, Music, Layers, Flame, Eye } from 'lucide-react';

interface CampfireDioramaProps {
  docks: Record<DockId, PersonaId | null>;
  currentStep: number;
  isPlaying: boolean;
  lidState: 'open' | 'closed';
  peekDioramaWhileClosed: boolean;
  composedSong: ComposedFolkSong;
  activeStemsThisStep: {
    rhythm: boolean;
    bass: boolean;
    harmony: boolean;
    melody: boolean;
    atmosphere: boolean;
  };
  onDockPersona: (dockId: DockId, personaId: PersonaId) => void;
  onUndockPersona: (dockId: DockId) => void;
  onSelectPersonaForInspection: (personaId: PersonaId) => void;
}

export const CampfireDiorama: React.FC<CampfireDioramaProps> = ({
  docks,
  currentStep,
  isPlaying,
  lidState,
  peekDioramaWhileClosed,
  composedSong,
  activeStemsThisStep,
  onDockPersona,
  onUndockPersona,
  onSelectPersonaForInspection,
}) => {
  const isLidClosed = lidState === 'closed';
  const showClosedCover = isLidClosed && !peekDioramaWhileClosed;

  // Spatial layout coordinates for the 5 tree stumps around the campfire
  const dockCoordinates: Record<DockId, { top: string; left: string; transform: string }> = {
    rhythm: { top: '16%', left: '20%', transform: 'translate(-50%, -50%)' },
    bass: { top: '70%', left: '16%', transform: 'translate(-50%, -50%)' },
    harmony: { top: '85%', left: '50%', transform: 'translate(-50%, -50%)' },
    melody: { top: '70%', left: '84%', transform: 'translate(-50%, -50%)' },
    atmosphere: { top: '16%', left: '80%', transform: 'translate(-50%, -50%)' },
  };

  return (
    <div
      id="campfire-diorama-container"
      className="relative w-full rounded-[2.5rem] overflow-hidden border-4 border-[#3a5a40] bg-[#588157] shadow-[0_8px_0_#344e41] min-h-[550px] flex flex-col justify-between p-4 sm:p-6 select-none"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, #60992D 0%, #407B19 75%, #31572C 100%)`,
      }}
    >
      {/* Playful Animal Crossing Meadow Texture (Tufts of Grass & Daisies) */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(#a7c957_2px,transparent_2px)] [background-size:24px_24px]" />

      {/* Cute River Bank Curve at the bottom */}
      <div className="absolute -bottom-16 left-0 right-0 h-28 bg-[#48cae4] rounded-[100%] opacity-40 blur-xs pointer-events-none" />

      {/* Top Diorama Banner (Animal Crossing Style Signboard) */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-[#fefae0]/90 px-3.5 py-1.5 rounded-full border-2 border-[#bc6c25] shadow-sm">
          <span className="text-base">🏕️</span>
          <span className="text-xs font-black uppercase text-[#382c26] tracking-wide">
            Campfire Meadow Stage
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isLidClosed ? (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#e76f51] text-white border-2 border-[#bc4749] flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-200 animate-ping" />
              Box Lid Shut · Band Performing!
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#faedcd] text-[#7f4f24] border-2 border-[#d4a373] flex items-center gap-1.5 shadow-sm">
              <span>🍃 Open · Seat Figurines on Stumps</span>
            </span>
          )}
        </div>
      </div>

      {/* Centerpiece: Diorama Scene (Campfire + 5 Surrounding Log Stumps) */}
      <div className="relative flex-1 w-full max-w-3xl mx-auto my-3 min-h-[390px] sm:min-h-[430px]">
        {/* Central Campfire Hearth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-0">
          {/* Warm Golden Campfire Light */}
          <div
            className={`w-48 h-48 rounded-full transition-all duration-700 blur-2xl ${
              isPlaying ? 'bg-[#ffb703]/40 scale-125' : 'bg-[#fca311]/25 scale-100'
            }`}
          />

          {/* Cobblestone Fire Pit */}
          <div className="absolute w-36 h-28 rounded-[2rem] border-4 border-[#936639] bg-[#6f4518]/90 shadow-xl flex items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {/* Wooden Firewood Logs */}
            <div className="relative w-24 h-16 flex items-center justify-center">
              <div className="absolute w-20 h-4 bg-[#7f4f24] rounded-full rotate-25 border-2 border-[#582f0e] shadow" />
              <div className="absolute w-20 h-4 bg-[#7f4f24] rounded-full -rotate-25 border-2 border-[#582f0e] shadow" />

              {/* Animated Warm Hearth Flames */}
              <div className="relative z-10 flex items-end justify-center gap-1">
                <div
                  className={`w-3.5 h-11 rounded-full bg-gradient-to-t from-[#d00000] via-[#ffba08] to-[#fff3b0] transition-all ${
                    isPlaying ? 'animate-bounce' : 'opacity-85'
                  }`}
                  style={{ animationDuration: '0.5s' }}
                />
                <div
                  className={`w-4.5 h-14 rounded-full bg-gradient-to-t from-[#e85d04] via-[#faa307] to-white transition-all ${
                    isPlaying ? 'animate-pulse' : 'opacity-95'
                  }`}
                  style={{ animationDuration: '0.35s' }}
                />
                <div
                  className={`w-3.5 h-10 rounded-full bg-gradient-to-t from-[#d00000] via-[#ffba08] to-[#fff3b0] transition-all ${
                    isPlaying ? 'animate-bounce' : 'opacity-85'
                  }`}
                  style={{ animationDuration: '0.6s' }}
                />
              </div>

              {/* Rising Campfire Sparks */}
              {isPlaying && (
                <>
                  <div className="absolute w-2 h-2 rounded-full bg-yellow-200 animate-ping -top-5 left-3" />
                  <div className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping -top-8 right-5" style={{ animationDelay: '0.2s' }} />
                  <div className="absolute w-2 h-2 rounded-full bg-orange-300 animate-ping -top-11 left-9" style={{ animationDelay: '0.4s' }} />
                </>
              )}
            </div>
          </div>

          <div className="absolute -bottom-9 text-xs font-black text-[#fefae0] tracking-wider bg-[#2b422a]/70 px-3 py-0.5 rounded-full border border-[#a7c957]/50">
            🔥 COZY CAMPFIRE
          </div>
        </div>

        {/* 5 Tree Stump Log Docks (Animal Crossing Style) */}
        {DOCKS.map((dock) => {
          const personaId = docks[dock.id];
          const persona = personaId ? PERSONAS[personaId] : null;
          const pos = dockCoordinates[dock.id];
          const isActiveThisStep = activeStemsThisStep[dock.id];

          return (
            <div
              key={dock.id}
              id={`dock-${dock.id}`}
              className="absolute z-10 w-44 sm:w-48 transition-all"
              style={{
                top: pos.top,
                left: pos.left,
                transform: pos.transform,
              }}
            >
              {/* Organic Tree Stump Shape */}
              <div
                className={`relative rounded-[2rem] p-3 transition-all duration-200 border-4 ${
                  persona
                    ? isActiveThisStep
                      ? 'bg-[#faedcd] border-[#ffb703] shadow-[0_8px_0_#bc6c25] scale-105'
                      : 'bg-[#fefae0] border-[#bc6c25] shadow-[0_5px_0_#8c5825] hover:scale-102'
                    : 'bg-[#faedcd]/80 border-dashed border-[#bc6c25]/70 hover:border-[#ffb703] shadow-inner'
                }`}
              >
                {/* Stump Role Tag / Leaf Badge */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase text-[#7f4f24] flex items-center gap-1">
                    <span>🪵</span>
                    <span>{dock.shortLabel}</span>
                  </span>
                  <span className="text-[9px] font-black text-[#588157] bg-[#e9edc9] px-2 py-0.5 rounded-full border border-[#ccd5ae]">
                    STUMP #{dock.slotNumber}
                  </span>
                </div>

                {/* Content: Animal Figurine Seated on Log Stump */}
                {persona ? (
                  <div className="space-y-1.5">
                    {/* Animal Figurine Amiibo Token */}
                    <div
                      onClick={() => onSelectPersonaForInspection(persona.id)}
                      className="cursor-pointer group flex items-center gap-2 p-1.5 rounded-2xl bg-[#fefae0] border-2 border-[#d4a373] hover:border-[#ffb703] transition-all shadow-xs"
                      title={`Click to inspect ${persona.name}’s musical notes`}
                    >
                      {/* Carved Wooden Figurine Avatar Base */}
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110 shadow-[0_2px_0_#936639] border-2"
                        style={{ backgroundColor: persona.accentBg, borderColor: persona.primaryColor }}
                      >
                        {persona.avatarIcon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-[#382c26] truncate">
                          {persona.name.split(' ')[0]}
                        </div>
                        <div className="text-[10px] font-bold text-[#606c38] truncate">
                          {persona.folkRole}
                        </div>
                      </div>

                      {/* Remove Figurine Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUndockPersona(dock.id);
                        }}
                        className="p-1 rounded-full text-[#bc6c25] hover:text-[#bc4749] hover:bg-[#faedcd] transition-colors"
                        title="Remove figurine from this stump"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* What this Figurine Contributes */}
                    <div className="text-[10px] text-[#7f4f24] font-bold px-2 py-1 bg-[#faedcd] rounded-xl border border-[#d4a373]/80">
                      {dock.id === 'rhythm' && (
                        <span className="text-[#bc6c25] font-black block">
                          ⚡ Controls BPM: {persona.rhythmPersona.bpm}
                        </span>
                      )}
                      <span className="block truncate text-[#382c26]">
                        {dock.id === 'rhythm' && persona.rhythmPersona.drumPatternName}
                        {dock.id === 'bass' && persona.bassPersona.styleName}
                        {dock.id === 'harmony' && persona.harmonyPersona.styleName}
                        {dock.id === 'melody' && persona.melodyPersona.styleName}
                        {dock.id === 'atmosphere' && persona.atmospherePersona.styleName}
                      </span>
                    </div>

                    {/* Note Hit Activity Bob */}
                    <div className="flex items-center justify-between text-[9px] font-black px-1">
                      <span className="text-[#606c38]">NOTE STATUS</span>
                      <span
                        className={`transition-colors ${
                          isActiveThisStep ? 'text-[#e76f51] animate-bounce font-black' : 'text-[#8c5825]'
                        }`}
                      >
                        {isActiveThisStep ? '🎵 PLAYING' : 'READY'}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Empty Tree Stump Socket */
                  <div className="py-3 px-1 text-center space-y-1">
                    <div className="w-9 h-9 mx-auto rounded-2xl border-2 border-dashed border-[#bc6c25] flex items-center justify-center text-[#8c5825] bg-[#faedcd]">
                      {dock.id === 'rhythm' && <Activity className="w-4 h-4 text-[#e76f51]" />}
                      {dock.id === 'bass' && <Flame className="w-4 h-4 text-[#588157]" />}
                      {dock.id === 'harmony' && <Layers className="w-4 h-4 text-[#3a86ff]" />}
                      {dock.id === 'melody' && <Music className="w-4 h-4 text-[#ffb703]" />}
                      {dock.id === 'atmosphere' && <Sparkles className="w-4 h-4 text-[#7209b7]" />}
                    </div>
                    <div className="text-xs font-black text-[#7f4f24]">Seat Figurine</div>
                    <div className="text-[9px] text-[#8c5825] font-bold line-clamp-1">{dock.governs}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Diorama Footer Info Bar (Signboard Style) */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-3 border-t-2 border-[#a7c957]/50 text-xs text-[#fefae0] font-bold">
        <div className="flex items-center gap-3">
          <span className="bg-[#2b422a]/70 px-2.5 py-0.5 rounded-full border border-[#a7c957]/40">
            BAND LEADER: <strong className="text-[#ffb703]">{composedSong.bandLeader.name}</strong>
          </span>
          <span className="bg-[#2b422a]/70 px-2.5 py-0.5 rounded-full border border-[#a7c957]/40">
            KEY: <strong className="text-white">{composedSong.key}</strong>
          </span>
          <span className="bg-[#2b422a]/70 px-2.5 py-0.5 rounded-full border border-[#a7c957]/40">
            STEP: <strong className="text-[#ffb703]">{currentStep + 1}</strong> / 16
          </span>
        </div>

        <div className="bg-[#2b422a]/70 px-3 py-0.5 rounded-full border border-[#a7c957]/40 text-[#ffb703]">
          {composedSong.dynamics.length > 0 ? (
            <span>★ {composedSong.dynamics.length} Figurine Synergies Active</span>
          ) : (
            <span>Place 2+ figurines for band synergies</span>
          )}
        </div>
      </div>

      {/* CLOSED LID WOODEN COVER OVERLAY (When lid is shut and not looking through peep-hole) */}
      {showClosedCover && (
        <div
          id="music-box-closed-cover"
          className="absolute inset-0 z-30 bg-[#bc6c25] flex flex-col items-center justify-center p-8 text-center"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, #d4a373 0%, #bc6c25 60%, #8c5825 100%)`,
          }}
        >
          {/* Animal Crossing Carved Wooden Box Ornament */}
          <div className="relative mb-5">
            <div className="w-28 h-28 rounded-full border-4 border-[#6f4518] bg-[#382c26] shadow-[0_6px_0_#4a2e1b] flex items-center justify-center p-2 relative overflow-hidden">
              {/* Internal Glowing Campfire visible through Peephole */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-t from-[#d00000] via-[#ffba08] to-yellow-200 opacity-90 blur-xs animate-pulse" />
              <div className="absolute text-4xl animate-bounce">🔥</div>
            </div>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#ffb703] border-2 border-[#d48b04] text-[#382c26] text-[11px] font-black uppercase px-3 py-0.5 rounded-full shadow-md">
              Brass Peephole
            </span>
          </div>

          <h3 className="text-2xl font-black text-[#fefae0] tracking-wide mb-2 drop-shadow-sm">
            Wooden Music Box Lid is Shut!
          </h3>
          <p className="text-sm text-[#faedcd] max-w-md mb-6 leading-relaxed font-medium">
            The clockwork gears are cycling inside the carved cedar box. The 5 folk band figurines are performing their
            melodies around the campfire!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                const peekBtn = document.getElementById('btn-peek-diorama');
                if (peekBtn) peekBtn.click();
              }}
              className="ac-btn px-5 py-2.5 rounded-2xl bg-[#ffb703] text-[#382c26] font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-2 border-[#d48b04]"
            >
              <Eye className="w-4 h-4 text-[#e76f51]" />
              <span>Peep Inside Box</span>
            </button>
            <button
              onClick={() => {
                const toggleLidBtn = document.getElementById('btn-toggle-lid');
                if (toggleLidBtn) toggleLidBtn.click();
              }}
              className="ac-btn px-5 py-2.5 rounded-2xl bg-[#588157] text-[#fefae0] font-black text-xs uppercase tracking-wider transition-all border-2 border-[#3a5a40]"
            >
              <span>Open Box to Rearrange</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
