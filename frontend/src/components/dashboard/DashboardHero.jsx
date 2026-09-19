import { useNavigate } from "react-router-dom";
import { Sparkles, BookOpenCheck } from "lucide-react";
import Button from "../common/Button";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function DashboardHero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div>
        <span className="hero-greeting">
          {getGreeting()} — ready to strengthen your memory today?
        </span>
        <h1>Learn smarter. Remember longer.</h1>
        <p className="hero-description">
          Turn your notes into personalized AI flashcards and build
          knowledge that sticks, one review at a time.
        </p>
        <div className="hero-actions">
          <Button icon={Sparkles} onClick={() => navigate("/generate")}>
            Generate Flashcards
          </Button>
          <Button
            variant="secondary"
            icon={BookOpenCheck}
            onClick={() => navigate("/review")}
          >
            Start Review
          </Button>
        </div>
      </div>

      <div className="hero-cardstack" aria-hidden="true">
        <div className="stack-card" />
        <div className="stack-card" />
        <div className="stack-card">
          <BookOpenCheck />
        </div>
      </div>
    </section>
  );
}

export default DashboardHero;
