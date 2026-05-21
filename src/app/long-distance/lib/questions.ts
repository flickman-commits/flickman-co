/**
 * Deep-question bank for the daily prompt.
 * Index is picked from day-of-year so the same question shows all day,
 * and rolls over each midnight.
 */
export const QUESTIONS: string[] = [
  "What's a small thing they did this week that made you smile?",
  "If you could teleport to them right now, what would you do first?",
  "What's a memory together you keep replaying?",
  "What's something you want to tell them but haven't yet?",
  "What part of your day reminded you of them today?",
  "What's a song that makes you think of them?",
  "What's a place you want to take them someday?",
  "What's something they've taught you about love?",
  "What's a small daily ritual you wish you shared?",
  "What were you doing the first time you knew you loved them?",
  "What's a question you've always wanted to ask them?",
  "What's a fear about distance you haven't said out loud?",
  "What's a tiny win you want to celebrate with them tonight?",
  "What's something they smell, look like, or say that you miss most?",
  "What's a habit of theirs you've started doing yourself?",
  "What's an inside joke that still makes you laugh alone?",
  "What's a future you can clearly picture with them?",
  "What's something they do that always makes you feel safe?",
  "Where do you feel them most when you can't see them?",
  "What's one thing you want to learn together this year?",
  "What's the hardest part of today being apart? Why?",
  "What's the best part of today being apart? (yes, really)",
  "What's something old of theirs you wish you had with you?",
  "If you both had a totally free Saturday — what would the ideal look like?",
  "What's a compliment you've been meaning to give them?",
  "What's a quiet way they love you that you sometimes miss?",
  "When this distance is over, what's the first month going to look like?",
  "What's one fear you can let go of, even just a little, today?",
  "What's something only they would understand about your day?",
  "What's a tiny promise you want to make to them right now?",
];

export function questionOfTheDay(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86_400_000);
  return QUESTIONS[dayOfYear % QUESTIONS.length];
}
