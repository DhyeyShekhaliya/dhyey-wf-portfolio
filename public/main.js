import * as THREE from "./vendor/three.module.js";

/* ------------------------------------------------------------------
   CONFIG: everything you'll want to edit lives here.
   ------------------------------------------------------------------ */

// Spoken intro. `t` = seconds after the visitor taps "enter".
// When the real voice note arrives, re-time these to match it.
// "*word" = accent colour. `quiet: true` = whispered line (small + grey).
// `note` = small gloss under the line.
const SCRIPT = [
  { t: 1.2,  words: ["Hey,", "hey,", "hey!"] },
  { t: 3.0,  words: ["Hu", "*Dhyey."], note: "hu (હું) = “I am” in Gujarati" },
  { t: 5.2,  words: ["Welcome", "to", "my", "*portfolio."] },
  { t: 7.2,  words: ["In", "these", "past", "years", "I've", "grown", "*so", "*much,"] },
  { t: 9.9,  words: ["from", "a", "silent,", "introvert", "child…"], quiet: true },
  { t: 12.1, words: ["into", "what", "you'll", "*see", "in", "a", "sec."] },
  { t: 14.3, words: ["Come", "with", "*me."] },
];
const TRANSITION_AT = 16.0;         // when the 2D intro dissolves into 3D
// Music timeline (seconds after the tap):
//   0 to 8   title song, part 1 (bg.mp3)
//   8 to 17  title song, part 2 (bg2.mp3), clean cut at 8 s
//   14 on    slow ambient loop fades in, full by 17 s as the 3D world opens
const SONG_SECONDS = 8;
const AMBIENT_AT = 14;
const VOICE_SRC = null;             // e.g. "audio/voice.mp3" once recorded

// Life stops along the 3D path (placeholder copy, swap with the real stories).
const STAGES = [
  { at: 0.10, kind: "childhood", year: "CH. 01", title: "Childhood",          text: "Where it started. The kid who took everything apart.", color: 0xffc23c },
  { at: 0.27, kind: "school",    year: "CH. 02", title: "School",             text: "Learning the rules, and which ones to break.",        color: 0x3c7dff },
  { at: 0.44, kind: "chance",    year: "CH. 03", title: "The first big chance", text: "The bet nobody asked me to take.",                  color: 0xff4d1f },
  { at: 0.61, kind: "mistake",   year: "CH. 04", title: "The mistakes",       text: "What broke, and what I rebuilt from the pieces.",     color: 0xd7263d },
  { at: 0.78, kind: "built",     year: "CH. 05", title: "Things I've built",  text: "Shipped, not just planned.",                          color: 0x19c37d },
  { at: 0.95, kind: "final",     year: "NOW",    title: "Let's build something.", text: "Your turn, Wispr Flow.",                          color: 0x0b0b0c },
];

const AUTO = new URLSearchParams(location.search).has("auto"); // ?auto = hands-free, for recording
const AUTO_TOUR_SECONDS = 22;

/* ------------------------------------------------------------------ */

const $ = (s) => document.querySelector(s);
const gate = $("#gate"), intro = $("#intro"), caption = $("#caption"), pill = $("#pill");
const bg = $("#bg"), bg2 = $("#bg2"), amb = $("#amb");
document.body.classList.add("locked");
window.scrollTo(0, 0);

let started = false;
$("#enter").addEventListener("click", start);
if (AUTO) document.addEventListener("keydown", (e) => e.key === "Enter" && start());

