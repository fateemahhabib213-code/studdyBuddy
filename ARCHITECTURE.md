# StudyBuddy — Architecture

This document explains how StudyBuddy is put together and why it's built
the way it is. It matches the actual implementation, not the original
spec — a few details (endpoint paths, package manager, ORM choice)
changed during development, and this file reflects what was actually
built.

---

## 1. Overall Architecture

```
┌──────────────────┐        HTTP/JSON         ┌───────────────────────┐
│  React + Vite      │ ───────────────────────> │   FastAPI Backend      │
│  (frontend)          │ <─────────────────────── │   (src/backend/)         │
└──────────────────┘                          └───────────┬───────────┘
                                                            │
                                        ┌───────────────────┼───────────────────┐
                                        ▼                                       ▼
                                ┌──────────────┐                      ┌─────────────────┐
                                │  OpenAI API    │                      │  SQLite            │
                                │  (server-side)   │                      │  studybuddy.db     │
                                └──────────────┘                      └─────────────────┘
```

The frontend never talks to OpenAI or the database directly — every
interaction goes through the FastAPI backend over plain JSON HTTP.

---

## 2. Backend Architecture

The backend follows a layered structure, each layer only calling the one
below it:

```
main.py (routes)
   ↓
flashcard_generator.py / spaced_repetition.py (services)
   ↓
repository.py
   ↓
database.py (SQLAlchemy engine/session) → studybuddy.db
```

- **`main.py`** — route handlers only. Each one parses the request
  (validated automatically by Pydantic), calls into a service or
  repository function, and maps the result — or a caught exception — to
  an HTTP response. No SQL, no OpenAI calls, and no scheduling logic live
  here.
- **`flashcard_generator.py`** — the only file that talks to OpenAI. Wraps
  the API call, JSON parsing, and Pydantic validation of the response
  behind a single function that either returns a valid `GeneratedFlashcards`
  object or raises one exception type (`FlashcardGenerationError`) that the
  route layer knows how to handle.
- **`spaced_repetition.py`** — a pure function with no I/O at all. It takes
  a card's current scheduling state plus a rating and returns its new
  state. Being pure made it possible to write and verify
  (`test_spaced_repetition.py`) before any database or API code existed.
- **`repository.py`** — the only file that issues SQLAlchemy queries.
  Nothing else imports `SessionLocal` directly.
- **`database.py`** — engine, session factory, table creation
  (`init_db()`), and the `get_db()` FastAPI dependency that yields a
  session per request and always closes it afterward.

**Deviation from the original plan:** the spec called for raw `sqlite3`
and a `venv`/`requirements.txt` setup. The project was actually built with
`uv` (a `src/backend/` layout) and SQLAlchemy as the ORM instead of raw
`sqlite3`, based on how the project was initialized early on. The layering
principle (routes → services → repository → database) stayed the same;
only the specific tools changed.

---

## 3. Request Flow — Generating Flashcards

```
1. User pastes notes (or uploads a .txt file, read client-side) on the
   Generate page.
2. Frontend: POST /generate-flashcards  { "notes": "..." }
3. FastAPI validates the request body (GenerateFlashcardsRequest):
   rejects notes under 20 or over 20,000 characters with a 422,
   before any OpenAI call is made.
4. flashcard_generator.py sends the notes to OpenAI (gpt-4o-mini,
   response_format={"type": "json_object"}, temperature 0.3).
5. The raw response is JSON-parsed, then validated against
   GeneratedFlashcards (Pydantic): must be a non-empty list of
   {question, answer} pairs, neither field empty.
   - Any failure at this stage (OpenAI error, timeout, malformed JSON,
     schema mismatch) raises FlashcardGenerationError.
6. main.py catches FlashcardGenerationError and returns 502 with a
   plain-language detail message. Nothing is saved on failure.
7. On success, repository.save_generated_flashcards() inserts one row
   per card with repetition=0, interval=0, ease_factor=2.5, and
   due_date=now (so new cards are immediately due).
8. The saved rows (now including database-assigned ids) are returned to
   the frontend and rendered.
```

---

## 4. OpenAI Integration

- Model: `gpt-4o-mini`, called once per generation request.
- `response_format={"type": "json_object"}` forces syntactically valid
  JSON back from the model — this doesn't guarantee the *shape* is
  correct, which is why Pydantic validation is still a separate step.
- The system/user prompt explicitly instructs the model to only use
  information present in the notes, not invent facts, and return 5–10
  cards.
- The API key is loaded once in `config.py` from `backend/.env` and used
  to construct a single `OpenAI` client at import time in
  `flashcard_generator.py`. It is never read, referenced, or logged
  anywhere in the frontend.
- Every OpenAI-specific exception (`RateLimitError`, `APITimeoutError`,
  `APIError`) is caught individually and re-raised as the generic
  `FlashcardGenerationError` with a message appropriate for an end user —
  the frontend never sees an OpenAI SDK exception or a raw traceback.

---

## 5. Database Design

