/**
 * usePlaceReviews.js
 * Fetches reviews for a place.
 * Strategy:
 *   1. If the place object already has a `reviews` array → use it directly.
 *   2. Otherwise if we have a tripId (the user has added the place to a trip)
 *      → call GET /api/v1/trips/{id}/reviews to get user-submitted reviews.
 *   3. Fall back to an empty array (no static dummies).
 */

import { useState, useEffect } from "react";
import tripService from "../services/tripService";

export function usePlaceReviews(place, tripId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Case 1: place already carries reviews
    if (Array.isArray(place?.reviews) && place.reviews.length > 0) {
      setReviews(
        place.reviews.map((r, i) => ({
          id: r.id || r.reviewId || i,
          name: r.displayName || r.name || "Traveller",
          rating: r.rating ?? 5,
          text: r.comment || r.text || "",
          avatar:
            r.profilePhotoUrl ||
            r.avatar ||
            `https://randomuser.me/api/portraits/${i % 2 === 0 ? "women" : "men"}/${(i % 10) + 1}.jpg`,
        }))
      );
      return;
    }

    // Case 2: we have a tripId → fetch trip reviews
    if (tripId) {
      setLoading(true);
      tripService
        .getTripById(tripId) // reuse existing method; no dedicated reviews endpoint here
        .then(() =>
          // The OpenAPI spec exposes GET /api/v1/trips/{id}/reviews
          // tripService doesn't have it yet, so we call it via the generic client
          import("../services/apiClient").then(({ default: apiClient }) =>
            apiClient.get(`/trips/${tripId}/reviews`)
          )
        )
        .then((res) => {
          const raw = Array.isArray(res.data) ? res.data : [];
          setReviews(
            raw.map((r, i) => ({
              id: r.tripReviewId || i,
              name: r.displayName || "Traveller",
              rating: r.rating ?? 5,
              text: r.comment || "",
              avatar: `https://randomuser.me/api/portraits/${i % 2 === 0 ? "women" : "men"}/${(i % 10) + 1}.jpg`,
            }))
          );
        })
        .catch((err) => {
          console.error("Failed to load trip reviews:", err);
          setReviews([]);
        })
        .finally(() => setLoading(false));
    }
  }, [place, tripId]);

  return { reviews, reviewsLoading: loading };
}