# Dropping in real ISL sign images/videos

> **✅ Already done in this copy.** `letters/` (26 files) and `ISL_Gifs/`
> (90 files) below are already populated, sourced from the SignBridge
> project's bundled copy of the same underlying dataset described below.
> 5 filenames were normalized to line up with `KNOWN_PHRASES` in
> `src/utils/fingerspell.js` (case/typo/apostrophe fixes), and `"june"`
> was added to that list since a GIF existed for it but the phrase wasn't
> registered. The rest of this file is kept as reference for adding more
> signs later.

The app auto-detects real media in a few naming variants. No code changes
needed for the steps below.

## Fastest path: use the satyam9090 dataset directly

The GitHub project **satyam9090/Automatic-Indian-Sign-Language-Translator-ISL**
(https://github.com/satyam9090/Automatic-Indian-Sign-Language-Translator-ISL)
bundles exactly the two folders this app needs, with filenames already
matched by the app's auto-detection:

1. Download the repo — on the GitHub page click **Code → Download ZIP**
   (or `git clone https://github.com/satyam9090/Automatic-Indian-Sign-Language-Translator-ISL.git`).
2. From the unzipped folder, copy:
   - `letters/` → into `public/signs/letters/` (files like `a.jpg`, `b.jpg`, ...)
   - `ISL_Gifs/` → into `public/signs/ISL_Gifs/` (files like `good morning.gif`,
     `hello.gif`, ...) — keep the folder name and filenames exactly as they are.
3. That's it — refresh the app. Type "hello" or "good morning" and it'll show
   the real GIF; type any other word and it'll fingerspell using the letter
   images.

Note: that repo has no license file, meaning it's not formally
open-licensed for redistribution — fine for personal/learning use, but
worth keeping in mind if you ever plan to publish or distribute this app
publicly. If that matters for your use case, consider swapping in your own
recordings or a properly-licensed source later; the file layout stays the
same either way.

The full phrase list from that project is already pre-loaded into
`src/utils/fingerspell.js` (`KNOWN_PHRASES`), so multi-word phrases like
"good morning" are recognized as one sign automatically — you don't need to
edit any code, just add the files.

## Manual / custom naming

**Letters** — `public/signs/letters/`, named as the character, either case,
several extensions all work: `A.png`, `a.jpg`, `B.svg`, `9.png`, `0.jpg`, etc.

**Words/phrases** — two options:
1. Drop the file in `public/signs/ISL_Gifs/<lowercase phrase>.gif` (matches
   the satyam9090 layout — no code changes needed, works automatically for
   anything in `KNOWN_PHRASES`).
2. Or add your own entry to `WORD_SIGNS` in `src/utils/fingerspell.js` and
   drop a file in `public/signs/words/` — video (.mp4/.webm/.mov) or image/gif.

If a file is missing for a given letter/word, that card falls back to the
placeholder glyph automatically — nothing breaks.
