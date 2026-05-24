/**
 * Daily-action todo state + streak tracking.
 *
 *   • Todos are stored per-day, keyed by date — opening the app on a new
 *     day naturally resets all three to unchecked.
 *   • Streak counts consecutive days with at least one completion.
 *     Marking your first action of the day increments the streak (or
 *     resets to 1 if you skipped yesterday).
 */
import { useEffect, useState, useCallback } from "react";

export type TodoKey = "deepQuestion" | "voiceMemo" | "faceTime";

export type DailyTodos = {
  date: string; // YYYY-MM-DD in local time
  deepQuestion: boolean;
  voiceMemo: boolean;
  faceTime: boolean;
};

export type Streak = {
  current: number;
  longest: number;
  /** Last day where at least one todo was completed. */
  lastActiveDate: string;
};

const TODOS_KEY = "ldl-todos:v1";
const STREAK_KEY = "ldl-streak:v1";

function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function todayStr(): string {
  return formatDate(new Date());
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

function emptyTodos(): DailyTodos {
  return {
    date: todayStr(),
    deepQuestion: false,
    voiceMemo: false,
    faceTime: false,
  };
}

function emptyStreak(): Streak {
  return { current: 0, longest: 0, lastActiveDate: "" };
}

function loadTodos(): DailyTodos {
  if (typeof window === "undefined") return emptyTodos();
  try {
    const raw = window.localStorage.getItem(TODOS_KEY);
    if (!raw) return emptyTodos();
    const parsed = JSON.parse(raw) as DailyTodos;
    if (parsed.date !== todayStr()) return emptyTodos();
    return parsed;
  } catch {
    return emptyTodos();
  }
}

function loadStreak(): Streak {
  if (typeof window === "undefined") return emptyStreak();
  try {
    const raw = window.localStorage.getItem(STREAK_KEY);
    if (!raw) return emptyStreak();
    return JSON.parse(raw) as Streak;
  } catch {
    return emptyStreak();
  }
}

function saveTodos(t: DailyTodos) {
  try {
    window.localStorage.setItem(TODOS_KEY, JSON.stringify(t));
  } catch {}
}
function saveStreak(s: Streak) {
  try {
    window.localStorage.setItem(STREAK_KEY, JSON.stringify(s));
  } catch {}
}

/** Streak number shown to the user (0 if broken). */
export function displayedStreak(s: Streak): number {
  if (!s.lastActiveDate) return 0;
  if (s.lastActiveDate === todayStr()) return s.current;
  if (s.lastActiveDate === yesterdayStr()) return s.current;
  return 0;
}

/** Bump the streak when the user completes their first action today. */
function bumpStreak(s: Streak): Streak {
  const today = todayStr();
  if (s.lastActiveDate === today) return s; // already counted today
  const next: Streak = {
    ...s,
    lastActiveDate: today,
    current: s.lastActiveDate === yesterdayStr() ? s.current + 1 : 1,
    longest: 0,
  };
  next.longest = Math.max(s.longest, next.current);
  return next;
}

/* ──────────────────────────────────────────────────────────────── */
/* Hook                                                              */
/* ──────────────────────────────────────────────────────────────── */

export function useDailyTodos() {
  const [todos, setTodos] = useState<DailyTodos>(emptyTodos);
  const [streak, setStreak] = useState<Streak>(emptyStreak);

  // Hydrate from storage after mount (client-only).
  useEffect(() => {
    setTodos(loadTodos());
    setStreak(loadStreak());
  }, []);

  const setAndPersistTodos = useCallback((updater: (prev: DailyTodos) => DailyTodos) => {
    setTodos((prev) => {
      const next = updater(prev);
      saveTodos(next);
      return next;
    });
  }, []);

  const setAndPersistStreak = useCallback((updater: (prev: Streak) => Streak) => {
    setStreak((prev) => {
      const next = updater(prev);
      saveStreak(next);
      return next;
    });
  }, []);

  /** Toggle a todo on/off. Bumps the streak the first time anything's done today. */
  const toggle = useCallback(
    (key: TodoKey) => {
      setAndPersistTodos((prev) => {
        const wasAnyDone =
          prev.deepQuestion || prev.voiceMemo || prev.faceTime;
        const nextValue = !prev[key];
        const next = { ...prev, [key]: nextValue };
        const nowAnyDone = next.deepQuestion || next.voiceMemo || next.faceTime;
        // Streak bumps only on the first completion of the day.
        if (!wasAnyDone && nowAnyDone) {
          setAndPersistStreak((s) => bumpStreak(s));
        }
        return next;
      });
    },
    [setAndPersistStreak, setAndPersistTodos]
  );

  /** Mark a todo complete (idempotent). Used when an action button is tapped. */
  const markDone = useCallback(
    (key: TodoKey) => {
      setAndPersistTodos((prev) => {
        if (prev[key]) return prev;
        const wasAnyDone =
          prev.deepQuestion || prev.voiceMemo || prev.faceTime;
        const next = { ...prev, [key]: true };
        if (!wasAnyDone) {
          setAndPersistStreak((s) => bumpStreak(s));
        }
        return next;
      });
    },
    [setAndPersistStreak, setAndPersistTodos]
  );

  return { todos, streak, toggle, markDone };
}
