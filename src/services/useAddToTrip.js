/**
 * useAddToTrip.js
 * Handles the full "Add to Trip" and "Manage Trip" flow:
 *   - Fetching & filtering trips by governorate
 *   - Adding a place to an existing trip (specific day OR auto-assign via AI edit)
 *   - Creating a new trip + generating an AI plan with mustInclude
 *   - Moving a place to another day (PUT /plan)
 *   - Moving a place to another trip (two PUT /plan calls)
 *   - Removing a place from the current trip (PUT /plan)
 */

import { useState, useCallback } from "react";
import tripService from "../services/tripService";
import aiService from "../services/aiService";

// ─── Budget calculation ───────────────────────────────────────────────────────
export const calcBudget = (tier, days, people) => {
  const economy = days * people * 1800;
  if (tier === "Economic") return economy;
  if (tier === "Comfortable") return Math.round(economy * 1.5);
  if (tier === "Luxury") return Math.round(economy * 1.5 * 1.5);
  return economy;
};

// ─── Normalise the plan to an array of day-objects ───────────────────────────
// The API stores plan as JSON (nullable). We treat it as:
//   [ { day: 1, places: [ ...placeObjects ] }, ... ]
const parsePlan = (rawPlan) => {
  if (!rawPlan) return [];
  if (typeof rawPlan === "string") {
    try {
      return JSON.parse(rawPlan);
    } catch {
      return [];
    }
  }
  if (Array.isArray(rawPlan)) return rawPlan;
  return [];
};

const findBestDay = (plan, totalDays) => {
  if (!plan || plan.length === 0) return 1;
  // pick the day with fewest places
  const counts = {};
  for (let d = 1; d <= totalDays; d++) counts[d] = 0;
  plan.forEach((dayObj) => {
    counts[dayObj.day] = (dayObj.places || []).length;
  });
  return Object.entries(counts).sort((a, b) => a[1] - b[1])[0][0];
};

