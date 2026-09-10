import { midiToFreq } from './musicTheory';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedbackGain: GainNode | null = null;
  private delayDryWetGain: GainNode | null = null;
  public analyser: AnalyserNode | null = null;

  private activeVoices: Map<number, { oscs: OscillatorNode[]; gain: GainNode }> = new Map();
  private isInitialized = false;

  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private destNode: MediaStreamAudioDestinationNode | null = null;

  public init() {
    if (this.isInitialized && this.ctx && this.ctx.state !== 'closed') return;

    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(14000, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(1.5, this.ctx.currentTime);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.8;

    this.delayNode = this.ctx.createDelay(1.0);
    this.delayNode.delayTime.setValueAtTime(0.28, this.ctx.currentTime);

    this.delayFeedbackGain = this.ctx.createGain();
    this.delayFeedbackGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    this.delayDryWetGain = this.ctx.createGain();
    this.delayDryWetGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    this.filterNode.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.filterNode.connect(this.delayNode);
    this.delayNode.connect(this.delayFeedbackGain);
    this.delayFeedbackGain.connect(this.delayNode);
    this.delayNode.connect(this.delayDryWetGain);
    this.delayDryWetGain.connect(this.masterGain);

    if (this.ctx.createMediaStreamDestination) {
      this.destNode = this.ctx.createMediaStreamDestination();
      this.analyser.connect(this.destNode);
    }

    this.isInitialized = true;
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(val: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1.2, val)), this.ctx.currentTime, 0.02);
    }
  }

  public setFilterCutoff(freq: number) {
    if (this.filterNode && this.ctx) {
      this.filterNode.frequency.setTargetAtTime(Math.max(100, Math.min(20000, freq)), this.ctx.currentTime, 0.05);
    }
  }

  public setDelayAmount(mix: number) {
    if (this.delayDryWetGain && this.ctx) {
      this.delayDryWetGain.gain.setTargetAtTime(Math.max(0, Math.min(0.8, mix)), this.ctx.currentTime, 0.05);
    }
  }

  public noteOn(midiPitch: number, velocity = 0.8, synthType: 'poly' | 'lead' | 'bass' = 'poly') {
    this.init();
    this.resume();
    if (!this.ctx || !this.filterNode) return;

    this.noteOff(midiPitch);

    const freq = midiToFreq(midiPitch);
    const now = this.ctx.currentTime;
    const voiceGain = this.ctx.createGain();
    const oscs: OscillatorNode[] = [];

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();

    if (synthType === 'bass') {
      osc1.type = 'sawtooth';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 0.5, now);
      voiceGain.gain.setValueAtTime(0, now);
      voiceGain.gain.linearRampToValueAtTime(velocity * 0.45, now + 0.01);
    } else if (synthType === 'lead') {
      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 1.004, now);
      voiceGain.gain.setValueAtTime(0, now);
      voiceGain.gain.linearRampToValueAtTime(velocity * 0.35, now + 0.02);
    } else {
      osc1.type = 'triangle';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 1.002, now);
      voiceGain.gain.setValueAtTime(0, now);
      voiceGain.gain.linearRampToValueAtTime(velocity * 0.28, now + 0.03);
    }

    osc1.connect(voiceGain);
    osc2.connect(voiceGain);
    voiceGain.connect(this.filterNode);

    osc1.start(now);
    osc2.start(now);
    oscs.push(osc1, osc2);

    this.activeVoices.set(midiPitch, { oscs, gain: voiceGain });
  }

  public noteOff(midiPitch: number) {
    if (!this.ctx) return;
    const voice = this.activeVoices.get(midiPitch);
    if (!voice) return;

    const now = this.ctx.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
    voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    setTimeout(() => {
      voice.oscs.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      voice.gain.disconnect();
    }, 150);

    this.activeVoices.delete(midiPitch);
  }

  public playSynthNote(
    midiPitch: number,
    durationSeconds: number,
    velocity = 0.8,
    synthType: 'poly' | 'lead' | 'bass' = 'poly',
    scheduledTime?: number
  ) {
    this.init();
    if (!this.ctx || !this.filterNode) return;

    const startTime = scheduledTime !== undefined ? scheduledTime : this.ctx.currentTime;
    const stopTime = startTime + Math.max(0.05, durationSeconds);
    const freq = midiToFreq(midiPitch);

    const voiceGain = this.ctx.createGain();
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();

    if (synthType === 'bass') {
      osc1.type = 'sawtooth';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freq, startTime);
      osc2.frequency.setValueAtTime(freq * 0.5, startTime);
      voiceGain.gain.setValueAtTime(0, startTime);
      voiceGain.gain.linearRampToValueAtTime(velocity * 0.5, startTime + 0.008);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, stopTime);
    } else if (synthType === 'lead') {
      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(freq, startTime);
      osc2.frequency.setValueAtTime(freq * 1.003, startTime);
      voiceGain.gain.setValueAtTime(0, startTime);
      voiceGain.gain.linearRampToValueAtTime(velocity * 0.35, startTime + 0.015);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, stopTime);
    } else {
      osc1.type = 'triangle';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, startTime);
      osc2.frequency.setValueAtTime(freq * 1.002, startTime);
      voiceGain.gain.setValueAtTime(0, startTime);
      voiceGain.gain.linearRampToValueAtTime(velocity * 0.3, startTime + 0.02);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, stopTime);
    }

    osc1.connect(voiceGain);
    osc2.connect(voiceGain);
    voiceGain.connect(this.filterNode);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(stopTime + 0.05);
    osc2.stop(stopTime + 0.05);
  }

  public playDrum(type: 'kick' | 'snare' | 'hihat' | 'perc', velocity = 0.8, scheduledTime?: number) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const startTime = scheduledTime !== undefined ? scheduledTime : this.ctx.currentTime;

    if (type === 'kick') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(140, startTime);
      osc.frequency.exponentialRampToValueAtTime(38, startTime + 0.08);
      gain.gain.setValueAtTime(velocity * 0.9, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    } else if (type === 'snare') {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, startTime);
      osc.frequency.exponentialRampToValueAtTime(80, startTime + 0.06);
      oscGain.gain.setValueAtTime(velocity * 0.4, startTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);
      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start(startTime);
      osc.stop(startTime + 0.15);

      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(1000, startTime);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(velocity * 0.5, startTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(startTime);
    } else if (type === 'hihat') {
      const bufferSize = this.ctx.sampleRate * 0.05;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7000, startTime);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(velocity * 0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.045);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(startTime);
    } else if (type === 'perc') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, startTime);
      osc.frequency.exponentialRampToValueAtTime(120, startTime + 0.06);
      gain.gain.setValueAtTime(velocity * 0.5, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(startTime);
      osc.stop(startTime + 0.1);
    }
  }

  public startRecording() {
    this.init();
    if (!this.destNode) return;
    this.recordedChunks = [];
    try {
      this.mediaRecorder = new MediaRecorder(this.destNode.stream);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.recordedChunks.push(e.data);
      };
      this.mediaRecorder.start();
    } catch (e) {
      console.error('MediaRecorder start failed:', e);
    }
  }

  public stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }
}

export const audioEngine = new AudioEngine();
