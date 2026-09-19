import { useState } from "react";
import { Sparkles } from "lucide-react";
import NotesInput from "./NotesInput";
import FileUpload from "./FileUpload";
import Button from "../common/Button";

const MIN_CHARS = 20;
const MAX_CHARS = 20000;

/**
 * Lets the person either paste notes or upload a .txt file, then submits
 * whichever text is present via onGenerate(notes).
 */
function GenerateForm({ onGenerate, submitting }) {
  const [tab, setTab] = useState("paste");
  const [notes, setNotes] = useState("");

  const trimmed = notes.trim();
  const canSubmit =
    trimmed.length >= MIN_CHARS && trimmed.length <= MAX_CHARS && !submitting;

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    onGenerate(trimmed);
  }

  return (
    <form className="generate-card" onSubmit={handleSubmit}>
      <div className="generate-tabs" role="tablist" aria-label="Notes input method">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "paste"}
          className={"generate-tab" + (tab === "paste" ? " active" : "")}
          onClick={() => setTab("paste")}
        >
          Paste Notes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "upload"}
          className={"generate-tab" + (tab === "upload" ? " active" : "")}
          onClick={() => setTab("upload")}
        >
          Upload File
        </button>
      </div>

      {tab === "paste" ? (
        <NotesInput value={notes} onChange={setNotes} />
      ) : (
        <FileUpload onTextExtracted={setNotes} />
      )}

      <Button
        type="submit"
        icon={Sparkles}
        size="lg"
        disabled={!canSubmit}
      >
        Generate Flashcards
      </Button>
    </form>
  );
}

export default GenerateForm;
