export class ProximityVoice {
  constructor(network) {
    this.net = network;
    this.enabled = false;
    this.localId = null;
    this.stream = null;
    this.peers = new Map();
    this.blocked = new Set();
    this.discoveryTimer = null;
    this.keyHeld = false;
    this.root = document.querySelector("#voice-chat");
    try { this.blocked = new Set(JSON.parse(localStorage.getItem("pixel-frontier-voice-blocked-v1") || "[]")); } catch {}
    this.render();
    this.net.on("voice:nearby", players => this.syncNearby(players));
    this.net.on("voice:signal", message => this.receiveSignal(message));
    this.net.on("voice:status", state => { this.enabled = state?.enabled === true; this.renderStatus(); });
    this.net.on("disconnect", () => this.disable(false));
  }

  setLocalId(id) { this.localId = id; }

  render() {
    if (!this.root) return;
    this.root.innerHTML = `
      <strong>Yakın sesli sohbet</strong>
      <p class="voice-note">Mikrofon varsayılan olarak kapalıdır. Açarsan yalnızca bas-konuş sırasında sesin iletilir.</p>
      <button id="voice-enable" type="button">Mikrofonu etkinleştir</button>
      <button id="voice-ptt" type="button" disabled>Basılı tut · V</button>
      <div id="voice-status" role="status">Sesli sohbet kapalı</div>
      <ul id="voice-peers"></ul>`;
    this.enableButton = this.root.querySelector("#voice-enable");
    this.pttButton = this.root.querySelector("#voice-ptt");
    this.status = this.root.querySelector("#voice-status");
    this.peerList = this.root.querySelector("#voice-peers");
    this.enableButton.addEventListener("click", () => this.enabled ? this.disable(true) : this.enable());
    this.pttButton.addEventListener("pointerdown", event => { event.preventDefault(); this.setTalking(true); });
    for (const name of ["pointerup", "pointercancel", "lostpointercapture", "pointerleave"]) {
      this.pttButton.addEventListener(name, () => this.setTalking(false));
    }
    this.pttButton.addEventListener("contextmenu", event => event.preventDefault());
    window.addEventListener("keydown", event => {
      if (event.code === "KeyV" && !event.repeat && !event.target?.matches?.("input,textarea,button")) this.setTalking(true);
    });
    window.addEventListener("keyup", event => { if (event.code === "KeyV") this.setTalking(false); });
    window.addEventListener("blur", () => this.setTalking(false));
    this.renderStatus();
  }

