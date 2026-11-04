import * as THREE from "three";
import { gsap } from "gsap";
import { STOPS, FINALE } from "./stops.js";
import { openBoard, closeBoard, isOpen, initBoard } from "./board.js";

export async function initWorld() {
initBoard();
const AUTO = new URLSearchParams(location.search).has("auto");
const PAPER = 0xf6f4ef, NIGHT = 0x08080a, SLATE = 0x15181b;
const $ = (s) => document.querySelector(s);
const hex = (n) => "#" + n.toString(16).padStart(6, "0");

/* ---------------- renderer / scene ---------------- */
const canvas = $("#world");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(NIGHT);
scene.fog = new THREE.FogExp2(NIGHT, 0.035);

const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 300);
const cam = { rise: 1 }; // 1 = high bird's-eye during the intro, 0 = eye level

scene.add(new THREE.HemisphereLight(0x8890ff, 0x110d08, 0.9));
const lamp = new THREE.PointLight(0xffe2c4, 30, 22, 1.6); // "torch" that follows the walker
scene.add(lamp);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: 0x0e0e11, roughness: 1 }));
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
const grid = new THREE.GridHelper(600, 300, 0x1e1e24, 0x15151a);
grid.position.y = 0.01;
scene.add(grid);

/* ---------------- the path ---------------- */
const SPACING = 20;
const N = STOPS.length + 1; // + finale
const LEN = SPACING * (N + 1);
const pts = [];
for (let i = 0; i <= N + 1; i++) pts.push(new THREE.Vector3(Math.sin(i * 1.1) * 4, 0, -i * SPACING));
const curve = new THREE.CatmullRomCurve3(pts);
const curveLen = curve.getLength();

const path = new THREE.Mesh(new THREE.TubeGeometry(curve, 600, 0.05, 6, false), new THREE.MeshBasicMaterial({ color: PAPER, transparent: true, opacity: 0.85 }));
path.position.y = 0.04;
scene.add(path);

// chalk dashes either side of the path
const dashGeo = new THREE.BoxGeometry(0.04, 0.02, 0.5);
const dashes = new THREE.InstancedMesh(dashGeo, new THREE.MeshBasicMaterial({ color: 0x3a3a44 }), 900);
{
  const o = new THREE.Object3D(), p = new THREE.Vector3(), t = new THREE.Vector3();
  let k = 0;
  for (let i = 0; i < 450; i++) {
    const u = i / 450;
    curve.getPointAt(u, p); curve.getTangentAt(u, t);
    const side = new THREE.Vector3(-t.z, 0, t.x).normalize();
    for (const s of [-1.6, 1.6]) {
      o.position.copy(p).addScaledVector(side, s); o.position.y = 0.02;
      o.lookAt(p.clone().add(t).addScaledVector(side, s));
      o.updateMatrix(); dashes.setMatrixAt(k++, o.matrix);
    }
  }
}
scene.add(dashes);

// stars / chalk dust
const dust = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: PAPER }), 500);
{
  const o = new THREE.Object3D();
  for (let i = 0; i < 500; i++) {
    o.position.set((Math.random() - 0.5) * 60, Math.random() * 14 + 0.5, 10 - Math.random() * (LEN + 30));
    o.updateMatrix(); dust.setMatrixAt(i, o.matrix);
  }
}
scene.add(dust);

/* ---------------- chalkboards ---------------- */
await document.fonts.load('700 64px "Caveat"').catch(() => {});
await document.fonts.load('400 30px "Special Elite"').catch(() => {});

