import { gsap } from "gsap";
import { initWorld } from "./world.js";

/* ------------------------------------------------------------------
   CONFIG: everything you'll want to edit lives here.
   ------------------------------------------------------------------ */

// Spoken intro, synced to public/audio/voice.mp3 (ElevenLabs, "Nishant").
// The voice starts VOICE_DELAY seconds after the tap; line times below are measured
// from the pauses in that recording.
// `t` = seconds after the tap, `d` = how long the line is spoken (words are spread across it).
// "*word" = accent colour. `quiet: true` = whispered line. `note` = small gloss under the line.
const VOICE_SRC = "/audio/voice.mp3";
const VOICE_DELAY = 1.0;
const SCRIPT = [
  { t: 1.08,  d: 1.0,  words: ["Hey,", "hey,", "hey!"] },
  { t: 2.26,  d: 0.5,  words: ["Hu", "*Dhyey."], note: "hu (હું) = “I am” in Gujarati" },
  { t: 3.12,  d: 1.3,  words: ["Welcome", "to", "my", "*portfolio."] },
  { t: 5.06,  d: 2.5,  words: ["In", "these", "past", "years", "I've", "grown", "*so", "*much,"] },
  { t: 7.97,  d: 2.0,  words: ["from", "a", "silent,", "introvert", "child…"], quiet: true },
  { t: 10.52, d: 1.3,  words: ["into", "what", "you'll", "*see", "in", "a", "sec."] },
  { t: 12.34, d: 0.45, words: ["Come", "with", "*me."] },
];
const TRANSITION_AT = 13.1;          // right after "me.": circle opens, page goes dark, 3D world begins

// Music timeline (seconds after the tap):
//   0 to 8        title song, part 1 (bg.mp3)
//   8 to "me."    title song, part 2 (bg2.mp3), clean cut at 8 s, fades out as the circle opens
//   TRANSITION_AT slow ambient loop fades in with the dark 3D world
const SONG_SECONDS = 8;
const SONG_VOLUME = 0.35;            // kept under the voice
const AMBIENT_VOLUME = 0.22;

// The 3D stops and their whiteboards live in stops.js.

export async function initIntro() {
const { enterWorld } = await initWorld();
const AUTO = new URLSearchParams(location.search).has("auto"); // ?auto = hands-free tour, for recording

/* ------------------------------------------------------------------ */

const $ = (s) => document.querySelector(s);
const gate = $("#gate"), intro = $("#intro"), caption = $("#caption"), ring = $("#ring");
const bg = $("#bg"), bg2 = $("#bg2"), amb = $("#amb"), voice = $("#voice");
document.body.classList.add("locked");
window.scrollTo(0, 0);

// Sound toggle: mutes every track (song, voice, ambient), remembered per visitor.
const muteBtn = $("#mute");
const tracks = [bg, bg2, amb, voice];
let muted = false;
try { muted = localStorage.getItem("muted") === "1"; } catch {}
const applyMute = () => {
  tracks.forEach((a) => (a.muted = muted));
  muteBtn.setAttribute("aria-pressed", muted);
  muteBtn.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
  muteBtn.querySelector(".ic").textContent = muted ? "🔇" : "🔊";
  muteBtn.querySelector(".lb").textContent = muted ? "muted" : "sound on";
};
muteBtn.addEventListener("click", () => { muted = !muted; try { localStorage.setItem("muted", muted ? "1" : "0"); } catch {} applyMute(); });
applyMute();

let started = false;
$("#enter").addEventListener("click", start);
if (AUTO) document.addEventListener("keydown", (e) => e.key === "Enter" && start());

function start() {
  if (started) return;
  started = true;
  // Unlock every track inside the tap so mobile browsers allow later playback.
  if (VOICE_SRC) voice.src = VOICE_SRC;
  [bg2, amb, voice].forEach((a) => { a.muted = true; a.play().then(() => { a.pause(); a.currentTime = 0; a.muted = muted; }).catch(() => {}); });
  bg.volume = SONG_VOLUME;
  bg.play().catch(() => {});
  if (VOICE_SRC) gsap.delayedCall(VOICE_DELAY, () => { voice.currentTime = 0; voice.volume = 1; voice.play().catch(() => {}); });
  gsap.delayedCall(SONG_SECONDS, () => {
    bg.pause();
    bg2.volume = SONG_VOLUME;
    bg2.currentTime = 0;
    bg2.play().catch(() => {});
  });

  const tl = gsap.timeline();
  muteBtn.classList.add("show");
  tl.to(gate, { opacity: 0, duration: 0.6, onComplete: () => (gate.style.display = "none") }, 0)
    .to(intro, { backgroundColor: "#f6f4ef", duration: 1.0, ease: "power2.inOut" }, 0.2);

  SCRIPT.forEach((line) => tl.call(() => showLine(line), null, line.t));
  tl.call(toWorld, null, TRANSITION_AT);
}

function showLine({ words, quiet, note, d = 1.2 }) {
  caption.innerHTML = "";
  caption.classList.toggle("quiet", !!quiet);
  const els = words.map((raw) => {
    const s = document.createElement("span");
    s.className = "w" + (raw.startsWith("*") ? " hl" : "");
    s.textContent = raw.replace(/^\*/, "");
    caption.appendChild(s);
    return s;
  });
  // spread the words across the spoken duration so text follows the voice
  const stagger = (d * 0.85) / Math.max(1, words.length);
  gsap.to(els, { opacity: 1, y: 0, duration: quiet ? 0.5 : 0.3, ease: "power3.out", stagger });
  if (note) {
    const n = document.createElement("div");
    n.className = "note mono";
    n.textContent = note;
    caption.appendChild(n);
    gsap.fromTo(n, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.5 });
  }
}

// Circle opens from the centre: the white page is cut away by a growing hole,
// revealing the dark 3D world underneath. A thin orange ring rides the edge.
function toWorld() {
  gsap.to(bg2, { volume: 0, duration: 1.2, onComplete: () => bg2.pause() });
  amb.volume = 0;
  amb.currentTime = 0;
  amb.play().catch(() => {});
  gsap.to(amb, { volume: AMBIENT_VOLUME, duration: 3, ease: "sine.inOut" });

  const maxR = Math.hypot(innerWidth, innerHeight) / 2 + 20;
  const iris = { r: 0 };
  const draw = () => {
    const m = `radial-gradient(circle at 50% 50%, transparent ${iris.r}px, #000 ${iris.r + 1}px)`;
    intro.style.webkitMaskImage = m;
    intro.style.maskImage = m;
    ring.style.width = ring.style.height = iris.r * 2 + "px";
  };
  const tl = gsap.timeline();
  tl.to(caption, { opacity: 0, scale: 0.92, duration: 0.45, ease: "power2.in" }, 0)
    .set(ring, { opacity: 1 }, 0.35)
    .to(iris, { r: 6, duration: 0.25, ease: "power2.out", onUpdate: draw }, 0.35)
    .to(iris, { r: maxR, duration: 1.5, ease: "expo.inOut", onUpdate: draw }, 0.75)
    .to(ring, { opacity: 0, duration: 0.4 }, 1.95)
    .set(intro, { display: "none" }, 2.3);
  enterWorld(tl, 0.9);
}
}
