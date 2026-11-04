/* The voice panel that opens when you click Byte: voice tricks + a speaking-speed round. */

const COMMANDS = [
  { trick: "sit", words: ["sit", "seat", "sat"], label: "sit" },
  { trick: "jump", words: ["jump", "hop", "up"], label: "jump" },
  { trick: "spin", words: ["spin", "turn", "around"], label: "spin" },
  { trick: "roll", words: ["roll", "rollover", "role"], label: "roll over" },
  { trick: "speak", words: ["speak", "bark", "woof"], label: "speak" },
  { trick: "dance", words: ["dance", "party", "groove"], label: "dance" },
  { trick: "good", words: ["good", "boy", "girl", "love", "nice"], label: "good boy" },
];

const PHRASES = [
  "Speaking is the fastest way to get an idea out of my head and into the world.",
  "I built this portfolio by talking to my computer instead of typing to it.",
  "Voice turns a half formed thought into a finished paragraph before I lose it.",
  "Typing makes me edit while I think, but speaking lets me just think.",
];
const TYPING_WPM = 40; // a commonly cited average typing speed

const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

export function initPetGame(pet) {
  const $ = (s) => document.querySelector(s);
  const panel = $("#petpanel"), mic = $("#pp-mic"), status = $("#pp-status"), heard = $("#pp-heard");
  const tabs = panel.querySelectorAll("[data-tab]"), phraseEl = $("#pp-phrase"), result = $("#pp-result");
  let mode = "tricks", rec = null, listening = false, phrase = "", tStart = 0;

  // trick buttons double as the no-voice fallback
  $("#pp-cmds").innerHTML = COMMANDS.map((c) => `<button data-trick="${c.trick}">${c.label}</button>`).join("");
  panel.querySelectorAll("[data-trick]").forEach((b) => b.addEventListener("click", () => perform(b.dataset.trick, b.textContent)));

  if (!SR) {
    mic.disabled = true;
    status.textContent = "Voice needs Chrome, Edge or Safari. Tap a trick instead:";
    panel.querySelector('[data-tab="speed"]').disabled = true;
  }

  tabs.forEach((t) => t.addEventListener("click", () => setMode(t.dataset.tab)));
  $("#pp-close").addEventListener("click", close);
  addEventListener("keydown", (e) => e.key === "Escape" && panel.classList.contains("open") && close());
  mic.addEventListener("click", () => (listening ? stop() : listen()));

  function setMode(m) {
    mode = m;
    stop();
    tabs.forEach((t) => t.setAttribute("aria-selected", t.dataset.tab === m));
    panel.dataset.mode = m;
    result.innerHTML = ""; heard.textContent = "";
    if (m === "speed") {
      phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
      phraseEl.textContent = `“${phrase}”`;
      status.textContent = "Tap the mic, then read this out loud:";
    } else if (SR) status.textContent = "Tap the mic and give Byte a command:";
  }

  function open() {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    setMode("tricks");
    mic.focus({ preventScroll: true });
    pet.doTrick("good");
  }
  function close() {
    stop();
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  }

  function listen() {
    if (!SR) return;
    rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 3;
    tStart = 0;
    let finalText = "", tEnd = 0, handled = false;
    rec.onstart = () => { listening = true; mic.classList.add("on"); status.textContent = mode === "speed" ? "Go! Read it out loud…" : "Listening…"; };
    rec.onspeechstart = () => { tStart = performance.now(); };
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) { finalText += r[0].transcript; tEnd = performance.now(); }
        else interim += r[0].transcript;
      }
      heard.textContent = (finalText + " " + interim).trim();
      if (mode === "tricks" && !finalText && !handled) { // react as soon as a command word is heard
        const c = match(interim);
        if (c) { handled = true; stop(); handleTrick(interim); }
      }
    };
    rec.onerror = (e) => {
      status.textContent = e.error === "not-allowed" || e.error === "service-not-allowed"
        ? "Mic access was blocked. Allow the microphone for this site, or tap a trick below."
        : e.error === "no-speech" ? "Didn't catch that. Tap the mic and try again." : "Voice hiccup. Tap the mic and try again.";
    };
    rec.onend = () => {
      listening = false; mic.classList.remove("on");
      if (!finalText || handled) return;
      if (mode === "tricks") handleTrick(finalText);
      else scoreSpeed(finalText, (tEnd || performance.now()) - (tStart || performance.now()));
      finalText = "";
    };
    try { rec.start(); } catch { /* already started */ }
  }
  function stop() { if (rec && listening) { try { rec.stop(); } catch {} } }

  function match(text) {
    const words = text.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/);
    return COMMANDS.find((c) => c.words.some((w) => words.includes(w)));
  }
  function handleTrick(text) {
    const c = match(text);
    if (c) perform(c.trick, c.label);
    else { pet.doTrick("huh"); status.textContent = "Byte tilts its head. Try: sit, jump, spin, roll over, speak, dance."; }
  }
  function perform(trick, label) {
    pet.doTrick(trick);
    status.textContent = `Byte: ${label}! ${SR ? "Tap the mic for another." : ""}`;
  }

  function scoreSpeed(said, ms) {
    const norm = (s) => s.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean);
    const target = norm(phrase), spoken = norm(said);
    const pool = [...spoken];
    const hits = target.filter((w) => { const i = pool.indexOf(w); if (i >= 0) { pool.splice(i, 1); return true; } return false; }).length;
    const accuracy = Math.round((hits / target.length) * 100);
    const secs = Math.max(ms / 1000, 0.8);
    const wpm = Math.round(spoken.length / (secs / 60));
    const x = (wpm / TYPING_WPM).toFixed(1);
    result.innerHTML = `
      <div class="pp-stat"><b>${wpm}</b><span>words / min speaking</span></div>
      <div class="pp-stat"><b>${TYPING_WPM}</b><span>avg typing</span></div>
      <div class="pp-stat"><b>${accuracy}%</b><span>words matched</span></div>
      <p>${wpm > TYPING_WPM ? `That's <b>${x}×</b> faster than typing. This is why I build with my voice.` : "Typing wins this round. Try again, a bit faster?"}</p>`;
    status.textContent = "Tap the mic to try again, or switch phrases.";
    pet.doTrick(wpm > TYPING_WPM && accuracy >= 60 ? "dance" : "huh");
  }

  $("#pp-new").addEventListener("click", () => setMode("speed"));
  return { open, close, isOpen: () => panel.classList.contains("open") };
}
