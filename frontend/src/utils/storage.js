/**
 * The backend is the source of truth for flashcards and review scheduling.
 * It does not track a "learning streak", so that one piece of state is
 * kept locally, derived from the dates the person actually completed a
 * review session on this device.
 */

const STREAK_KEY = "studybuddy.reviewDates";
const COUNTS_KEY = "studybuddy.reviewCounts";

function readDates() {
  try {
    const raw = window.localStorage.getItem(STREAK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function readCounts() {
  try {
    const raw = window.localStorage.getItem(COUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Call once per completed review. Marks today as an active study day
 * (for the streak) and increments today's review count (for the weekly
 * progress chart).
 */
export function recordReviewToday() {
  const key = todayKey();

  const dates = readDates();
  if (!dates.includes(key)) {
    dates.push(key);
    try {
      window.localStorage.setItem(STREAK_KEY, JSON.stringify(dates));
    } catch {
      // Ignore storage failures — streak is a nice-to-have, not core data.
    }
  }

  const counts = readCounts();
  counts[key] = (counts[key] || 0) + 1;
  try {
    window.localStorage.setItem(COUNTS_KEY, JSON.stringify(counts));
  } catch {
    // Same as above — non-critical local state.
  }
}

/**
 * Returns the last 7 days (oldest first) with how many reviews were
 * completed on each, for the Weekly Progress chart. Days with no
 * reviews show a count of 0 rather than being omitted, so the chart
 * always has 7 bars.
 */
export function getWeeklyReviewCounts() {
  const counts = readCounts();
  const days = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = todayKey(date);
    days.push({
      date: key,
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      count: counts[key] || 0,
    });
  }

  return days;
}

/** Returns the current consecutive-day streak, counting back from today. */
export function getCurrentStreak() {
  const dates = new Set(readDates());
  let streak = 0;
  const cursor = new Date();

  // Today counts only if already reviewed; otherwise start counting from yesterday
  // so a streak isn't broken just because today hasn't happened yet.
  if (!dates.has(todayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (dates.has(todayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
