from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime

from backend.database import Base


class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False)
    answer = Column(String, nullable=False)

    repetition = Column(Integer, nullable=False, default=0)
    interval = Column(Integer, nullable=False, default=0)
    ease_factor = Column(Float, nullable=False, default=2.5)

    due_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    last_reviewed = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)