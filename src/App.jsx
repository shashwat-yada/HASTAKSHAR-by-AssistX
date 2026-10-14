import { useState } from "react";
import LandmarkSkeleton from "./components/LandmarkSkeleton";
import TextToSign from "./components/TextToSign";
import SignToText from "./components/SignToText";

export default function App() {
  const [mode, setMode] = useState("text");

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="wordmark">
          <span className="devanagari">हस्ताक्षर</span>
          <span>Hastakshar</span>
          <span className="wordmark-credit">by AssistX</span>
        </div>
        <span className="header-tag">runs entirely in your browser</span>
      </header>

      <section className="hero">
        <div>
          <div className="hero-eyebrow">indian sign language, both directions</div>
          <h1>
            A hand shape <span className="accent">is</span> a letter.
          </h1>
          <p className="lede">
            Hastakshar (<em>hasta</em> = hand, <em>akshar</em> = letter) turns
            typed or spoken text into ISL fingerspelling, and turns a sign
            shown to your camera back into text and speech — no install, no
            server, no account.
          </p>

          <div className="hero-meta">
            <div>
              <b>21</b>
              landmarks / hand
            </div>
            <div>
              <b>0</b>
              frames leave your device
            </div>
            <div>
              <b>&lt;1s</b>
              to train a new sign
            </div>
          </div>

          <div style={{ marginTop: 30 }}>
            <div className="mode-switch">
              <button
                data-mode="text"
                className={mode === "text" ? "active" : ""}
                onClick={() => setMode("text")}
              >
                <span className="dot" /> Text / Speech → Sign
              </button>
              <button
                data-mode="sign"
                className={mode === "sign" ? "active" : ""}
                onClick={() => setMode("sign")}
              >
                <span className="dot" /> Sign → Text / Speech
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <LandmarkSkeleton />
        </div>
      </section>

      <main>
        <div className="container" style={{ padding: 0 }}>
          {mode === "text" ? <TextToSign /> : <SignToText />}
        </div>
      </main>

      <footer className="site-footer">
        <span>
          Real ISL letter photos &amp; phrase GIFs (satyam9090 dataset) +
          a browser-trained classifier — placeholder glyphs only show up for
          signs outside the dataset.
        </span>
        <span>
          Built with React, MediaPipe Tasks Vision, TensorFlow.js &amp; the
          Web Speech API.
        </span>
      </footer>
    </div>
  );
}
