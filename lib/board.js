/* The full-screen "scientist's whiteboard" for a stop. */
import { gsap } from "gsap";

const hex = (n) => "#" + n.toString(16).padStart(6, "0");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

let board, inner, pad, ctx;
let onClose = null, drawing = false, drawMode = false, last = null;

export function initBoard() {
  board = document.querySelector("#board");
  inner = board.querySelector(".board-inner");
  pad = board.querySelector("#chalkpad");
  ctx = pad.getContext("2d");
  board.querySelector("[data-close]").addEventListener("click", () => closeBoard());
  board.querySelector("[data-draw]").addEventListener("click", (e) => {
    drawMode = !drawMode;
    board.classList.toggle("drawing", drawMode);
    e.currentTarget.setAttribute("aria-pressed", drawMode);
  });
  board.querySelector("[data-erase]").addEventListener("click", () => ctx.clearRect(0, 0, pad.width, pad.height));
  addEventListener("keydown", (e) => e.key === "Escape" && isOpen() && closeBoard());
  addEventListener("resize", () => isOpen() && sizePad());
  pad.addEventListener("pointerdown", (e) => { if (!drawMode) return; drawing = true; last = pos(e); pad.setPointerCapture(e.pointerId); });
  pad.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    const p = pos(e);
    ctx.strokeStyle = "rgba(246,244,239,.85)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x + (Math.random() - 0.5) * 0.8, p.y + (Math.random() - 0.5) * 0.8);
    ctx.stroke();
    last = p;
  });
  ["pointerup", "pointercancel"].forEach((ev) => pad.addEventListener(ev, () => (drawing = false)));
}

export const isOpen = () => board.classList.contains("open");

