/* The voice panel that opens when you click Byte: voice tricks + a speed round.
   When the browser can't do speech (Firefox, Brave, Arc, blocked mic...), it says why and
   falls back: tricks become tap buttons, and the speed round becomes a typing test. */

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
const TYPING_WPM = 40;    // a commonly cited average typing speed
const SPEAKING_WPM = 150; // a commonly cited conversational speaking pace

const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

// Brave exposes the speech API, but its speech service is blocked, so every attempt fails.
const isBrave = () => typeof navigator !== "undefined" && !!navigator.brave;

// What to tell people for each speech error. `fatal` = voice won't work in this browser, switch to typing/taps.
const ERRORS = {
  "not-allowed": { fatal: true, msg: "Mic access is blocked. Allow the microphone for this site (the icon in the address bar) and reload, or play by tapping." },
  "service-not-allowed": { fatal: true, msg: "Speech recognition is turned off in this browser. On a Mac, Safari needs Dictation switched on (System Settings → Keyboard). Or play by tapping." },
  network: { fatal: true, msg: "This browser can't reach a speech service (Brave, Arc, Opera and some privacy blockers stop it). Try Chrome, Edge or Safari, or play by tapping." },
  "audio-capture": { fatal: true, msg: "No microphone found, or another app is using it. Or play by tapping." },
  "no-speech": { fatal: false, msg: "Didn't catch that. Tap the mic and speak a little louder." },
  "bad-grammar": { fatal: false, msg: "Didn't catch that. Tap the mic and try again." },
};

