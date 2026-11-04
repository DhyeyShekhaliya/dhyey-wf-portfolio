/* Byte: a small low-poly robot pup that trots along the path with you and does tricks. */
import * as THREE from "three";

export const TRICKS = ["sit", "jump", "spin", "roll", "speak", "dance", "good"];

export function createPet(scene) {
  const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, flatShading: true, ...o });
  const fur = M(0xf6f4ef), dark = M(0x1c1d22), accent = M(0xff4d1f, { emissive: 0xff4d1f, emissiveIntensity: 0.35 });
  const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);

  const group = new THREE.Group();   // position + heading (model faces +z)
  const body = new THREE.Group();    // trick animations act on this
  group.add(body);
  group.scale.setScalar(0.75);
  scene.add(group);

  const torso = box(0.5, 0.32, 0.78, fur); torso.position.y = 0.48; body.add(torso);
  const back = box(0.42, 0.06, 0.5, accent); back.position.set(0, 0.66, -0.05); body.add(back);

  const head = new THREE.Group(); head.position.set(0, 0.76, 0.42); body.add(head);
  head.add(box(0.38, 0.32, 0.34, fur));
  const snout = box(0.2, 0.13, 0.16, fur); snout.position.set(0, -0.06, 0.22); head.add(snout);
  const nose = box(0.07, 0.05, 0.04, dark); nose.position.set(0, -0.02, 0.31); head.add(nose);
  const visor = box(0.3, 0.09, 0.02, dark); visor.position.set(0, 0.05, 0.175); head.add(visor);
  const eyeM = new THREE.MeshBasicMaterial({ color: 0x7fe7ff });
  const eyes = [-0.07, 0.07].map((x) => { const e = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.01), eyeM); e.position.set(x, 0.05, 0.187); head.add(e); return e; });
  [-0.12, 0.12].forEach((x, i) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 4), i ? accent : dark);
    ear.position.set(x, 0.22, -0.02); ear.rotation.z = x > 0 ? -0.25 : 0.25; head.add(ear);
  });
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.025, 6, 16), accent);
  collar.position.set(0, 0.62, 0.3); collar.rotation.x = Math.PI / 2.4; body.add(collar);

  const tail = new THREE.Group(); tail.position.set(0, 0.6, -0.38); body.add(tail);
  const tailMesh = box(0.06, 0.06, 0.3, accent); tailMesh.position.z = -0.14; tailMesh.rotation.x = -0.6; tail.add(tailMesh);

  const legs = [[-0.16, 0.26], [0.16, 0.26], [-0.16, -0.26], [0.16, -0.26]].map(([x, z]) => {
    const hip = new THREE.Group(); hip.position.set(x, 0.36, z); body.add(hip);
    const leg = box(0.1, 0.34, 0.1, fur); leg.position.y = -0.17; hip.add(leg);
    const paw = box(0.12, 0.05, 0.14, dark); paw.position.set(0, -0.34, 0.02); hip.add(paw);
    return hip;
  });

  // generous invisible hit area so Byte is easy to click (raycasts ignore .visible)
  const hit = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.7, 1.7), new THREE.MeshBasicMaterial());
  hit.position.y = 0.65; hit.visible = false; group.add(hit);

  // shadow blob
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.42, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.02; group.add(shadow);

  let trick = null, idle = 0, walkPhase = 0, wagSpeed = 8, sitBlend = 0, onTrickEnd = null;
  const last = new THREE.Vector3(), tmp = new THREE.Vector3(), face = new THREE.Vector3();
  let placed = false;

  const DUR = { sit: 2.6, jump: 0.9, spin: 1.1, roll: 1.4, speak: 1.2, dance: 2.4, good: 2.2, huh: 1.2 };

  function doTrick(name, done) {
    trick = { name: DUR[name] ? name : "huh", t: 0 };
    onTrickEnd = done || null;
    if (name === "speak") bark();
  }

  function reset() {
    body.position.set(0, 0, 0); body.rotation.set(0, 0, 0);
    head.rotation.set(0, 0, 0);
    legs.forEach((l) => l.rotation.set(0, 0, 0));
  }

  // goal: where to trot to; look: what to face when idle (the camera)
  function update(dt, t, goal, look) {
    if (!placed) { group.position.copy(goal); last.copy(goal); placed = true; }
    eyes.forEach((e) => (e.scale.y = Math.sin(t * 0.7) > 0.985 ? 0.1 : 1)); // blink

    if (trick) {
      trick.t += dt;
      const k = Math.min(1, trick.t / DUR[trick.name]);
      reset();
      const s = Math.sin(Math.PI * k);
      switch (trick.name) {
        case "sit": sitPose(Math.min(1, s * 3)); break;
        case "jump": body.position.y = s * 0.9; legs.forEach((l, i) => (l.rotation.x = (i < 2 ? -1 : 1) * s * 0.9)); break;
        case "spin": body.rotation.y = k * Math.PI * 2; body.position.y = s * 0.15; break;
        case "roll": body.rotation.z = k * Math.PI * 2; body.position.y = s * 0.35; break;
        case "speak": head.rotation.x = -Math.abs(Math.sin(k * Math.PI * 3)) * 0.4; break;
        case "dance": body.rotation.z = Math.sin(k * Math.PI * 8) * 0.25; body.position.y = Math.abs(Math.sin(k * Math.PI * 8)) * 0.2; head.rotation.y = Math.sin(k * Math.PI * 4) * 0.4; break;
        case "good": sitPose(Math.min(1, s * 3)); wagSpeed = 26; break;
        case "huh": head.rotation.z = s * 0.45; break;
      }
      if (k >= 1) { reset(); trick = null; wagSpeed = 8; const cb = onTrickEnd; onTrickEnd = null; cb && cb(); }
    } else {
      // trot toward the goal
      tmp.copy(goal).sub(group.position);
      const dist = tmp.length();
      const speed = Math.min(dist, 9 * dt) / Math.max(dt, 1e-3);
      if (dist > 0.02) group.position.addScaledVector(tmp, Math.min(1, (6 * dt) / Math.max(dist, 0.6)));
      const moving = group.position.distanceTo(last) / Math.max(dt, 1e-3) > 0.25;
      last.copy(group.position);
      idle = moving ? 0 : idle + dt;
      if (moving) {
        walkPhase += dt * (6 + speed * 1.5);
        legs.forEach((l, i) => (l.rotation.x = Math.sin(walkPhase + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.6));
        body.position.y = Math.abs(Math.sin(walkPhase)) * 0.05;
        face.copy(goal); face.y = group.position.y;
        if (dist > 0.05) smoothLook(face, dt * 8);
      } else {
        legs.forEach((l) => (l.rotation.x *= 0.85));
        body.position.y *= 0.85;
        face.copy(look); face.y = group.position.y;
        smoothLook(face, dt * 3); // turn to look at you
      }
      sitBlend += ((idle > 1.4 ? 1 : 0) - sitBlend) * Math.min(1, dt * 4);
      if (sitBlend > 0.01) sitPose(sitBlend);
      else body.rotation.x = 0;
    }
    tail.rotation.y = Math.sin(t * wagSpeed) * 0.6;
  }

  function sitPose(a) {
    body.rotation.x = -0.45 * a;
    body.position.y = Math.max(body.position.y, 0) - 0.12 * a;
    legs[2].rotation.x = legs[3].rotation.x = 1.1 * a;
    legs[0].rotation.x = legs[1].rotation.x = 0.35 * a;
    head.rotation.x = 0.35 * a;
  }

  const q = new THREE.Quaternion(), m = new THREE.Matrix4(), up = new THREE.Vector3(0, 1, 0);
  function smoothLook(target, rate) {
    if (target.distanceToSquared(group.position) < 1e-4) return;
    m.lookAt(target, group.position, up); // object3D convention: +z toward target
    q.setFromRotationMatrix(m);
    group.quaternion.slerp(q, Math.min(1, rate));
  }

  return { group, update, doTrick, isBusy: () => !!trick };
}

/* a tiny synthesized "woof" so no audio file is needed; silent when the site is muted */
function bark() {
  if (document.querySelector("#mute")?.getAttribute("aria-pressed") === "true") return;
  try {
    const ac = (bark.ac ??= new (window.AudioContext || window.webkitAudioContext)());
    [0, 0.18].forEach((d) => {
      const o = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime + d;
      o.type = "square";
      o.frequency.setValueAtTime(520, t0);
      o.frequency.exponentialRampToValueAtTime(240, t0 + 0.12);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14);
      o.connect(g).connect(ac.destination);
      o.start(t0); o.stop(t0 + 0.15);
    });
  } catch {}
}
