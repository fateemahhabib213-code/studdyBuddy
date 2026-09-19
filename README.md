# StudyBuddy — AI Flashcard Generator with Spaced Repetition

StudyBuddy turns raw notes into study flashcards using the OpenAI API, then
schedules reviews with a simplified SM-2 spaced repetition algorithm so the
cards you're most likely to forget come back around at the right time.

Built as a step-by-step learning project: a FastAPI backend with OpenAI
integration and SQLite persistence, and a React + Vite frontend for
generating, reviewing, and browsing flashcards.

---

## Features

- **Paste notes or upload a `.txt` file** and generate 5–10 question/answer
  flashcards with OpenAI.
- **Structured, validated AI output** — every generated flashcard is checked
  with Pydantic before it's saved; a malformed or failed AI response never
  reaches the database or the frontend as raw data.
- **SM-2-style spaced repetition** — each card tracks its own repetition
  count, interval, and ease factor, and reschedules itself after every
  review based on a four-option rating (Again / Hard / Good / Easy).
- **Persistent storage** — flashcards and their review schedule live in a
  local SQLite database and survive restarts.
- **Due-card filtering** — the Review page only pulls cards that are
  actually due, not the entire deck.
- **Dashboard** — total cards, cards due today, a 7-day review activity
  chart, and a local learning streak.
- **Clean error handling** throughout — invalid input, AI failures, network
  errors, and missing records all produce readable messages instead of
  crashes or raw stack traces.

---

## Tech Stack

