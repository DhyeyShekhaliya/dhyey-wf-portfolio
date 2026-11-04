/* ------------------------------------------------------------------
   STOPS: the content of every whiteboard on the 3D walk.
   Edit freely. Each stop has:
     id, chapter, era, title, color (hex), prop (3D shape near the board)
     notes: what's written on the board, in order. Note types:
       { type: "lead",   text }                 big handwritten line
       { type: "text",   text }                 paragraph
       { type: "list",   title?, items: [] }    bullet list
       { type: "chips",  items: [] }            skill / tool tags
       { type: "eq",     tex, caption? }        an equation
       { type: "flow",   steps: [] }            chalk arrows a → b → c
       { type: "sticky", front, back }          flip card (click)
       { type: "photo",  src?, caption }        taped photo (src empty = placeholder)
       { type: "links",  items: [{ label, href }] }
       { type: "diagram", svg }                 hand-drawn SVG (see DIAGRAMS)
       { type: "fourier" }                      interactive Fourier demo
       { type: "palette", colors: [] }          click-to-copy swatches
       { type: "cards",  items: [{ title, text, href }] }
   `wide: true` on a note makes it span the full board width.
   ------------------------------------------------------------------ */

const D = {
  thermopile: `
  <svg viewBox="0 0 320 170" class="sketch">
    <text x="22" y="24" class="hand s">HOT side</text>
    <text x="232" y="24" class="hand s">COLD side</text>
    <path class="draw warm" d="M30 40 q10 -14 20 0 q10 14 20 0 q10 -14 20 0" />
    <path class="draw cool" d="M230 40 l10 0 m8 -8 l0 16 m-8 -8 l16 0" />
    <path class="draw" d="M60 60 L60 130 M100 60 L100 130 M140 60 L140 130 M180 60 L180 130 M220 60 L220 130 M260 60 L260 130" />
    <path class="draw" d="M60 60 L100 60 M140 60 L180 60 M220 60 L260 60 M100 130 L140 130 M180 130 L220 130" />
    <path class="draw" d="M60 130 L40 150 L280 150 L260 130" />
    <circle class="draw accent" cx="160" cy="150" r="11" />
    <text x="154" y="155" class="hand s accentfill">V</text>
    <text x="70" y="100" class="hand xs">junctions</text>
  </svg>`,
  api: `
  <svg viewBox="0 0 340 150" class="sketch">
    <rect class="draw" x="10" y="45" width="70" height="50" rx="8" />
    <text x="28" y="76" class="hand s">me</text>
    <path class="draw" d="M84 60 L196 60" marker-end="url(#arrow)" />
    <text x="104" y="52" class="hand xs">GET /how-does-it-work</text>
    <rect class="draw accent" x="200" y="35" width="120" height="70" rx="10" />
    <text x="236" y="76" class="hand s accentfill">API</text>
    <path class="draw" d="M196 88 L84 88" marker-end="url(#arrow)" />
    <text x="110" y="110" class="hand xs">{ "answer": ... }</text>
    <text x="196" y="140" class="hand xs">...so how do we crack it?</text>
  </svg>`,
  ladder: `
  <svg viewBox="0 0 260 220" class="sketch">
    <path class="draw" d="M40 210 L40 10 M120 210 L120 10" />
    <path class="draw" d="M40 175 L120 175 M40 130 L120 130 M40 85 L120 85 M40 40 L120 40" />
    <text x="132" y="180" class="hand s">video editing member</text>
    <text x="132" y="135" class="hand s">core team</text>
    <text x="132" y="90" class="hand s">leading events</text>
    <text x="132" y="45" class="hand s accentfill">PRESIDENT</text>
    <path class="draw accent" d="M80 200 q-30 -60 0 -150" marker-end="url(#arrow)" />
  </svg>`,
  satellite: `
  <svg viewBox="0 0 340 170" class="sketch">
    <rect class="draw" x="30" y="20" width="26" height="18" />
    <path class="draw" d="M8 29 L30 29 M56 29 L78 29 M8 22 L8 36 M78 22 L78 36" />
    <path class="draw dash" d="M43 40 L110 130 M43 40 L30 140" />
    <path class="draw warm" d="M10 140 q40 -16 80 -4 t80 2 t80 -6 t80 4" />
    <path class="draw cool" d="M10 156 q40 -10 80 0 t80 0 t80 0 t80 0" />
    <text x="150" y="40" class="hand s">satellite tiles</text>
    <path class="draw" d="M150 60 L196 60" marker-end="url(#arrow)" />
    <text x="204" y="66" class="hand s">segment sand</text>
    <text x="210" y="122" class="hand xs accentfill">Chandipur coastline</text>
  </svg>`,
  wireframe: `
  <svg viewBox="0 0 300 180" class="sketch">
    <rect class="draw" x="10" y="10" width="280" height="160" rx="10" />
    <path class="draw" d="M10 36 L290 36" />
    <circle class="draw" cx="26" cy="23" r="5" /><circle class="draw" cx="42" cy="23" r="5" />
    <rect class="draw accent" x="24" y="52" width="110" height="60" rx="6" />
    <path class="draw" d="M150 56 L270 56 M150 72 L250 72 M150 88 L262 88" />
    <rect class="draw" x="24" y="126" width="74" height="28" rx="14" />
    <rect class="draw" x="110" y="126" width="74" height="28" rx="14" />
    <text x="200" y="148" class="hand xs">v0.1 wireframe</text>
  </svg>`,
  llm: `
  <svg viewBox="0 0 340 160" class="sketch">
    <text x="6" y="46" class="hand s">requirements</text>
    <path class="draw" d="M100 40 L140 70" marker-end="url(#arrow)" />
    <circle class="draw accent" cx="175" cy="80" r="34" />
    <text x="160" y="86" class="hand s accentfill">LLM</text>
    <path class="draw" d="M212 70 L252 46" marker-end="url(#arrow)" />
    <text x="256" y="46" class="hand s">output</text>
    <path class="draw" d="M212 92 L252 120" marker-end="url(#arrow)" />
    <text x="256" y="126" class="hand s">evaluate?</text>
    <text x="40" y="150" class="hand xs">where does it hold up, where does it break?</text>
  </svg>`,
};

