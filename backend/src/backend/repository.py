from datetime import datetime
from sqlalchemy.orm import Session

from backend.model import Flashcard
from backend.schemas import GeneratedFlashcards


def save_generated_flashcards(db: Session, generated: GeneratedFlashcards) -> list[Flashcard]:
    """Persists AI-generated flashcards as new rows, ready to be reviewed immediately."""
    now = datetime.utcnow()
    rows = [
        Flashcard(
            question=card.question,
            answer=card.answer,
            repetition=0,
            interval=0,
            ease_factor=2.5,
            due_date=now,
            last_reviewed=None,
            created_at=now,
        )
        for card in generated.flashcards
    ]
    db.add_all(rows)
    db.commit()
    for row in rows:
        db.refresh(row)
    return rows


def get_all_flashcards(db: Session) -> list[Flashcard]:
    return db.query(Flashcard).order_by(Flashcard.created_at.desc()).all()


def get_due_flashcards(db: Session) -> list[Flashcard]:
    now = datetime.utcnow()
    return (
        db.query(Flashcard)
        .filter(Flashcard.due_date <= now)
        .order_by(Flashcard.due_date.asc())
        .all()
    )


def get_flashcard_by_id(db: Session, flashcard_id: int) -> Flashcard | None:
    return db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()


def update_flashcard_review(
    db: Session,
    flashcard: Flashcard,
    *,
    repetition: int,
    interval: int,
    ease_factor: float,
    due_date: datetime,
    last_reviewed: datetime,
) -> Flashcard:
    flashcard.repetition = repetition
    flashcard.interval = interval
    flashcard.ease_factor = ease_factor
    flashcard.due_date = due_date
    flashcard.last_reviewed = last_reviewed
    db.commit()
    db.refresh(flashcard)
    return flashcard