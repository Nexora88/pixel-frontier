import { WorldRenderer } from "./WorldRenderer.js";

export class WorldScene extends Phaser.Scene {
  constructor(net) {
    super("WorldScene");
    this.net = net;
    this.players = new Map();
    this.localId = null;
    this.lastInput = "";
    this.buildMode = null;
  }

  preload() {
    this.load.spritesheet("survivor", "/assets/survivor.svg", {
      frameWidth: 16,
      frameHeight: 16
    });
  }

  create() {
    this.createPlayerAnimations();
    this.renderer = new WorldRenderer(this);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("W,A,S,D");
    this.input.keyboard.on("keydown-E", () => this.gatherNearest());
    this.input.on("pointerdown", p => {
      if (!this.buildMode || !this.net.connected) return;
      const q = this.cameras.main.getWorldPoint(p.x, p.y);
      this.net.emit("world:build", { type: this.buildMode, x: q.x, y: q.y });
    });
    this.bindNetwork();
  }

  createPlayerAnimations() {
    const directions = ["down", "left", "right", "up"];
    directions.forEach((direction, row) => {
      this.anims.create({
        key: `survivor-walk-${direction}`,
        frames: this.anims.generateFrameNumbers("survivor", {
          start: row * 4,
          end: row * 4 + 3
        }),
        frameRate: 8,
        repeat: -1
      });
    });
  }

  bindNetwork() {
    this.net.on("world:init", d => {
      this.localId = d.ownId;
      this.cameras.main.setBounds(0, 0, d.world.width, d.world.height);
      this.renderer.drawGround(d.world.width, d.world.height, d.worldState.seed);
      this.renderer.addResources(d.worldState.resources);
      this.renderer.addBuildings(d.worldState.buildings);
      d.players.forEach(p => this.upsert(p));
      const me = this.players.get(this.localId);
      if (me) this.cameras.main.startFollow(me.body, true, 0.12, 0.12);
      this.events.emit("ready", d);
    });
    this.net.on("player:joined", p => this.upsert(p));
    this.net.on("player:left", ({ id }) => this.remove(id));
    this.net.on("world:state", ({ players }) => players.forEach(p => this.upsert(p)));
    this.net.on("world:resource:removed", ({ id }) => this.renderer.removeResource(id));
    this.net.on("world:building:placed", b => this.renderer.addBuilding(b));
    this.net.on("world:gather:result", r => this.events.emit("action-result", r));
    this.net.on("world:build:result", r => this.events.emit("action-result", r));
  }

  upsert(d) {
    let p = this.players.get(d.id);
    if (!p) {
      const body = this.add.sprite(d.x, d.y, "survivor", 0)
        .setOrigin(0.5, 0.78)
        .setDepth(10);
      const label = this.add.text(d.x, d.y - 23, d.id === this.localId ? "YOU" : "SURVIVOR", {
        fontSize: "10px",
        color: "#fff",
        backgroundColor: "#142018",
        padding: { x: 3, y: 2 }
      }).setOrigin(0.5).setDepth(11);
      p = { body, label, x: d.x, y: d.y, direction: "down" };
      this.players.set(d.id, p);
    }

    const dx = d.x - p.x;
    const dy = d.y - p.y;
    const moving = Math.abs(dx) + Math.abs(dy) > 0.25;
    if (moving) {
      if (Math.abs(dx) > Math.abs(dy)) p.direction = dx < 0 ? "left" : "right";
      else p.direction = dy < 0 ? "up" : "down";
      const animation = `survivor-walk-${p.direction}`;
      if (p.body.anims.currentAnim?.key !== animation) p.body.play(animation, true);
    } else {
      p.body.anims.stop();
      p.body.setFrame(({ down: 0, left: 4, right: 8, up: 12 })[p.direction]);
    }

    p.body.setPosition(d.x, d.y);
    p.label.setPosition(d.x, d.y - 23);
    p.x = d.x;
    p.y = d.y;
    if (d.id === this.localId) this.events.emit("inventory", d.inventory);
  }

  remove(id) {
    const p = this.players.get(id);
    if (!p) return;
    p.body.destroy();
    p.label.destroy();
    this.players.delete(id);
  }

  gatherNearest() {
    const me = this.players.get(this.localId);
    if (!me) return;
    let target = null;
    let best = 78;
    for (const [id, object] of this.renderer.resourceObjects) {
      const distance = Phaser.Math.Distance.Between(me.body.x, me.body.y, object.shape.x, object.shape.y);
      if (distance < best) {
        best = distance;
        target = id;
      }
    }
    if (target) this.net.emit("world:gather", { resourceId: target });
    else this.events.emit("action-result", { ok: false, reason: "no-resource-nearby" });
  }

  setBuildMode(type) {
    this.buildMode = this.buildMode === type ? null : type;
  }

  update() {
    if (!this.net.connected) return;
    const k = this.wasd;
    const c = this.cursors;
    const input = {
      up: k.W.isDown || c.up.isDown,
      down: k.S.isDown || c.down.isDown,
      left: k.A.isDown || c.left.isDown,
      right: k.D.isDown || c.right.isDown
    };
    const encoded = JSON.stringify(input);
    if (encoded !== this.lastInput) {
      this.net.emit("player:input", input);
      this.lastInput = encoded;
    }
  }
}