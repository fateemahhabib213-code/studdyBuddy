import { useEffect, useState } from "react";
import { api, ApiError } from "../services/api";
import { countByStatus } from "../utils/flashcardStatus";
import { getCurrentStreak, getWeeklyReviewCounts } from "../utils/storage";
import DashboardHero from "../components/dashboard/DashboardHero";
import StatsGrid from "../components/dashboard/StatsGrid";
import WeeklyProgressChart from "../components/dashboard/WeeklyProgressChart";
import UpcomingReviews from "../components/dashboard/UpcomingReviews";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";

function Dashboard() {
  const [cards, setCards] = useState(null);
  const [dueCards, setDueCards] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    setError(null);
    setCards(null);
    setDueCards(null);
    try {
      // Fetched together since the dashboard needs both the full set
      // (for stats) and the due subset (for Upcoming Reviews).
      const [all, due] = await Promise.all([
        api.getAllFlashcards(),
        api.getDueFlashcards(),
      ]);
      setCards(all);
      setDueCards(due);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load your dashboard.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const loading = cards === null && !error;

  return (
    <>
      <DashboardHero />

      <section className="section">
        {loading && <LoadingState label="Loading your progress" />}

        {error && <ErrorState message={error} onRetry={load} />}

        {cards !== null && dueCards !== null && !error && (
          <>
            <StatsGrid
              stats={{
                total: cards.length,
                ...countByStatus(cards),
                streak: getCurrentStreak(),
              }}
            />

            <WeeklyProgressChart days={getWeeklyReviewCounts()} />

            <UpcomingReviews dueCards={dueCards} />
          </>
        )}
      </section>
    </>
  );
}

export default Dashboard;
