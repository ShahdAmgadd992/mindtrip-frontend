/**
 * useAddToTrip.js  – Final Fixed Version (v6 - AI Resilience + Confirmed Persist Fix)
 *
 * Bug fixes:
 * 1. ✅ Data Structure Mismatch Fixed
 * 2. ✅ formatPlanForBackend: فلتر بـ _slot بس — مش بـ indexOf (كان بيبوظ الترتيب)
 * 3. ✅ Auto-assign fallback: لو الـ AI edit فشل يرجع لـ findBestDay
 * 4. ✅ generatePlan 503/format errors: retry بـ backoff قبل ما نرجع لـ fallback، وفالييديشن
 *    على شكل الـ response قبل ما نبعتها لـ parsePlan
 * 5. ✅ 400 Validation Error: buildPlaceItem بيعمل Number()/String() coercion صريح لكل الحقول
 * 6. ✅ putPlan() helper: بيلف كل نداء PUT بصيغة { plan: {...} } الصحيحة وبيطبعها
 * 7. ✅ mustInclude بقى List<MustIncludePlace> مش string (نفس فيكس AiPlanner.jsx)
 * 8. ✅ Empty-trip fix: لو الـ AI فشل/رجع 0 places، المكان بيتحط force في Day 1
 * 9. ✅ Confirmed persist: بعد أي putPlan (create أو add-to-existing) بنعمل
 *    getTripById تاني ونرجّع الـ trip الحقيقي من السيرفر (فيه الـ accommodation/hotel)
 *    بدل م نعتمد على الـ local state
 */

import { useState, useCallback } from "react";
import tripService from "../services/tripService";
import aiService from "../services/aiService";

