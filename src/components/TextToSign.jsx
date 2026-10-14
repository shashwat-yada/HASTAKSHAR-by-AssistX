import { useEffect, useMemo, useState } from "react";
import FingerspellCard from "./FingerspellCard";
import SignPlayer from "./SignPlayer";
import { textToFrames } from "../utils/fingerspell";
import { useSpeech } from "../hooks/useSpeech";

export default function TextToSign() {
  const [text, setText] = useState("");
  const [view, setView] = useState("play"); // "play" | "grid"
  const { supported, listening, transcript, error, startListening, speak, synthesisSupported } = useSpeech();

  useEffect(() => {
    if (transcript) setText(transcript);
  }, [transcript]);

  // Memoized so its identity only changes when the text actually changes —
  // SignPlayer resets to the start only on real changes, not on every
  // unrelated re-render (e.g. toggling play/pause).
  const frames = useMemo(() => textToFrames(text), [text]);

  return (
    <div className="panel">
      <div className="panel-title">
        <span>text / speech → isl</span>
      </div>

      <div className="two-col">
        <div>
          <input
            className="text-field"
            placeholder="Type a word or sentence…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p style={{ marginTop: 10, fontSize: 13 }}>
            Common words/phrases sign as a whole; anything else is
            fingerspelled letter by letter. See{" "}
            <code className="mono">public/signs/README.md</code> for adding
            real images/videos.
          </p>
        </div>

        <div>
          {supported ? (
            <button
              className={`btn ${listening ? "btn-signal" : ""}`}
              onClick={startListening}
              disabled={listening}
            >
              {listening ? "Listening…" : "🎤 Speak instead"}
            </button>
          ) : (
            <div className="notice warn">
              SpeechRecognition isn't supported in this browser — try Chrome
              or Edge on desktop.
            </div>
          )}
          {error && (
            <p style={{ marginTop: 10, color: "var(--motion)" }}>Mic error: {error}</p>
          )}
        </div>
      </div>

      {frames.length > 0 && (
        <div className="view-switch">
          <button className={`btn btn-sm ${view === "play" ? "btn-signal" : "btn-ghost"}`} onClick={() => setView("play")}>
            ▶ Play
          </button>
          <button className={`btn btn-sm ${view === "grid" ? "btn-signal" : "btn-ghost"}`} onClick={() => setView("grid")}>
            ▦ Show all at once
          </button>
        </div>
      )}

      {view === "play" ? (
        <div style={{ marginTop: 20 }}>
          <SignPlayer frames={frames} text={text} speak={speak} speechSupported={synthesisSupported} />
        </div>
      ) : frames.length === 0 ? (
        <div className="empty-state">
          Nothing to sign yet — type a sentence or tap the mic.
        </div>
      ) : (
        <div className="card-strip">
          {frames.map((f, i) => (
            <FingerspellCard key={i} label={f.label} type={f.type} index={i} asset={f.asset} />
          ))}
        </div>
      )}
    </div>
  );
}
