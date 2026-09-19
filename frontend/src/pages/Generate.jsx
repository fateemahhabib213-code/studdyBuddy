import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../services/api";
import Header from "../components/layout/Header";
import GenerateForm from "../components/flashcards/GenerateForm";
import ErrorState from "../components/common/ErrorState";
import Button from "../components/common/Button";

function Generate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function handleGenerate(notes) {
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const cards = await api.generateFlashcards(notes);
      setResult(cards);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong while generating your flashcards."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header
        title="Create your flashcards"
        subtitle="Turn your notes into personalized study cards with AI."
      />

      <div className="generate-layout">
        {submitting && (
          <div className="generate-card">
            <div className="generating-panel">
              <div className="generating-spinner" aria-hidden="true" />
              <h3>Creating your study deck...</h3>
              <p>Analyzing your notes and generating useful questions.</p>
            </div>
          </div>
        )}

        {!submitting && error && (
          <div className="generate-card">
            <ErrorState
              title="Generation failed"
              message={error}
              onRetry={() => setError(null)}
            />
          </div>
        )}

        {!submitting && !error && result && (
          <div className="generate-card">
            <div className="generating-panel">
              <div
                className="state-block-icon"
                style={{ background: "var(--color-success-soft)", color: "var(--color-success)" }}
              >
                ✓
              </div>
              <h3>{result.length} flashcards ready</h3>
              <p>Your new cards have been saved and are ready to review.</p>
              <div style={{ display: "flex", gap: "var(--space-3)" }}>
                <Button variant="secondary" onClick={() => setResult(null)}>
                  Generate more
                </Button>
                <Button onClick={() => navigate("/review")}>Start reviewing</Button>
              </div>
            </div>
          </div>
        )}

        {!submitting && !error && !result && (
          <GenerateForm onGenerate={handleGenerate} submitting={submitting} />
        )}
      </div>
    </>
  );
}

export default Generate;
