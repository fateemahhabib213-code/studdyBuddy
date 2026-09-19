from datetime import datetime, timedelta
from typing import Literal, NamedTuple

Rating = Literal["again", "hard", "good", "easy"]

# Maps our four user-facing ratings to the SM-2 "quality of recall" score (0-5).
# This mapping is intentionally simplified (Anki-style) rather than using
# the full 0-5 range SM-2 originally defines:
#   again -> 0  : total blackout, did not recall at all -> reset progress
#   hard  -> 3  : recalled, but with real difficulty -> still counts as a pass
#   good  -> 4  : recalled correctly with some effort
#   easy  -> 5  : recalled correctly and effortlessly
RATING_TO_QUALITY: dict[Rating, int] = {
    "again": 0,
    "hard": 3,
    "good": 4,
    "easy": 5,
}

MIN_EASE_FACTOR = 1.3
DEFAULT_EASE_FACTOR = 2.5


class ReviewResult(NamedTuple):
    repetition: int
    interval: int
    ease_factor: float
    due_date: str  # ISO datetime string
    last_reviewed: str  # ISO datetime string


def review_flashcard(
    *,
    repetition: int,
    interval: int,
    ease_factor: float,
    rating: Rating,
    now: datetime | None = None,
) -> ReviewResult:
    """
    Applies one SM-2-style review step to a flashcard's current scheduling
    state and returns its updated state.

    This is a pure function: it does not touch the database. The caller
    (a service/repository layer) is responsible for persisting the result.
    """
    if rating not in RATING_TO_QUALITY:
        raise ValueError(f"Invalid rating: {rating!r}")

    now = now or datetime.utcnow()
    quality = RATING_TO_QUALITY[rating]

    if quality < 3:
        # Failed recall: reset progress, review again soon.
        new_repetition = 0
        new_interval = 1
    else:
        # Successful recall: grow the interval.
        if repetition == 0:
            new_interval = 1
        elif repetition == 1:
            new_interval = 6
        else:
            new_interval = round(interval * ease_factor)
        new_repetition = repetition + 1

    # Ease factor update (standard SM-2 formula), clamped to a minimum
    # so cards never become impossibly hard to graduate.
    new_ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    new_ease_factor = max(MIN_EASE_FACTOR, round(new_ease_factor, 2))

    due_date = now + timedelta(days=new_interval)

    return ReviewResult(
        repetition=new_repetition,
        interval=new_interval,
        ease_factor=new_ease_factor,
        due_date=due_date.isoformat(),
        last_reviewed=now.isoformat(),
    )