function boardTexture(stop) {
  const W = 1024, H = 640, c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#15181b"; g.fillRect(0, 0, W, H);
  // chalk smudges
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
    g.beginPath(); g.ellipse(Math.random() * W, Math.random() * H, 80 + Math.random() * 160, 20 + Math.random() * 40, Math.random(), 0, 7); g.fill();
  }
  g.strokeStyle = "rgba(246,244,239,.25)"; g.lineWidth = 3; g.strokeRect(24, 24, W - 48, H - 48);
  g.fillStyle = hex(stop.color);
  g.font = '400 32px "Special Elite", monospace';
  g.fillText(`CH. ${stop.chapter} · ${stop.era.toUpperCase()}`, 70, 110);
  g.fillStyle = "#f6f4ef";
  g.font = '700 104px "Caveat", cursive';
  const ty = wrap(g, stop.title, 70, 220, W - 140, 96);
  g.strokeStyle = hex(stop.color); g.lineWidth = 6; g.lineCap = "round";
  g.beginPath(); g.moveTo(70, ty + 36); g.bezierCurveTo(300, ty + 18, 500, ty + 53, 640, ty + 30); g.stroke();
  g.fillStyle = "rgba(246,244,239,.7)";
  g.font = '600 46px "Caveat", cursive';
  const lead = stop.notes.find((n) => n.type === "lead");
  if (lead) wrap(g, lead.text, 70, ty + 120, W - 140, 52);
  g.fillStyle = hex(stop.color);
  g.font = '400 30px "Special Elite", monospace';
  g.fillText("[ click to open the board ]", 70, H - 70);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function wrap(g, text, x, y, maxW, lh) {
  let line = "";
  for (const w of text.split(" ")) {
    const test = line ? line + " " + w : w;
    if (g.measureText(test).width > maxW && line) { g.fillText(line, x, y); line = w; y += lh; }
    else line = test;
  }
  g.fillText(line, x, y);
  return y;
}

const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, flatShading: true, ...o });
const clickables = [];
const anims = [];
const stations = [];

STOPS.forEach((stop, i) => {
  const at = (i + 1) / (N + 1);
  const p = curve.getPointAt(at), t = curve.getTangentAt(at);
  const side = new THREE.Vector3(-t.z, 0, t.x).normalize().multiplyScalar(i % 2 ? -1 : 1);
  const g = new THREE.Group();
  g.position.copy(p).addScaledVector(side, 4.2).addScaledVector(t, 2.5);
  // face back toward the approaching walker
  const facing = p.clone().addScaledVector(t, -4);
  g.lookAt(facing.x, 0, facing.z);
  scene.add(g);

  // easel: legs + frame + slate
  const frameM = mat(0x2a2620);
  const legs = [[-2.6, -1], [2.6, -1]];
  legs.forEach(([x]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.6, 0.12), frameM); l.position.set(x, 1.8, -0.05); g.add(l); });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(5.6, 3.6, 0.14), frameM);
  frame.position.set(0, 3.0, 0);
  g.add(frame);
  const slate = new THREE.Mesh(new THREE.PlaneGeometry(5.3, 3.31), new THREE.MeshBasicMaterial({ map: boardTexture(stop), toneMapped: false, fog: false }));
  slate.position.set(0, 3.0, 0.08);
  slate.userData.stop = stop;
  g.add(slate);
  clickables.push(slate);
  // chalk tray
  const tray = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.08, 0.3), frameM);
  tray.position.set(0, 1.15, 0.15);
  g.add(tray);
  const chalk = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.35, 8), mat(PAPER));
  chalk.rotation.z = Math.PI / 2; chalk.position.set(1.4, 1.23, 0.15);
  g.add(chalk);
  // coloured glow ring on the floor
  const glow = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.35, 48), new THREE.MeshBasicMaterial({ color: stop.color, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
  glow.rotation.x = -Math.PI / 2; glow.position.y = 0.03;
  const gp = p.clone(); glow.position.x = gp.x; glow.position.z = gp.z;
  scene.add(glow);
  // floating prop
  const prop = makeProp(stop);
  prop.position.set(3.6, 4.6, 0.4);
  g.add(prop);

  stations.push({ stop, at, group: g, slate, glow, prop });
});

