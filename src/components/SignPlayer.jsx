import { useEffect, useRef, useState } from "react";
import { useSignMedia } from "../hooks/useSignMedia";

const DURATIONS = {
  slow: { letter: 650, word: 1700, space: 350 },
  normal: { letter: 420, word: 1100, space: 220 },
  fast: { letter: 260, word: 700, space: 140 },
};

function BigHandGlyph({ active }) {
  // A larger, more visible version of the placeholder glyph used in the
  // grid — shown whenever no real image/video/gif exists for this
  // letter/word yet. `active` retriggers the CSS "appear" motion.
  return (
    <svg viewBox="0 0 160 180" width="140" height="158" aria-hidden="true" className={active ? "hand-glyph-active" : ""}>
      <rect x="2" y="2" width="156" height="176" rx="20" fill="var(--ink-raised)" stroke="var(--hairline)" />
      <rect x="48" y="62" width="64" height="52" rx="18" fill="var(--panel-hi)" />
      {[-28, -10, 8, 26].map((dx, i) => {
        const heights = [32, 44, 40, 30];
        const h = heights[i];
        return (
          <rect
            key={i}
            x={80 + dx - 6}
            y={62 - h}
            width="12"
            height={h}
            rx="6"
            fill="var(--panel-hi)"
          />
        );
      })}
      <rect x="28" y="70" width="20" height="28" rx="8" fill="var(--panel-hi)" />
    </svg>
  );
}

export default function SignPlayer({ frames, text, speak, speechSupported }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState("slow");
  const [speakOn, setSpeakOn] = useState(true);
  const timerRef = useRef(null);

  const current = frames[index] || null;
  const { src, isVideo, onError } = useSignMedia(current?.label ?? "", current?.type ?? "letter", current?.asset);

  // New text -> jump back to the start and auto-play.
  useEffect(() => {
    setIndex(0);
    setPlaying(frames.length > 0);
  }, [frames]);

  // Advance through frames on a timer while playing.
  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!playing || frames.length === 0) return undefined;
    if (index >= frames.length - 1) {
      timerRef.current = setTimeout(() => setPlaying(false), DURATIONS[speed][frames[index]?.type || "letter"]);
      return () => clearTimeout(timerRef.current);
    }
    const dur = DURATIONS[speed][frames[index]?.type || "letter"];
    timerRef.current = setTimeout(() => setIndex((i) => i + 1), dur);
    return () => clearTimeout(timerRef.current);
  }, [index, playing, speed, frames]);

  // Speak the word once when its first frame becomes active.
  useEffect(() => {
    if (!speakOn || !speechSupported || !current?.wordStart || !current?.word) return;
    speak(current.word);
  }, [index, speakOn, speechSupported, current, speak]);

  if (frames.length === 0) {
    return (
      <div className="sign-stage empty">
        <BigHandGlyph active={false} />
        <p style={{ marginTop: 14 }}>Type something above and it'll sign it here, one step at a time.</p>
      </div>
    );
  }

  const tokens = text.trim().split(/\s+/).filter(Boolean);
  const activeWord = current?.word ? current.word.toUpperCase() : null;
  const finished = index >= frames.length - 1 && !playing;
  const progressPct = frames.length <= 1 ? 100 : (index / (frames.length - 1)) * 100;

  return (
    <div>
      <div className="sign-stage">
        <div className="sign-stage-inner" key={index}>
          {current?.type !== "space" && src ? (
            isVideo ? (
              <video className="sign-stage-media" src={src} autoPlay loop muted playsInline onError={onError} />
            ) : (
              <img className="sign-stage-media" src={src} alt={`ISL sign for ${current.label}`} onError={onError} />
            )
          ) : (
            <BigHandGlyph active />
          )}
        </div>
        <div className="sign-stage-label mono">
          {current?.type === "space" ? "·" : current?.label}
        </div>
      </div>

      <div className="confidence-bar" style={{ marginTop: 14 }}>
        <span style={{ width: `${progressPct}%` }} />
      </div>

      <p className="caption" style={{ marginTop: 14 }}>
        {tokens.map((tok, i) => {
          const isActive = activeWord && activeWord.split(/\s+/).includes(tok.toUpperCase());
          return (
            <span key={i} className={isActive ? "caption-active" : ""}>
              {tok}{" "}
            </span>
          );
        })}
      </p>

      <div className="player-controls">
        <button
          className="btn btn-sm btn-signal"
          onClick={() => {
            if (finished) {
              setIndex(0);
              setPlaying(true);
            } else {
              setPlaying((p) => !p);
            }
          }}
        >
          {finished ? "⟲ Replay" : playing ? "⏸ Pause" : "▶ Play"}
        </button>

        <div className="chip-grid" role="group" aria-label="Playback speed">
          {["slow", "normal", "fast"].map((s) => (
            <button
              key={s}
              className={`chip ${speed === s ? "selected" : ""}`}
              onClick={() => setSpeed(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {speechSupported && (
          <label className="speak-toggle mono">
            <input type="checkbox" checked={speakOn} onChange={(e) => setSpeakOn(e.target.checked)} />
            🔊 speak along
          </label>
        )}
      </div>
    </div>
  );
}
