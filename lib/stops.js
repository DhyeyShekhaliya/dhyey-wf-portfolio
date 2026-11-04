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
       { type: "stats",  items: [{ value, label }] }  big headline numbers
       { type: "photo",  src?, caption }        taped photo (src empty = placeholder)
       { type: "links",  items: [{ label, href }] }
       { type: "diagram", svg }                 hand-drawn SVG (see DIAGRAMS)
       { type: "fourier" }                      interactive Fourier demo
       { type: "unblur" }                       drag-to-unblur photo demo
       { type: "palette", colors: [] }          click-to-copy swatches
       { type: "cards",  title?, items: [{ title, text, href, tags? }] }
       { type: "shot",   src, url?, caption? }  screenshot in a browser frame
       { type: "morph",  text, cta }            "Let's <build/create/design/think> something." hero
   `bare: true` on a stop hides the big handwritten title (the finale uses its own hero).
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
  <svg viewBox="0 0 520 190" class="sketch">
    <rect class="draw" x="30" y="16" width="26" height="18" />
    <path class="draw" d="M8 25 L30 25 M56 25 L78 25 M8 18 L8 32 M78 18 L78 32" />
    <text x="88" y="30" class="hand xs">Sentinel-2</text>
    <path class="draw dash" d="M43 36 L20 130 M43 36 L70 130" />
    <path class="draw warm" d="M6 140 q30 -10 60 -2 t60 0" />
    <path class="draw cool" d="M6 152 q30 -6 60 0 t60 0" />
    <text x="4" y="176" class="hand xs">±2 h of low tide</text>
    <path class="draw" d="M134 90 L176 90" marker-end="url(#arrow)" />
    <rect class="draw" x="182" y="58" width="110" height="64" rx="8" />
    <text x="196" y="84" class="hand s">labels</text>
    <text x="196" y="106" class="hand xs">field samples</text>
    <text x="196" y="118" class="hand xs">2017 to 2020</text>
    <path class="draw" d="M298 90 L340 90" marker-end="url(#arrow)" />
    <rect class="draw accent" x="346" y="52" width="160" height="76" rx="8" />
    <text x="358" y="80" class="hand s accentfill">DeepLabv3+</text>
    <text x="358" y="102" class="hand xs">vs U-Net · Focal-Dice loss</text>
    <text x="358" y="120" class="hand xs">8 sediment classes</text>
    <path class="draw accent" d="M426 134 L426 160" marker-end="url(#arrow)" />
    <text x="362" y="180" class="hand s accentfill">facies map ✓</text>
  </svg>`,
  wireframe: `
  <svg viewBox="0 0 320 200" class="sketch">
    <rect class="draw" x="6" y="6" width="308" height="188" rx="10" />
    <rect class="draw" x="20" y="16" width="280" height="22" rx="11" />
    <path class="draw accent" d="M30 32 a9 9 0 0 1 18 0 M34 32 a5 5 0 0 1 10 0" />
    <text x="52" y="32" class="hand xs">Serin</text>
    <path class="draw" d="M120 27 L140 27 M150 27 L170 27 M180 27 L200 27 M210 27 L230 27" />
    <rect class="draw" x="262" y="20" width="32" height="14" rx="7" />
    <path class="draw" d="M90 72 L230 72 M110 92 L210 92" />
    <path class="draw accent" d="M96 112 L224 112" />
    <path class="draw" d="M80 132 L240 132 M96 142 L224 142" />
    <rect class="draw" x="98" y="154" width="56" height="16" rx="8" />
    <rect class="draw accent" x="166" y="154" width="56" height="16" rx="8" />
    <circle class="draw" cx="146" cy="183" r="5" />
    <path class="draw" d="M156 183 L182 183" />
  </svg>`,
  llm: `
  <svg viewBox="0 0 520 180" class="sketch">
    <text x="6" y="40" class="hand s">~3,000 messy</text>
    <text x="6" y="62" class="hand s">crowd requirements</text>
    <path class="draw dash" d="M10 76 L150 76" />
    <text x="6" y="98" class="hand xs">balanced sample: 300</text>
    <path class="draw" d="M156 60 L196 80" marker-end="url(#arrow)" />
    <circle class="draw accent" cx="252" cy="88" r="50" />
    <text x="222" y="84" class="hand s accentfill">17 LLMs</text>
    <text x="214" y="106" class="hand xs">× 5 prompting</text>
    <text x="226" y="120" class="hand xs">strategies</text>
    <path class="draw" d="M306 70 L346 46" marker-end="url(#arrow)" />
    <path class="draw" d="M306 88 L346 82" marker-end="url(#arrow)" />
    <path class="draw" d="M306 104 L346 118" marker-end="url(#arrow)" />
    <path class="draw" d="M300 122 L346 152" marker-end="url(#arrow)" />
    <text x="354" y="50" class="hand s">sector 1</text>
    <text x="354" y="88" class="hand s">sector 2</text>
    <text x="354" y="124" class="hand s">sector 3</text>
    <text x="354" y="160" class="hand s">sector 4</text>
    <text x="440" y="104" class="hand s accentfill">F1 86.7%</text>
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
      { type: "photo", src: "/img/club-vfx-ai.jpg", caption: "hosting VFX AI: DALL·E 2 on the big screen" },
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
    id: "paper", chapter: "06", era: "computer vision", title: "First step into computer vision.", color: 0x22c1d6, prop: "satellite",
    notes: [
      { type: "badge", label: "published", text: "Elsevier · Procedia Computer Science, Vol. 283 (2026)", wide: true },
      { type: "lead", text: "Teaching a model to read a coastline from space." },
      { type: "text", text: "Computer vision is the field I fell for, and this was CV in its most tangible form. On the Chandipur coast in Odisha the sea recedes up to five kilometres at low tide, exposing flats whose sediments look almost identical from orbit. We classified them from satellite imagery." },
      { type: "diagram", svg: D.satellite, caption: "the pipeline", wide: true },
      { type: "stats", items: [
        { value: "0.886", label: "Mean IoU" },
        { value: "0.95", label: "Cohen's κ: almost perfect agreement" },
        { value: "8", label: "land-cover classes" },
        { value: "M1", label: "trained on a MacBook Air" },
      ], wide: true },
      { type: "list", title: "the hard part was the ground", items: ["a tidally synchronized Sentinel-2 dataset", "every label anchored to field sediment samples", "Focal-Dice loss for severe class imbalance", "DeepLabv3+ beat U-Net, confirmed with McNemar's test"] },
      { type: "list", title: "the nights", items: ["weeks of labeling in QGIS with co-author Rhythm Shah", "breaking models and rebuilding them", "rough masks slowly sharpening into clean facies maps"] },
      { type: "list", title: "with", items: ["mentor: Dr. Pooja Shah", "earth-science and remote-sensing collaborators, including SAC/ISRO", "presented at ICMLDE 4.0, UPES Dehradun"] },
      { type: "links", items: [{ label: "read the paper (open access)", href: "https://lnkd.in/dxnVxzee" }] },
      { type: "sticky", front: "what it taught me →", back: "The hard part isn't the model. It's the ground beneath it. You just start, and sometimes it turns into this." },
    ],
  },
  {
    id: "startup", chapter: "07", era: "Ahmedabad", title: "Designing a startup from zero.", color: 0x8a93e6, prop: "palette",
    notes: [
      { type: "lead", text: "Serin AI at Blink Analytics." },
      { type: "text", text: "Everything I'd taught myself about UI design until then, from meme edits to the design club, I applied here. At a very early stage, I designed the whole UI: the colour palettes, the wireframes, the first look of the product." },
      { type: "flow", steps: ["self-taught UI", "design club", "Serin AI"] },
      { type: "palette", colors: ["#060322", "#12143F", "#414A98", "#515DB5", "#A09FAF", "#FFFFFF"] },
      { type: "shot", src: "/img/serin-hero.jpg", url: "serin-ai.com", caption: "the Serin landing page", wide: true },
      { type: "links", items: [{ label: "serin-ai.com", href: "https://serin-ai.com/" }] },
      { type: "sticky", front: "what it taught me →", back: "At day zero, design is product strategy." },
    ],
  },
  {
    id: "research", chapter: "08", era: "IISER", title: "Interrogating LLMs.", color: 0xffd23c, prop: "brain",
    notes: [
      { type: "badge", label: "first-author paper", text: "ACM SAC '26 · Thessaloniki, Greece", wide: true },
      { type: "lead", text: "Where can LLMs actually deliver value?" },
      { type: "text", text: "We tackled a real bottleneck in requirements engineering: manually sorting thousands of messy, crowdsourced user requirements into meaningful sectors. The paper: \"An Empirical Analysis of Large Language Models for Sector Classification of Crowd-Based Software Requirements\"." },
      { type: "diagram", svg: D.llm, caption: "the experiment", wide: true },
      { type: "stats", items: [
        { value: "86.7%", label: "best F1, with zero fine-tuning" },
        { value: "17", label: "open-source LLMs tested" },
        { value: "5", label: "prompting strategies" },
        { value: "300", label: "balanced requirements from CrowdRE" },
      ], wide: true },
      { type: "list", title: "what surprised us", items: ["LLMs matched or beat supervised ML, with zero fine-tuning", "bigger isn't always better: architecture and smart prompting often mattered more than parameter count", "the best prompt depends on size: concise for small models, step-by-step reasoning for large ones"] },
      { type: "list", title: "why open source", items: ["every model we tested is open source", "anyone can reproduce or build on it", "no costly proprietary APIs: democratizing AI for requirements engineering"] },
      { type: "photo", src: "/img/research-desk.jpg", caption: "the setup: benchmarking LLMs, notebook open" },
      { type: "list", title: "with", items: ["advisor and co-author Dr. Arpit Sharma, who presented our work in person and guided me through every step"] },
      { type: "links", items: [{ label: "read the paper", href: "https://lnkd.in/dkyNpc9H" }] },
      { type: "sticky", front: "what it taught me →", back: "Bigger isn't always better. The right architecture and the right prompt beat raw size, and open source means anyone can build on it." },
    ],
  },
  {
    id: "projects", chapter: "09", era: "shipped", title: "Things I've built.", color: 0x19c37d, prop: "blocks",
    notes: [
      { type: "lead", text: "Shipped, not just planned." },
      { type: "cards", items: [
        { title: "BugAgent", tags: ["multi-agent", "LangGraph", "RAG"], href: "https://github.com/DhyeyShekhaliya/BugAgent",
          text: "An autonomous LLM system on LangGraph that orchestrates four specialized agents: Scout (intel ingestion), Brain (rules, PRD and hypotheses), Hacker (browser, Nuclei and ZAP probes) and Diplomat (reports and disclosure email), from scope ingestion to submission-ready vulnerability reports backed by real proof-of-concept evidence. A ChromaDB-backed RAG knowledge base feeds the pipeline, while hardcoded scope, method and rate guardrails plus mandatory human approval keep it strictly ethical." },
        { title: "FuelNetEnv", tags: ["RL", "LLM agents", "FastAPI"], href: "https://huggingface.co/spaces/Dhyeyyy18/Fuel-Net-Env-Final",
          text: "An OpenEnv-compliant RL and LLM-agent environment (FastAPI) that simulates global fuel distribution during real geopolitical crises, with five graded scenarios up to a full Strait of Hormuz closure. Its hybrid baseline pairs a deterministic logistics engine with Llama-3.1-8B, scored 70% deterministically and 30% by an LLM judge. Built at the Meta PyTorch OpenEnv Hackathon as team Dhokla Deep Learners." },
        { title: "Invflow", tags: ["Next.js", "Prisma", "Postgres"], href: "https://invflow-eight.vercel.app/login",
          text: "An inventory and billing system for fast-paced retail, built on Next.js and Prisma over Postgres. Money correctness is non-negotiable: the ledger and stock-movement journals are append-only, every money mutation is a single atomic transaction under row locks, and all amounts stay decimal-precise end to end." },
        { title: "Secure Code Assistant", tags: ["TypeScript", "VS Code", "security", "devtools"], href: "https://github.com/DhyeyShekhaliya/Secure-Code-Assistant",
          text: "VS Code extension for real-time static security scanning (Semgrep) with AI-assisted explanations and reports, aligned to OWASP." },
        { title: "ZapCart", tags: ["IoT", "Raspberry Pi", "RFID", "PHP"], href: "https://github.com/DhyeyShekhaliya/ZAPCART",
          text: "Raspberry Pi shopping cart with RFID auto-detection, a touchscreen UI and QR checkout that removes the checkout line, plus an admin dashboard for live carts." },
      ], wide: true },
      { type: "cards", title: "freelance", items: [
        { title: "Dental House Rajkot", tags: ["website", "SEO", "AEO"], href: "https://www.dentalhouserajkot.com/",
          text: "Designed and built the clinic's website, and handled its SEO and AEO so it shows up in search and in AI answers." },
      ], wide: true },
    ],
  },
];

export const FINALE = {
  id: "connect", chapter: "10", era: "now", title: "Let's build something.", color: 0xd1343d, bare: true,
  notes: [
    { type: "morph", wide: true,
      text: "Open to 2026 roles, research collaborations, and ambitious product work. If you're building something that matches my taste, I want to hear about it.",
      cta: { label: "Get in touch", href: "mailto:dheypatel21@gmail.com" } },
    { type: "lead", text: "let's connect." },
    { type: "links", items: [
      { label: "Email me", href: "mailto:dheypatel21@gmail.com" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/dhyeyshekhaliya/" },
      { label: "GitHub", href: "https://github.com/DhyeyShekhaliya" },
      { label: "Google Scholar", href: "https://scholar.google.com/citations?user=juY4r1sAAAAJ&hl=en" },
      { label: "Old portfolio", href: "https://www.dhyeyyy.in/" },
    ], wide: true },
  ],
};
