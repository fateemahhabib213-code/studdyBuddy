const MIN_CHARS = 20;
const MAX_CHARS = 20000;

/**
 * The paste-notes textarea. Enforces the same min/max length the backend
 * validates, so the person gets feedback before submitting rather than
 * after a request round-trip.
 */
function NotesInput({ value, onChange }) {
  const count = value.length;
  const tooShort = count > 0 && count < MIN_CHARS;
  const tooLong = count > MAX_CHARS;

  return (
    <div>
      <textarea
        className="notes-textarea"
        placeholder="Paste your notes here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Notes to generate flashcards from"
      />
      <div className={"notes-meta" + (tooShort || tooLong ? " warn" : "")}>
        <span>
          {tooShort && `Add at least ${MIN_CHARS - count} more characters`}
          {tooLong && "Notes are too long — please shorten them"}
        </span>
        <span>
          {count.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
        </span>
      </div>
    </div>
  );
}

export default NotesInput;
