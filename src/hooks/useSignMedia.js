import { useEffect, useMemo, useState } from "react";

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "svg", "webp", "gif"];
const VIDEO_EXTENSIONS = ["mp4", "webm", "mov"];

function buildCandidates(label, type, asset) {
  if (asset) return [asset];

  if (type === "letter") {
    const upper = encodeURIComponent(label.toUpperCase());
    const lower = encodeURIComponent(label.toLowerCase());
    const out = [];
    for (const ext of IMAGE_EXTENSIONS) {
      out.push(`/signs/letters/${upper}.${ext}`);
      if (lower !== upper) out.push(`/signs/letters/${lower}.${ext}`);
    }
    return out;
  }

  if (type === "word") {
    const upper = label.toUpperCase();
    const lower = label.toLowerCase();
    const out = [];
    for (const ext of VIDEO_EXTENSIONS) {
      out.push(`/signs/words/${encodeURIComponent(upper)}.${ext}`);
    }
    for (const ext of IMAGE_EXTENSIONS) {
      out.push(`/signs/words/${encodeURIComponent(upper)}.${ext}`);
    }
    // matches satyam9090/Automatic-Indian-Sign-Language-Translator-ISL's
    // ISL_Gifs/<lowercase phrase>.gif layout — copy that folder in as-is
    out.push(`/signs/ISL_Gifs/${encodeURIComponent(lower)}.gif`);
    out.push(`/signs/words/${encodeURIComponent(lower)}.gif`);
    return out;
  }

  return [];
}

function isVideoSrc(src) {
  return /\.(mp4|webm|mov)$/i.test(src);
}

/**
 * Resolves a letter/word to real media if present, walking through
 * candidate filenames/extensions and falling back to null (placeholder)
 * once all candidates 404. Shared by FingerspellCard (grid) and SignPlayer
 * (animated stage) so both look in exactly the same places.
 */
export function useSignMedia(label, type, asset) {
  const candidates = useMemo(
    () => (type === "space" ? [] : buildCandidates(label, type, asset)),
    [label, type, asset]
  );

  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [candidates]);

  const exhausted = idx >= candidates.length;
  const src = exhausted ? null : candidates[idx];

  const onError = () => setIdx((i) => i + 1);

  return { src, isVideo: src ? isVideoSrc(src) : false, onError, hasReal: Boolean(src) };
}