export function initPetGame(pet) {
  const $ = (s) => document.querySelector(s);
  const panel = $("#petpanel"), mic = $("#pp-mic"), status = $("#pp-status"), heard = $("#pp-heard");
  const tabs = panel.querySelectorAll("[data-tab]"), phraseEl = $("#pp-phrase"), result = $("#pp-result");
  const typeBox = $("#pp-type"), typeDone = $("#pp-typedone");
  let mode = "tricks", rec = null, listening = false, phrase = "", tStart = 0, lang = "en-IN";

  // voice works unless proven otherwise; once a fatal error happens we stay in tap/typing mode
  let voice = !!SR && !isBrave();
  let voiceNote = !SR ? "Voice games need Chrome, Edge or Safari. Here you can play by tapping."
    : isBrave() ? "Brave blocks the browser's speech service, so voice can't work here. Play by tapping, or open this in Chrome, Edge or Safari."
    : "";

  // trick buttons are always there, and are the whole game when voice is off
  $("#pp-cmds").innerHTML = COMMANDS.map((c) => `<button data-trick="${c.trick}">${c.label}</button>`).join("");
  panel.querySelectorAll("[data-trick]").forEach((b) => b.addEventListener("click", () => perform(b.dataset.trick, b.textContent)));

  tabs.forEach((t) => t.addEventListener("click", () => setMode(t.dataset.tab)));
  $("#pp-close").addEventListener("click", close);
  $("#pp-new").addEventListener("click", () => setMode("speed"));
  addEventListener("keydown", (e) => e.key === "Escape" && panel.classList.contains("open") && close());
  mic.addEventListener("click", () => (listening ? stop() : listen()));

  // typing version of the speed round
  let typeStart = 0;
  typeBox.addEventListener("input", () => { if (!typeStart && typeBox.value) typeStart = performance.now(); });
  typeBox.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); finishTyping(); } });
  typeDone.addEventListener("click", finishTyping);

  function applyVoiceState() {
    panel.dataset.voice = voice ? "on" : "off";
    mic.disabled = !voice;
  }

  function setMode(m) {
    mode = m;
    stop();
    tabs.forEach((t) => t.setAttribute("aria-selected", t.dataset.tab === m));
    panel.dataset.mode = m;
    result.innerHTML = ""; heard.textContent = "";
    typeBox.value = ""; typeStart = 0;
    applyVoiceState();
    if (m === "speed") {
      phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
      phraseEl.textContent = `“${phrase}”`;
      status.textContent = voice ? "Tap the mic, then read this out loud:" : "Type this as fast as you can, then press Enter:";
    } else {
      status.textContent = voice ? "Tap the mic and give Byte a command:" : "Tap a trick for Byte:";
    }
    if (!voice && voiceNote) status.textContent = voiceNote + (m === "speed" ? " Meanwhile, type it as fast as you can and press Enter:" : "");
  }

  function open() {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    setMode("tricks");
    (voice ? mic : panel.querySelector("[data-trick]")).focus({ preventScroll: true });
    pet.doTrick("good");
  }
  function close() {
    stop();
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  }

  function voiceFailed(note) {
    voice = false;
    voiceNote = note;
    stop();
    applyVoiceState();
    status.textContent = note + (mode === "speed" ? " Meanwhile, type it as fast as you can and press Enter:" : "");
    if (mode === "speed") { phraseEl.textContent = `“${phrase}”`; typeBox.focus({ preventScroll: true }); }
  }

  function listen() {
    if (!voice) return;
    rec = new SR();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 3;
    tStart = 0;
    let finalText = "", tEnd = 0, handled = false, failed = false;
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
      failed = true;
      if (e.error === "aborted") return;
      if (e.error === "language-not-supported" && lang !== "en-US") { lang = "en-US"; status.textContent = "Switching to US English, tap the mic again."; return; }
      const info = ERRORS[e.error];
      if (!info) { status.textContent = `Voice hiccup (${e.error}). Tap the mic and try again, or play by tapping.`; return; }
      if (info.fatal) voiceFailed(info.msg);
      else status.textContent = info.msg;
    };
    rec.onend = () => {
      listening = false; mic.classList.remove("on");
      if (failed || !finalText || handled) return;
      if (mode === "tricks") handleTrick(finalText);
      else scoreSpeed(finalText, (tEnd || performance.now()) - (tStart || performance.now()));
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
    status.textContent = `Byte: ${label}! ${voice ? "Tap the mic for another." : "Tap another trick."}`;
  }

  const norm = (s) => s.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean);
  function accuracyOf(text) {
    const target = norm(phrase), pool = norm(text);
    const hits = target.filter((w) => { const i = pool.indexOf(w); if (i >= 0) { pool.splice(i, 1); return true; } return false; }).length;
    return Math.round((hits / target.length) * 100);
  }

  function scoreSpeed(said, ms) {
    const wpm = Math.round(norm(said).length / (Math.max(ms / 1000, 0.8) / 60));
    const accuracy = accuracyOf(said);
    result.innerHTML = `
      <div class="pp-stat"><b>${wpm}</b><span>words / min speaking</span></div>
      <div class="pp-stat"><b>${TYPING_WPM}</b><span>avg typing</span></div>
      <div class="pp-stat"><b>${accuracy}%</b><span>words matched</span></div>
      <p>${wpm > TYPING_WPM ? `That's <b>${(wpm / TYPING_WPM).toFixed(1)}×</b> faster than typing. This is why I build with my voice.` : "Typing wins this round. Try again, a bit faster?"}</p>`;
    status.textContent = "Tap the mic to try again, or switch phrases.";
    pet.doTrick(wpm > TYPING_WPM && accuracy >= 60 ? "dance" : "huh");
  }

  function finishTyping() {
    const typed = typeBox.value.trim();
    if (!typed || !typeStart) return;
    const wpm = Math.round(norm(typed).length / (Math.max((performance.now() - typeStart) / 1000, 0.8) / 60));
    const accuracy = accuracyOf(typed);
    result.innerHTML = `
      <div class="pp-stat"><b>${wpm}</b><span>words / min typing</span></div>
      <div class="pp-stat"><b>~${SPEAKING_WPM}</b><span>avg speaking</span></div>
      <div class="pp-stat"><b>${accuracy}%</b><span>words matched</span></div>
      <p>Speaking that would take about <b>${(SPEAKING_WPM / Math.max(wpm, 1)).toFixed(1)}×</b> less time. That's why I build with my voice.</p>`;
    status.textContent = "Try another phrase, or open this in Chrome, Edge or Safari to race with your voice.";
    pet.doTrick(accuracy >= 60 ? "dance" : "huh");
    typeBox.blur();
  }

  applyVoiceState();
  return { open, close, isOpen: () => panel.classList.contains("open") };
}