// Build the place object in PlanItemRequest shape from a place prop
const buildPlaceItem = (place, dayNumber) => ({
  place_id: place?.place_id || null,
  name: place?.title || place?.name || "Unknown Place",
  day: dayNumber,
  type: place?.type || null,
  category: place?.category || null,
  price: place?.price || 0,
  cost: place?.price || 0,
  city: place?.city || null,
  city_en: place?.city || null,
  lat: place?.lat ?? 0,
  lng: place?.lng ?? 0,
  rating: place?.rating ?? 0,
  reviews_count: 0,
  address: place?.address || null,
  description: place?.description || null,
  photo_url: place?.photo_url || place?.image || place?.image_urls?.[0] || null,
  image_urls: place?.image_urls || [],
  maps_url: place?.maps_url || null,
  interests: place?.interests || [],
});

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAddToTrip(place) {
  // ── Trips state ──
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(false);

  // ── "Added" state – which trip the place currently lives in ──
  const [addedTripId, setAddedTripId] = useState(null);
  const [addedTripTitle, setAddedTripTitle] = useState("");
  const [currentDayNumber, setCurrentDayNumber] = useState(null);

  // ── Loading / error ──
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─────────────────────────────────────────────────────────────────
  // Fetch trips filtered to the same governorate as the current place
  // ─────────────────────────────────────────────────────────────────
  const fetchTrips = useCallback(async () => {
    setTripsLoading(true);
    setError(null);
    try {
      const res = await tripService.getTrips({ Page: 1, PageSize: 50 });
      const items =
        res.data?.items ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);

      const placeGov = place?.governorate || place?.destinationGovernorate || place?.city;

      const filtered = items
        .map((t) => ({
          ...t,
          id: t.tripId,
          coverImage: t.coverImageUrl,
        }))
        .filter((t) => {
          if (!placeGov) return true; // no filter if we don't know governorate
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

  // ─────────────────────────────────────────────────────────────────
  // Path A – Add place to EXISTING trip
  // ─────────────────────────────────────────────────────────────────
  const addToExistingTrip = useCallback(
    async (tripId, daySelection) => {
      // daySelection: number (1-based) | null (auto-assign)
      setActionLoading(true);
      setError(null);
      try {
        const tripRes = await tripService.getTripById(tripId);
        const tripData = tripRes.data;
        let plan = parsePlan(tripData.plan);

        let targetDay;

        if (daySelection === null) {
          // AUTO-ASSIGN: call AI edit to figure out best day
          const existingPlanItems = plan.flatMap((d) =>
            (d.places || []).map((p) => ({ ...p, day: d.day }))
          );

          const editRes = await aiService.editPlan({
            targetChange: `Add "${place?.title || place?.name}" to the best logical day in the plan`,
            destination: tripData.destinationGovernorate || tripData.city || "",
            days: tripData.durationDays || 1,
            budget: tripData.totalBudgetEgp || 1000,
            people: tripData.people || 1,
            interests: [],
            existingPlan: existingPlanItems,
            places: [buildPlaceItem(place, 1)],
          });

          // The AI response is the updated plan; use it directly
          const aiPlan = parsePlan(editRes.data?.plan || editRes.data);
          if (aiPlan.length > 0) {
            await tripService.updateTripPlan(tripId, { plan: aiPlan });
            // Detect which day the AI put our place on
            const dayObj = aiPlan.find((d) =>
              (d.places || []).some(
                (p) => p.place_id === place?.place_id || p.name === (place?.title || place?.name)
              )
            );
            targetDay = dayObj?.day || 1;
            setCurrentDayNumber(targetDay);
            setAddedTripId(tripId);
            setAddedTripTitle(tripData.title || "your trip");
            return { success: true, tripTitle: tripData.title, day: targetDay };
          }
          // Fallback: place on day with fewest items
          targetDay = findBestDay(plan, tripData.durationDays || 1);
        } else {
          targetDay = daySelection;
        }

        // Append place to the target day
        let dayEntry = plan.find((d) => d.day === targetDay);
        if (!dayEntry) {
          dayEntry = { day: targetDay, places: [] };
          plan.push(dayEntry);
        }
        dayEntry.places = [...(dayEntry.places || []), buildPlaceItem(place, targetDay)];

        await tripService.updateTripPlan(tripId, { plan });

        setCurrentDayNumber(targetDay);
        setAddedTripId(tripId);
        setAddedTripTitle(tripData.title || "your trip");
        return { success: true, tripTitle: tripData.title, day: targetDay };
      } catch (err) {
        setError("Failed to add place to trip.");
        console.error(err);
        return { success: false };
      } finally {
        setActionLoading(false);
      }
    },
    [place]
  );

  // ─────────────────────────────────────────────────────────────────
  // Path B – Create NEW trip + generate AI plan
  // ─────────────────────────────────────────────────────────────────
  const createTripWithPlan = useCallback(
    async ({ startDate, endDate, budgetTier, people }) => {
      setActionLoading(true);
      setError(null);
      try {
        const days = Math.max(
          1,
          Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
        );
        const budget = calcBudget(budgetTier, days, people);
        const city = place?.city || "Cairo";

        // 1. Create the trip shell
        const createRes = await tripService.createTrip({
          title: `Trip to ${city}`,
          destinationGovernorate: place?.governorate || city,
          city,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          people,
          totalBudgetEgp: budget,
          isPublic: false,
        });

        const newTripId = createRes.data?.tripId;
        if (!newTripId) throw new Error("No tripId returned from create");

        // 2. Generate the AI plan, forcing the current place in via mustInclude
        const planRes = await aiService.generatePlan({
          city,
          days,
          budget,
          people,
          interests: [],
          mustInclude: place?.title || place?.name || "",
        });

        const generatedPlan = parsePlan(planRes.data?.plan || planRes.data);

        // 3. Save the plan back to the trip
        if (generatedPlan.length > 0) {
          await tripService.updateTripPlan(newTripId, { plan: generatedPlan });
        }

        setAddedTripId(newTripId);
        setAddedTripTitle(`Trip to ${city}`);
        return { success: true, tripId: newTripId, tripTitle: `Trip to ${city}` };
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

  // ─────────────────────────────────────────────────────────────────
  // Manage – Move place to ANOTHER DAY in the same trip
  // ─────────────────────────────────────────────────────────────────
  const moveToAnotherDay = useCallback(
    async (newDayNumber) => {
      if (!addedTripId) return { success: false };
      setActionLoading(true);
      setError(null);
      try {
        const tripRes = await tripService.getTripById(addedTripId);
        let plan = parsePlan(tripRes.data.plan);

        // Remove place from old day
        plan = plan.map((d) => ({
          ...d,
          places: (d.places || []).filter(
            (p) =>
              p.place_id !== place?.place_id &&
              p.name !== (place?.title || place?.name)
          ),
        }));

        // Add to new day
        let newDayEntry = plan.find((d) => d.day === newDayNumber);
        if (!newDayEntry) {
          newDayEntry = { day: newDayNumber, places: [] };
          plan.push(newDayEntry);
        }
        newDayEntry.places = [
          ...(newDayEntry.places || []),
          buildPlaceItem(place, newDayNumber),
        ];

        await tripService.updateTripPlan(addedTripId, { plan });
        setCurrentDayNumber(newDayNumber);
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

  // ─────────────────────────────────────────────────────────────────
  // Manage – Move place to ANOTHER TRIP
  // ─────────────────────────────────────────────────────────────────
  const moveToAnotherTrip = useCallback(
    async (destinationTripId) => {
      if (!addedTripId) return { success: false };
      setActionLoading(true);
      setError(null);
      try {
        // Remove from current trip
        const currentRes = await tripService.getTripById(addedTripId);
        let currentPlan = parsePlan(currentRes.data.plan);
        currentPlan = currentPlan.map((d) => ({
          ...d,
          places: (d.places || []).filter(
            (p) =>
              p.place_id !== place?.place_id &&
              p.name !== (place?.title || place?.name)
          ),
        }));
        await tripService.updateTripPlan(addedTripId, { plan: currentPlan });

        // Add to destination trip (day 1 by default)
        const destRes = await tripService.getTripById(destinationTripId);
        let destPlan = parsePlan(destRes.data.plan);
        let destDay1 = destPlan.find((d) => d.day === 1);
        if (!destDay1) {
          destDay1 = { day: 1, places: [] };
          destPlan.push(destDay1);
        }
        destDay1.places = [...(destDay1.places || []), buildPlaceItem(place, 1)];
        await tripService.updateTripPlan(destinationTripId, { plan: destPlan });

        const destTripTitle = destRes.data?.title || "the trip";
        setAddedTripId(destinationTripId);
        setAddedTripTitle(destTripTitle);
        setCurrentDayNumber(1);
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

  // ─────────────────────────────────────────────────────────────────
  // Manage – Remove place from current trip
  // ─────────────────────────────────────────────────────────────────
  const removeFromTrip = useCallback(async () => {
    if (!addedTripId) return { success: false };
    setActionLoading(true);
    setError(null);
    try {
      const tripRes = await tripService.getTripById(addedTripId);
      let plan = parsePlan(tripRes.data.plan);
      plan = plan.map((d) => ({
        ...d,
        places: (d.places || []).filter(
          (p) =>
            p.place_id !== place?.place_id &&
            p.name !== (place?.title || place?.name)
        ),
      }));
      await tripService.updateTripPlan(addedTripId, { plan });

      // Reset added state
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
    // state
    trips,
    tripsLoading,
    actionLoading,
    error,
    addedTripId,
    addedTripTitle,
    currentDayNumber,
    isAddedToTrip: !!addedTripId,
    // actions
    fetchTrips,
    addToExistingTrip,
    createTripWithPlan,
    moveToAnotherDay,
    moveToAnotherTrip,
    removeFromTrip,
  };
}