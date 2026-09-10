// Campfire Wild West Folk Web Audio Engine
// Synthesizes authentic folk instruments: Porch Stomp, Spoons, Washtub Bass,
// 5-String Banjo, Campfire Acoustic Guitar, Hoedown Fiddle, Blues Harmonica,
// Procedural Campfire Embers & Crickets, and Antique Music Box Tines.

export class FolkAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private campfireGain: GainNode | null = null;
  private isCampfireActive = false;
  private campfireTimer: number | null = null;
  public timbreParams = {
    stompPitchHz: 110,
    snareDecayMs: 120,
    washtubCutoffHz: 450,
    washtubResonance: 3,
    guitarBrightnessHz: 2200,
    fiddleVibratoRateHz: 5.8,
    fiddleVibratoDepthCents: 15,
    harmonicaBendMs: 60,
    campfireCrackleIntensity: 1.0,
  };

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  public setTimbreParams(params: Partial<typeof this.timbreParams>) {
    this.timbreParams = { ...this.timbreParams, ...params };
  }

  public auditionInstrument(type: 'stomp' | 'snare' | 'tambourine' | 'spoons' | 'washtub' | 'guitar' | 'banjo' | 'fiddle' | 'harmonica' | 'flute' | 'jug') {
    this.init();
    switch (type) {
      case 'stomp':
        this.triggerPorchStomp(0.9, 1.0);
        break;
      case 'snare':
        this.triggerBrushOrSnare(0.85, this.timbreParams.snareDecayMs / 1000);
        break;
      case 'tambourine':
        this.triggerTambourine(0.8);
        break;
      case 'spoons':
        this.triggerAccentPercussion('spoons', 0.85);
        break;
      case 'jug':
        this.triggerAccentPercussion('jug-pop', 0.9);
        break;
      case 'washtub':
        this.triggerBassNote(43, 0.45, 0.9, 'washtub-bass'); // G1
        break;
      case 'guitar':
        this.triggerHarmonyNote(55, 0.7, 0.85, 'acoustic-guitar'); // G3
        break;
      case 'banjo':
        this.triggerMelodyNote(67, 0.4, 0.9, 'soaring-banjo'); // G4
        break;
      case 'fiddle':
        this.triggerMelodyNote(71, 0.6, 0.85, 'wild-fiddle'); // B4
        break;
      case 'harmonica':
        this.triggerMelodyNote(67, 0.5, 0.9, 'blues-harmonica');
        break;
      case 'flute':
        this.triggerMelodyNote(72, 0.7, 0.85, 'wooden-flute');
        break;
    }
  }

  public init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.campfireGain = this.ctx.createGain();
      this.campfireGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.campfireGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, vol));
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  public setCampfireVolume(vol: number) {
    if (this.campfireGain && this.ctx) {
      const clamped = Math.max(0, Math.min(0.3, vol));
      this.campfireGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  public startCampfireAmbience() {
    if (this.isCampfireActive) return;
    this.init();
    if (!this.ctx || !this.campfireGain) return;

    this.isCampfireActive = true;
    this.scheduleCampfireCrackles();
  }

  public stopCampfireAmbience() {
    this.isCampfireActive = false;
    if (this.campfireTimer) {
      clearTimeout(this.campfireTimer);
      this.campfireTimer = null;
    }
  }

  private scheduleCampfireCrackles() {
    if (!this.isCampfireActive || !this.ctx || !this.campfireGain) return;

    // Trigger an ember pop / crackle
    this.playEmberPop();

    // Random interval between 60ms and 260ms
    const nextInterval = 70 + Math.random() * 220;
    this.campfireTimer = window.setTimeout(() => {
      this.scheduleCampfireCrackles();
    }, nextInterval);
  }

  private playEmberPop() {
    if (!this.ctx || !this.campfireGain) return;
    const t = this.ctx.currentTime;

    // Small burst of filtered noise for wood snap
    const bufferSize = Math.floor(this.ctx.sampleRate * (0.01 + Math.random() * 0.025));
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = Math.random() > 0.4 ? 'bandpass' : 'highpass';
    filter.frequency.setValueAtTime(1200 + Math.random() * 3200, t);
    filter.Q.setValueAtTime(3 + Math.random() * 5, t);

    const gain = this.ctx.createGain();
    const popVol = 0.03 + Math.random() * 0.07;
    gain.gain.setValueAtTime(popVol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.campfireGain);

    noise.start(t);
  }

  // --- MECHANICAL MUSIC BOX SOUNDS ---

  public playRatchetClick() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900 + Math.random() * 200, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.03);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.Q.setValueAtTime(6, t);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.035);
  }

  public playLidShutSound() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // 1. Heavy wooden box thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.18);
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.22);

    // 2. Brass latch click
    const latchOsc = this.ctx.createOscillator();
    const latchGain = this.ctx.createGain();
    const latchFilter = this.ctx.createBiquadFilter();
    latchOsc.type = 'square';
    latchOsc.frequency.setValueAtTime(2400, t + 0.04);
    latchOsc.frequency.exponentialRampToValueAtTime(800, t + 0.12);

    latchFilter.type = 'bandpass';
    latchFilter.frequency.setValueAtTime(2800, t);
    latchFilter.Q.setValueAtTime(8, t);

    latchGain.gain.setValueAtTime(0.001, t);
    latchGain.gain.setValueAtTime(0.3, t + 0.04);
    latchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    latchOsc.connect(latchFilter);
    latchFilter.connect(latchGain);
    latchGain.connect(this.masterGain);
    latchOsc.start(t + 0.04);
    latchOsc.stop(t + 0.14);

    // 3. Antique music box tine chime (intro chord)
    this.playMusicBoxChime(76, 0.2, t + 0.1);
    this.playMusicBoxChime(83, 0.2, t + 0.18);
  }

  public playLidOpenSound() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // Wooden creak & latch release
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(380, t);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.15);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(4, t);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.16);

    this.playMusicBoxChime(79, 0.2, t + 0.08);
  }

  public playMusicBoxChime(midiPitch: number, duration = 0.8, timeOffset?: number) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = timeOffset !== undefined ? timeOffset : this.ctx.currentTime;
    const freq = 440 * Math.pow(2, (midiPitch - 69) / 12);

    const osc = this.ctx.createOscillator();
    const harmonicOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    // High crystalline harmonic overtone
    harmonicOsc.type = 'sine';
    harmonicOsc.frequency.setValueAtTime(freq * 3.01, t);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.0005, t + duration);

    const harmGain = this.ctx.createGain();
    harmGain.gain.setValueAtTime(0.08, t);
    harmGain.gain.exponentialRampToValueAtTime(0.0001, t + duration * 0.4);

    osc.connect(gain);
    harmonicOsc.connect(harmGain);
    harmGain.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    harmonicOsc.start(t);
    osc.stop(t + duration);
    harmonicOsc.stop(t + duration);
  }

  // --- CAMPFIRE FOLK DRUMS & PERCUSSION ---

  public triggerPorchStomp(velocity = 0.8, pitchMod = 1.0) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // Resonant wooden porch stomp (low thud + wood knock)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110 * pitchMod, t);
    osc.frequency.exponentialRampToValueAtTime(36 * pitchMod, t + 0.14);

    gain.gain.setValueAtTime(velocity * 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    // Wood knock transient
    const knockOsc = this.ctx.createOscillator();
    const knockGain = this.ctx.createGain();
    knockOsc.type = 'square';
    knockOsc.frequency.setValueAtTime(260, t);
    knockOsc.frequency.exponentialRampToValueAtTime(70, t + 0.04);
    knockGain.gain.setValueAtTime(velocity * 0.35, t);
    knockGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    knockOsc.connect(knockGain);
    gain.connect(this.masterGain);
    knockGain.connect(this.masterGain);

    osc.start(t);
    knockOsc.start(t);
    osc.stop(t + 0.24);
    knockOsc.stop(t + 0.05);
  }

  public triggerBrushOrSnare(velocity = 0.7, duration = 0.12) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, t);
    filter.Q.setValueAtTime(2.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity * 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }

  public triggerTambourine(velocity = 0.6) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // Metallic jingle clusters
    const freqs = [5800, 7200, 8900];
    freqs.forEach((f) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f + (Math.random() * 200 - 100), t);

      gain.gain.setValueAtTime(velocity * 0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t);
      osc.stop(t + 0.09);
    });
  }

  public triggerAccentPercussion(type: 'spoons' | 'wood-block' | 'jug-pop' | 'jaw-harp', velocity = 0.7) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    if (type === 'spoons') {
      // Crisp metallic wooden spoon clack
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1600, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.03);
      gain.gain.setValueAtTime(velocity * 0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.04);
    } else if (type === 'wood-block') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      gain.gain.setValueAtTime(velocity * 0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.07);
    } else if (type === 'jug-pop') {
      // Hollow blown jug pop with upward pitch scoop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(190, t + 0.08);
      gain.gain.setValueAtTime(velocity * 0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.15);
    } else {
      // Jaw harp boing
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.linearRampToValueAtTime(240, t + 0.06);
      osc.frequency.linearRampToValueAtTime(180, t + 0.15);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, t);
      filter.frequency.linearRampToValueAtTime(1400, t + 0.08);
      filter.Q.setValueAtTime(7, t);

      gain.gain.setValueAtTime(velocity * 0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.22);
    }
  }

  // --- FOLK BASS ENGINES ---

  public triggerBassNote(pitch: number, durationSec = 0.4, velocity = 0.8, instrument: 'washtub-bass' | 'upright-acoustic' | 'hollow-jug' | 'walking-thumb' = 'washtub-bass') {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const freq = 440 * Math.pow(2, (pitch - 69) / 12);

    if (instrument === 'hollow-jug') {
      // Hollow breathy jug scoop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 0.85, t);
      osc.frequency.exponentialRampToValueAtTime(freq, t + 0.08);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(velocity * 0.5, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + durationSec);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + durationSec + 0.05);
      return;
    }

    // Washtub / Upright Acoustic Bass
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq, t);

    // Warm wooden lowpass filter with pluck envelope
    filter.type = 'lowpass';
    const initCutoff = instrument === 'washtub-bass' ? 450 : 650;
    filter.frequency.setValueAtTime(initCutoff, t);
    filter.frequency.exponentialRampToValueAtTime(140, t + durationSec * 0.7);
    filter.Q.setValueAtTime(3, t);

    // Pluck amplitude envelope
    gain.gain.setValueAtTime(velocity * 0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + durationSec);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + durationSec + 0.05);
    osc2.stop(t + durationSec + 0.05);
  }

  // --- FOLK HARMONY (Campfire Guitar, Banjo Chords, Reed Accordion) ---

  public triggerHarmonyNote(pitch: number, durationSec = 0.5, velocity = 0.7, instrument: 'acoustic-guitar' | 'clawhammer-banjo' | 'campfire-accordion' | 'reed-harmonium' = 'acoustic-guitar') {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const freq = 440 * Math.pow(2, (pitch - 69) / 12);

    if (instrument === 'clawhammer-banjo') {
      // Sharp bright attack with fast decay and metallic ring
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 2.2, t);
      filter.Q.setValueAtTime(3.5, t);

      gain.gain.setValueAtTime(velocity * 0.45, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + Math.min(durationSec, 0.35));

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + durationSec);
      return;
    }

    if (instrument === 'campfire-accordion' || instrument === 'reed-harmonium') {
      // Dual detuned reeds
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'square';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, t);
      osc2.frequency.setValueAtTime(freq * 1.004, t); // gentle reed chorus

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);
      filter.Q.setValueAtTime(2, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(velocity * 0.3, t + 0.03);
      gain.gain.setValueAtTime(velocity * 0.28, t + durationSec - 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + durationSec);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + durationSec + 0.05);
      osc2.stop(t + durationSec + 0.05);
      return;
    }

    // Default: Campfire Acoustic Guitar Pluck
    const osc = this.ctx.createOscillator();
    const oscBody = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);

    oscBody.type = 'triangle';
    oscBody.frequency.setValueAtTime(freq, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.frequency.exponentialRampToValueAtTime(450, t + durationSec * 0.8);
    filter.Q.setValueAtTime(2, t);

    gain.gain.setValueAtTime(velocity * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + durationSec);

    osc.connect(filter);
    oscBody.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    oscBody.start(t);
    osc.stop(t + durationSec + 0.05);
    oscBody.stop(t + durationSec + 0.05);
  }

  // --- FOLK LEAD MELODY (Wild Fiddle, Soaring Banjo, Blues Harmonica, River Flute) ---

  public triggerMelodyNote(pitch: number, durationSec = 0.4, velocity = 0.8, instrument: 'wild-fiddle' | 'soaring-banjo' | 'blues-harmonica' | 'fingerstyle-lead' | 'wooden-flute' = 'wild-fiddle') {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const freq = 440 * Math.pow(2, (pitch - 69) / 12);

    if (instrument === 'wild-fiddle') {
      // Hoedown fiddle: bowed saw with vibrato and wood formant
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Vibrato LFO
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(5.8, t); // 5.8 Hz natural folk vibrato
      lfoGain.gain.setValueAtTime(freq * 0.015, t); // subtle pitch swing
      lfo.connect(osc.frequency);

      osc.type = 'sawtooth';
      // Expressive hoedown slide from 1 semitone below
      osc.frequency.setValueAtTime(freq * 0.94, t);
      osc.frequency.exponentialRampToValueAtTime(freq, t + 0.04);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, t);
      filter.Q.setValueAtTime(2.2, t);

      // Bow attack envelope
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(velocity * 0.42, t + 0.03);
      gain.gain.setValueAtTime(velocity * 0.38, t + durationSec - 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + durationSec);

      lfo.start(t);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + durationSec + 0.05);
      lfo.stop(t + durationSec + 0.05);
      return;
    }

    if (instrument === 'blues-harmonica') {
      // Gritty dual-reed harmonica with initial pitch bend
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'square';
      osc2.type = 'sawtooth';

      // Expressive bend down then up
      osc1.frequency.setValueAtTime(freq * 0.92, t);
      osc1.frequency.exponentialRampToValueAtTime(freq, t + 0.06);
      osc2.frequency.setValueAtTime(freq * 0.925, t);
      osc2.frequency.exponentialRampToValueAtTime(freq * 1.006, t + 0.06);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, t);
      filter.Q.setValueAtTime(3.8, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(velocity * 0.36, t + 0.03);
      gain.gain.setValueAtTime(velocity * 0.34, t + durationSec - 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + durationSec);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + durationSec + 0.05);
      osc2.stop(t + durationSec + 0.05);
      return;
    }

    if (instrument === 'wooden-flute') {
      // Pure warm breathy sine with gentle harmonic
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(velocity * 0.35, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + durationSec);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + durationSec + 0.05);
      return;
    }

    // Default: Banjo or Fingerstyle Lead
    this.triggerHarmonyNote(pitch, durationSec, velocity, instrument === 'soaring-banjo' ? 'clawhammer-banjo' : 'acoustic-guitar');
  }

  // --- FOLK ATMOSPHERE & ACCENTS (Whistle, Chimes, Night Flute) ---

  public triggerAtmosphereVoice(pitch: number, durationSec = 0.8, velocity = 0.5, texture: string = 'pine-crackles') {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const freq = 440 * Math.pow(2, (pitch - 69) / 12);

    if (texture === 'canyon-wind' || texture === 'river-stream') {
      // Shimmering acoustic harmonic chime
      this.playMusicBoxChime(pitch + 12, durationSec, t);
      return;
    }

    // Wooden whistle or flute accent
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.02, t + durationSec * 0.5);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(velocity * 0.25, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + durationSec);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + durationSec);
  }
}

// Global singleton instance for the applet
export const folkAudio = new FolkAudioEngine();
