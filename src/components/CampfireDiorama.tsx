import React from 'react';
import {
  PersonaId,
  DockId,
  ComposedFolkSong,
} from '../types/musicBox';
import { DOCKS, PERSONAS } from '../utils/personaData';
import { X, Sparkles, Activity, Music, Layers, Flame, Info } from 'lucide-react';

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

  // Spatial layout coordinates for the 5 log docks around the campfire
  const dockCoordinates: Record<DockId, { top: string; left: string; transform: string }> = {
    rhythm: { top: '15%', left: '16%', transform: 'translate(-50%, -50%)' },
    bass: { top: '72%', left: '14%', transform: 'translate(-50%, -50%)' },
    harmony: { top: '86%', left: '50%', transform: 'translate(-50%, -50%)' },
    melody: { top: '72%', left: '86%', transform: 'translate(-50%, -50%)' },
    atmosphere: { top: '15%', left: '84%', transform: 'translate(-50%, -50%)' },
  };

  return (
    <div
      id="campfire-diorama-container"
      className="relative w-full rounded-2xl overflow-hidden border-2 border-stone-800 bg-[#16120e] shadow-2xl min-h-[540px] flex flex-col justify-between p-4 sm:p-6 select-none"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.12) 0%, rgba(20, 15, 10, 0.95) 75%)`,
      }}
    >
      {/* Background Decorative Woodgrain & Forest Silhouette */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top Diorama Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          <span className="text-xs font-mono tracking-widest uppercase text-amber-300/90 font-bold">
            Campfire Diorama Stage · Physical Toy Simulator
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isLidClosed ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-amber-950/80 text-amber-400 border border-amber-800/80 flex items-center gap-1.5 shadow">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Lid Latched · Acoustic Box Resonating
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-stone-800/80 text-stone-300 border border-stone-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Lid Open · Place or Swap Figurines
            </span>
          )}
        </div>
      </div>

      {/* Centerpiece: Diorama Scene (Campfire + 5 Surrounding Log Docks) */}
      <div className="relative flex-1 w-full max-w-3xl mx-auto my-4 min-h-[380px] sm:min-h-[420px]">
        {/* Central Campfire */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-0">
          {/* Campfire Glow Aura */}
          <div
            className={`w-44 h-44 rounded-full transition-all duration-700 blur-2xl ${
              isPlaying
                ? 'bg-amber-500/25 scale-110'
                : 'bg-amber-600/15 scale-95'
            }`}
          />

          {/* Stone Circle */}
          <div className="absolute w-36 h-28 rounded-full border-4 border-stone-700/80 bg-stone-900/60 shadow-inner flex items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {/* Charcoal & Burning Wood Logs */}
            <div className="relative w-24 h-16 flex items-center justify-center">
              {/* Crossed wooden logs */}
              <div className="absolute w-20 h-4 bg-stone-800 rounded-full rotate-25 border border-stone-950 shadow" />
              <div className="absolute w-20 h-4 bg-stone-800 rounded-full -rotate-25 border border-stone-950 shadow" />

              {/* Animated Flames */}
              <div className="relative z-10 flex items-end justify-center gap-1">
                <div
                  className={`w-3 h-10 rounded-full bg-gradient-to-t from-red-600 via-amber-500 to-yellow-200 transition-all ${
                    isPlaying ? 'animate-bounce' : 'opacity-80'
                  }`}
                  style={{ animationDuration: '0.6s' }}
                />
                <div
                  className={`w-4 h-14 rounded-full bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-100 transition-all ${
                    isPlaying ? 'animate-pulse' : 'opacity-90'
                  }`}
                  style={{ animationDuration: '0.4s' }}
                />
                <div
                  className={`w-3 h-9 rounded-full bg-gradient-to-t from-red-600 via-amber-500 to-yellow-200 transition-all ${
                    isPlaying ? 'animate-bounce' : 'opacity-80'
                  }`}
                  style={{ animationDuration: '0.7s' }}
                />
              </div>

              {/* Rising Embers */}
              {isPlaying && (
                <>
                  <div className="absolute w-1.5 h-1.5 rounded-full bg-yellow-300 animate-ping -top-4 left-4" />
                  <div className="absolute w-1 h-1 rounded-full bg-amber-400 animate-ping -top-7 right-6" style={{ animationDelay: '0.3s' }} />
                  <div className="absolute w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping -top-10 left-10" style={{ animationDelay: '0.5s' }} />
                </>
              )}
            </div>
          </div>

          <div className="absolute -bottom-8 text-[11px] font-mono font-bold text-amber-500/80 tracking-wider">
            CAMPFIRE HEARTH
          </div>
        </div>

        {/* 5 Log Docking Stations */}
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
              {/* Dock Container */}
              <div
                className={`relative rounded-xl p-2.5 transition-all duration-200 border-2 ${
                  persona
                    ? isActiveThisStep
                      ? 'bg-stone-900 border-amber-400 shadow-lg shadow-amber-500/30 scale-105'
                      : 'bg-stone-900/90 border-stone-700 shadow-md hover:border-stone-500'
                    : 'bg-stone-950/60 border-dashed border-stone-800 hover:border-amber-700/60'
                }`}
              >
                {/* Dock Header & Slot Badge */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {dock.shortLabel}
                  </span>
                  <span className="text-[9px] font-mono text-stone-400 bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800">
                    SLOT {dock.slotNumber}
                  </span>
                </div>

                {/* Dock Contents: Occupied by Figurine OR Empty Socket */}
                {persona ? (
                  <div className="space-y-1.5">
                    {/* Figurine Badge */}
                    <div
                      onClick={() => onSelectPersonaForInspection(persona.id)}
                      className="cursor-pointer group flex items-center gap-2 p-1.5 rounded-lg bg-stone-950/80 border border-stone-800 hover:border-amber-500/60 transition-all"
                      title={`Click to inspect ${persona.name}’s musical dossier`}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-110 shadow-inner"
                        style={{ backgroundColor: persona.accentBg, border: `1.5px solid ${persona.primaryColor}` }}
                      >
                        {persona.avatarIcon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-stone-100 truncate group-hover:text-amber-300 transition-colors">
                          {persona.name.split(' ')[0]}
                        </div>
                        <div className="text-[10px] text-stone-400 truncate">
                          {persona.title}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUndockPersona(dock.id);
                        }}
                        className="p-1 rounded-full text-stone-500 hover:text-red-400 hover:bg-stone-900 transition-colors"
                        title="Remove figurine from this dock"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Role Description Tag */}
                    <div className="text-[10px] text-amber-200/90 leading-snug px-1.5 py-1 bg-amber-950/30 rounded border border-amber-900/30">
                      {dock.id === 'rhythm' && (
                        <span className="font-mono text-amber-300 font-bold block">
                          ⚡ Sets Tempo: {persona.rhythmPersona.bpm} BPM
                        </span>
                      )}
                      <span className="block truncate text-stone-300">
                        {dock.id === 'rhythm' && persona.rhythmPersona.drumPatternName}
                        {dock.id === 'bass' && persona.bassPersona.styleName}
                        {dock.id === 'harmony' && persona.harmonyPersona.styleName}
                        {dock.id === 'melody' && persona.melodyPersona.styleName}
                        {dock.id === 'atmosphere' && persona.atmospherePersona.styleName}
                      </span>
                    </div>

                    {/* Live Trigger Pulse Indicator */}
                    <div className="flex items-center justify-between text-[9px] font-mono px-1">
                      <span className="text-stone-400">ACTIVE VOICE</span>
                      <span
                        className={`font-bold transition-colors ${
                          isActiveThisStep ? 'text-amber-400' : 'text-stone-400'
                        }`}
                      >
                        {isActiveThisStep ? '♪ TRIGGERED' : 'STANDBY'}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Empty Dock Socket */
                  <div className="py-3 px-1 text-center space-y-1">
                    <div className="w-8 h-8 mx-auto rounded-full border border-dashed border-stone-700 flex items-center justify-center text-stone-600 bg-stone-950/40">
                      {dock.id === 'rhythm' && <Activity className="w-4 h-4 text-stone-500" />}
                      {dock.id === 'bass' && <Flame className="w-4 h-4 text-stone-500" />}
                      {dock.id === 'harmony' && <Layers className="w-4 h-4 text-stone-500" />}
                      {dock.id === 'melody' && <Music className="w-4 h-4 text-stone-500" />}
                      {dock.id === 'atmosphere' && <Sparkles className="w-4 h-4 text-stone-500" />}
                    </div>
                    <div className="text-[11px] font-medium text-stone-400">Empty Log Seat</div>
                    <div className="text-[9px] text-stone-400 line-clamp-1">{dock.governs}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Diorama Footer Info Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-800/80 text-xs text-stone-400">
        <div className="flex items-center gap-3">
          <span className="font-mono text-stone-300">
            BAND LEADER: <strong className="text-amber-400">{composedSong.bandLeader.name}</strong>
          </span>
          <span className="text-stone-400">·</span>
          <span className="font-mono text-stone-300">
            KEY: <strong className="text-stone-200">{composedSong.key}</strong>
          </span>
          <span className="text-stone-400">·</span>
          <span className="font-mono text-stone-300">
            STEP: <strong className="text-amber-400 font-bold">{currentStep + 1}</strong> / 16
          </span>
        </div>

        <div className="text-stone-400 text-[11px] font-mono">
          {composedSong.dynamics.length > 0 ? (
            <span className="text-emerald-400 font-semibold">
              ★ {composedSong.dynamics.length} Interpersonal Synergy Active
            </span>
          ) : (
            <span>Add more figurines to unlock band dynamics</span>
          )}
        </div>
      </div>

      {/* CLOSED LID WOODEN COVER OVERLAY (When lid is shut and not peeping) */}
      {showClosedCover && (
        <div
          id="music-box-closed-cover"
          className="absolute inset-0 z-30 bg-[#1f1710] flex flex-col items-center justify-center p-8 text-center backdrop-blur-md bg-opacity-95"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, #2b1f14 0%, #17110c 100%)`,
          }}
        >
          {/* Vintage Brass Corner Plates */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-600/70 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-600/70 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-600/70 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-600/70 rounded-br-lg" />

          {/* Ornate Brass Peephole Emblem */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-amber-600/80 bg-stone-950/90 shadow-2xl flex items-center justify-center p-2 relative overflow-hidden">
              {/* Inner glowing fire silhouette visible through peephole */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-t from-red-600 via-amber-500 to-yellow-300 opacity-90 blur-sm animate-pulse" />
              <div className="absolute text-2xl animate-bounce">🔥</div>
            </div>
            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-amber-900 border border-amber-600 text-amber-200 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full shadow">
              Diorama Peephole
            </span>
          </div>

          <h3 className="text-xl font-serif text-amber-200 font-bold tracking-wide mb-1">
            The Toy Music Box is Shut & Performing
          </h3>
          <p className="text-sm text-stone-300 max-w-md mb-6 leading-relaxed">
            The wooden lid is closed, activating the internal music cylinder. The 5 figurines are performing their
            campfire folk composition inside the resonant wooden chamber.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                const peekBtn = document.getElementById('btn-peek-diorama');
                if (peekBtn) peekBtn.click();
              }}
              className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-stone-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center gap-2"
            >
              <span>Look Through Peep-Hole</span>
            </button>
            <button
              onClick={() => {
                const toggleLidBtn = document.getElementById('btn-toggle-lid');
                if (toggleLidBtn) toggleLidBtn.click();
              }}
              className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-700/60 font-bold text-xs tracking-wider uppercase transition-all"
            >
              <span>Open Box Lid to Rearrange</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
