/**
 * Centralized API client for the StudyBuddy backend.
 *
 * Every network call in the app goes through this file. If the backend's
 * route paths ever change, this is the only place that needs updating.
 *
 * NOTE: The spec this app was built against assumed routes prefixed with
 * /api (e.g. POST /api/flashcards/generate). The actual running backend
 * does not use that prefix, so the ENDPOINTS map below points at the
 * real routes. Change ENDPOINTS if the backend's paths change.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const ENDPOINTS = {
  generate: "/generate-flashcards",
  list: "/flashcards",
  due: "/flashcards/due",
  review: (id) => `/flashcards/${id}/review`,
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (err) {
    throw new ApiError(
      "Can't reach the StudyBuddy server. Make sure the backend is running.",
      0
    );
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      (typeof data === "string" ? data : null) ||
      `Something went wrong (status ${response.status}).`;
    throw new ApiError(message, response.status);
  }

  return data;
}

export const api = {
  /** Sends raw notes text to the backend and returns the saved flashcards. */
  generateFlashcards: (notes) =>
    request(ENDPOINTS.generate, {
      method: "POST",
      body: JSON.stringify({ notes }),
    }),

  /** Returns every flashcard, most recently created first. */
  getAllFlashcards: () => request(ENDPOINTS.list),

  /** Returns only flashcards whose due date has passed. */
  getDueFlashcards: () => request(ENDPOINTS.due),

  /** Submits a review rating for one flashcard and returns its updated state. */
  reviewFlashcard: (id, rating) =>
    request(ENDPOINTS.review(id), {
      method: "POST",
      body: JSON.stringify({ rating }),
    }),
};