// ─── Budget calculation ───────────────────────────────────────────────────────
export const calcBudget = (tier, days, people) => {
  const economy = days * people * 1800;
  if (tier === "Economic")    return economy;
  if (tier === "Comfortable") return Math.round(economy * 1.5);
  if (tier === "Luxury")      return Math.round(economy * 1.5 * 1.5);
  return economy;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Convert backend Object { day1: { morning: [] } } to internal Array
const parsePlan = (rawPlan) => {
  if (!rawPlan) return [];
  if (typeof rawPlan === "string") {
    try { rawPlan = JSON.parse(rawPlan); } catch { return []; }
  }
  if (Array.isArray(rawPlan)) return rawPlan;
  if (rawPlan.days && Array.isArray(rawPlan.days)) return rawPlan.days;

  // Handle Backend Object format: { day1: { morning: [], afternoon: [], evening: [] } }
  const planArray = [];
  Object.keys(rawPlan).forEach((key) => {
    if (key.startsWith("day")) {
      const dayNum = parseInt(key.replace("day", ""), 10);
      const dayData = rawPlan[key];
      let places = [];

      if (Array.isArray(dayData)) {
        places = dayData;
      } else if (typeof dayData === "object" && dayData !== null) {
        // Tag each place with its slot so we can round-trip slot structure correctly
        const morning   = (dayData.morning   || []).map((p) => ({ ...p, _slot: "morning"   }));
        const afternoon = (dayData.afternoon || []).map((p) => ({ ...p, _slot: "afternoon" }));
        const evening   = (dayData.evening   || []).map((p) => ({ ...p, _slot: "evening"   }));
        places = [...morning, ...afternoon, ...evening];
      }
      planArray.push({ day: dayNum, places });
    }
  });

  planArray.sort((a, b) => a.day - b.day);
  // ✅ FIX: rawPlan.accommodation (the hotel) was silently dropped here because
  // this loop only ever looked at "day*" keys. Every downstream putPlan() call
  // then PUT a plan object with no accommodation field, and since the backend
  // replaces the whole plan rather than merging, the hotel (and its price)
  // disappeared from the trip after any add/move/remove-from-trip action.
  // Stash it on the array so callers can carry it through to putPlan().
  planArray.accommodation = rawPlan.accommodation ?? [];
  return planArray;
};

// ✅ FIX: Convert internal Array back to Backend Object format before API calls.
// Filters ONLY by _slot tag — never by index (index-based filtering broke slot order
// whenever a new place was prepended to the array, shifting all indices).
// Places with no _slot fallback to morning.
const formatPlanForBackend = (planArray, accommodation) => {
  const formatted = {};
  planArray.forEach((dayObj) => {
    const dayKey = `day${dayObj.day}`;
    const places = dayObj.places || [];

    const morning   = places.filter((p) => p._slot === "morning"   || !p._slot);
    const afternoon = places.filter((p) => p._slot === "afternoon");
    const evening   = places.filter((p) => p._slot === "evening");

    formatted[dayKey] = { morning, afternoon, evening };
  });
  // ✅ FIX: carry the hotel through — falls back to whatever parsePlan() stashed
  // on planArray.accommodation if the caller didn't pass one explicitly.
  formatted.accommodation = accommodation ?? planArray.accommodation ?? [];
  return formatted;
};

const findBestDay = (plan, totalDays) => {
  if (!plan || plan.length === 0) return 1;
  const counts = {};
  for (let d = 1; d <= totalDays; d++) counts[d] = 0;
  plan.forEach((dayObj) => {
    counts[dayObj.day] = (dayObj.places || []).length;
  });
  return Number(Object.entries(counts).sort((a, b) => a[1] - b[1])[0][0]);
};

const buildPlaceItem = (place, dayNumber) => {
  const mappedPlace = {
    place_id:      place?.place_id || null,
    name:          String(place?.title || place?.name || "Unknown Place"),
    day:           Number(dayNumber) || 1,
    type:          place?.type || null,
    category:      place?.category || null,
    price:         Number(place?.price) || 0,
    cost:          Number(place?.cost ?? place?.price) || 0,
    city:          place?.city || null,
    city_en:       place?.city || null,
    lat:           Number(place?.lat) || 0,
    lng:           Number(place?.lng) || 0,
    rating:        Number(place?.rating) || 0,
    reviews_count: Number(place?.reviews_count) || 0,
    address:       place?.address || null,
    description:   place?.description || null,
    photo_url:     place?.photo_url || place?.image || place?.image_urls?.[0] || null,
    image_urls:    place?.image_urls || [],
    maps_url:      place?.maps_url || null,
    interests:     place?.interests || [],
  };

  console.log("Mapped Place Item:", mappedPlace);
  return mappedPlace;
};

const sanitizePlaceFromAi = (rawPlace, dayNumber) => ({
  place_id:      rawPlace?.place_id || rawPlace?.id || null,
  name:          String(rawPlace?.name || rawPlace?.title || "Unknown Place"),
  day:           Number(dayNumber) || 1,
  type:          rawPlace?.type || null,
  category:      rawPlace?.category || null,
  price:         Number(rawPlace?.price ?? rawPlace?.cost) || 0,
  cost:          Number(rawPlace?.cost ?? rawPlace?.price) || 0,
  city:          rawPlace?.city || rawPlace?.city_en || null,
  city_en:       rawPlace?.city_en || rawPlace?.city || null,
  lat:           Number(rawPlace?.lat ?? rawPlace?.latitude) || 0,
  lng:           Number(rawPlace?.lng ?? rawPlace?.longitude) || 0,
  rating:        Number(rawPlace?.rating) || 0,
  reviews_count: Number(rawPlace?.reviews_count ?? rawPlace?.reviewsCount) || 0,
  address:       rawPlace?.address || null,
  description:   rawPlace?.description || null,
  photo_url:     rawPlace?.photo_url || rawPlace?.image || rawPlace?.image_urls?.[0] || rawPlace?.photos?.[0] || null,
  image_urls:    rawPlace?.image_urls || rawPlace?.photos || [],
  maps_url:      rawPlace?.maps_url || null,
  interests:     rawPlace?.interests || [],
  // ✅ FIX: preserve the morning/afternoon/evening slot tag that parsePlan()
  // attached. This was being dropped here, so by the time formatPlanForBackend()
  // ran, every place had _slot === undefined and its `!p._slot` fallback rule
  // swept ALL places (not just unslotted ones) into "morning" — collapsing the
  // whole generated day into a single slot even though the AI response itself
  // had them correctly split across morning/afternoon/evening.
  _slot:         rawPlace?._slot || undefined,
});

const sanitizePlanForApi = (rawPlan) => {
  if (!Array.isArray(rawPlan)) return [];
  const sanitized = rawPlan.map((dayObj) => {
    const dayNumber = Number(dayObj?.day) || 1;
    const places = Array.isArray(dayObj?.places) ? dayObj.places : [];
    return {
      day: dayNumber,
      places: places.map((p) => sanitizePlaceFromAi(p, dayNumber)),
    };
  });
  // ✅ FIX: same .map()-drops-accommodation issue as elsewhere in this file —
  // a freshly AI-generated plan's hotel was lost here before the very first
  // putPlan() on a newly created trip.
  sanitized.accommodation = rawPlan.accommodation ?? [];
  console.log("Sanitized AI plan (Array format):", sanitized);
  return sanitized;
};

const resolveInterests = (explicitInterests, place) => {
  if (Array.isArray(explicitInterests) && explicitInterests.length > 0) return explicitInterests;
  if (Array.isArray(place?.interests) && place.interests.length > 0) return place.interests;
  if (place?.category) return [place.category];
  if (place?.type) return [place.type];
  return [];
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ✅ FIX: generate-plan was failing intermittently with 503 ("Service Unavailable")
// or with a malformed body that broke parsePlan() downstream ("Service returned
// an unexpected response format"). Previously a single 503 permanently killed the
// AI plan for that request even though the AI service is usually back up within a
// couple seconds. We now retry transient failures (503/502/504, or no response at
// all e.g. timeout) with backoff before giving up and falling back to the
// place-only plan.
const isRetryableAiError = (err) => {
  const status = err?.response?.status;
  if (status === 503 || status === 502 || status === 504) return true;
  if (!err?.response) return true; // network error / timeout, no HTTP response at all
  return false;
};

const withAiRetry = async (fn, { attempts = 3, baseDelayMs = 800 } = {}) => {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRetryableAiError(err) || i === attempts - 1) throw err;
      await sleep(baseDelayMs * Math.pow(2, i)); // 800ms, then 1600ms
    }
  }
  throw lastErr;
};