function start() {
  if (started) return;
  started = true;
  // Unlock every track inside the tap so mobile browsers allow later playback.
  [bg2, amb].forEach((a) => { a.muted = true; a.play().then(() => { a.pause(); a.currentTime = 0; a.muted = false; }).catch(() => {}); });
  bg.volume = 0.55;
  bg.play().catch(() => {});
  gsap.delayedCall(SONG_SECONDS, () => {
    bg.pause();
    bg2.volume = 0.55;
    bg2.currentTime = 0;
    bg2.play().catch(() => {});
  });
  gsap.delayedCall(AMBIENT_AT, () => {
    amb.volume = 0;
    amb.currentTime = 0;
    amb.play().catch(() => {});
    gsap.to(amb, { volume: 0.22, duration: 3, ease: "sine.inOut" });
  });
  if (VOICE_SRC) new Audio(VOICE_SRC).play().catch(() => {});

  const tl = gsap.timeline();
  tl.to(gate, { opacity: 0, duration: 0.6, onComplete: () => (gate.style.display = "none") }, 0)
    .to(intro, { backgroundColor: "#f6f4ef", duration: 1.4, ease: "power2.inOut" }, 0.2)
    .to(pill, { opacity: 1, y: 0, x: "-50%", duration: 0.6, ease: "back.out(2)", onStart: () => pill.classList.add("on") }, 0.8);

  SCRIPT.forEach((line) => tl.call(() => showLine(line), null, line.t));
  tl.call(toWorld, null, TRANSITION_AT);
}

function showLine({ words, quiet, note }) {
  caption.innerHTML = "";
  caption.classList.toggle("quiet", !!quiet);
  const els = words.map((raw) => {
    const s = document.createElement("span");
    s.className = "w" + (raw.startsWith("*") ? " hl" : "");
    s.textContent = raw.replace(/^\*/, "");
    caption.appendChild(s);
    return s;
  });
  gsap.to(els, { opacity: 1, y: 0, duration: quiet ? 0.6 : 0.35, ease: "power3.out", stagger: quiet ? 0.28 : 0.16 });
  if (note) {
    const n = document.createElement("div");
    n.className = "note mono";
    n.textContent = note;
    caption.appendChild(n);
    gsap.fromTo(n, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.6 });
  }
}

function toWorld() {
  pill.classList.remove("on");
  $("#pill-label").textContent = "scroll to walk";
  const tl = gsap.timeline();
  tl.to(caption, { scale: 6, opacity: 0, duration: 1.1, ease: "power3.in" }, 0)
    .to(intro, { opacity: 0, duration: 1.0, ease: "power2.inOut", onComplete: () => (intro.style.display = "none") }, 0.5)
    .to(cam, { rise: 0, duration: 2.6, ease: "power3.inOut" }, 0.4)
    .to("#hud", { opacity: 1, duration: 0.8 }, 1.8)
    .call(() => {
      document.body.classList.remove("locked");
      worldLive = true;
      tourStart = performance.now();
      if (AUTO) gsap.to(pill, { opacity: 0, duration: 0.6 });
    }, null, 2.2)
    .to(pill, { opacity: AUTO ? 0 : 1, duration: 0.3 }, 2.2);
}

/* ------------------------------------------------------------------
   3D WORLD
   ------------------------------------------------------------------ */
const PAPER = 0xf6f4ef, INK = 0x0b0b0c;
const canvas = $("#world");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(PAPER);
scene.fog = new THREE.Fog(PAPER, 12, 48);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
const cam = { rise: 1 }; // 1 = high bird's-eye at start, 0 = walking height

scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d2c3, 1.6));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(8, 18, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, far: 60 });
scene.add(sun, sun.target);

// ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(400, 400),
  new THREE.MeshStandardMaterial({ color: PAPER, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
const grid = new THREE.GridHelper(400, 200, 0xd8d3c8, 0xe6e2d9);
grid.position.y = 0.01;
scene.add(grid);

// the life path
const LEN = 150;
const pts = [];
for (let i = 0; i <= 14; i++) {
  const z = -i * (LEN / 14);
  pts.push(new THREE.Vector3(Math.sin(i * 0.9) * 5, 0, z));
}
const curve = new THREE.CatmullRomCurve3(pts);
const path = new THREE.Mesh(
  new THREE.TubeGeometry(curve, 400, 0.06, 8, false),
  new THREE.MeshBasicMaterial({ color: INK })
);
path.position.y = 0.05;
scene.add(path);

// dotted milestones on the path
STAGES.forEach((s) => {
  const p = curve.getPointAt(s.at);
  const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 32), new THREE.MeshBasicMaterial({ color: s.color }));
  dot.position.set(p.x, 0.06, p.z);
  scene.add(dot);
});