  async enable() {
    if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) {
      this.status.textContent = "Bu tarayıcı WebRTC sesini desteklemiyor.";
      return;
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
      for (const track of this.stream.getAudioTracks()) track.enabled = false;
      this.enabled = true;
      this.net.emit("voice:enable", { enabled: true });
      this.discoveryTimer = window.setInterval(() => this.net.emit("voice:discover", {}), 2000);
      this.net.emit("voice:discover", {});
      this.renderStatus();
    } catch (error) {
      this.status.textContent = error?.name === "NotAllowedError" ? "Mikrofon izni verilmedi. Tarayıcı ayarlarından izin verebilirsin." : "Mikrofon başlatılamadı.";
    }
  }

  disable(notify = true) {
    this.setTalking(false);
    if (this.discoveryTimer) window.clearInterval(this.discoveryTimer);
    this.discoveryTimer = null;
    for (const id of [...this.peers.keys()]) this.closePeer(id);
    for (const track of this.stream?.getTracks?.() || []) track.stop();
    this.stream = null;
    const wasEnabled = this.enabled;
    this.enabled = false;
    if (notify && wasEnabled) this.net.emit("voice:enable", { enabled: false });
    this.renderStatus();
  }

  setTalking(active) {
    const talking = !!active && this.enabled && !!this.stream;
    for (const track of this.stream?.getAudioTracks?.() || []) track.enabled = talking;
    if (this.pttButton) this.pttButton.classList.toggle("talking", talking);
    if (this.status && this.enabled) this.status.textContent = talking ? "Konuşuyorsun · tuşu bırakınca ses kesilir" : "Dinleme açık · konuşmak için basılı tut";
  }

  async syncNearby(players) {
    if (!this.enabled || !Array.isArray(players)) return;
    const allowed = new Set(players.map(p => p.id).filter(id => typeof id === "string" && !this.blocked.has(id)));
    for (const id of [...this.peers.keys()]) if (!allowed.has(id)) this.closePeer(id);
    for (const player of players) {
      if (!allowed.has(player.id) || this.peers.has(player.id) || !this.localId || this.localId.localeCompare(player.id) > 0) continue;
      await this.createPeer(player.id, true);
    }
    this.renderPeers(players.filter(p => allowed.has(p.id)));
  }

  async createPeer(id, initiator) {
    if (this.peers.has(id) || !this.stream) return this.peers.get(id);
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    const audio = document.createElement("audio");
    audio.autoplay = true;
    audio.playsInline = true;
    audio.dataset.playerId = id;
    document.body.append(audio);
    const peer = { pc, audio, muted: false, pendingCandidates: [] };
    this.peers.set(id, peer);
    for (const track of this.stream.getAudioTracks()) pc.addTrack(track, this.stream);
    pc.ontrack = event => {
      if (event.streams?.[0]) audio.srcObject = event.streams[0];
      audio.muted = peer.muted;
      audio.play().catch(() => {});
    };
    pc.onicecandidate = event => {
      if (event.candidate) this.net.emit("voice:signal", { to: id, signal: { type: "candidate", candidate: event.candidate } });
    };
    pc.onconnectionstatechange = () => {
      if (["failed", "closed"].includes(pc.connectionState)) this.closePeer(id);
    };
    if (initiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.net.emit("voice:signal", { to: id, signal: { type: "offer", sdp: pc.localDescription } });
    }
    return peer;
  }

  async receiveSignal({ from, signal } = {}) {
    if (!this.enabled || typeof from !== "string" || this.blocked.has(from) || !signal) return;
    try {
      const peer = await this.createPeer(from, false);
      if (!peer) return;
      if (signal.type === "offer") {
        await peer.pc.setRemoteDescription(signal.sdp);
        const answer = await peer.pc.createAnswer();
        await peer.pc.setLocalDescription(answer);
        this.net.emit("voice:signal", { to: from, signal: { type: "answer", sdp: peer.pc.localDescription } });
      } else if (signal.type === "answer" && !peer.pc.remoteDescription) {
        await peer.pc.setRemoteDescription(signal.sdp);
      } else if (signal.type === "candidate" && signal.candidate) {
        await peer.pc.addIceCandidate(signal.candidate);
      }
    } catch {
      this.closePeer(from);
    }
  }

  renderPeers(players = []) {
    if (!this.peerList) return;
    this.peerList.replaceChildren();
    for (const player of players) {
      const peer = this.peers.get(player.id);
      const row = document.createElement("li");
      const label = document.createElement("span");
      label.textContent = player.name || "Gezgin";
      const mute = document.createElement("button");
      mute.type = "button";
      mute.textContent = peer?.muted ? "Sesi aç" : "Sessize al";
      mute.addEventListener("click", () => {
        if (!peer) return;
        peer.muted = !peer.muted;
        peer.audio.muted = peer.muted;
        mute.textContent = peer.muted ? "Sesi aç" : "Sessize al";
      });
      const block = document.createElement("button");
      block.type = "button";
      block.textContent = "Engelle";
      block.addEventListener("click", () => {
        this.blocked.add(player.id);
        try { localStorage.setItem("pixel-frontier-voice-blocked-v1", JSON.stringify([...this.blocked])); } catch {}
        this.closePeer(player.id);
        row.remove();
      });
      row.append(label, mute, block);
      this.peerList.append(row);
    }
  }

  renderStatus() {
    if (!this.root || !this.enableButton || !this.pttButton) return;
    this.enableButton.textContent = this.enabled ? "Sesli sohbeti kapat" : "Mikrofonu etkinleştir";
    this.pttButton.disabled = !this.enabled;
    if (!this.enabled && this.status) this.status.textContent = "Sesli sohbet kapalı";
  }

  closePeer(id) {
    const peer = this.peers.get(id);
    if (!peer) return;
    peer.pc.ontrack = null;
    peer.pc.onicecandidate = null;
    peer.pc.close();
    peer.audio.srcObject = null;
    peer.audio.remove();
    this.peers.delete(id);
  }

  destroy() { this.disable(true); }
}
