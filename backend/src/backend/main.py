import logging

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.database import init_db, get_db
from backend.schemas import (
    GenerateFlashcardsRequest,
    GeneratedFlashcards,
    FlashcardResponse,
    ReviewRequest,
)
from backend.flashcard_generator import generate_flashcards_from_notes, FlashcardGenerationError
from backend.spaced_repetition import review_flashcard
from backend import repository

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="StudyBuddy API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://<your-static-web-app-url>.azurestaticapps.net",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok", "service": "StudyBuddy API"}


@app.post("/generate-flashcards", response_model=list[FlashcardResponse])
def generate_flashcards(request: GenerateFlashcardsRequest, db: Session = Depends(get_db)):
    try:
        generated: GeneratedFlashcards = generate_flashcards_from_notes(request.notes)
    except FlashcardGenerationError as e:
        raise HTTPException(status_code=502, detail=str(e))

    saved = repository.save_generated_flashcards(db, generated)
    return saved


@app.get("/flashcards", response_model=list[FlashcardResponse])
def list_flashcards(db: Session = Depends(get_db)):
    return repository.get_all_flashcards(db)


@app.get("/flashcards/due", response_model=list[FlashcardResponse])
def list_due_flashcards(db: Session = Depends(get_db)):
    return repository.get_due_flashcards(db)


@app.post("/flashcards/{flashcard_id}/review", response_model=FlashcardResponse)
def review_flashcard_endpoint(
    flashcard_id: int, request: ReviewRequest, db: Session = Depends(get_db)
):
    flashcard = repository.get_flashcard_by_id(db, flashcard_id)
    if flashcard is None:
        raise HTTPException(status_code=404, detail=f"Flashcard {flashcard_id} not found.")

    result = review_flashcard(
        repetition=flashcard.repetition,
        interval=flashcard.interval,
        ease_factor=flashcard.ease_factor,
        rating=request.rating,
    )

    updated = repository.update_flashcard_review(
        db,
        flashcard,
        repetition=result.repetition,
        interval=result.interval,
        ease_factor=result.ease_factor,
        due_date=__import__("datetime").datetime.fromisoformat(result.due_date),
        last_reviewed=__import__("datetime").datetime.fromisoformat(result.last_reviewed),
    )
    return updated
# Serve React frontend in production
FRONTEND_DIST = Path(__file__).resolve().parents[3] / "frontend" / "dist"

if FRONTEND_DIST.exists():
    app.mount(
        "/assets",
        StaticFiles(directory=FRONTEND_DIST / "assets"),
        name="assets",
    )

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        requested_file = FRONTEND_DIST / full_path

        if requested_file.is_file():
            return FileResponse(requested_file)

        return FileResponse(FRONTEND_DIST / "index.html")