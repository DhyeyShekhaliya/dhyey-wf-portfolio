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
          <button id="enter">
            tap to enter<span className="caret">_</span>
          </button>
        </div>
      </section>

      {/* Scene 1: white page + spoken captions */}
      <section id="intro" aria-live="polite">
        <div id="caption"></div>
      </section>

      {/* Circle-reveal ring */}
      <div id="ring"></div>

      {/* Scene 2: the 3D walk */}
      <canvas id="world"></canvas>

      {/* "open board" prompt when standing at a stop */}
      <button id="prompt" className="nav">
        <b>✎</b> <span></span> <em>open board</em>
      </button>

      {/* The scientist's whiteboard */}
      <section id="board" aria-hidden="true" role="dialog" aria-label="Whiteboard">
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <filter id="chalk">
              <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
            </filter>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 1 L9 5 L0 9" fill="none" stroke="#f6f4ef" strokeWidth="1.6" strokeLinecap="round" />
            </marker>
          </defs>
        </svg>
        <div className="board-tools nav">
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
