# Dhyey · Walk Through It

An interactive story portfolio built for the Wispr Flow India application.

**Flow:** black screen ("tap to enter") → fades to white while the spoken intro appears word by word → the camera swoops into a 3D path through life chapters → "Let's build something."

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 (scroll to walk the path). Add `?auto` to the URL for a hands-free tour, used to record the preview video.

## Edit content

Everything editable is at the top of `public/main.js`:

- `SCRIPT`: the intro lines and their timings (seconds after the tap)
- `SONG_SECONDS`: how long the title song plays before the ambient loop takes over
- `VOICE_SRC`: path to the recorded voice intro
- `STAGES`: the life chapters on the 3D path

## Stack

Plain HTML/CSS/JS, Three.js (3D), GSAP (timeline). The libraries are vendored in `public/vendor/`, so there's no build step. It deploys as a static site (e.g. Vercel, with `public` as the output directory).

## Audio

- `public/audio/bg.mp3`: the title song, first 8 seconds only
- `public/audio/ambient.mp3`: an original slow ambient loop generated for this project
