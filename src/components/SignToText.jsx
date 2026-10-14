import { useEffect, useRef, useState } from "react";
import { useHandLandmarker } from "../hooks/useHandLandmarker";
import { useGestureClassifier } from "../hooks/useGestureClassifier";
import { useSpeech } from "../hooks/useSpeech";

const DEFAULT_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function SignToText() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("A");
  const [customLabel, setCustomLabel] = useState("");
  const [composed, setComposed] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [autoPredict, setAutoPredict] = useState(false);

  const { ready, error: handError, numHands, getFeatures, featuresTick } = useHandLandmarker({
    videoRef,
    canvasRef,
    running,
  });
  const { counts, addExample, predict, clearLabel, clearAll } = useGestureClassifier();
  const { speak } = useSpeech();

  const knownLabels = Array.from(new Set([...DEFAULT_LABELS, ...Object.keys(counts)]));

  // Live auto-predict loop, throttled to every ~6th detection frame.
  useEffect(() => {
    if (!autoPredict || numHands === 0) return;
    if (featuresTick % 6 !== 0) return;
    let cancelled = false;
    predict(getFeatures()).then((res) => {
      if (!cancelled && res) setPrediction(res);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featuresTick, autoPredict, numHands]);

  function handleAddExample() {
    if (numHands === 0) return;
    addExample(getFeatures(), selectedLabel);
  }

  function handleAddCustomLabel() {
    const label = customLabel.trim().toUpperCase();
    if (!label) return;
    setSelectedLabel(label);
    setCustomLabel("");
  }

  function appendToComposed(text) {
    setComposed((c) => c + text);
  }

  const topLabel = prediction?.label;
  const confidence = prediction ? prediction.confidences[prediction.label] : 0;

  return (
    <div className="panel">
      <div className="panel-title">
        <span>sign → text / speech</span>
      </div>

      <div className="two-col">
        {/* ---- camera stage ---- */}
        <div>
          <div className="stage">
            <video ref={videoRef} muted playsInline />
            <canvas ref={canvasRef} />
            {running && (
              <div className="stage-badge">
                <span className="rec" />
                {numHands} hand{numHands === 1 ? "" : "s"} tracked
              </div>
            )}
            {!running && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <button className="btn btn-motion" onClick={() => setRunning(true)}>
                  Start camera
                </button>
              </div>
            )}
          </div>

          {running && (
            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-sm btn-ghost" onClick={() => setRunning(false)}>
                Stop camera
              </button>
              <button
                className={`btn btn-sm ${autoPredict ? "btn-motion" : ""}`}
                onClick={() => setAutoPredict((v) => !v)}
                disabled={Object.keys(counts).length === 0}
              >
                {autoPredict ? "Live predicting…" : "Start live prediction"}
              </button>
            </div>
          )}

          {handError && <div className="notice warn" style={{ marginTop: 12 }}>{handError}</div>}
          {!ready && !handError && (
            <div className="notice" style={{ marginTop: 12 }}>
              Loading hand-tracking model…
            </div>
          )}

          {autoPredict && topLabel && (
            <div className="readout">
              <span className="letter">{topLabel}</span>
              <div style={{ flex: 1 }}>
                <span className="confidence">{(confidence * 100).toFixed(0)}% confidence</span>
                <div className="confidence-bar">
                  <span style={{ width: `${confidence * 100}%` }} />
                </div>
              </div>
              <button className="btn btn-sm btn-signal" onClick={() => appendToComposed(topLabel)}>
                Add letter
              </button>
            </div>
          )}
        </div>

        {/* ---- training panel ---- */}
        <div>
          <p style={{ marginBottom: 10 }}>
            Pick a label, show the sign to the camera, then click{" "}
            <b style={{ color: "var(--paper)" }}>Add example</b> a few times
            (varying angle/distance). This trains a live, in-browser
            classifier — no server, no Python.
          </p>

          <div className="chip-grid" style={{ marginBottom: 12 }}>
            {knownLabels.map((label) => (
              <button
                key={label}
                className={`chip ${selectedLabel === label ? "selected" : ""}`}
                onClick={() => setSelectedLabel(label)}
              >
                {label}
                <span className="count">{counts[label] || 0}</span>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input
              className="text-field"
              placeholder="Custom label, e.g. HELLO"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCustomLabel()}
            />
            <button className="btn btn-sm" onClick={handleAddCustomLabel}>
              Add
            </button>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-signal" onClick={handleAddExample} disabled={!running || numHands === 0}>
              ➕ Add example for “{selectedLabel}”
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => clearLabel(selectedLabel)}>
              Clear “{selectedLabel}” examples
            </button>
            <button className="btn btn-sm btn-ghost" onClick={clearAll}>
              Reset all training data
            </button>
          </div>

          <div className="composed-bar">
            <div className="composed-text">
              {composed || <span style={{ color: "var(--muted)" }}>Composed sentence…</span>}
              <span className="caret" />
            </div>
            <button className="btn btn-sm" onClick={() => appendToComposed(" ")}>␣ Space</button>
            <button className="btn btn-sm" onClick={() => setComposed((c) => c.slice(0, -1))}>⌫ Back</button>
            <button className="btn btn-sm" onClick={() => setComposed("")}>🗑️ Clear</button>
            <button
              className="btn btn-sm btn-motion"
              onClick={() => speak(composed)}
              disabled={!composed.trim()}
            >
              🔊 Speak
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