export const STOPS = [
  {
    id: "science", chapter: "01", era: "childhood", title: "Science first.", color: 0xffc23c, prop: "atom",
    notes: [
      { type: "lead", text: "Quiet kid. Loud curiosity." },
      { type: "text", text: "I was an introvert, but I found my energy (and my love) in science projects. Physics especially. I wanted to know why everything worked." },
      { type: "diagram", svg: D.thermopile, caption: "thermopiles: making electricity from heat" },
      { type: "list", title: "the lab notebook", items: ["built science project after science project", "generated energy with thermopiles", "entered science competitions, won some", "made it to the state level"] },
      { type: "eq", tex: "V = N · S · ΔT", caption: "more junctions, more heat difference, more volts" },
      { type: "photo", src: "img/science-fair.jpg", caption: "science fair, me + my project" },
      { type: "sticky", front: "what it taught me →", back: "You don't have to be the loudest in the room to build something that works." },
    ],
  },
  {
    id: "tech", chapter: "02", era: "2016 to 2019", title: "Hardware, then everything.", color: 0x3c7dff, prop: "chip",
    notes: [
      { type: "lead", text: "Tech became my main thing." },
      { type: "text", text: "Linus Tech Tips, Dave2D and MKBHD on loop. First it was hardware. Then I wanted to know what was happening underneath: how software talks, how you crack an API." },
      { type: "chips", items: ["Linus Tech Tips", "Dave2D", "MKBHD", "spec sheets", "teardowns", "APIs"] },
      { type: "diagram", svg: D.api, caption: "the question I kept asking" },
      { type: "flow", steps: ["watch", "take apart", "understand", "rebuild"] },
      { type: "sticky", front: "what it taught me →", back: "Reverse-engineer what you love. It's the fastest way to learn anything." },
    ],
  },
  {
    id: "lockdown", chapter: "03", era: "2020 lockdown", title: "The lockdown classroom.", color: 0xff4d1f, prop: "reel",
    notes: [
      { type: "lead", text: "Self-taught, on the internet." },
      { type: "text", text: "During the 2020 lockdown I taught myself Final Cut Pro and Photoshop, ran a popular meme page on Instagram and was active on Reddit. Meme culture even got me into chess." },
      { type: "chips", items: ["Final Cut Pro", "Photoshop", "Instagram meme page", "Reddit", "Chess"] },
      { type: "flow", steps: ["memes", "editing", "design", "storytelling"] },
      { type: "sticky", front: "what it taught me →", back: "Memes are a crash course in what makes people stop scrolling." },
    ],
  },
  {
    id: "club", chapter: "04", era: "college", title: "Member → President.", color: 0xb06bff, prop: "ladder",
    notes: [
      { type: "lead", text: "Then I brought it to college." },
      { type: "text", text: "I joined the graphic design club as a video editing member, moved up the chain, and in my final year I became its president." },
      { type: "diagram", svg: D.ladder, caption: "the climb" },
      { type: "list", title: "BFXAI: the event I hosted", items: ["merged design with AI", "used DALL·E to create edits", "back when that still felt like magic"] },
      { type: "photo", src: "img/club-web-design.jpg", caption: "running a web design session for the club" },
      { type: "sticky", front: "what it taught me →", back: "Merge your interests and you get something no one else could run." },
    ],
  },
  {
    id: "vision", chapter: "05", era: "2nd year", title: "What does a Pixel see?", color: 0x19c37d, prop: "eye",
    notes: [
      { type: "lead", text: "One button made me curious." },
      { type: "text", text: "I'm a Pixel fanboy. Its image analysis feature looked like magic: press a button, it understands the photo. A math assignment gave me the excuse to find out how." },
      { type: "eq", tex: "F(u,v) = Σ Σ f(x,y) · e^(−j2π(ux/M + vy/N))", caption: "the Fourier transform: where it clicked" },
      { type: "fourier" },
      { type: "flow", steps: ["image processing", "ML fundamentals", "NLP", "computer vision ♥"] },
      { type: "chips", items: ["Elective: Digital Image Processing", "Elective: Computer Vision"] },
    ],
  },
  {
    id: "paper", chapter: "06", era: "publication", title: "Mapping beaches from space.", color: 0x22c1d6, prop: "satellite",
    notes: [
      { type: "lead", text: "My first published paper." },
      { type: "text", text: "Using only satellite imagery, we mapped the sandy beaches of the Chandipur coast." },
      { type: "diagram", svg: D.satellite, caption: "satellite → segmentation → coastline", wide: true },
      { type: "links", items: [{ label: "Read the paper", href: "#" }] },
    ],
  },
  {
    id: "startup", chapter: "07", era: "Ahmedabad", title: "Designing a startup from zero.", color: 0xff8a3c, prop: "palette",
    notes: [
      { type: "lead", text: "Serin AI at Blink Analytics." },
      { type: "text", text: "Very early stage. I designed the whole UI: the colour palettes, the wireframes, the first look of the product." },
      { type: "palette", colors: ["#0B0B0C", "#F6F4EF", "#FF4D1F", "#3C7DFF", "#19C37D"] },
      { type: "diagram", svg: D.wireframe, caption: "first wireframes" },
      { type: "sticky", front: "what it taught me →", back: "At day zero, design is product strategy." },
    ],
  },
  {
    id: "research", chapter: "08", era: "IISER", title: "Interrogating LLMs.", color: 0xffd23c, prop: "brain",
    notes: [
      { type: "lead", text: "AI research at IISER." },
      { type: "text", text: "I investigated how large language models handle requirements engineering. It became my first-author paper." },
      { type: "diagram", svg: D.llm, caption: "the research question", wide: true },
      { type: "links", items: [{ label: "First-author paper", href: "#" }] },
      { type: "sticky", front: "what it taught me →", back: "Owning a paper end to end: the question, the experiments, the writing." },
    ],
  },
  {
    id: "projects", chapter: "09", era: "shipped", title: "Things I've built.", color: 0x19c37d, prop: "blocks",
    notes: [
      { type: "lead", text: "Shipped, not just planned." },
      { type: "cards", items: [
        { title: "Project one", text: "One line on what it does and why it matters.", href: "#" },
        { title: "Project two", text: "One line on what it does and why it matters.", href: "#" },
        { title: "Project three", text: "One line on what it does and why it matters.", href: "#" },
      ], wide: true },
    ],
  },
];

export const FINALE = {
  id: "connect", chapter: "10", era: "now", title: "Let's build something.", color: 0xff4d1f,
  notes: [
    { type: "lead", text: "Wispr Flow India, let's talk." },
    { type: "text", text: "You've walked through how I think. Now let's grow Wispr Flow in India together." },
    { type: "links", items: [
      { label: "Email me", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "GitHub", href: "https://github.com/DhyeyShekhaliya" },
      { label: "Old portfolio", href: "https://www.dhyeyyy.in/" },
    ], wide: true },
  ],
};
