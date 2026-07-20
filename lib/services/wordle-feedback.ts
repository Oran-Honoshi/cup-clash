// Shared Wordle-style per-letter feedback for "Guess the Footballer" and
// "Guess the Club" — one implementation so both games can never drift onto
// two different (and possibly non-standard) duplicate-letter behaviors.

export type LetterStatus = "green" | "orange" | "red" | "separator";
export type LetterTile = { char: string; status: LetterStatus };

const COMBINING_MARKS = /[̀-ͯ]/g;

// Diacritic-insensitive so guessing "e" colors against an "é" in the answer
// (and vice versa) — per confirmed decision, not a literal Unicode compare.
function normalizeLetter(ch: string): string {
  return ch.normalize("NFD").replace(COMBINING_MARKS, "").toUpperCase();
}

function isLetter(ch: string): boolean {
  return /\p{L}/u.test(ch);
}

// Compares the guessed name against the real answer name letter-by-letter,
// using the standard two-pass Wordle algorithm (greens first, then oranges
// against remaining letter counts) so a letter that appears once in the
// answer never lights up green/orange twice in the guess. Non-letter
// characters (spaces, hyphens, apostrophes, …) are never guessable/colored —
// they pass through as "separator" tiles so multi-word names render sensibly.
//
// Position is measured within each name's letter-only sequence (spaces and
// hyphens don't count as positions), so e.g. "Manchester City" vs "Manchester
// United" still lines up and greens the shared "Manchester" even though the
// second words differ in length.
export function computeWordleFeedback(guessName: string, answerName: string): LetterTile[] {
  const guessChars = Array.from(guessName);

  const answerLetterSeq: string[] = [];
  for (const ch of answerName) {
    if (isLetter(ch)) answerLetterSeq.push(normalizeLetter(ch));
  }

  const guessLetterIndices: number[] = [];
  guessChars.forEach((ch, i) => {
    if (isLetter(ch)) guessLetterIndices.push(i);
  });

  const remaining = new Map<string, number>();
  for (const letter of answerLetterSeq) remaining.set(letter, (remaining.get(letter) ?? 0) + 1);

  const statusByCharIndex = new Map<number, LetterStatus>();

  // Pass 1 — green: same letter-position (within the letter-only sequences).
  guessLetterIndices.forEach((charIndex, letterPos) => {
    const normalized = normalizeLetter(guessChars[charIndex]);
    if (letterPos < answerLetterSeq.length && normalized === answerLetterSeq[letterPos]) {
      statusByCharIndex.set(charIndex, "green");
      remaining.set(normalized, (remaining.get(normalized) ?? 0) - 1);
    }
  });

  // Pass 2 — orange (present elsewhere, remaining count > 0) or red.
  guessLetterIndices.forEach(charIndex => {
    if (statusByCharIndex.has(charIndex)) return;
    const normalized = normalizeLetter(guessChars[charIndex]);
    const count = remaining.get(normalized) ?? 0;
    if (count > 0) {
      statusByCharIndex.set(charIndex, "orange");
      remaining.set(normalized, count - 1);
    } else {
      statusByCharIndex.set(charIndex, "red");
    }
  });

  return guessChars.map((ch, i) => ({
    char: ch,
    status: statusByCharIndex.get(i) ?? "separator",
  }));
}
