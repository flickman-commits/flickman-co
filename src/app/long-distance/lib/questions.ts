/**
 * Deep-question bank.
 *
 * Currently seeded with 10 placeholder prompts in the spirit of the "Partners
 * are Humans" card game — intimate, vulnerable, growth-oriented questions a
 * couple in a long-distance relationship can ask each other. Swap in the real
 * licensed deck (with attribution) once we have rights.
 */
export const QUESTIONS: string[] = [
  "What's a part of yourself you've shown me that you've never shown anyone else?",
  "What's a question about us you've been afraid to ask?",
  "When have I made you feel most seen this past month?",
  "What is this distance teaching us about the way we love?",
  "What's something you used to want from a partner that I've helped you stop needing?",
  "What's a small moment between us you think about more than I'd guess?",
  "If we made a documentary about our relationship, what would the title be?",
  "What's a memory of us that has gotten softer — or sharper — with time?",
  "What's a fear about us you've been quietly carrying lately?",
  "What's something I do that you hope I never stop?",
];

/** Stable question for the day, indexed by day-of-year. */
export function questionOfTheDay(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86_400_000);
  return QUESTIONS[dayOfYear % QUESTIONS.length];
}

/** Random different-from-current question — for the 'ask another' button. */
export function randomQuestion(excluding?: string): string {
  if (QUESTIONS.length === 0) return "";
  if (QUESTIONS.length === 1) return QUESTIONS[0];
  let q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
  let safety = 0;
  while (q === excluding && safety++ < 12) {
    q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
  }
  return q;
}
