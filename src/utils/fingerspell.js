/**
 * fingerspell.js
 * ----------------
 * Splits input text into an ordered list of frames to render as
 * <FingerspellCard>s.
 *
 * Letters: FingerspellCard automatically looks for images in
 * public/signs/letters/ (both A.png and a.jpg style names work) — no code
 * changes needed.
 *
 * Words/phrases: not everything is fingerspelled letter by letter — many
 * common words and phrases have their own whole sign. KNOWN_PHRASES below
 * is pre-loaded with the phrase list from the classic open-source
 * "Automatic-Indian-Sign-Language-Translator-ISL" project, so if you copy
 * that project's ISL_Gifs/ folder into public/signs/ISL_Gifs/ (unchanged,
 * no renaming), all of those phrases will show their real GIF automatically.
 *
 * Matching is greedy longest-phrase-first, so "good morning" is matched as
 * one two-word sign rather than two separate single-word lookups.
 *
 * To add more of your own words/phrases, add them to WORD_SIGNS. The value
 * can be:
 *   - `true`        -> auto-discover (checks public/signs/words/ and
 *                       public/signs/ISL_Gifs/ in a few naming variants)
 *   - "/some/path"  -> use that exact asset path
 */

// Phrase list from satyam9090/Automatic-Indian-Sign-Language-Translator-ISL
// (main1.py / main2.py, isl_gif list) — matches filenames in that project's
// ISL_Gifs/ folder, e.g. ISL_Gifs/good morning.gif
const KNOWN_PHRASES = [
  "any questions", "are you angry", "are you busy", "are you hungry", "are you sick", "be careful",
  "can we meet tomorrow", "did you book tickets", "did you finish homework", "do you go to office", "do you have money",
  "do you want something to drink", "do you want tea or coffee", "do you watch tv", "dont worry", "flower is beautiful",
  "good afternoon", "good evening", "good morning", "good night", "good question", "had your lunch", "happy journey",
  "hello what is your name", "how many people are there in your family", "i am a clerk", "i am bore doing nothing",
  "i am fine", "i am sorry", "i am thinking", "i am tired", "i dont understand anything", "i go to a theatre", "i love to shop",
  "i had to say something but i forgot", "i have headache", "i like pink colour", "i live in nagpur", "lets go for lunch",
  "my mother is a homemaker", "my name is john", "nice to meet you", "no smoking please", "open the door", "please call me later",
  "please clean the room", "please give me your pen", "please use dustbin dont throw garbage", "please wait for sometime",
  "shall i help you", "shall we go together tommorow", "sign language interpreter", "sit down", "stand up", "take care",
  "there was traffic jam", "wait i am thinking", "what are you doing", "what is the problem", "what is todays date",
  "what is your father do", "what is your job", "what is your mobile number", "what is your name", "whats up",
  "when is your interview", "when we will go", "where do you stay", "where is the bathroom", "where is the police station",
  "you are wrong", "address", "agra", "ahemdabad", "all", "april", "assam", "august", "australia", "badoda", "banana",
  "banaras", "banglore", "bihar", "bridge", "cat", "chandigarh", "chennai", "christmas", "church", "clinic", "coconut",
  "crocodile", "dasara", "deaf", "december", "deer", "delhi", "dollar", "duck", "febuary", "friday", "fruits", "glass",
  "grapes", "gujrat", "hello", "hindu", "hyderabad", "india", "january", "jesus", "job", "july", "june", "karnataka",
  "kerala", "krishna", "litre", "mango", "may", "mile", "monday", "mumbai", "museum", "muslim", "nagpur", "october",
  "orange", "pakistan", "pass", "police station", "post office", "pune", "punjab", "rajasthan", "ram", "restaurant", "saturday",
  "september", "shop", "sleep", "southafrica", "story", "sunday", "tamil nadu", "temperature", "temple", "thursday",
  "toilet", "tomato", "town", "tuesday", "usa", "village", "voice", "wednesday", "weight",
];

export const WORD_SIGNS = Object.fromEntries(KNOWN_PHRASES.map((p) => [p.toUpperCase(), true]));

// Add your own here — merged with the built-in list above:
// WORD_SIGNS["THANK YOU"] = "/signs/words/thank-you.mp4";

const MAX_PHRASE_WORDS = 8;

export function textToFrames(text) {
  const frames = [];
  if (!text) return frames;

  const words = text.trim().split(/\s+/).filter(Boolean);
  let i = 0;
  while (i < words.length) {
    let matchedLen = 0;
    const maxLen = Math.min(MAX_PHRASE_WORDS, words.length - i);
    for (let len = maxLen; len >= 1; len--) {
      const phrase = words
        .slice(i, i + len)
        .join(" ")
        .toUpperCase();
      if (WORD_SIGNS[phrase]) {
        const entry = WORD_SIGNS[phrase];
        const wordLabel = words.slice(i, i + len).join(" ");
        frames.push({
          type: "word",
          label: wordLabel,
          asset: typeof entry === "string" ? entry : undefined,
          word: wordLabel,
          wordStart: true,
        });
        matchedLen = len;
        break;
      }
    }

    if (matchedLen > 0) {
      i += matchedLen;
    } else {
      const word = words[i];
      let first = true;
      for (const ch of word) {
        if (/[a-zA-Z0-9]/.test(ch)) {
          frames.push({ type: "letter", label: ch.toUpperCase(), word, wordStart: first });
          first = false;
        }
      }
      i += 1;
    }

    if (i < words.length) {
      frames.push({ type: "space", label: "␣", word: null, wordStart: false });
    }
  }
  return frames;
}