// stage objects
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, flatShading: true, ...o });
const anims = [];
const anchors = [];

STAGES.forEach((s, i) => {
  const p = curve.getPointAt(s.at);
  const tan = curve.getTangentAt(s.at);
  const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize().multiplyScalar(i % 2 ? -4.5 : 4.5);
  const g = new THREE.Group();
  g.position.copy(p).add(side);
  if (s.kind === "final") g.position.copy(p).add(new THREE.Vector3(0, 0, -4));
  scene.add(g);
  build(s, g);
  g.traverse((m) => m.isMesh && (m.castShadow = true));
  const anchor = new THREE.Object3D();
  anchor.position.set(0, s.kind === "final" ? 5.6 : 4.2, 0);
  g.add(anchor);
  anchors.push(anchor);
});

function build(s, g) {
  const c = s.color;
  switch (s.kind) {
    case "childhood": {
      const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 1), mat(c));
      g.add(ball);
      const kite = new THREE.Mesh(new THREE.OctahedronGeometry(0.6, 0), mat(0xff4d1f));
      kite.scale.set(1, 1.4, 0.15);
      kite.position.set(-1.2, 3, 0);
      g.add(kite);
      anims.push((t) => {
        ball.position.y = 0.9 + Math.abs(Math.sin(t * 3)) * 1.4;
        ball.rotation.x = t * 2;
        kite.position.y = 3 + Math.sin(t * 1.3) * 0.3;
        kite.rotation.z = Math.sin(t * 1.7) * 0.4;
      });
      break;
    }
    case "school": {
      const cols = [c, 0xffc23c, 0x19c37d, 0xff4d1f];
      const books = cols.map((col, k) => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(2 - k * 0.15, 0.38, 1.4), mat(col));
        b.position.y = 0.19 + k * 0.4;
        b.rotation.y = k * 0.25;
        g.add(b);
        return b;
      });
      anims.push((t) => books.forEach((b, k) => (b.rotation.y = k * 0.25 + Math.sin(t + k) * 0.15)));
      break;
    }
    case "chance": {
      const r = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 2, 12), mat(0xf6f4ef));
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 12), mat(c));
      nose.position.y = 1.45;
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1, 10), mat(0xffc23c, { emissive: 0xff7a00, emissiveIntensity: 0.8 }));
      flame.rotation.x = Math.PI;
      flame.position.y = -1.4;
      for (let k = 0; k < 3; k++) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.6), mat(c));
        fin.position.set(Math.cos((k * Math.PI * 2) / 3) * 0.45, -0.75, Math.sin((k * Math.PI * 2) / 3) * 0.45);
        fin.rotation.y = -(k * Math.PI * 2) / 3;
        r.add(fin);
      }
      r.add(body, nose, flame);
      g.add(r);
      anims.push((t) => {
        r.position.y = 2 + Math.sin(t * 2) * 0.35;
        r.rotation.y = t * 0.8;
        flame.scale.y = 0.8 + Math.random() * 0.5;
      });
      break;
    }
    case "mistake": {
      const shards = [];
      for (let k = 0; k < 14; k++) {
        const m = new THREE.Mesh(new THREE.TetrahedronGeometry(0.35 + Math.random() * 0.3), mat(k % 3 ? c : INK));
        const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.3, Math.random() - 0.5).normalize();
        m.userData = { dir, spin: Math.random() * 3 };
        g.add(m);
        shards.push(m);
      }
      anims.push((t) => {
        const e = (Math.sin(t * 1.1) + 1) / 2; // 0 = whole, 1 = shattered
        shards.forEach((m) => {
          m.position.copy(m.userData.dir).multiplyScalar(0.3 + e * 2.2);
          m.position.y += 1.6;
          m.rotation.set(t * m.userData.spin * e, t * m.userData.spin, 0);
        });
      });
      break;
    }
    case "built": {
      const blocks = [];
      for (let x = 0; x < 3; x++)
        for (let z = 0; z < 3; z++) {
          const h = 0.6 + ((x * 3 + z) % 4) * 0.5;
          const b = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1, 0.75), mat((x + z) % 2 ? c : 0xf6f4ef));
          b.position.set((x - 1) * 0.85, 0, (z - 1) * 0.85);
          b.userData.h = h;
          g.add(b);
          blocks.push(b);
        }
      anims.push((t) =>
        blocks.forEach((b, k) => {
          const h = b.userData.h * (0.6 + 0.4 * (Math.sin(t * 1.5 + k) + 1) / 2);
          b.scale.y = h;
          b.position.y = h / 2;
        })
      );
      break;
    }
    case "final": {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.18, 16, 80), mat(0xff4d1f, { emissive: 0xff4d1f, emissiveIntensity: 0.25 }));
      ring.position.y = 2.6;
      const core = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat(INK));
      core.position.y = 2.6;
      g.add(ring, core);
      anims.push((t) => {
        ring.rotation.y = t * 0.6;
        ring.rotation.x = Math.sin(t * 0.5) * 0.3;
        core.rotation.set(t * 0.7, t, 0);
      });
      break;
    }
  }
}

