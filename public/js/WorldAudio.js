// Procedural, original ambience and short gameplay cues. No external audio assets required.
export class WorldAudio {
  constructor() {
    this.settings = { nature: 75, music: 35, player: 80 };
    try {
      const saved = JSON.parse(localStorage.getItem("pixel-frontier-audio-v1") || "null");
      if (saved && typeof saved === "object") {
        for (const key of Object.keys(this.settings)) {
          const value = Number(saved[key]);
          if (Number.isFinite(value)) this.settings[key] = Math.max(0, Math.min(100, value));
        }
      }
    } catch {}
    this.context = null;
    this.master = null;
    this.natureGain = null;
    this.playerGain = null;
    this.nodes = [];
    this.noiseBuffer = null;
    this.started = false;
    this.weather = "clear";
    this.music = document.querySelector("#world-music");
    this.unlock = () => this.start();
    document.addEventListener("pointerdown", this.unlock, { once: true });
    document.addEventListener("keydown", this.unlock, { once: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.pauseMusic();
      else if (this.started) this.playMusic();
    });
    this.applyVolumes();
  }

  setVolume(key, value) {
    if (!(key in this.settings)) return;
    this.settings[key] = Math.max(0, Math.min(100, Number(value) || 0));
    try { localStorage.setItem("pixel-frontier-audio-v1", JSON.stringify(this.settings)); } catch {}
    this.applyVolumes();
  }

  applyVolumes() {
    if (this.natureGain) this.natureGain.gain.setTargetAtTime(this.settings.nature / 100 * 0.18, this.context.currentTime, 0.15);
    if (this.playerGain) this.playerGain.gain.setTargetAtTime(this.settings.player / 100 * 0.32, this.context.currentTime, 0.08);
    if (this.music) this.music.volume = this.settings.music / 100;
  }

  async start() {
    if (this.started) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.context = new AudioContextClass();
    await this.context.resume();
    this.master = this.context.createGain();
    this.master.gain.value = 0.8;
    this.master.connect(this.context.destination);
    this.natureGain = this.context.createGain();
    this.playerGain = this.context.createGain();
    this.natureGain.connect(this.master);
    this.playerGain.connect(this.master);
    this.noiseBuffer = this.makeNoiseBuffer();
    this.startWind();
    this.startWater();
    this.started = true;
    this.applyVolumes();
    this.playMusic();
    this.birdTimer = window.setInterval(() => {
      if (!document.hidden && Math.random() < 0.72) this.birdCall();
    }, 8500);
  }

  makeNoiseBuffer() {
    const length = this.context.sampleRate * 3;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * 0.22;
    return buffer;
  }

  noiseLayer(frequency, q, gain, pan = 0) {
    const source = this.context.createBufferSource();
    source.buffer = this.noiseBuffer;
    source.loop = true;
    const filter = this.context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = frequency;
    filter.Q.value = q;
    const level = this.context.createGain();
    level.gain.value = gain;
    const panner = this.context.createStereoPanner();
    panner.pan.value = pan;
    source.connect(filter).connect(level).connect(panner).connect(this.natureGain);
    source.start();
    this.nodes.push(source, filter, level, panner);
    return { source, filter, level };
  }

  startWind() {
    const wind = this.noiseLayer(420, 0.5, 0.18, -0.15);
    const lfo = this.context.createOscillator();
    const depth = this.context.createGain();
    lfo.frequency.value = 0.07;
    depth.gain.value = 150;
    lfo.connect(depth).connect(wind.filter.frequency);
    lfo.start();
    this.nodes.push(lfo, depth);
    this.windLayer = wind;
  }

  startWater() {
    const water = this.noiseLayer(1100, 0.7, 0.035, 0.18);
    this.waterLayer = water;
  }

  birdCall() {
    if (!this.context || !this.natureGain || this.context.state !== "running") return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();
    const panner = this.context.createStereoPanner();
    const start = 1500 + Math.random() * 700;
    const end = start + (Math.random() - 0.35) * 800;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(start, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(500, end), now + 0.13);
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(0.045, now + 0.025);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.19);
    panner.pan.value = Math.random() * 1.6 - 0.8;
    oscillator.connect(envelope).connect(panner).connect(this.natureGain);
    oscillator.start(now);
    oscillator.stop(now + 0.21);
  }

  setWeather(weather) {
    this.weather = weather || "clear";
    if (this.windLayer && this.context) {
      const windy = this.weather === "rain" ? 0.28 : this.weather === "cloudy" ? 0.22 : 0.18;
      this.windLayer.level.gain.setTargetAtTime(windy, this.context.currentTime, 0.8);
      this.waterLayer.level.gain.setTargetAtTime(this.weather === "rain" ? 0.075 : 0.035, this.context.currentTime, 0.8);
    }
  }

  playMusic() {
    if (!this.music || !this.music.getAttribute("src") || document.hidden) return;
    this.music.volume = this.settings.music / 100;
    this.music.play().catch(() => {});
  }

  pauseMusic() { this.music?.pause(); }

  cue(kind) {
    if (!this.context || !this.playerGain || this.context.state !== "running") return;
    const presets = {
      gather: [260, 190, 0.12],
      build: [150, 95, 0.2],
      craft: [420, 610, 0.16],
    };
    const preset = presets[kind];
    if (!preset) return;
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = kind === "build" ? "triangle" : "sine";
    osc.frequency.setValueAtTime(preset[0], now);
    osc.frequency.exponentialRampToValueAtTime(preset[1], now + 0.11);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(preset[2], now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(gain).connect(this.playerGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  destroy() {
    if (this.birdTimer) clearInterval(this.birdTimer);
    this.pauseMusic();
    for (const node of this.nodes) { try { node.stop?.(); node.disconnect?.(); } catch {} }
    this.context?.close().catch(() => {});
    this.started = false;
  }
}
