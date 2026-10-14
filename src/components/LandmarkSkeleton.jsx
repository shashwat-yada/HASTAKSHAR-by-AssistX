import { useEffect, useRef } from "react";

/**
 * LandmarkSkeleton — the app's signature visual: an animated dot-and-line
 * hand skeleton, styled exactly like the MediaPipe landmark overlay used in
 * the live Sign → Text camera view. It cycles between a few abstract hand
 * poses so the hero itself demonstrates the mechanism the app is built on,
 * rather than illustrating it with a generic stock graphic.
 */

// MediaPipe hand topology (21 landmarks)
const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

// A handful of hand-shaped keyframes (normalized 0-100 coordinate space),
// loosely evoking open palm / fist / point / pinch — enough to feel alive
// without claiming to be a specific, real ISL sign.
const POSES = [
  // open palm
  [
    [50, 88], [40, 78], [33, 62], [30, 48], [28, 38],
    [45, 55], [43, 32], [42, 16], [41, 4],
    [50, 55], [50, 28], [50, 10], [50, -2],
    [55, 56], [57, 32], [58, 16], [59, 4],
    [60, 60], [65, 42], [68, 28], [70, 18],
  ],
  // fist
  [
    [50, 88], [42, 80], [36, 70], [33, 62], [31, 56],
    [45, 60], [44, 50], [43, 44], [42, 40],
    [50, 60], [50, 48], [50, 42], [50, 38],
    [55, 61], [56, 50], [57, 44], [58, 40],
    [60, 63], [62, 54], [63, 48], [64, 44],
  ],
  // point (index extended)
  [
    [50, 88], [41, 79], [35, 64], [32, 50], [30, 40],
    [45, 56], [43, 30], [41, 12], [40, -4],
    [50, 58], [50, 46], [50, 40], [50, 36],
    [55, 59], [56, 48], [57, 42], [58, 38],
    [60, 61], [62, 52], [63, 46], [64, 42],
  ],
  // pinch (thumb + index meeting)
  [
    [50, 88], [42, 76], [37, 60], [35, 44], [40, 34],
    [45, 55], [44, 34], [41, 22], [39, 32],
    [50, 56], [50, 42], [50, 36], [50, 32],
    [55, 58], [56, 46], [57, 40], [58, 36],
    [60, 61], [62, 51], [63, 45], [64, 41],
  ],
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export default function LandmarkSkeleton({ size = 320, accent = "var(--motion)" }) {
  const svgRef = useRef(null);
  const frame = useRef(0);

  useEffect(() => {
    let raf;
    let start = null;
    const HOLD = 1100;
    const TRANSITION = 650;
    const CYCLE = HOLD + TRANSITION;

    const dots = svgRef.current.querySelectorAll("[data-dot]");
    const lines = svgRef.current.querySelectorAll("[data-line]");

    function tick(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const totalCycle = CYCLE * POSES.length;
      const t = elapsed % totalCycle;
      const poseIdx = Math.floor(t / CYCLE);
      const withinCycle = t % CYCLE;
      const nextPoseIdx = (poseIdx + 1) % POSES.length;

      let progress = 0;
      if (withinCycle > HOLD) {
        progress = (withinCycle - HOLD) / TRANSITION;
        // ease in-out
        progress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      }

      const from = POSES[poseIdx];
      const to = POSES[nextPoseIdx];

      const current = from.map(([x, y], i) => [
        lerp(x, to[i][0], progress),
        lerp(y, to[i][1], progress),
      ]);

      dots.forEach((dot, i) => {
        dot.setAttribute("cx", current[i][0]);
        dot.setAttribute("cy", current[i][1]);
      });
      lines.forEach((line, i) => {
        const [a, b] = CONNECTIONS[i];
        line.setAttribute("x1", current[a][0]);
        line.setAttribute("y1", current[a][1]);
        line.setAttribute("x2", current[b][0]);
        line.setAttribute("y2", current[b][1]);
      });

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="10 -10 70 105"
      width={size}
      height={size}
      role="img"
      aria-label="Animated hand landmark skeleton"
    >
      {CONNECTIONS.map((_, i) => (
        <line
          key={i}
          data-line
          stroke={accent}
          strokeWidth="0.6"
          strokeLinecap="round"
          opacity="0.55"
        />
      ))}
      {POSES[0].map((_, i) => (
        <circle key={i} data-dot r={i === 0 ? 1.6 : 1.1} fill={accent} />
      ))}
    </svg>
  );
}