// HTML labels
const labelEls = STAGES.map((s) => {
  const d = document.createElement("div");
  d.className = "label";
  d.innerHTML = `<div class="yr">${s.year}</div><h3>${s.title}</h3><p>${s.text}</p>`;
  $("#labels").appendChild(d);
  return d;
});

// floating confetti specks for depth
const specks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), new THREE.MeshBasicMaterial({ color: INK }), 300);
const tmp = new THREE.Object3D();
for (let i = 0; i < 300; i++) {
  tmp.position.set((Math.random() - 0.5) * 40, Math.random() * 10 + 0.5, -Math.random() * (LEN + 10));
  tmp.rotation.set(Math.random() * 3, Math.random() * 3, 0);
  tmp.updateMatrix();
  specks.setMatrixAt(i, tmp.matrix);
}
scene.add(specks);

/* ------------------------------------------------------------------
   LOOP
   ------------------------------------------------------------------ */
let worldLive = false, tourStart = 0, progress = 0, target = 0;
const v = new THREE.Vector3(), look = new THREE.Vector3();
const clock = new THREE.Clock();
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w < 640 ? 65 : 50;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();

function frame() {
  const t = clock.getElapsedTime();

  if (worldLive) {
    if (AUTO) {
      target = easeInOut(Math.min(1, (performance.now() - tourStart) / 1000 / AUTO_TOUR_SECONDS));
    } else {
      const max = document.documentElement.scrollHeight - innerHeight;
      target = max > 0 ? scrollY / max : 0;
    }
  }
  progress += (target - progress) * 0.06;

  // camera rides slightly behind & above the path, looking ahead
  const p = Math.min(0.97, progress * 0.93);
  curve.getPointAt(p, v);
  curve.getPointAt(Math.min(1, p + 0.04), look);
  camera.position.set(v.x, 2.6 + cam.rise * 26, v.z + 6 + cam.rise * 10);
  look.y = 1.4;
  camera.lookAt(look);
  sun.position.set(v.x + 8, 18, v.z + 6);
  sun.target.position.set(v.x, 0, v.z - 6);

  anims.forEach((fn) => fn(t));

  // labels
  let active = null;
  STAGES.forEach((s, i) => {
    const d = Math.abs(s.at - (p + 0.07));
    const vis = worldLive && d < 0.075;
    anchors[i].getWorldPosition(v);
    v.project(camera);
    const el = labelEls[i];
    el.style.left = ((v.x + 1) / 2) * innerWidth + "px";
    el.style.top = ((1 - v.y) / 2) * innerHeight + "px";
    el.style.opacity = vis && v.z < 1 ? 1 : 0;
    if (vis) active = s;
  });
  $("#stage-name").textContent = active ? `${active.year} · ${active.title}` : "walking…";
  $("#progress b").style.width = progress * 100 + "%";

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();
