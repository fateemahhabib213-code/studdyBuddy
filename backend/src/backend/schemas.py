from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Literal


class GenerateFlashcardsRequest(BaseModel):
    notes: str = Field(..., description="Raw notes text to generate flashcards from")

    @field_validator("notes")
    @classmethod
    def notes_must_be_reasonable_length(cls, v: str) -> str:
        stripped = v.strip()
        if len(stripped) < 20:
            raise ValueError("Notes are too short to generate meaningful flashcards (min 20 characters).")
        if len(stripped) > 20000:
            raise ValueError("Notes are too long (max 20,000 characters). Please shorten and try again.")
        return stripped


class FlashcardOut(BaseModel):
    question: str
    answer: str

    @field_validator("question", "answer")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Flashcard question/answer cannot be empty.")
        return v.strip()


class GeneratedFlashcards(BaseModel):
    """Shape we expect back from OpenAI, validated before anything touches the DB."""
    flashcards: list[FlashcardOut]

    @field_validator("flashcards")
    @classmethod
    def must_have_at_least_one(cls, v: list[FlashcardOut]) -> list[FlashcardOut]:
        if len(v) == 0:
            raise ValueError("No flashcards were generated.")
        return  v
class FlashcardResponse(BaseModel):
    id: int
    question: str
    answer: str
    repetition: int
    interval: int
    ease_factor: float
    due_date: datetime
    last_reviewed: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}  # allows building this from a SQLAlchemy row


class ReviewRequest(BaseModel):
    rating: Literal["again", "hard", "good", "easy"]