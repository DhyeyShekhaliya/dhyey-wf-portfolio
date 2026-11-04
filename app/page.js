"use client";

import { useEffect } from "react";

let booted = false;

export default function Home() {
  useEffect(() => {
    if (booted) return;
    booted = true;
    // Three.js, GSAP and the audio only run in the browser.
    import("../lib/intro.js").then(({ initIntro }) => initIntro());
  }, []);

  return (
    <>
      {/* Scene 0: gate */}
      <section id="gate">
        <div className="gate-inner">
          <p className="dim">🎧 headphones on</p>
          {/* starts as "loading"; lib/intro.js enables it the moment its click handler exists */}
          <button id="enter" disabled>
            loading<span className="caret">_</span>
          </button>
          <p className="gate-note">💻 best experienced on desktop</p>
        </div>
      </section>

      {/* Scene 1: white page + spoken captions */}
      <section id="intro" aria-live="polite">
        <div id="caption"></div>
      </section>

      {/* Sound toggle */}
      <button id="mute" className="nav" aria-pressed="false" aria-label="Mute sound">
        <span className="ic">🔊</span> <span className="lb">sound on</span>
      </button>

      {/* Circle-reveal ring */}
      <div id="ring"></div>

      {/* Scene 2: the 3D walk */}
      <canvas id="world"></canvas>

      {/* "open board" prompt when standing at a stop */}
      <button id="prompt" className="type">
        <b>✎</b> <span></span> <em>open board</em>
      </button>

      {/* Byte, the pet: hint bubble + voice panel */}
      <div id="pet-bubble" className="type" aria-hidden="true">psst, click me 🎙</div>
      <section id="petpanel" aria-hidden="true" role="dialog" aria-label="Play with Byte" data-mode="tricks">
        <header className="pp-head">
          <div>
            <span className="type pp-kicker">Byte · voice games</span>
            <h3 className="hand">Talk to Byte.</h3>
          </div>
          <button id="pp-close" className="type" aria-label="Close">✕</button>
        </header>
        <div className="pp-tabs nav" role="tablist">
          <button data-tab="tricks" role="tab" aria-selected="true">tricks</button>
          <button data-tab="speed" role="tab" aria-selected="false">speed round</button>
        </div>
        <p id="pp-status" className="nav">Tap the mic and give Byte a command:</p>
        <p id="pp-phrase" className="hand"></p>
        <button id="pp-mic" className="nav" aria-label="Start talking"><span>🎙</span></button>
        <p id="pp-heard" className="type" aria-live="polite"></p>
        <div id="pp-cmds" className="type"></div>
        <div id="pp-result" className="nav" aria-live="polite"></div>
        <button id="pp-new" className="type">new phrase ↻</button>
        <p className="pp-note nav">Speech is recognised by your browser&apos;s built-in voice service.</p>
      </section>

      {/* The scientist's whiteboard */}
      <section id="board" aria-hidden="true" role="dialog" aria-label="Whiteboard">
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <filter id="goo">
              <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140" />
            </filter>
            <filter id="chalk">
              <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
            </filter>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 1 L9 5 L0 9" fill="none" stroke="#f6f4ef" strokeWidth="1.6" strokeLinecap="round" />
            </marker>
          </defs>
        </svg>
        <div className="board-tools type">
          <button data-draw="" aria-pressed="false">✎ draw on it</button>
          <button data-erase="">erase</button>
          <button data-close="">close ✕</button>
        </div>
        <div className="board-inner"></div>
        <canvas id="chalkpad"></canvas>
      </section>

      <div id="hud" className="nav">
        <span id="stage-name"></span>
        <span className="hint">scroll or ← → to walk · click a board</span>
        <span id="progress">
          <b></b>
        </span>
      </div>
      <div id="scroll-space"></div>

      <audio id="bg" src="/audio/bg.mp3" preload="auto"></audio>
      <audio id="bg2" src="/audio/bg2.mp3" preload="auto"></audio>
      <audio id="voice" preload="auto"></audio>
      <audio id="amb" src="/audio/ambient.mp3" preload="auto" loop></audio>
    </>
  );
}
