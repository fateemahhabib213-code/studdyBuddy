import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../services/api";
import { getFlashcardStatus, countByStatus } from "../utils/flashcardStatus";
import Header from "../components/layout/Header";
import StatsGrid from "../components/dashboard/StatsGrid";
import { getCurrentStreak } from "../utils/storage";
import FlashcardList from "../components/flashcards/FlashcardList";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "due", label: "Due" },
  { value: "learning", label: "Learning" },
  { value: "mastered", label: "Mastered" },
];

function Flashcards() {
  const navigate = useNavigate();
  const [cards, setCards] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  async function load() {
    setError(null);
    setCards(null);
    try {
      const data = await api.getAllFlashcards();
      setCards(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't load your flashcards."
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredCards = useMemo(() => {
    if (!cards) return [];
    return cards.filter((card) => {
      const matchesFilter = filter === "all" || getFlashcardStatus(card) === filter;
      const matchesSearch =
        search.trim() === "" ||
        card.question.toLowerCase().includes(search.trim().toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [cards, search, filter]);

  return (
    <>
      <Header title="My Flashcards" subtitle="Every card you've generated, in one place." />

      {cards === null && !error && <LoadingState label="Loading your flashcards" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {cards !== null && !error && cards.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="Your study deck is waiting for you."
          description="Generate your first set of flashcards from your notes."
          actionLabel="Create Flashcards"
          onAction={() => navigate("/generate")}
        />
      )}

      {cards !== null && !error && cards.length > 0 && (
        <>
          <StatsGrid
            stats={{
              total: cards.length,
              ...countByStatus(cards),
              streak: getCurrentStreak(),
            }}
          />

          <div className="section">
            <div className="filter-bar">
              <div className="search-input-wrap">
                <Search />
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search flashcards..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search flashcards"
                />
              </div>
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  className={"filter-chip" + (filter === f.value ? " active" : "")}
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <FlashcardList
              cards={filteredCards}
              noResultsFromFilter={cards.length > 0}
            />
          </div>
        </>
      )}
    </>
  );
}

export default Flashcards;
