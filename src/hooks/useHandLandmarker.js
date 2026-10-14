import { useCallback, useEffect, useRef, useState } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task";

const NUM_HANDS = 2;
const FEATURES_PER_HAND = 21 * 3;
export const FEATURE_LEN = NUM_HANDS * FEATURES_PER_HAND; // 126

const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

/**
 * useHandLandmarker — starts the webcam, runs MediaPipe's HandLandmarker
 * (Tasks API, WASM, entirely client-side — no frames ever leave the
 * browser), draws a landmark overlay on `canvasRef`, and exposes the latest
 * flattened, wrist-relative feature vector for classification.
 */
export function useHandLandmarker({ videoRef, canvasRef, running }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [numHands, setNumHands] = useState(0);
  const landmarkerRef = useRef(null);
  const rafRef = useRef(null);
  const featuresRef = useRef(new Float32Array(FEATURE_LEN));
  const [featuresTick, setFeaturesTick] = useState(0);

  // Load the model once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
        let landmarker;
        try {
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
            runningMode: "VIDEO",
            numHands: NUM_HANDS,
          });
        } catch (gpuErr) {
          // Some browsers/devices (older GPUs, some Linux setups, some
          // laptops without WebGL) don't support the GPU delegate. Fall
          // back to CPU rather than failing outright.
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
            runningMode: "VIDEO",
            numHands: NUM_HANDS,
          });
        }
        if (!cancelled) {
          landmarkerRef.current = landmarker;
          setReady(true);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load hand-tracking model.");
      }
    })();
    return () => {
      cancelled = true;
      landmarkerRef.current?.close?.();
    };
  }, []);

  // Start/stop webcam + detection loop.
  useEffect(() => {
    if (!running || !ready) return;
    let stream;
    let cancelled = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (cancelled) return;
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();
        loop();
      } catch (e) {
        setError(e?.message || "Could not access the camera.");
      }
    }

    function loop() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;
      if (!video || !canvas || !landmarker || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const result = landmarker.detectForVideo(video, performance.now());
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const hands = result.landmarks || [];
      setNumHands(hands.length);

      const vec = new Float32Array(FEATURE_LEN);
      const sorted = [...hands].sort((a, b) => a[0].x - b[0].x);

      sorted.slice(0, NUM_HANDS).forEach((landmarks, handIdx) => {
        const wrist = landmarks[0];
        const start = handIdx * FEATURES_PER_HAND;
        landmarks.forEach((lm, i) => {
          vec[start + i * 3] = lm.x - wrist.x;
          vec[start + i * 3 + 1] = lm.y - wrist.y;
          vec[start + i * 3 + 2] = lm.z - wrist.z;
        });

        ctx.strokeStyle = "#ff7a59";
        ctx.lineWidth = 2;
        CONNECTIONS.forEach(([a, b]) => {
          ctx.beginPath();
          ctx.moveTo(landmarks[a].x * canvas.width, landmarks[a].y * canvas.height);
          ctx.lineTo(landmarks[b].x * canvas.width, landmarks[b].y * canvas.height);
          ctx.stroke();
        });
        ctx.fillStyle = "#f2b705";
        landmarks.forEach((lm) => {
          ctx.beginPath();
          ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      featuresRef.current = vec;
      setFeaturesTick((t) => (t + 1) % 1000000);

      rafRef.current = requestAnimationFrame(loop);
    }

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
      setNumHands(0);
    };
  }, [running, ready, videoRef, canvasRef]);

  const getFeatures = useCallback(() => featuresRef.current, []);

  return { ready, error, numHands, getFeatures, featuresTick };
}