function makeProp(stop) {
  const c = stop.color, g = new THREE.Group(), e = { emissive: c, emissiveIntensity: 0.35 };
  switch (stop.prop) {
    case "atom": {
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 1), mat(c, e)); g.add(core);
      for (let k = 0; k < 3; k++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.025, 8, 48), mat(PAPER)); r.rotation.set(k * 1.05, k * 0.6, 0); g.add(r); }
      anims.push((t) => g.rotation.set(t * 0.6, t * 0.9, 0));
      break;
    }
    case "chip": {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.9), mat(0x1c1f26)); g.add(b);
      const d = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.14, 0.45), mat(c, e)); d.position.y = 0.04; g.add(d);
      for (let k = 0; k < 6; k++) for (const s of [-1, 1]) { const pin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.2), mat(0xc9c2b2)); pin.position.set(-0.35 + k * 0.14, 0, s * 0.53); g.add(pin); }
      anims.push((t) => { g.rotation.y = t * 0.7; g.rotation.x = 0.6 + Math.sin(t) * 0.1; });
      break;
    }
    case "reel": {
      const r = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.12, 32), mat(c, e)); r.rotation.x = Math.PI / 2; g.add(r);
      for (let k = 0; k < 5; k++) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.14, 16), mat(0x08080a)); h.rotation.x = Math.PI / 2; h.position.set(Math.cos(k * 1.256) * 0.4, Math.sin(k * 1.256) * 0.4, 0); r.add(h); }
      anims.push((t) => (g.rotation.z = -t * 1.2));
      break;
    }
    case "ladder": {
      for (const x of [-0.3, 0.3]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.8, 0.06), mat(PAPER)); s.position.x = x; g.add(s); }
      for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.05), mat(k === 4 ? c : PAPER, k === 4 ? e : {})); s.position.y = -0.8 + k * 0.4; g.add(s); }
      const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.18), mat(c, e)); star.position.y = 1.15; g.add(star);
      anims.push((t) => { g.rotation.y = Math.sin(t * 0.8) * 0.5; star.rotation.y = t * 2; });
      break;
    }
    case "eye": {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 16), mat(PAPER)); g.add(eye);
      const iris = new THREE.Mesh(new THREE.CircleGeometry(0.28, 32), mat(c, e)); iris.position.z = 0.56; g.add(iris);
      const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), mat(0x050505)); pupil.position.z = 0.57; g.add(pupil);
      anims.push((t) => { g.rotation.y = Math.sin(t * 0.7) * 0.6; g.rotation.x = Math.sin(t * 0.5) * 0.2; });
      break;
    }
    case "satellite": {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.5), mat(0xc9c2b2)); g.add(body);
      for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.02, 0.34), mat(c, e)); p.position.x = s * 0.6; g.add(p); }
      anims.push((t) => { g.rotation.set(0.3, t * 0.5, Math.sin(t) * 0.2); g.position.y = 4.6 + Math.sin(t * 1.3) * 0.15; });
      break;
    }
    case "palette": {
      const cols = [0x12143f, 0x414a98, 0x515db5, 0xa09faf, 0xffffff]; // Serin AI palette
      cols.forEach((col, k) => { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 24), mat(col)); d.rotation.x = Math.PI / 2; d.position.set(Math.cos(k * 1.256) * 0.45, Math.sin(k * 1.256) * 0.45, 0); g.add(d); });
      anims.push((t) => (g.rotation.z = t * 0.5));
      break;
    }
    case "brain": {
      const nodes = [];
      for (let k = 0; k < 9; k++) { const n = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), mat(k % 3 ? PAPER : c, e)); n.position.set(Math.cos(k * 0.7) * 0.6, Math.sin(k * 1.3) * 0.45, Math.sin(k * 0.9) * 0.3); g.add(n); nodes.push(n.position); }
      const lg = new THREE.BufferGeometry().setFromPoints(nodes.flatMap((a, k) => [a, nodes[(k + 2) % nodes.length], a, nodes[(k + 4) % nodes.length]]));
      g.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: c })));
      anims.push((t) => (g.rotation.y = t * 0.6));
      break;
    }
    default: {
      for (let k = 0; k < 6; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), mat(k % 2 ? c : PAPER, k % 2 ? e : {})); b.position.set((k % 3 - 1) * 0.34, Math.floor(k / 3) * 0.34, 0); g.add(b); }
      anims.push((t) => (g.rotation.y = t * 0.8));
    }
  }
  return g;
}

