import { useSignMedia } from "../hooks/useSignMedia";

/**
 * FingerspellCard — a single letter/word card in the "show all at once"
 * grid. For the animated one-at-a-time view, see SignPlayer.jsx. Both
 * share the same media lookup (useSignMedia) so they always agree on
 * whether a real image/video/gif exists for a given letter or word.
 */
export default function FingerspellCard({ label, type = "letter", index = 0, asset }) {
  const isSpace = type === "space";
  const { src, isVideo, onError } = useSignMedia(label, type, asset);

  return (
    <div className="fs-card" style={{ animationDelay: `${index * 45}ms` }}>
      {!isSpace && src ? (
        isVideo ? (
          <video
            className="fs-media"
            src={src}
            width="72"
            height="82"
            autoPlay
            loop
            muted
            playsInline
            onError={onError}
          />
        ) : (
          <img
            className="fs-media"
            src={src}
            width="72"
            height="82"
            alt={`ISL sign for ${label}`}
            onError={onError}
          />
        )
      ) : (
        <svg viewBox="0 0 80 92" width="72" height="82" aria-hidden="true">
          <rect x="1" y="1" width="78" height="90" rx="12" fill="var(--ink-raised)" stroke="var(--hairline)" />
          {!isSpace && (
            <>
              <rect x="24" y="30" width="32" height="26" rx="9" fill="var(--panel-hi)" />
              {[-14, -5, 4, 13].map((dx, i) => {
                const heights = [16, 22, 20, 15];
                const h = heights[i];
                return (
                  <rect
                    key={i}
                    x={40 + dx - 3}
                    y={30 - h}
                    width="6"
                    height={h}
                    rx="3"
                    fill="var(--panel-hi)"
                  />
                );
              })}
              <rect x="14" y="34" width="10" height="14" rx="4" fill="var(--panel-hi)" />
            </>
          )}
        </svg>
      )}
      <div className="fs-label">{isSpace ? "space" : label}</div>
    </div>
  );
}
