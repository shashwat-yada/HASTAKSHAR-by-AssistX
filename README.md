# Hastakshar by AssistX — ISL Translator (React)

*हस्ताक्षर — hasta (hand) + akshar (letter): a hand shape **is** a letter.*

**New here or just got a zip from me? → see [`HOW_TO_RUN.md`](./HOW_TO_RUN.md)
for exact setup steps.**

A bidirectional Indian Sign Language translator that runs **entirely in the
browser** — no backend, no API keys, nothing to deploy but static files.

- **Text / Speech → Sign:** type or speak (native `SpeechRecognition`) and
  watch it get signed back one step at a time — real ISL images/GIFs where
  available (see `public/signs/README.md`), fingerspelled letter by letter
  otherwise, with an optional spoken read-along. A "show all at once" grid
  view is also available.
- **Sign → Text / Speech:** show a hand sign to your webcam. MediaPipe's
  `HandLandmarker` (WASM, on-device) extracts 21 hand landmarks; a
  TensorFlow.js KNN classifier — which **you train live**, teachable-machine
  style, right in the page — predicts the letter. Build a sentence and have
  it read aloud with `speechSynthesis`.

Nothing about your camera feed or voice ever leaves the device: hand
tracking, classification, and speech all run client-side.

## Quick start

See [`HOW_TO_RUN.md`](./HOW_TO_RUN.md) for step-by-step setup if this is
your first time. Short version:

```bash
npm install
npm run dev
```

Open the printed `localhost` URL in **Chrome or Edge (desktop)** — best
support for both `SpeechRecognition` and camera access. Grant microphone /
camera permissions when prompted.

```bash
npm run build     # production build -> dist/
npm run preview   # preview the production build locally
```

Deploy `dist/` anywhere that serves static files (Vercel, Netlify, GitHub
Pages, Cloudflare Pages, ...) — that's it, no server code required.

## How the "Sign → Text" training works

1. Pick a label (A–Z are pre-listed; add your own, e.g. `HELLO`, with the
   text field).
2. Show the sign to your camera and click **Add example** 8–15 times,
   varying your hand's angle/distance/lighting a little each time.
3. Repeat for every sign you want recognized.
4. Click **Start live prediction** — the KNN classifier compares your live
   hand landmarks against your saved examples in real time.

Training examples are saved to `localStorage`, so they persist across page
reloads on the same browser/device. Use **Reset all training data** to start
over.

## Project structure

```
src/
├── App.jsx                       # layout, hero, mode switch
├── index.css                     # design tokens + all styling
├── components/
│   ├── LandmarkSkeleton.jsx      # animated hand-skeleton hero visual
│   ├── TextToSign.jsx            # text/speech -> player + fingerspelling grid
│   ├── SignPlayer.jsx            # animated one-step-at-a-time sign player
│   ├── SignToText.jsx            # webcam + training UI + composer
│   └── FingerspellCard.jsx       # single letter/word flashcard (grid view)
├── hooks/
│   ├── useSpeech.js              # Web Speech API (recognition + synthesis)
│   ├── useSignMedia.js           # resolves real image/video/gif for a letter/word
│   ├── useHandLandmarker.js      # MediaPipe HandLandmarker + canvas overlay
│   └── useGestureClassifier.js   # TensorFlow.js KNN classifier + persistence
└── utils/
    └── fingerspell.js            # text -> letter/word frame list + built-in phrase dictionary
```

## Swapping in real ISL sign imagery

`useSignMedia.js` auto-detects real media (used by both the player and the
grid) and falls back to a placeholder glyph only when no file is found — no
code changes required. See `public/signs/README.md` for exact filenames/
paths, including a fast path that lets you copy in the `letters/` and
`ISL_Gifs/` folders from the open-source
[satyam9090/Automatic-Indian-Sign-Language-Translator-ISL](https://github.com/satyam9090/Automatic-Indian-Sign-Language-Translator-ISL)
project unchanged.

## Notes & limits

- **Browser support:** `SpeechRecognition` is most reliable in Chrome/Edge
  desktop; Firefox/Safari support is partial (the UI detects this and warns
  you).
- **Model loading:** the hand-tracking model and WASM runtime load from
  Google's CDN (`storage.googleapis.com` / `cdn.jsdelivr.net`) on first use —
  you'll need network access the first time; after that the browser caches
  it.
- **Accuracy:** a KNN classifier over hand landmarks is a lightweight
  baseline (works well for distinct static hand shapes). For higher accuracy
  at scale, more examples per label and a larger `k` help; a proper deep
  model trained on a larger dataset would do even better — see the Python
  version of this project for a scikit-learn training pipeline you can build
  on.
