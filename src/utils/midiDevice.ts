import { MidiNoteMessage } from '../types/music';

export type MidiListener = (msg: MidiNoteMessage) => void;

interface MIDIAccessLike {
  inputs: {
    values(): IterableIterator<MIDIInputLike>;
  };
  onstatechange: (() => void) | null;
}

interface MIDIInputLike {
  name?: string;
  onmidimessage: ((event: MIDIMessageEventLike) => void) | null;
}

interface MIDIMessageEventLike {
  data?: Uint8Array | number[];
  timeStamp?: number;
}

class MidiDeviceManager {
  private midiAccess: MIDIAccessLike | null = null;
  private listeners: Set<MidiListener> = new Set();
  public isSupported = false;
  public isConnected = false;
  public inputDevices: string[] = [];
  public selectedInputId: string | null = null;

  constructor() {
    if (typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator) {
      this.isSupported = true;
    }
  }

  public async requestAccess(): Promise<boolean> {
    if (!this.isSupported) return false;
    try {
      const nav = navigator as unknown as {
        requestMIDIAccess: (opts: { sysex: boolean }) => Promise<MIDIAccessLike>;
      };
      this.midiAccess = await nav.requestMIDIAccess({ sysex: false });
      this.isConnected = true;
      this.updateDeviceList();

      this.midiAccess.onstatechange = () => {
        this.updateDeviceList();
      };

      return true;
    } catch (err) {
      console.warn('Web MIDI API access denied or unavailable:', err);
      this.isConnected = false;
      return false;
    }
  }

  private updateDeviceList() {
    if (!this.midiAccess) return;
    const names: string[] = [];
    const inputs = this.midiAccess.inputs.values();

    for (const input of inputs) {
      names.push(input.name || 'Unnamed MIDI Device');
      input.onmidimessage = (e: MIDIMessageEventLike) => this.handleMidiMessage(e);
    }
    this.inputDevices = names;
  }

  private handleMidiMessage(event: MIDIMessageEventLike) {
    if (!event.data || event.data.length < 3) return;
    const [status, note, velocity] = event.data;
    const command = status >> 4;
    const channel = status & 0xf;

    if (command === 9 && velocity > 0) {
      this.notifyListeners({
        type: 'noteOn',
        note,
        velocity: velocity / 127,
        channel,
        timestamp: event.timeStamp || Date.now(),
      });
    } else if (command === 8 || (command === 9 && velocity === 0)) {
      this.notifyListeners({
        type: 'noteOff',
        note,
        velocity: 0,
        channel,
        timestamp: event.timeStamp || Date.now(),
      });
    }
  }

  public subscribe(listener: MidiListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(msg: MidiNoteMessage) {
    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (err) {
        console.error('Error in MIDI listener:', err);
      }
    });
  }
}

export const midiDeviceManager = new MidiDeviceManager();
