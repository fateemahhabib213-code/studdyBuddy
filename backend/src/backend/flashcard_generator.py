import json
import logging

from openai import OpenAI, APIError, APITimeoutError, RateLimitError
from pydantic import ValidationError

from backend.config import OPENAI_API_KEY
from backend.schemas import GeneratedFlashcards

logger = logging.getLogger(__name__)

client = OpenAI(api_key=OPENAI_API_KEY)


class FlashcardGenerationError(Exception):
    """Raised whenever flashcard generation fails for any reason.
    The route layer catches this and returns a clean HTTP error."""
    pass


SYSTEM_PROMPT = "You are a study assistant that creates accurate educational flashcards."

PROMPT_TEMPLATE = """Create study flashcards from the following notes.

Rules:
- Create clear and useful question-answer pairs.
- Only use information present in the notes.
- Do not invent information.
- Return 5 to 10 flashcards.
- Return ONLY valid JSON matching this exact shape:

{{
    "flashcards": [
        {{"question": "Question here", "answer": "Answer here"}}
    ]
}}

Notes:
{notes}
"""


def generate_flashcards_from_notes(notes: str) -> GeneratedFlashcards:
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": PROMPT_TEMPLATE.format(notes=notes)},
            ],
            temperature=0.3,
            response_format={"type": "json_object"},
        )
    except RateLimitError as e:
        logger.warning("OpenAI rate limit hit: %s", e)
        raise FlashcardGenerationError("The AI service is busy right now. Please try again shortly.") from e
    except APITimeoutError as e:
        logger.warning("OpenAI request timed out: %s", e)
        raise FlashcardGenerationError("The AI service took too long to respond. Please try again.") from e
    except APIError as e:
        logger.error("OpenAI API error: %s", e)
        raise FlashcardGenerationError("The AI service failed to generate flashcards. Please try again.") from e

    raw_content = response.choices[0].message.content

    if not raw_content:
        raise FlashcardGenerationError("The AI returned an empty response.")

    try:
        parsed = json.loads(raw_content)
    except json.JSONDecodeError as e:
        logger.error("OpenAI returned invalid JSON: %s", raw_content)
        raise FlashcardGenerationError("The AI returned an invalid response format.") from e

    try:
        validated = GeneratedFlashcards.model_validate(parsed)
    except ValidationError as e:
        logger.error("OpenAI response failed schema validation: %s", e)
        raise FlashcardGenerationError("The AI response did not match the expected flashcard format.") from e

    return validated