import { useNavigate } from "react-router-dom";
import { Layers, Clock, Flame, Trophy } from "lucide-react";
import StatCard from "../common/StatCard";

/**
 * `stats` shape: { total, due, streak, mastered }
 */
function StatsGrid({ stats }) {
  const navigate = useNavigate();
  const hasStreak = stats.streak > 0;

  return (
    <div className="stats-grid">
      <StatCard
        icon={Layers}
        label="Flashcards"
        value={stats.total}
        tone="primary"
        onClick={() => navigate("/flashcards")}
      />

      <StatCard
        icon={Clock}
        label="Due Today"
        value={stats.due}
        tone="warning"
        onClick={() => navigate("/review")}
      />

      <StatCard
        icon={Flame}
        label="Learning Streak"
        value={hasStreak ? `${stats.streak}d` : "—"}
        tone="info"
        highlight={hasStreak}
        footnote={hasStreak ? undefined : "Start your streak today!"}
      />

      <StatCard
        icon={Trophy}
        label="Mastered"
        value={stats.mastered}
        tone="success"
        footnote={
          stats.mastered === 0
            ? "Complete your first review to earn one."
            : undefined
        }
      />
    </div>
  );
}

export default StatsGrid;