/* ---------------- finale billboard ---------------- */
const finale = (() => {
  const at = N / (N + 1);
  const p = curve.getPointAt(at), t = curve.getTangentAt(at);
  const g = new THREE.Group();
  g.position.copy(p).addScaledVector(t, 14);
  const facing = p.clone().addScaledVector(t, -6);
  g.lookAt(facing.x, 0, facing.z);
  scene.add(g);
  const W = 1600, H = 800, c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d");
  x.fillStyle = "#0b0b0c"; x.fillRect(0, 0, W, H);
  x.strokeStyle = "#ff4d1f"; x.lineWidth = 10; x.strokeRect(30, 30, W - 60, H - 60);
  x.fillStyle = "#ff4d1f"; x.font = '400 44px "Special Elite", monospace'; x.fillText("NOW · WISPR FLOW INDIA", 90, 140);
  x.fillStyle = "#f6f4ef"; x.font = '900 150px "Inter Tight", sans-serif'; x.fillText("Let's build", 86, 330); x.fillText("something.", 86, 480);
  x.fillStyle = "#ff4d1f"; x.font = '700 72px "Caveat", cursive'; x.fillText("let's connect. let's hire. →", 90, 640);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, fog: false }));
  sign.position.y = 9;
  sign.userData.stop = FINALE;
  g.add(sign);
  clickables.push(sign);
  const back = new THREE.Mesh(new THREE.BoxGeometry(16.6, 8.6, 0.3), new THREE.MeshBasicMaterial({ color: 0xff4d1f, fog: false })); back.position.set(0, 9, -0.2); g.add(back);
  for (const s of [-5, 5]) { const pole = new THREE.Mesh(new THREE.BoxGeometry(0.4, 9, 0.4), mat(0x22222a)); pole.position.set(s, 4.5, -0.3); g.add(pole); }
  const spot = new THREE.PointLight(0xff4d1f, 60, 30, 1.5); spot.position.set(0, 4, 5); g.add(spot);
  anims.push((tt) => (spot.intensity = 50 + Math.sin(tt * 2) * 12));
  return { at, group: g, sign, stop: FINALE };
})();

/* ---------------- walking + interaction ---------------- */
let live = false, progress = 0, target = 0, autoDriving = false;
const state = { p: 0 };
const pos = new THREE.Vector3(), ahead = new THREE.Vector3(), lookAt = new THREE.Vector3(), tmp = new THREE.Vector3();
const prompt = $("#prompt");
const hudName = $("#stage-name"), hudBar = $("#progress b");
const stopAt = (k) => (k < STOPS.length ? stations[k].at : finale.at) - 0.035; // where the walker pauses
let nearest = null;

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.fov = innerWidth < 640 ? 72 : 60;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();

function open(stop) {
  if (isOpen()) return;
  prompt.classList.remove("show");
  openBoard(stop, { onClosed: () => document.body.classList.remove("locked") });
  document.body.classList.add("locked");
}

// click a board in 3D
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
canvas.addEventListener("click", (e) => {
  if (!live) return;
  ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(clickables)[0];
  if (hit && hit.distance < 30) open(hit.object.userData.stop);
});
canvas.addEventListener("pointermove", (e) => {
  if (!live) return;
  ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  canvas.style.cursor = ray.intersectObjects(clickables)[0] ? "pointer" : "";
});
prompt.addEventListener("click", () => nearest && open(nearest));
// scroll position of each stop
const LAST = STOPS.length;
const stopScroll = (k) => (stopAt(k) / stopAt(LAST)) * (document.documentElement.scrollHeight - innerHeight);
const clampY = () => Math.max(0, scrollY);
const nearestIndex = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? (Math.min(max, clampY()) / max) * stopAt(LAST) : 0;
  let best = 0;
  for (let k = 1; k <= LAST; k++) if (Math.abs(stopAt(k) - p) < Math.abs(stopAt(best) - p)) best = k;
  return best;
};
const goTo = (k) => window.scrollTo({ top: stopScroll(Math.max(0, Math.min(LAST, k))), behavior: "smooth" });