// ✅ FIX: validate the AI response actually looks like a plan (object/array)
// before handing it to parsePlan(). Previously a malformed/empty body was
// silently treated as a valid "0 places" plan instead of a failure, which is
// what produced the empty-trip bug. Now it's explicitly rejected and falls
// through to the same place-only fallback as a network/503 failure.
const extractAiPlanOrThrow = (planRes) => {
  const rawAiPlan = planRes?.data?.plan ?? planRes?.data;
  const looksValid =
    rawAiPlan &&
    (Array.isArray(rawAiPlan) ||
      (typeof rawAiPlan === "object" && Object.keys(rawAiPlan).length > 0));
  if (!looksValid) {
    throw new Error("Service returned an unexpected response format.");
  }
  return rawAiPlan;
};

const putPlan = (tripId, planArray, accommodation) => {
  const formattedPlan = formatPlanForBackend(planArray, accommodation);
  const payload = { plan: formattedPlan };
  console.log("Final PUT Payload:", payload);
  return tripService.updateTripPlan(tripId, payload);
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAddToTrip(place, { onPlanUpdated } = {}) {
  const [trips,          setTrips]          = useState([]);
  const [tripsLoading,   setTripsLoading]   = useState(false);
  const [addedTripId,    setAddedTripId]    = useState(null);
  const [addedTripTitle, setAddedTripTitle] = useState("");
  const [currentDayNumber, setCurrentDayNumber] = useState(null);
  const [actionLoading,  setActionLoading]  = useState(false);
  const [error,          setError]          = useState(null);

  // ── Fetch & filter trips ────────────────────────────────────────────────────
  const fetchTrips = useCallback(async () => {
    setTripsLoading(true);
    setError(null);
    try {
      const res   = await tripService.getTrips({ Page: 1, PageSize: 50 });
      const items = res.data?.items || res.data?.data ||
                    (Array.isArray(res.data) ? res.data : []);
      const placeGov = place?.governorate || place?.destinationGovernorate || place?.city;

      const filtered = items
        .map((t) => ({ ...t, id: t.tripId, coverImage: t.coverImageUrl }))
        .filter((t) => {
          if (!placeGov) return true;
          const tGov = t.destinationGovernorate || t.city;
          return (
            !tGov ||
            tGov.toLowerCase().includes(placeGov.toLowerCase()) ||
            placeGov.toLowerCase().includes(tGov.toLowerCase())
          );
        });

      setTrips(filtered);
      return filtered;
    } catch (err) {
      setError("Failed to load trips.");
      console.error(err);
      return [];
    } finally {
      setTripsLoading(false);
    }
  }, [place]);

  // ── Path A: Add to EXISTING trip ───────────────────────────────────────────
  const addToExistingTrip = useCallback(
    async (tripId, daySelection) => {
      setActionLoading(true);
      setError(null);
      try {
        const tripRes  = await tripService.getTripById(tripId);
        const tripData = tripRes.data;
        let   plan     = parsePlan(tripData.plan);
        let   targetDay;

        if (daySelection === null) {
          targetDay = findBestDay(plan, tripData.durationDays || 1);
        } else {
          targetDay = Number(daySelection);
        }

        const placeName = place?.title || place?.name;
        const placeId   = place?.place_id;

        let dayEntry = plan.find((d) => Number(d.day) === targetDay);
        if (!dayEntry) {
          dayEntry = { day: targetDay, places: [] };
          plan.push(dayEntry);
        }

        // Remove any existing copy first (idempotent)
        dayEntry.places = (dayEntry.places || []).filter((p) =>
          (placeId && p.place_id) ? p.place_id !== placeId : p.name !== placeName
        );

        // Insert at the front of the morning slot
        const newPlaceItem = { ...buildPlaceItem(place, targetDay), _slot: "morning" };
        dayEntry.places = [newPlaceItem, ...dayEntry.places];

        await putPlan(tripId, plan);

        // ✅ FIX: refetch from the server after the PUT instead of trusting the
        // locally-built `tripData` — guarantees the returned trip (and what we
        // store in state) reflects exactly what's persisted, including the
        // accommodation/hotel block, even though this path never modifies it.
        let finalTripData = tripData;
        try {
          const finalRes = await tripService.getTripById(tripId);
          finalTripData = finalRes.data;
        } catch (fetchErr) {
          console.warn("Could not refetch trip after adding place:", fetchErr);
        }

        setCurrentDayNumber(targetDay);
        setAddedTripId(tripId);
        setAddedTripTitle(finalTripData.title || "your trip");

        onPlanUpdated?.({ tripId, day: targetDay });
        window.dispatchEvent(new CustomEvent("tripPlanUpdated", { detail: { tripId, day: targetDay } }));

        return { success: true, tripTitle: finalTripData.title, day: targetDay, trip: finalTripData };
      } catch (err) {
        const serverMsg =
          err?.response?.data?.detail ||
          err?.response?.data?.title  ||
          err?.message ||
          "Failed to add place to trip.";
        setError(serverMsg);
        console.error("addToExistingTrip failed:", err?.response?.data || err);
        return { success: false, error: serverMsg };
      } finally {
        setActionLoading(false);
      }
    },
    [place]
  );

  // ── Path B: Create NEW trip + generate AI plan ─────────────────────────────
  const createTripWithPlan = useCallback(
    async ({ startDate, endDate, budgetTier, people, interests }) => {
      setActionLoading(true);
      setError(null);
      try {
        // ✅ FIX: inclusive day count (1 Aug → 3 Aug = 3 days, not 2).
        // Math.ceil(diff/ms) was calculating the number of *nights* between
        // the two dates, not the calendar days the trip spans — this made
        // generate-plan receive days=2 for a 3-day trip, leaving the last
        // day empty in trip-result even though durationDays (computed
        // correctly elsewhere, e.g. Tripresult.jsx) showed 3.
        const days   = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);
        const budget = calcBudget(budgetTier, days, people);
        const city   = place?.city || "Cairo";

        // ✅ FIX: startDate/endDate arrive here as local-midnight Date objects
        // (new Date(year, month, day) from the calendar picker in TripDetails.jsx).
        // Calling .toISOString() directly on those converts local midnight to UTC,
        // and in timezones ahead of UTC (e.g. Egypt, UTC+2/+3) local midnight is
        // still the *previous* day in UTC — so the trip/hotel dates sent to the
        // backend silently shifted one day earlier than what was actually picked
        // on the calendar (e.g. picking 1 Sep → 3 Sep was saved as 31 Aug → 2 Sep).
        // Build the ISO string from the same UTC-midnight date instead, using the
        // Date object's local y/m/d (which are what the calendar picker set).
        const toUtcMidnightIso = (d) =>
          new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString();

        const createRes = await tripService.createTrip({
          title:                  `Trip to ${city}`,
          destinationGovernorate: place?.governorate || city,
          city,
          startDate:    toUtcMidnightIso(startDate),
          endDate:      toUtcMidnightIso(endDate),
          people,
          totalBudgetEgp: budget,
          isPublic:     false,
        });

        const newTripId = createRes.data?.tripId;
        if (!newTripId) throw new Error("No tripId returned from create");

        let hasPlan = false;
        let workingPlan = [];

        try {
          const resolvedInterests = resolveInterests(interests, place);
          const mustIncludeName = place?.title || place?.name || "";
          // ✅ FIX: backend expects mustInclude as List<MustIncludePlace>, not a
          // plain string — sending a string caused a 400 Validation error:
          // "$.mustInclude: The JSON value could not be converted to
          // List`1[...MustIncludePlace]" (same root cause already fixed in
          // AiPlanner.jsx's handleGeneratePlan()).
          const planRes = await withAiRetry(() =>
            aiService.generatePlan({
              city,
              days,
              budget,
              people,
              interests:   resolvedInterests,
              mustInclude: mustIncludeName
                ? [{ name: mustIncludeName, placeId: place?.place_id || null }]
                : [],
            })
          );

          const rawAiPlan = extractAiPlanOrThrow(planRes);
          const generatedPlan = parsePlan(rawAiPlan);
          workingPlan = sanitizePlanForApi(generatedPlan);
        } catch (planErr) {
          console.warn("generate-plan failed after retries, will save trip with the selected place only:", planErr?.response?.data || planErr?.message || planErr);
          workingPlan = [];
        }

        // ✅ FIX: the whole point of "create trip with this place" is that the
        // place ends up in the trip. Previously, if the AI call 503'd, returned
        // 0 places, or just silently ignored mustInclude, the trip was saved as
        // a completely empty shell (no place, no plan) — which is exactly the
        // bug shown in the report (3 days created, 0 stops, ~0 EGP everywhere).
        // We now force-insert the triggering place into Day 1 regardless of
        // what the AI did, the same way addToExistingTrip() already guarantees
        // it for existing trips. This does not touch the move/remove logic.
        const placeName = place?.title || place?.name;
        const placeId   = place?.place_id;

        let day1 = workingPlan.find((d) => Number(d.day) === 1);
        if (!day1) {
          day1 = { day: 1, places: [] };
          workingPlan.push(day1);
        }

        const alreadyIncluded = (day1.places || []).some((p) =>
          (placeId && p.place_id) ? p.place_id === placeId : p.name === placeName
        );

        if (!alreadyIncluded) {
          day1.places = [
            { ...buildPlaceItem(place, 1), _slot: "morning" },
            ...(day1.places || []),
          ];
        }

        try {
          await putPlan(newTripId, workingPlan);
          hasPlan = true;
        } catch (putErr) {
          console.warn("putPlan failed while saving trip plan:", putErr?.response?.data || putErr);
        }

        // ✅ FIX: don't just trust local state — refetch the trip from the
        // server so the caller (UI) gets back exactly what was persisted,
        // including the accommodation/hotel block. This is what guarantees the
        // trip "comes back complete" once the AI/server call succeeds, instead
        // of the UI assuming success from values it built locally.
        let finalTripData = null;
        try {
          const finalRes = await tripService.getTripById(newTripId);
          finalTripData = finalRes.data;
        } catch (fetchErr) {
          console.warn("Could not refetch trip after creation:", fetchErr);
        }

        const finalTitle = finalTripData?.title || `Trip to ${city}`;
        setAddedTripId(newTripId);
        setAddedTripTitle(finalTitle);
        return {
          success: true,
          tripId: newTripId,
          tripTitle: finalTitle,
          hasPlan,
          trip: finalTripData,
        };
      } catch (err) {
        setError("Failed to create trip.");
        console.error(err);
        return { success: false };
      } finally {
        setActionLoading(false);
      }
    },
    [place]
  );

  // ── Manage: Move to another day ────────────────────────────────────────────
  const moveToAnotherDay = useCallback(
    async (newDayNumber) => {
      if (!addedTripId) return { success: false };
      setActionLoading(true);
      setError(null);
      try {
        const tripRes = await tripService.getTripById(addedTripId);
        let   plan    = parsePlan(tripRes.data.plan);
        // ✅ FIX: .map() below returns a brand-new array, which loses the
        // .accommodation stashed by parsePlan(). Capture it first.
        const accommodation = plan.accommodation ?? [];

        plan = plan.map((d) => ({
          ...d,
          places: (d.places || []).filter(
            (p) => p.place_id !== place?.place_id &&
                   p.name    !== (place?.title || place?.name)
          ),
        }));

        let newDayEntry = plan.find((d) => d.day === newDayNumber);
        if (!newDayEntry) {
          newDayEntry = { day: newDayNumber, places: [] };
          plan.push(newDayEntry);
        }
        newDayEntry.places = [
          ...(newDayEntry.places || []),
          { ...buildPlaceItem(place, newDayNumber), _slot: "morning" },
        ];

        await putPlan(addedTripId, plan, accommodation);
        setCurrentDayNumber(newDayNumber);
        onPlanUpdated?.({ tripId: addedTripId, day: newDayNumber });
        window.dispatchEvent(new CustomEvent("tripPlanUpdated", { detail: { tripId: addedTripId } }));
        return { success: true };
      } catch (err) {
        setError("Failed to move place.");
        console.error(err);
        return { success: false };
      } finally {
        setActionLoading(false);
      }
    },
    [addedTripId, place]
  );

  // ── Manage: Move to another trip ───────────────────────────────────────────
  const moveToAnotherTrip = useCallback(
    async (destinationTripId) => {
      if (!addedTripId) return { success: false };
      setActionLoading(true);
      setError(null);
      try {
        const currentRes = await tripService.getTripById(addedTripId);
        let   currentPlan = parsePlan(currentRes.data.plan);
        // ✅ FIX: same .map() issue as moveToAnotherDay — grab the source
        // trip's accommodation before it's dropped by the new array.
        const currentAccommodation = currentPlan.accommodation ?? [];
        currentPlan = currentPlan.map((d) => ({
          ...d,
          places: (d.places || []).filter(
            (p) => p.place_id !== place?.place_id &&
                   p.name    !== (place?.title || place?.name)
          ),
        }));
        await putPlan(addedTripId, currentPlan, currentAccommodation);

        const destRes  = await tripService.getTripById(destinationTripId);
        let   destPlan = parsePlan(destRes.data.plan);
        let   destDay1 = destPlan.find((d) => d.day === 1);
        if (!destDay1) {
          destDay1 = { day: 1, places: [] };
          destPlan.push(destDay1);
        }
        destDay1.places = [
          ...(destDay1.places || []),
          { ...buildPlaceItem(place, 1), _slot: "morning" },
        ];
        await putPlan(destinationTripId, destPlan);

        const destTripTitle = destRes.data?.title || "the trip";
        setAddedTripId(destinationTripId);
        setAddedTripTitle(destTripTitle);
        setCurrentDayNumber(1);
        onPlanUpdated?.({ tripId: destinationTripId });
        window.dispatchEvent(new CustomEvent("tripPlanUpdated", { detail: { tripId: destinationTripId } }));
        return { success: true, destTripTitle };
      } catch (err) {
        setError("Failed to move place to another trip.");
        console.error(err);
        return { success: false };
      } finally {
        setActionLoading(false);
      }
    },
    [addedTripId, place]
  );

  // ── Manage: Remove from trip ───────────────────────────────────────────────
  const removeFromTrip = useCallback(async () => {
    if (!addedTripId) return { success: false };
    setActionLoading(true);
    setError(null);
    try {
      const tripRes = await tripService.getTripById(addedTripId);
      let   plan    = parsePlan(tripRes.data.plan);
      // ✅ FIX: same .map() issue — capture accommodation before it's dropped.
      const accommodation = plan.accommodation ?? [];
      plan = plan.map((d) => ({
        ...d,
        places: (d.places || []).filter(
          (p) => p.place_id !== place?.place_id &&
                 p.name    !== (place?.title || place?.name)
        ),
      }));
      await putPlan(addedTripId, plan, accommodation);
      onPlanUpdated?.({ tripId: addedTripId });
      window.dispatchEvent(new CustomEvent("tripPlanUpdated", { detail: { tripId: addedTripId } }));
      setAddedTripId(null);
      setAddedTripTitle("");
      setCurrentDayNumber(null);
      return { success: true };
    } catch (err) {
      setError("Failed to remove place from trip.");
      console.error(err);
      return { success: false };
    } finally {
      setActionLoading(false);
    }
  }, [addedTripId, place]);

  return {
    trips, tripsLoading, actionLoading, error,
    addedTripId, addedTripTitle, currentDayNumber,
    isAddedToTrip: !!addedTripId,
    fetchTrips, addToExistingTrip, createTripWithPlan,
    moveToAnotherDay, moveToAnotherTrip, removeFromTrip,
  };
}