**Backend**
- Python 3.11+, managed with [`uv`](https://docs.astral.sh/uv/)
- FastAPI
- SQLAlchemy (SQLite)
- Pydantic v2 (request/response validation)
- OpenAI Python SDK (`gpt-4o-mini`, structured JSON output mode)

**Frontend**
- React 18 + Vite
- React Router
- Plain CSS (custom design system, no UI framework)
- Lucide React (icons)

---

## Architecture

```
studybuddy/
├── backend/
│   ├── pyproject.toml         # uv project config (build backend: uv_build)
│   ├── .env                    # OPENAI_API_KEY (never committed)
│   ├── studybuddy.db           # SQLite database (created on first run)
│   └── src/backend/
│       ├── main.py             # FastAPI app + route handlers
│       ├── config.py           # Environment variable loading
│       ├── database.py         # SQLAlchemy engine, session, init_db()
│       ├── model.py            # Flashcard ORM model
│       ├── schemas.py          # Pydantic request/response schemas
│       ├── flashcard_generator.py  # OpenAI call + response validation
│       ├── repository.py       # All direct database queries
│       └── spaced_repetition.py    # Pure SM-2 scheduling function
│
└── frontend/
    └── src/
        ├── pages/               # Dashboard, Generate, Review, Flashcards
        ├── components/          # Reusable UI, grouped by feature area
        ├── services/api.js      # Single place all backend calls go through
        ├── utils/                # Date formatting, status derivation, local streak
        └── styles/               # Design tokens + component styles
```

The backend follows a layered structure: **routes → services → repository
→ database**. Route handlers in `main.py` stay thin — they call a service
or repository function and translate the result (or a raised exception)
into an HTTP response. `spaced_repetition.py` is a pure function with no
database or network dependency, which is what made it possible to test in
isolation before anything else was built.

---

## Installation

### Prerequisites
- Python 3.11+
- [`uv`](https://docs.astral.sh/uv/getting-started/installation/)
- Node.js 18+ and npm

### Backend

```bash
cd backend
uv sync
```

### Frontend

```bash
cd frontend
npm install
```

---

## Environment Variables

Create `backend/.env` (copy from `backend/.env.example`):

```
OPENAI_API_KEY=your_openai_api_key_here
```

The key is read only on the backend (`config.py`) and is never sent to or
exposed in the frontend. `.env` is git-ignored.

The frontend reads the backend's URL from `frontend/.env`:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## Running the Backend

```bash
cd backend
uv run uvicorn backend.main:app --reload
```

- API root: `http://127.0.0.1:8000`
- Interactive docs (Swagger UI): `http://127.0.0.1:8000/docs`
- Health check: `GET /health`

On first run, `studybuddy.db` and the `flashcards` table are created
automatically.

---

## Running the Frontend

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`. The backend must be running for any page
other than empty-state views to load data.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Basic liveness check |
| `POST` | `/generate-flashcards` | Generates flashcards from notes text via OpenAI, saves them, returns the saved cards (with `id`s) |
| `GET` | `/flashcards` | Returns every flashcard, most recently created first |
| `GET` | `/flashcards/due` | Returns only flashcards whose `due_date` has passed |
| `POST` | `/flashcards/{id}/review` | Submits a rating (`again` \| `hard` \| `good` \| `easy`), runs the SM-2 update, and returns the updated card |

**Example — generate flashcards**

```json
POST /generate-flashcards
{ "notes": "Photosynthesis is the process by which..." }
```

```json
[
  {
    "id": 1,
    "question": "What is photosynthesis?",
    "answer": "The process by which green plants convert light energy into chemical energy.",
    "repetition": 0,
    "interval": 0,
    "ease_factor": 2.5,
    "due_date": "2026-09-17T10:23:55",
    "last_reviewed": null,
    "created_at": "2026-09-17T10:23:55"
  }
]
```

**Example — submit a review**

```json
POST /flashcards/1/review
{ "rating": "good" }
```

Errors are returned as `{"detail": "readable message"}` with an
appropriate status code — `422` for invalid input, `404` for a missing
flashcard, `502` if OpenAI generation fails.

---

## Spaced Repetition

StudyBuddy uses a simplified SM-2 algorithm. Each card stores:

- `repetition` — how many times in a row it's been recalled successfully
- `interval` — days until the next review
- `ease_factor` — how quickly the interval grows (minimum `1.3`)
- `due_date` — when the card next becomes reviewable

The four user-facing ratings map to SM-2's 0–5 "quality of recall" scale:

| Rating | Quality | Meaning |
|---|---|---|
| Again | 0 | Did not recall it at all |
| Hard | 3 | Recalled it, but with real difficulty |
| Good | 4 | Recalled it correctly with some effort |
| Easy | 5 | Recalled it correctly and effortlessly |

- A quality below 3 (**Again**) resets `repetition` to 0 and sets the next
  interval to 1 day.
- The first successful review sets the interval to 1 day; the second sets
  it to 6 days; every review after that multiplies the previous interval
  by the current `ease_factor`.
- `ease_factor` is adjusted after every review using the standard SM-2
  formula, clamped to a minimum of `1.3` so a card never becomes
  impossible to graduate.

The algorithm lives in `spaced_repetition.py` as a single pure function
with no database dependency, and is covered by `test_spaced_repetition.py`.

---

## Screenshots

_Add screenshots of the Dashboard, Generate, Review, and Flashcards pages
here once the UI is finalized._

---

## Deployment

This project is currently set up for local development. To deploy:

1. **Backend** — host on any platform that runs a Python ASGI app (e.g.
   Render, Railway, Fly.io). Set `OPENAI_API_KEY` as a platform environment
   variable rather than a committed `.env` file. Swap SQLite for a hosted
   Postgres/MySQL instance if you need the data to survive redeploys or
   scale beyond a single instance, since SQLite is a local file.
2. **Frontend** — build a static bundle with `npm run build` in
   `frontend/` and deploy the resulting `dist/` folder to any static host
   (Vercel, Netlify, Cloudflare Pages). Set `VITE_API_BASE_URL` to your
   deployed backend's public URL at build time.
3. **CORS** — update the `allow_origins` list in `backend/src/backend/main.py`
   to include your deployed frontend's URL.