// when scrolling pauses, glide to the nearest stop so a board is always in front of you
let snapTimer = 0;
addEventListener("scroll", () => {
  if (!live || autoDriving || isOpen()) return;
  clearTimeout(snapTimer);
  snapTimer = setTimeout(() => {
    const k = nearestIndex();
    if (Math.abs(scrollY - stopScroll(k)) > 4) goTo(k);
  }, 220);
}, { passive: true });

addEventListener("keydown", (e) => {
  if (!live || isOpen()) return;
  if (e.key === "Enter" && nearest) open(nearest);
  if (e.key === "ArrowRight") goTo(nearestIndex() + 1);
  if (e.key === "ArrowLeft") goTo(nearestIndex() - 1);
});

function enterWorld(tl, at) {
  tl.to(cam, { rise: 0, duration: 2.8, ease: "power3.inOut" }, at)
    .to("#hud", { opacity: 1, duration: 0.8 }, at + 1.5)
    .call(() => {
      live = true;
      document.body.classList.remove("locked");
      window.scrollTo(0, 0);
      if (AUTO) autoTour();
    }, null, at + 1.7);
}

async function autoTour() {
  autoDriving = true;
  const wait = (s) => new Promise((r) => setTimeout(r, s * 1000));
  const walk = (to, d) => new Promise((r) => gsap.to(state, { p: to, duration: d, ease: "power2.inOut", onComplete: r }));
  for (let k = 0; k <= STOPS.length; k++) {
    await walk(stopAt(k), k === 0 ? 2.2 : 2.6);
    await wait(0.6);
    open(k < STOPS.length ? STOPS[k] : FINALE);
    await wait(k < STOPS.length ? 4.2 : 4.5);
    closeBoard();
    await wait(0.4);
  }
}

function frame() {
  const t = performance.now() / 1000;
  if (live) {
    if (autoDriving) target = state.p;
    else {
      const max = document.documentElement.scrollHeight - innerHeight;
      // Safari's elastic overscroll can report scrollY < 0 or > max: clamp it
      const f = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      target = f * stopAt(STOPS.length);
    }
  }
  progress += (target - progress) * (autoDriving ? 0.2 : 0.07);

  // nearest stop + head-turn toward its board
  nearest = null;
  let turn = 0, focus = null;
  [...stations, { ...finale, slate: finale.sign }].forEach((s, k) => {
    const d = Math.abs(progress - stopAt(k));
    const w = Math.max(0, 1 - d / 0.03);
    if (w > turn) { turn = w; focus = s; }
    s.glow && (s.glow.material.opacity = 0.25 + 0.5 * w);
    if (d < 0.02) nearest = s.stop;
  });

  const u = Math.min(0.999, Math.max(0, progress)); // the curve only exists on 0..1
  curve.getPointAt(u, pos);
  curve.getPointAt(Math.min(1, u + 0.02), ahead);
  ahead.y = 1.7;
  lookAt.copy(ahead);
  if (focus) {
    focus.slate.getWorldPosition(tmp);
    lookAt.lerp(tmp, 0.75 * easeInOut(turn));
  }
  const bob = live ? Math.sin(progress * 400) * 0.03 : 0;
  camera.position.set(pos.x, 1.7 + bob + cam.rise * 30, pos.z + 4 + cam.rise * 14);
  camera.lookAt(lookAt.x, lookAt.y - cam.rise * 4, lookAt.z);
  lamp.position.set(pos.x, 3, pos.z - 2);

  anims.forEach((fn) => fn(t));

  if (live && !isOpen()) {
    prompt.classList.toggle("show", !!nearest);
    if (nearest) prompt.querySelector("span").textContent = innerWidth < 640 ? `CH. ${nearest.chapter}` : `CH. ${nearest.chapter} · ${nearest.title}`;
  }
  hudName.textContent = focus && turn > 0.3 ? `CH. ${focus.stop.chapter} · ${focus.stop.title}` : "walking…";
  hudBar.style.width = (progress / stopAt(STOPS.length)) * 100 + "%";

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
const easeInOut = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
frame();
return { enterWorld };
}