Single table, `flashcards`:

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Autoincrement |
| `question` | VARCHAR | Not null |
| `answer` | VARCHAR | Not null |
| `repetition` | INTEGER | Default `0` — consecutive successful reviews |
| `interval` | INTEGER | Default `0` — days until next review |
| `ease_factor` | FLOAT | Default `2.5`, floor `1.3` |
| `due_date` | DATETIME | When the card next becomes reviewable |
| `last_reviewed` | DATETIME, nullable | `NULL` until the first review |
| `created_at` | DATETIME | Set once, at generation time |

One table, one flashcard "pool" — there is intentionally no deck/category
table. Multi-deck organization was scoped out as a non-goal from the
start (see Phase 1 planning) to keep the project focused; the frontend's
"Upcoming Reviews" list and flashcard rows reflect this by never showing
a deck name.

`GET /flashcards/due` filters with `due_date <= now`, and `GET /flashcards`
returns everything ordered by `created_at desc` — no separate index was
added since the dataset size for a single-user local app doesn't warrant
one.

---

## 6. Review Flow

```
1. Frontend: GET /flashcards/due  →  queue of cards due right now.
2. User reveals the answer, picks a rating (Again / Hard / Good / Easy).
3. Frontend: POST /flashcards/{id}/review  { "rating": "good" }
4. main.py loads the card via repository.get_flashcard_by_id().
   - Not found → 404 with a clear detail message.
5. spaced_repetition.review_flashcard() is called with the card's
   current repetition/interval/ease_factor and the rating. This function
   has no knowledge of the database — it just computes and returns the
   new state.
6. repository.update_flashcard_review() writes the new
   repetition/interval/ease_factor/due_date/last_reviewed back to the row.
7. The updated card is returned; the frontend shows "Next review: in N
   days" and advances to the next card in the local queue.
```

The queue itself (which cards are left to review in this session) is
frontend-only state — the backend has no concept of a "session", only of
individual card due-dates. This keeps the backend stateless between
requests and matches the fact that "session" is a UI convenience, not
data that needs to persist.

---

## 7. Spaced Repetition Algorithm

See `README.md` → **Spaced Repetition** for the rating-to-quality mapping
and interval rules. The implementation detail worth calling out here:
`review_flashcard()` in `spaced_repetition.py` is a pure function
(keyword-only arguments, no default mutable state, an injectable `now`
parameter for testability) specifically so it could be written and
verified in isolation, before the database or API layers existed. This
ordering — build and test the algorithm first, wire it into the app
second — is why `test_spaced_repetition.py` exists as a standalone script
rather than only being exercised indirectly through the API.

---

## 8. Frontend Architecture

```
main.jsx → App.jsx (React Router) → AppLayout (Sidebar / MobileNav)
   → Dashboard | Generate | Review | Flashcards
```

- **`services/api.js`** — the only file that calls `fetch`. Every page
  goes through the `api` object it exports. Network failures, non-2xx
  responses, and unparseable bodies are all normalized into a single
  `ApiError` type with a readable `.message`, so every page can handle
  errors the same way.
- **Pages own their data fetching** (`useEffect` + local `useState`);
  there is no global state store, since each page's data is independent
  and the backend is the single source of truth. The one exception is the
  **learning streak and weekly review counts**, which the backend doesn't
  track — these are read/written directly to `localStorage` in
  `utils/storage.js`, intentionally kept separate from the API layer so
  it's clear which data is authoritative (backend) and which is a local
  convenience (streak).
- **`utils/flashcardStatus.js`** derives a card's Due/Learning/Mastered
  status from its raw `interval`/`due_date` fields (a card becomes
  "Mastered" once its interval reaches 21 days). This logic lives in one
  place so the Dashboard and Flashcards page can never disagree about a
  card's status.
- **Components are grouped by feature** (`dashboard/`, `flashcards/`,
  `review/`) plus a `common/` folder for primitives (`Button`,
  `LoadingState`, `ErrorState`, `EmptyState`, `StatCard`) reused across
  every page, so loading/error/empty states look and behave identically
  everywhere rather than being reimplemented per page.

---

## 9. Important Design Decisions

- **No authentication.** StudyBuddy is a single-user local app; adding
  auth would add complexity without a corresponding requirement.
- **No multi-deck organization.** All flashcards live in one pool. This
  was scoped out early to keep the review-scheduling logic and UI simple;
  it's the main candidate for a future addition if needed.
- **SQLite over Postgres/MySQL.** Appropriate for a single-user, local,
  file-based app; the repository layer isolates all query logic, so
  swapping the database engine later would only touch `database.py` and
  `repository.py`.
- **File upload reads client-side only.** The backend has no file-upload
  endpoint — `.txt` files are read directly in the browser
  (`FileReader`) and their text is sent through the same
  `/generate-flashcards` endpoint as pasted notes. No unsupported file
  type (PDF, DOCX) is silently accepted.
- **Pure function for the scheduling algorithm.** Keeping
  `spaced_repetition.py` free of database/network dependencies made it
  independently testable and is why it was the first piece of business
  logic built, ahead of the API routes that use it.
