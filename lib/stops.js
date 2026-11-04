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
       { type: "badge",  label, text }          highlighted fact (e.g. your major)
       { type: "photo",  src?, caption }        taped photo (src empty = placeholder)
       { type: "links",  items: [{ label, href }] }
       { type: "diagram", svg }                 hand-drawn SVG (see DIAGRAMS)
       { type: "fourier" }                      interactive Fourier demo
       { type: "unblur" }                       drag-to-unblur photo demo
       { type: "palette", colors: [] }          click-to-copy swatches
       { type: "cards",  items: [{ title, text, href }] }
   `wide: true` on a note makes it span the full board width.
   ------------------------------------------------------------------ */

const D = {
  thermopile: `
  <svg viewBox="0 0 340 200" class="sketch">
    <text x="96" y="20" class="hand s cooltext">COLD side: ice / heatsink</text>
    <path class="draw cool" d="M60 30 l0 10 m30 -10 l0 10 m30 -10 l0 10 m30 -10 l0 10 m30 -10 l0 10 m30 -10 l0 10 m30 -10 l0 10" />
    <rect class="draw" x="50" y="44" width="220" height="12" rx="2" />
    <rect class="draw" x="64" y="62" width="18" height="44" /><rect class="draw accent" x="96" y="62" width="18" height="44" />
    <rect class="draw" x="128" y="62" width="18" height="44" /><rect class="draw accent" x="160" y="62" width="18" height="44" />
    <rect class="draw" x="192" y="62" width="18" height="44" /><rect class="draw accent" x="224" y="62" width="18" height="44" />
    <text x="67" y="90" class="hand xs">n</text><text x="100" y="90" class="hand xs accentfill">p</text>
    <text x="131" y="90" class="hand xs">n</text><text x="164" y="90" class="hand xs accentfill">p</text>
    <text x="195" y="90" class="hand xs">n</text><text x="228" y="90" class="hand xs accentfill">p</text>
    <rect class="draw" x="50" y="112" width="220" height="12" rx="2" />
    <path class="draw warm" d="M90 160 q-10 -14 0 -26 q10 12 0 26 M160 160 q-10 -14 0 -26 q10 12 0 26 M230 160 q-10 -14 0 -26 q10 12 0 26" />
    <text x="100" y="186" class="hand s warmtext">HOT side: candle / heat</text>
    <path class="draw" d="M270 70 L306 70 L306 92 M270 100 L306 100 L306 112" />
    <circle class="draw accent" cx="306" cy="102" r="11" />
    <text x="300" y="107" class="hand s accentfill">V</text>
    <text x="284" y="136" class="hand xs">power!</text>
  </svg>`,
  apk: `
  <svg viewBox="0 0 340 170" class="sketch">
    <rect class="draw" x="14" y="22" width="62" height="110" rx="10" />
    <path class="draw" d="M36 30 L54 30" />
    <rect class="draw accent" x="26" y="54" width="38" height="38" rx="6" />
    <text x="31" y="79" class="hand s accentfill">.apk</text>
    <path class="draw" d="M84 76 L176 76" marker-end="url(#arrow)" />
    <text x="96" y="66" class="hand xs">decompile</text>
    <rect class="draw" x="184" y="34" width="140" height="86" rx="8" />
    <text x="196" y="58" class="hand xs">&lt;/&gt; classes.dex</text>
    <text x="196" y="80" class="hand xs">res / manifest</text>
    <text x="196" y="102" class="hand xs accentfill">mod it, rebuild it</text>
    <text x="150" y="158" class="hand xs">...so how do we crack it?</text>
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
      { type: "diagram", svg: D.thermopile, caption: "my project: a Peltier cooler, flipped into a generator" },
      { type: "list", title: "the lab notebook", items: ["built science project after science project", "the big one: a thermoelectric generator from a Peltier cooler module (12V 6A, 40×40 mm)", "entered science competitions, won some", "made it to the state level"] },
      { type: "eq", tex: "V = N · S · ΔT", caption: "the Seebeck effect: more p-n pairs, more temperature difference, more volts" },
      { type: "photo", src: "/img/science-fair.jpg", caption: "science fair: me + my Peltier generator" },
      { type: "sticky", front: "what it taught me →", back: "Science fundamentally changed my way of thinking." },
    ],
  },
  {
    id: "tech", chapter: "02", era: "2016 to 2019", title: "Hardware, then everything.", color: 0x3c7dff, prop: "chip",
    notes: [
      { type: "lead", text: "Tech became my main thing." },
      { type: "text", text: "Linus Tech Tips, Dave2D and MKBHD on loop. First it was hardware. Then I wanted to know what was happening underneath: how apps are built, how you crack an APK." },
      { type: "chips", items: ["Linus Tech Tips", "Dave2D", "MKBHD", "spec sheets", "teardowns", "APKs"] },
      { type: "diagram", svg: D.apk, caption: "the question I kept asking" },
      { type: "flow", steps: ["watch", "take apart", "understand", "rebuild"] },
      { type: "sticky", front: "what it taught me →", back: "Learning to self-learn: from random YouTube videos to blogs. Learning the skill of learning." },
    ],
  },
  {
    id: "lockdown", chapter: "03", era: "2020 lockdown", title: "The lockdown classroom.", color: 0xff4d1f, prop: "reel",
    notes: [
      { type: "lead", text: "Self-taught, on the internet." },
      { type: "text", text: "During the 2020 lockdown I taught myself Final Cut Pro and Photoshop, became a contributor to a meme page on Instagram, and was active on Reddit. Meme culture even got me into chess." },
      { type: "chips", items: ["Final Cut Pro", "Photoshop", "meme page contributor", "Reddit", "Chess"] },
      { type: "links", items: [{ label: "@meme__stats", href: "https://www.instagram.com/meme__stats/" }] },
      { type: "flow", steps: ["memes", "editing", "design", "storytelling"] },
      { type: "sticky", front: "what it taught me →", back: "How to make trendy content with mass appeal, connect with an audience, and run social media." },
    ],
  },
  {
    id: "club", chapter: "04", era: "college", title: "Member → President.", color: 0xb06bff, prop: "ladder",
    notes: [
      { type: "badge", label: "my major", text: "Computer Science (AI)", wide: true },
      { type: "lead", text: "Coding by major. Design by taste." },
      { type: "text", text: "I chose Computer Science with AI. But I always leaned towards good user experience and good design, so I built that taste while learning it: I joined the graphic design club as a video editing member, moved up the chain, and in my final year became its president." },
      { type: "diagram", svg: D.ladder, caption: "the climb" },
      { type: "list", title: "VFX AI: the event I hosted", items: ["merged visual effects and design with AI", "used DALL·E to create edits", "back when that still felt like magic"] },
      { type: "links", items: [{ label: "the VFX AI post", href: "https://lnkd.in/p/dWvzFBae" }] },
      { type: "photo", src: "/img/club-vfx-ai.jpg", caption: "hosting the VFX AI event" },
      { type: "photo", src: "/img/club-web-design.jpg", caption: "running a web design session for the club" },
      { type: "chips", items: ["UX", "UI design", "video editing", "event hosting", "leading a team"] },
      { type: "sticky", front: "what it taught me →", back: "Taste is a skill. I built mine by learning design alongside code." },
    ],
  },
  {
    id: "vision", chapter: "05", era: "2nd year", title: "Pixel Unblur.", color: 0x19c37d, prop: "eye",
    notes: [
      { type: "lead", text: "How does a phone unblur a photo?" },
      { type: "text", text: "I'm a Pixel fanboy, and its Photo Unblur felt like magic. Dr. Ankush Raje set us an assignment: pick a discrete math topic, find its real-life use, and suggest improvements. I picked my phone's unblur feature and went down the rabbit hole." },
      { type: "unblur" },
      { type: "eq", tex: "F̂ = G · H* / ( |H|² + λ )", caption: "Fourier deconvolution: undo the blur kernel H, with λ as regularization" },
      { type: "list", title: "under the hood", items: ["Fourier transforms + deconvolution", "convolution kernels", "regularization, so noise doesn't explode"] },
      { type: "list", title: "debugging it", items: ["learned the art of handling kernels", "fine-tuned parameters for the best results", "debugging became my best friend"] },
      { type: "list", title: "making it better", items: ["explored DeblurGANv2", "found Polyblur: faster than the conventional method", "both could land in real products"] },
      { type: "links", items: [{ label: "read the full post", href: "https://lnkd.in/p/dKjA2vPC" }] },
      { type: "flow", steps: ["image processing", "ML fundamentals", "NLP", "computer vision ♥"] },
      { type: "chips", items: ["Elective: Digital Image Processing", "Elective: Computer Vision"] },
      { type: "sticky", front: "what it taught me →", back: "Resilience, the joy of cracking a complex problem, and actually reading the long papers." },
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