export function openBoard(stop, { onClosed } = {}) {
  onClose = onClosed;
  board.style.setProperty("--c", hex(stop.color));
  inner.innerHTML = `
    <header class="b-head">
      <span class="b-ch type">CH. ${esc(stop.chapter)} · ${esc(stop.era)}</span>
      <h2 class="hand">${esc(stop.title)}</h2>
      <svg class="underline" viewBox="0 0 300 12" preserveAspectRatio="none"><path class="draw accent" d="M2 8 C 80 2, 160 12, 298 4"/></svg>
    </header>
    <div class="b-grid">${stop.notes.map(renderNote).join("")}</div>`;
  inner.querySelectorAll(".note").forEach((n, i) => n.style.setProperty("--r", ((i * 37) % 7 - 3) * 0.35 + "deg"));
  wire(inner);
  board.classList.add("open");
  board.setAttribute("aria-hidden", "false");
  sizePad();
  ctx.clearRect(0, 0, pad.width, pad.height);
  // chalk animation: notes fade in, then strokes draw themselves
  gsap.fromTo(inner.querySelectorAll(".b-head, .note"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power2.out", delay: 0.15 });
  inner.querySelectorAll("path.draw, circle.draw, rect.draw").forEach((p, i) => {
    const len = p.getTotalLength ? p.getTotalLength() : 300;
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
    gsap.to(p.style, { strokeDashoffset: 0, duration: 0.9, delay: 0.4 + i * 0.05, ease: "power1.inOut" });
  });
  board.querySelector(".board-inner").scrollTop = 0;
}

export function closeBoard() {
  if (!isOpen()) return;
  board.classList.remove("open", "drawing");
  board.setAttribute("aria-hidden", "true");
  drawMode = false;
  const cb = onClose; onClose = null;
  cb && cb();
}

function renderNote(n) {
  const wide = n.wide ? " wide" : "";
  switch (n.type) {
    case "badge":
      return `<div class="note badge${wide}"><span class="b-label type">${esc(n.label)}</span><span class="b-text">${esc(n.text)}</span></div>`;
    case "lead":
      return `<div class="note lead hand wide">${esc(n.text)}</div>`;
    case "text":
      return `<div class="note text${wide}"><p>${esc(n.text)}</p></div>`;
    case "list":
      return `<div class="note list${wide}">${n.title ? `<h4 class="hand">${esc(n.title)}</h4>` : ""}<ul>${n.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`;
    case "chips":
      return `<div class="note chips${wide}">${n.items.map((i) => `<span class="chip">${esc(i)}</span>`).join("")}</div>`;
    case "eq":
      return `<div class="note eq${wide}" tabindex="0"><div class="tex">${esc(n.tex)}</div>${n.caption ? `<div class="cap hand">${esc(n.caption)}</div>` : ""}</div>`;
    case "flow":
      return `<div class="note flow wide">${n.steps.map((s) => `<span class="step hand">${esc(s)}</span>`).join('<span class="arr">→</span>')}</div>`;
    case "sticky":
      return `<button class="note sticky${wide}" aria-label="flip card"><span class="face front hand">${esc(n.front)}</span><span class="face back hand">${esc(n.back)}</span></button>`;
    case "photo":
      return `<figure class="note photo${wide}"><span class="tape"></span>${n.src ? `<img src="${esc(n.src)}" alt="${esc(n.caption)}" onerror="this.outerHTML='<div class=&quot;ph mono&quot;>photo<br>coming</div>'">` : `<div class="ph mono">photo<br>coming</div>`}<figcaption class="hand">${esc(n.caption)}</figcaption></figure>`;
    case "links":
      return `<div class="note links${wide}">${n.items.map((l) => `<a class="hand" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} <span>↗</span></a>`).join("")}</div>`;
    case "diagram":
      return `<figure class="note diagram${wide}">${n.svg}${n.caption ? `<figcaption class="hand">${esc(n.caption)}</figcaption>` : ""}</figure>`;
    case "fourier":
      return `<div class="note fourier${wide}"><h4 class="hand">try it: add sine waves → get a square wave</h4>
        <svg viewBox="0 0 320 110" class="sketch"><path class="wave accent" d=""/><path class="axis" d="M0 55 L320 55"/></svg>
        <label class="mono">harmonics <input type="range" min="1" max="15" step="2" value="1"> <b>1</b></label></div>`;
    case "palette":
      return `<div class="note palette${wide}"><h4 class="hand">palette (click to copy)</h4><div class="sw">${n.colors.map((c) => `<button style="--s:${esc(c)}" data-hex="${esc(c)}"><span class="mono">${esc(c)}</span></button>`).join("")}</div></div>`;
    case "cards":
      return `<div class="note cards${wide}">${n.items.map((c) => `<a class="card" href="${esc(c.href)}" target="_blank" rel="noopener"><h4 class="hand">${esc(c.title)} ↗</h4><p>${esc(c.text)}</p></a>`).join("")}</div>`;
    default:
      return "";
  }
}

function wire(root) {
  root.querySelectorAll(".sticky").forEach((s) => s.addEventListener("click", () => s.classList.toggle("flipped")));
  root.querySelectorAll(".palette button").forEach((b) =>
    b.addEventListener("click", () => {
      navigator.clipboard?.writeText(b.dataset.hex).catch(() => {});
      const span = b.querySelector("span"), was = span.textContent;
      span.textContent = "copied!";
      setTimeout(() => (span.textContent = was), 900);
    })
  );
  root.querySelectorAll(".fourier").forEach((f) => {
    const input = f.querySelector("input"), out = f.querySelector("b"), wave = f.querySelector(".wave");
    const draw = () => {
      const n = +input.value;
      out.textContent = (n + 1) / 2;
      let d = "";
      for (let x = 0; x <= 320; x += 2) {
        const t = (x / 320) * Math.PI * 4;
        let y = 0;
        for (let k = 1; k <= n; k += 2) y += Math.sin(k * t) / k;
        d += (x ? "L" : "M") + x + " " + (55 - y * 52).toFixed(1);
      }
      wave.setAttribute("d", d);
    };
    input.addEventListener("input", draw);
    draw();
  });
}

/* ---- chalk drawing pad ---- */
function sizePad() {
  const r = pad.getBoundingClientRect(), dpr = Math.min(devicePixelRatio, 2);
  pad.width = r.width * dpr;
  pad.height = r.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
const pos = (e) => { const r = pad.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
