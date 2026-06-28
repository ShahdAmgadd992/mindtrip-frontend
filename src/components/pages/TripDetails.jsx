/**
 * TripDetails.jsx  – Refactored
 *
 * Task 1 – "Add to Trip" flow (existing trip + new quick-AI trip)
 * Task 2 – "Manage Trip" flow (move day / move trip / remove)
 * Task 3 – Dynamic data mapping:
 *   • Pricing label → "avg / person"
 *   • Cuisine label → conditional (restaurant / cafe / food only)
 *   • Reviews       → dynamic from API via usePlaceReviews
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import ReviewsIcon from "../../assets/icons/ReviewsIcon.png";
import "./TripDetails.css";
import tripService from "../../services/tripService";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useHomePlaces } from "../../services/useHomePlaces";
import { useAddToTrip, calcBudget } from "../../services/useAddToTrip";
import { usePlaceReviews } from "../../services/usePlaceReviews";
// ─── Constants ────────────────────────────────────────────────────────────────
const FOOD_CATEGORIES = ["restaurant", "cafe", "food", "dining", "eatery"];

const isFoodPlace = (place) => {
  const cat = (place?.category || "").toLowerCase();
  const type = (place?.type || "").toLowerCase();
  return FOOD_CATEGORIES.some((f) => cat.includes(f) || type.includes(f));
};

// ─── Calendar helpers (pure functions) ───────────────────────────────────────
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();
const formatDate = (d) => {
  if (!d) return "";
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
};

// ─── Small shared components ──────────────────────────────────────────────────
const CloseBtn = ({ onClick }) => (
  <button className="td-modal-close" onClick={onClick}>✕</button>
);

const BackBtn = ({ onClick }) => (
  <button className="td-qai-back-btn" onClick={onClick}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  </button>
);

// ─── Calendar component ───────────────────────────────────────────────────────
const Calendar = ({
  month,
  onMonthChange,
  startDate,
  endDate,
  onDayClick,
  highlightedDays = [],          // array of day numbers (for manage-day mode)
  selectedSingleDay = null,      // Date object (for manage-day mode)
  rangeMode = true,
}) => {
  const year = month.getFullYear();
  const mon = month.getMonth();
  const totalDays = getDaysInMonth(year, mon);
  const firstDay = getFirstDayOfMonth(year, mon);
  const prevMonthDays = getDaysInMonth(year, mon - 1);

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: prevMonthDays - firstDay + 1 + i, inactive: true });
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, inactive: false });
  }

  const isSameDay = (d, date) => {
    if (!date) return false;
    const cand = new Date(year, mon, d);
    return cand.toDateString() === date.toDateString();
  };
  const isInRange = (d) => {
    if (!startDate || !endDate) return false;
    const cand = new Date(year, mon, d);
    return cand > startDate && cand < endDate;
  };

  return (
    <div className="td-calendar">
      <div className="td-calendar-header">
        <span className="td-calendar-month-label">{MONTH_NAMES[mon]} {year}</span>
        <div className="td-calendar-nav">
          <button className="td-cal-nav-btn" onClick={() => onMonthChange(new Date(year, mon - 1, 1))}>‹</button>
          <button className="td-cal-nav-btn" onClick={() => onMonthChange(new Date(year, mon + 1, 1))}>›</button>
        </div>
      </div>
      <div className="td-calendar-grid">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} className="td-cal-weekday">{d}</div>
        ))}
        {cells.map((cell, i) => {
          if (cell.inactive) {
            return <div key={i} className="td-cal-day td-cal-day-inactive">{cell.day}</div>;
          }

          const isHighlighted = highlightedDays.includes(cell.day);
          const isSingle = isSameDay(cell.day, selectedSingleDay);
          const isStart = rangeMode && isSameDay(cell.day, startDate);
          const isEnd = rangeMode && isSameDay(cell.day, endDate);
          const inRange = rangeMode && isInRange(cell.day);

          const classes = [
            "td-cal-day",
            isStart || isEnd ? "td-cal-day-selected" : "",
            isStart && endDate ? "td-cal-day-range-start" : "",
            isEnd && startDate ? "td-cal-day-range-end" : "",
            inRange ? "td-cal-day-range" : "",
            isSingle ? "td-cal-day-selected-solid" : "",
            !isHighlighted && highlightedDays.length > 0 && !isSingle ? "td-cal-day-disabled" : "",
          ].filter(Boolean).join(" ");

          return (
            <div
              key={i}
              className={classes}
              onClick={() => {
                if (highlightedDays.length > 0 && !isHighlighted) return;
                onDayClick(cell.day);
              }}
            >
              {cell.day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Trip card for selection lists ───────────────────────────────────────────
const TripCard = ({ trip, selected, onClick, children }) => (
  <div
    className={`td-trip-option ${selected ? "selected" : ""}`}
    onClick={onClick}
  >
    <img
      src={trip.coverImage || trip.coverImageUrl || "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=200"}
      alt={trip.title}
      className="td-trip-img"
    />
    <div className="td-trip-info">
      <span className="td-trip-name">{trip.title}</span>
      <span className="td-trip-meta">
        {trip.durationDays || "—"} days · {trip.placesCount ?? "—"} places
      </span>
    </div>
    {children}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const TripDetails = ({ place }) => {
  // ── UI state ──
  const [liked, setLiked] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(4);
  const [reviewText, setReviewText] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // ── Add-to-Trip modal state ──
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null); // null = auto-assign

  // ── Quick-AI new-trip modal state ──
  const [showQuickAIModal, setShowQuickAIModal] = useState(false);
  const [quickAIStep, setQuickAIStep] = useState("form"); // form | calendar | skeleton | loading
  const [calendarTarget, setCalendarTarget] = useState(null); // "start" | "end"
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [budgetTier, setBudgetTier] = useState("Economic");
  const [numPeople, setNumPeople] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // ── Manage-Trip modal state ──
  const [showManageTripModal, setShowManageTripModal] = useState(false);
  const [manageTripStep, setManageTripStep] = useState("menu"); // menu | moveDay | moveTrip | remove
  const [manageDayMonth, setManageDayMonth] = useState(new Date());
  const [manageSelectedDay, setManageSelectedDay] = useState(null);
  const [manageDestTripId, setManageDestTripId] = useState(null);

  // ── Map ──
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // ─── Custom hooks ───────────────────────────────────────────────────────────
  const {
    trips,
    tripsLoading,
    actionLoading,
    fetchTrips,
    addToExistingTrip,
    createTripWithPlan,
    moveToAnotherDay,
    moveToAnotherTrip,
    removeFromTrip,
    isAddedToTrip,
    addedTripId,
    addedTripTitle,
  } = useAddToTrip(place);

  const { reviews, reviewsLoading } = usePlaceReviews(place, addedTripId);

  const { featured: nearbyFromAPI, loading: nearbyLoading } = useHomePlaces(
    place?.city || "Cairo"
  );
  const nearbyPlaces = nearbyFromAPI
    .filter((p) => p.place_id !== place?.place_id)
    .slice(0, 3)
    .map((p) => ({
      ...p,
      distance: `${((Math.abs(p.lat - (place?.lat ?? 0)) + Math.abs(p.lng - (place?.lng ?? 0))) * 111).toFixed(1)} km`,
      image: p.photo_url,
    }));

  // ─── Toast helper ───────────────────────────────────────────────────────────
  const showToastMsg = useCallback((msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4500);
  }, []);

  // ─── Derived data ───────────────────────────────────────────────────────────
  const category = (place?.category || "attraction").toLowerCase();
  const isFood = isFoodPlace(place);

  // Task 3 – Pricing label fix: "avg / person" instead of "avg / meal"
  const avgPrice = (() => {
    if (!place) return "—";
    if (category === "hotel") return `${place.price ?? "—"} EGP / Night`;
    if (category === "attraction") return `Entry ${place.price ?? "—"} EGP`;
    // Restaurant / café / food → "avg / person" (NOT "avg / meal")
    return `Avg. ${place.price ?? "—"} EGP / person`;
  })();

  // Task 3 – Visit info: conditional Cuisine field
  const visitLabels = (() => {
    if (category === "hotel") {
      return {
        label1: "Check-In",      val1: place?.openingHours || "02:00 PM",
        label2: "Check-Out",     val2: place?.closingHours || "12:00 PM",
        label3: "Best For",      val3: "Friends · Families",
        label4: "Suggested Visit", val4: "Morning",
      };
    }
    if (isFood) {
      return {
        label1: "Opening Hours", val1: place?.openingHours || place?.opening_hours?.split("-")[0] || "10:00 AM",
        label2: "Closing Hours", val2: place?.closingHours || place?.opening_hours?.split("-")[1] || "12:00 AM",
        // Task 3 – Only show Cuisine for food places
        label3: "Cuisine",       val3: place?.cuisine || place?.tags?.[0] || "Local",
        label4: "Suggested Visit", val4: "Morning",
      };
    }
    // Attraction / museum / historical site → NO cuisine field
    return {
      label1: "Opening Hours", val1: place?.opening_hours?.split("-")[0] || "08:00 AM",
      label2: "Closing Hours", val2: place?.opening_hours?.split("-")[1] || "06:00 PM",
      label3: "Entry Fee",     val3: place?.price ? `${place.price} EGP` : "Free",
      label4: "Best Time",     val4: "Oct – Apr",
    };
  })();

  const data = {
    name: place?.title || place?.name || "Place",
    city: place?.city || "Egypt",
    rating: place?.rating ?? 0,
    reviewCount: place?.reviews_count ?? place?.reviews ?? 0,
    avgPrice,
    images: place?.image_urls?.length
      ? place.image_urls
      : [place?.photo_url || place?.image].filter(Boolean),
    overview:
      place?.description ||
      `${place?.title || "This place"} is one of Egypt's top destinations in ${place?.city || "Egypt"}.`,
    overallRating: place?.rating ?? 0,
    lat: place?.lat ?? 29.9792,
    lng: place?.lng ?? 31.1342,
    nearbyPlaces,
  };

  const overviewText = showFullOverview
    ? data.overview
    : data.overview.slice(0, 120) + "…";

  // ─── Mapbox ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

    mapboxgl.accessToken =
      "pk.eyJ1IjoieG1vaGFtZWR4IiwiYSI6ImNtcG1zZ25kbTB4eTkydHNidXZ2cnR2ajkifQ.CugdwmFa8ME2UU4rDEAJug";

    const lat = data.lat;
    const lng = data.lng;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: 13,
    });

    mapRef.current.on("load", () => {
      const el = document.createElement("div");
      el.style.cssText =
        "width:28px;height:28px;background:#5596fe;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3);";
      new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(mapRef.current);
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, [place]);

  // ─── Loading messages for Quick AI ──────────────────────────────────────────
  const loadingMessages = [
    { threshold: 0,  text: "Collecting your preferences…" },
    { threshold: 30, text: "Building your itinerary…" },
    { threshold: 56, text: "Almost there! Arranging days…" },
    { threshold: 85, text: "Finalising your trip plan…" },
  ];
  const currentLoadingMsg =
    loadingMessages.filter((m) => loadingProgress >= m.threshold).at(-1)?.text || "Loading…";

  // ─── Quick-AI: generate plan handler ────────────────────────────────────────
  const handleGeneratePlan = async () => {
    if (!startDate || !endDate) {
      showToastMsg("Please select start and end dates.");
      return;
    }
    setQuickAIStep("skeleton");
    setLoadingProgress(0);

    await new Promise((r) => setTimeout(r, 1000));
    setQuickAIStep("loading");

    let progress = 0;
    const interval = setInterval(() => {
      progress = Math.min(90, progress + Math.floor(Math.random() * 10) + 5);
      setLoadingProgress(progress);
    }, 400);

    try {
      const result = await createTripWithPlan({ startDate, endDate, budgetTier, people: numPeople });
      clearInterval(interval);
      setLoadingProgress(100);

      await new Promise((r) => setTimeout(r, 500));
      setShowQuickAIModal(false);
      setQuickAIStep("form");

      if (result.success) {
        showToastMsg(`Trip created: ${result.tripTitle} ✅`);
      } else {
        showToastMsg("Failed to generate trip. Please try again.");
      }
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      setQuickAIStep("form");
      showToastMsg("Something went wrong. Please try again.");
    }
  };

  // ─── Add to existing trip handler (Confirm button) ──────────────────────────
  const handleConfirmAddToTrip = async () => {
    if (!selectedTripId) return;
    setShowAddTripModal(false);

    const result = await addToExistingTrip(selectedTripId, selectedDay);
    if (result.success) {
      showToastMsg(`${data.name} added to ${result.tripTitle} ✅`);
    } else {
      showToastMsg("Failed to add place. Please try again.");
    }
  };

  // ─── Move to another day handler ────────────────────────────────────────────
  const handleMoveDay = async () => {
    if (!manageSelectedDay) return;
    // We highlight trip's valid days (1..durationDays) – here we use the calendar day number
    const dayNum = manageSelectedDay.getDate(); // simplified: use date number as day index
    const result = await moveToAnotherDay(dayNum);
    setShowManageTripModal(false);
    setManageTripStep("menu");
    setManageSelectedDay(null);
    showToastMsg(result.success ? "Day updated successfully ✅" : "Failed to update day.");
  };

  // ─── Move to another trip handler ───────────────────────────────────────────
  const handleMoveTrip = async () => {
    if (!manageDestTripId) return;
    const result = await moveToAnotherTrip(manageDestTripId);
    setShowManageTripModal(false);
    setManageTripStep("menu");
    setManageDestTripId(null);
    showToastMsg(
      result.success
        ? `Place moved to ${result.destTripTitle} ✅`
        : "Failed to move place."
    );
  };

  // ─── Remove from trip handler ────────────────────────────────────────────────
  const handleRemoveFromTrip = async () => {
    const result = await removeFromTrip();
    setShowManageTripModal(false);
    setManageTripStep("menu");
    showToastMsg(result.success ? "Place removed from trip ✅" : "Failed to remove place.");
  };

  // ─── Open Add-to-Trip modal ──────────────────────────────────────────────────
  const handleMainButtonClick = () => {
    if (isAddedToTrip) {
      setManageTripStep("menu");
      setManageSelectedDay(null);
      setManageDestTripId(null);
      setShowManageTripModal(true);
    } else {
      fetchTrips();
      setSelectedTripId(null);
      setSelectedDay(null);
      setShowAddTripModal(true);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar activePage="explore" />

      <div className="td-wrapper">
        <div className="td-page">
          {/* Title */}
          <h1 className="td-place-title">{data.name}</h1>

          {/* Meta */}
          <div className="td-meta">
            <span className="td-meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5596fe" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {data.city}
            </span>
            <span className="td-meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {data.rating} ({data.reviewCount} reviews)
            </span>
            <span className="td-meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5596fe" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              {/* Task 3: Dynamic price label */}
              {data.avgPrice}
            </span>
          </div>

          {/* Images */}
          <div className="td-images">
            <div className="td-main-img">
              <img src={data.images?.[0]} alt={data.name} />
            </div>
            <div className="td-side-imgs">
              {(data.images || []).slice(1, 3).map((img, i) => (
                <div key={i} className="td-side-img-wrap">
                  <img src={img} alt={`${data.name} ${i + 1}`} />
                  {i === 0 && (
                    <button
                      className={`td-heart-btn ${liked ? "liked" : ""}`}
                      onClick={() => setLiked(!liked)}
                    >❤️</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content grid */}
          <div className="td-content">
            {/* ─ Left column ─ */}
            <div className="td-left">
              {/* Overview */}
              <div className="td-section">
                <h2 className="td-section-title">Overview</h2>
                <p className="td-overview-text">
                  {overviewText}{" "}
                  <button className="td-see-more" onClick={() => setShowFullOverview(!showFullOverview)}>
                    {showFullOverview ? "See Less" : "See More"}
                  </button>
                </p>
              </div>

              {/* Nearby */}
              <div className="td-section">
                <h2 className="td-section-title">Nearby Places</h2>
                <div className="td-nearby-grid">
                  {nearbyLoading ? (
                    <p style={{ color: "#888", fontSize: "14px" }}>Loading nearby places…</p>
                  ) : (
                    data.nearbyPlaces.map((np, i) => (
                      <div
                        key={i}
                        className="td-nearby-card"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          np.place_id &&
                          window.navigateToTripDetails &&
                          window.navigateToTripDetails(np)
                        }
                      >
                        <img src={np.image} alt={np.name} className="td-nearby-img" />
                        <p className="td-nearby-name">{np.name}</p>
                        <span className="td-nearby-dist">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5596fe" strokeWidth="2">
                            <rect x="1" y="3" width="15" height="13" rx="2"/>
                            <path d="M16 8h4l3 3v5h-7V8z"/>
                            <circle cx="5.5" cy="18.5" r="2.5"/>
                            <circle cx="18.5" cy="18.5" r="2.5"/>
                          </svg>
                          {np.distance}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Task 3 – Dynamic Reviews */}
              <div className="td-section">
                <h2 className="td-section-title">
                  Reviews{" "}
                  <span className="td-review-edit" onClick={() => setShowReviewModal(true)} style={{ cursor: "pointer" }}>
                    <img src={ReviewsIcon} alt="edit" style={{ width: "20px", height: "20px" }} />
                  </span>
                </h2>
                <div className="td-rating-summary">
                  <div className="td-overall">
                    <span className="td-overall-num">{data.overallRating}</span>
                    <div className="td-stars">
                      {"★".repeat(Math.floor(data.overallRating))}
                      {"☆".repeat(5 - Math.floor(data.overallRating))}
                    </div>
                  </div>
                  <div className="td-rating-bars">
                    {[85, 70, 30].map((w, i) => (
                      <div key={i} className="td-bar-row">
                        <div className="td-bar">
                          <div className={`td-bar-fill${i === 2 ? " td-bar-fill-light" : ""}`} style={{ width: `${w}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {reviewsLoading ? (
                  <p style={{ color: "#888", fontSize: "14px" }}>Loading reviews…</p>
                ) : reviews.length === 0 ? (
                  <p style={{ color: "#aaa", fontSize: "14px" }}>No reviews yet. Be the first!</p>
                ) : (
                  <div className="td-reviews-grid">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="td-review-card">
                        <img src={rev.avatar} alt={rev.name} className="td-reviewer-avatar" />
                        <div className="td-review-info">
                          <span className="td-reviewer-name">{rev.name}</span>
                          <div className="td-review-stars">{"★".repeat(rev.rating)}</div>
                          <p className="td-review-text">{rev.text || "A wonderful experience!"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ─ Right column ─ */}
            <div className="td-right">
              <div className="td-visit-card">
                <h3 className="td-visit-title">Visit Info</h3>
                <div className="td-visit-grid">
                  {[
                    [visitLabels.label1, visitLabels.val1],
                    [visitLabels.label2, visitLabels.val2],
                    // Task 3: Cuisine only rendered when it's a food place
                    isFood || visitLabels.label3 !== "Cuisine"
                      ? [visitLabels.label3, visitLabels.val3]
                      : null,
                    [visitLabels.label4, visitLabels.val4],
                  ]
                    .filter(Boolean)
                    .map(([label, val], i) => (
                      <div key={i} className="td-visit-item">
                        <span className="td-visit-label">{label}</span>
                        <span className="td-visit-value">{val}</span>
                      </div>
                    ))}
                </div>

                <h3 className="td-visit-title" style={{ marginTop: "24px" }}>Location</h3>
                <div className="td-map-placeholder">
                  <div ref={mapContainerRef} style={{ width: "100%", height: "200px", borderRadius: "12px", overflow: "hidden" }} />
                </div>
                <a className="td-open-map-btn" onClick={() => setShowMapModal(true)} style={{ cursor: "pointer" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5596fe" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Open full map
                </a>

                {/* Main CTA button */}
                <button
                  className={isAddedToTrip ? "td-manage-trip-btn" : "td-add-trip-btn"}
                  onClick={handleMainButtonClick}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Loading…"
                    : isAddedToTrip
                    ? "Manage your trip"
                    : "Add to your trip"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          MAP MODAL
      ══════════════════════════════════════════════════════════════════════════ */}
      {showMapModal && (
        <div className="td-modal-overlay" onClick={() => setShowMapModal(false)}>
          <div className="td-modal-map" onClick={(e) => e.stopPropagation()}>
            <CloseBtn onClick={() => setShowMapModal(false)} />
            <iframe
              title="full-map"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: "16px" }}
              loading="lazy"
              src={`https://maps.google.com/maps?q=${data.lat},${data.lng}&z=14&output=embed`}
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          ADD TO TRIP MODAL  (Task 1)
      ══════════════════════════════════════════════════════════════════════════ */}
      {showAddTripModal && (
        <div className="td-modal-overlay" onClick={() => setShowAddTripModal(false)}>
          <div className="td-modal-add-trip" onClick={(e) => e.stopPropagation()}>
            <CloseBtn onClick={() => setShowAddTripModal(false)} />
            <h2 className="td-add-trip-modal-title">Add to a Trip</h2>
            <p className="td-add-trip-modal-sub">Select an itinerary to add {data.name}</p>

            {place?.city && (
              <p className="td-add-trip-city-filter">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5596fe" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Showing trips in <strong>{place.city}</strong>
              </p>
            )}

            <div className="td-add-trip-list">
              {tripsLoading ? (
                <div className="td-trips-loading">
                  <div className="td-trips-spinner" />
                  <span>Loading trips…</span>
                </div>
              ) : trips.length === 0 ? (
                <p style={{ color: "#aaa", padding: "16px 0", fontSize: "14px" }}>
                  No trips found for {place?.city || "this location"}.
                </p>
              ) : (
                trips.map((trip) => (
                  <div
                    key={trip.id}
                    className={`td-trip-option ${selectedTripId === trip.id ? "selected" : ""}`}
                    onClick={() => { setSelectedTripId(trip.id); setSelectedDay(null); }}
                  >
                    <input
                      type="radio"
                      name="trip-select"
                      className="td-trip-radio"
                      checked={selectedTripId === trip.id}
                      readOnly
                    />
                    <img
                      src={trip.coverImage || "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=200"}
                      alt={trip.title}
                      className="td-trip-img"
                    />
                    <div className="td-trip-info">
                      <span className="td-trip-name">{trip.title}</span>
                      <span className="td-trip-meta">
                        {trip.durationDays || "—"} days · {trip.placesCount ?? "—"} places
                      </span>
                    </div>

                    {/* Day selector appears for the selected trip */}
                    {selectedTripId === trip.id && (
                      <div className="td-day-select-wrap" onClick={(e) => e.stopPropagation()}>
                        <span className="td-day-select-label">Day Selection:</span>
                        <select
                          className="td-day-select"
                          defaultValue="auto"
                          onChange={(e) => {
                            const v = e.target.value;
                            setSelectedDay(v === "auto" ? null : parseInt(v, 10));
                          }}
                        >
                          <option value="auto">Auto-assign ✨</option>
                          {Array.from({ length: trip.durationDays || 3 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>Day {i + 1}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Create a new trip via Quick AI */}
              <div
                className="td-trip-option td-create-new"
                onClick={() => {
                  setShowAddTripModal(false);
                  setShowQuickAIModal(true);
                  setQuickAIStep("form");
                }}
              >
                <div className="td-create-plus">+</div>
                <div className="td-trip-info">
                  <span className="td-trip-name">Create a new trip</span>
                  <span className="td-trip-meta">Start planning with AI</span>
                </div>
              </div>
            </div>

            <button
              className="td-confirm-btn"
              disabled={!selectedTripId || actionLoading}
              onClick={handleConfirmAddToTrip}
            >
              {actionLoading ? "Adding…" : "Confirm"}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          QUICK AI TRIP PLANNING MODAL  (Task 1 – Path B)
      ══════════════════════════════════════════════════════════════════════════ */}
      {showQuickAIModal && (
        <div
          className="td-modal-overlay"
          onClick={() => { if (quickAIStep !== "loading") setShowQuickAIModal(false); }}
        >
          <div className="td-modal-quick-ai" onClick={(e) => e.stopPropagation()}>
            {/* ── Form step ── */}
            {quickAIStep === "form" && (
              <>
                <CloseBtn onClick={() => setShowQuickAIModal(false)} />
                <div className="td-qai-header">
                  <BackBtn onClick={() => { setShowQuickAIModal(false); setShowAddTripModal(true); }} />
                  <div>
                    <h2 className="td-qai-title">Quick AI Trip Planning</h2>
                    <p className="td-qai-subtitle">
                      This is a quick overview. For a detailed itinerary, return to the{" "}
                      <span
                        className="td-qai-link"
                        onClick={() => { setShowQuickAIModal(false); window.navigateToAiPlanner?.(); }}
                      >
                        AI trip planner
                      </span>.
                    </p>
                  </div>
                </div>

                <div className="td-qai-section">
                  <h3 className="td-qai-section-label">Duration</h3>
                  <div className="td-qai-dates-row">
                    {[["Start date :", "start", startDate], ["End date :", "end", endDate]].map(([lbl, target, val]) => (
                      <div key={target} className="td-qai-date-col">
                        <label className="td-qai-date-label">{lbl}</label>
                        <div
                          className="td-qai-date-input"
                          onClick={() => { setCalendarTarget(target); setQuickAIStep("calendar"); }}
                        >
                          <span>{val ? formatDate(val) : (target === "start" ? "Select start" : "Select end")}</span>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5596fe" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                  {startDate && endDate && (
                    <p style={{ fontSize: "13px", color: "#5596fe", marginTop: "6px" }}>
                      {Math.max(1, Math.ceil((endDate - startDate) / 86400000))} day trip
                    </p>
                  )}
                </div>

                <div className="td-qai-section">
                  <h3 className="td-qai-section-label">Budget</h3>
                  <div className="td-qai-budget-row">
                    {["Economic", "Comfortable", "Luxury"].map((b) => (
                      <button
                        key={b}
                        className={`td-qai-budget-btn ${budgetTier === b ? "active" : ""}`}
                        onClick={() => setBudgetTier(b)}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  {startDate && endDate && (
                    <p style={{ fontSize: "12px", color: "#888", marginTop: "6px" }}>
                      ≈ {calcBudget(budgetTier, Math.max(1, Math.ceil((endDate - startDate) / 86400000)), numPeople).toLocaleString()} EGP total
                    </p>
                  )}
                </div>

                <div className="td-qai-section">
                  <h3 className="td-qai-section-label">Number of people</h3>
                  <div className="td-qai-people-input">
                    <button type="button" className="td-qai-people-btn" onClick={() => setNumPeople((p) => Math.max(1, p - 1))}>−</button>
                    <input
                      type="number"
                      min="1"
                      className="td-qai-people-field"
                      value={numPeople}
                      onChange={(e) => setNumPeople(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    />
                    <button type="button" className="td-qai-people-btn" onClick={() => setNumPeople((p) => p + 1)}>+</button>
                  </div>
                </div>

                <button
                  className="td-qai-generate-btn"
                  onClick={handleGeneratePlan}
                  disabled={!startDate || !endDate}
                >
                  Generate Plan
                </button>
              </>
            )}

            {/* ── Calendar step ── */}
            {quickAIStep === "calendar" && (
              <>
                <CloseBtn onClick={() => setShowQuickAIModal(false)} />
                <BackBtn onClick={() => setQuickAIStep("form")} />
                <Calendar
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  startDate={startDate}
                  endDate={endDate}
                  rangeMode
                  onDayClick={(day) => {
                    const selected = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                    if (calendarTarget === "start") setStartDate(selected);
                    else setEndDate(selected);
                    setQuickAIStep("form");
                  }}
                />
              </>
            )}

            {/* ── Skeleton step ── */}
            {quickAIStep === "skeleton" && (
              <div className="td-qai-skeleton">
                <div className="td-qai-skeleton-header" />
                <div className="td-qai-skeleton-sub" />
                <div className="td-qai-skeleton-sub td-qai-skeleton-sub-short" />
                <div className="td-qai-skeleton-label" />
                <div className="td-qai-skeleton-row">
                  <div className="td-qai-skeleton-input" />
                  <div className="td-qai-skeleton-input" />
                </div>
                <div className="td-qai-skeleton-label" />
                <div className="td-qai-skeleton-row">
                  <div className="td-qai-skeleton-pill td-qai-skeleton-pill-active" />
                  <div className="td-qai-skeleton-pill" />
                  <div className="td-qai-skeleton-pill" />
                </div>
                <div className="td-qai-skeleton-btn" />
              </div>
            )}

            {/* ── Loading step ── */}
            {quickAIStep === "loading" && (
              <div className="td-qai-loading">
                <div className="td-qai-spinner" />
                <h3 className="td-qai-loading-title">{currentLoadingMsg} ({loadingProgress}%)</h3>
                <p className="td-qai-loading-sub">
                  Please wait while our AI creates the perfect trip plan including {data.name}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MANAGE TRIP MODAL  (Task 2)
      ══════════════════════════════════════════════════════════════════════════ */}
      {showManageTripModal && (
        <div className="td-modal-overlay" onClick={() => setShowManageTripModal(false)}>
          <div className="td-modal-manage-trip" onClick={(e) => e.stopPropagation()}>

            {/* ── Menu ── */}
            {manageTripStep === "menu" && (
              <>
                <CloseBtn onClick={() => setShowManageTripModal(false)} />
                <h2 className="td-mt-title">Manage Trip</h2>
                <p className="td-mt-subtitle">Update where this place is saved</p>

                {[
                  {
                    id: "moveDay",
                    icon: (
                      <svg className="td-mt-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    ),
                    title: "Move to Another Day",
                    sub: "Choose a different day",
                    danger: false,
                  },
                  {
                    id: "moveTrip",
                    icon: (
                      <svg className="td-mt-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2"/>
                        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                      </svg>
                    ),
                    title: "Move to Another Trip",
                    sub: "Move this destination to another trip",
                    danger: false,
                  },
                  {
                    id: "remove",
                    icon: (
                      <svg className="td-mt-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e02424" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                    ),
                    title: "Remove from Trip",
                    sub: "Remove this destination from your itinerary",
                    danger: true,
                  },
                ].map((opt, i, arr) => (
                  <div key={opt.id}>
                    <div className="td-mt-option" onClick={() => setManageTripStep(opt.id)}>
                      {opt.icon}
                      <div className="td-mt-option-text">
                        <span className={`td-mt-option-title${opt.danger ? " td-mt-option-danger" : ""}`}>
                          {opt.title}
                        </span>
                        <span className="td-mt-option-sub">{opt.sub}</span>
                      </div>
                    </div>
                    {i < arr.length - 1 && <div className="td-mt-divider" />}
                  </div>
                ))}
              </>
            )}

            {/* ── Move to Another Day ── */}
            {manageTripStep === "moveDay" && (
              <>
                <CloseBtn onClick={() => setShowManageTripModal(false)} />
                <div className="td-mt-header-row">
                  <BackBtn onClick={() => setManageTripStep("menu")} />
                  <div>
                    <h2 className="td-mt-title">Select New Day</h2>
                    <p className="td-mt-subtitle">Update your schedule</p>
                  </div>
                </div>
                <Calendar
                  month={manageDayMonth}
                  onMonthChange={setManageDayMonth}
                  rangeMode={false}
                  selectedSingleDay={manageSelectedDay}
                  onDayClick={(day) => {
                    setManageSelectedDay(new Date(manageDayMonth.getFullYear(), manageDayMonth.getMonth(), day));
                  }}
                />
                <button
                  className="td-mt-submit-btn"
                  disabled={!manageSelectedDay || actionLoading}
                  onClick={handleMoveDay}
                >
                  {actionLoading ? "Updating…" : "Update Date"}
                </button>
              </>
            )}

            {/* ── Move to Another Trip ── */}
            {manageTripStep === "moveTrip" && (
              <>
                <CloseBtn onClick={() => setShowManageTripModal(false)} />
                <div className="td-mt-header-row">
                  <BackBtn onClick={() => setManageTripStep("menu")} />
                  <div>
                    <h2 className="td-mt-title">Select Destination Trip</h2>
                    <p className="td-mt-subtitle">Choose which trip to move this place to.</p>
                  </div>
                </div>

                <div className="td-mt-trip-list">
                  {tripsLoading ? (
                    <div className="td-trips-loading"><div className="td-trips-spinner" /><span>Loading…</span></div>
                  ) : (
                    trips
                      .filter((t) => t.id !== addedTripId) // exclude current trip
                      .map((trip) => (
                        <div
                          key={trip.id}
                          className={`td-mt-trip-card ${manageDestTripId === trip.id ? "selected" : ""}`}
                          onClick={() => setManageDestTripId(trip.id)}
                        >
                          <img
                            src={trip.coverImage || "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=200"}
                            alt={trip.title}
                            className="td-mt-trip-img"
                          />
                          <div className="td-trip-info">
                            <span className="td-trip-name">{trip.title}</span>
                            <span className="td-trip-meta">
                              {trip.durationDays || "—"} days · {trip.placesCount ?? "—"} places
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                <button
                  className="td-mt-submit-btn"
                  disabled={!manageDestTripId || actionLoading}
                  onClick={handleMoveTrip}
                >
                  {actionLoading ? "Moving…" : "Move Trip"}
                </button>
              </>
            )}

            {/* ── Remove Confirmation ── */}
            {manageTripStep === "remove" && (
              <>
                <CloseBtn onClick={() => setShowManageTripModal(false)} />
                <div className="td-mt-confirm-header">
                  <BackBtn onClick={() => setManageTripStep("menu")} />
                  <h2 className="td-mt-confirm-title">
                    Are you sure you want to{" "}
                    <span className="td-mt-confirm-danger">delete</span> from trip?
                  </h2>
                </div>
                <button className="td-mt-cancel-btn" onClick={() => setManageTripStep("menu")}>
                  Cancel
                </button>
                <button
                  className="td-mt-confirm-btn"
                  onClick={handleRemoveFromTrip}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Removing…" : "Confirm"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          REVIEW MODAL
      ══════════════════════════════════════════════════════════════════════════ */}
      {showReviewModal && (
        <div className="td-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="td-modal-review" onClick={(e) => e.stopPropagation()}>
            <CloseBtn onClick={() => setShowReviewModal(false)} />
            <h2 className="td-review-modal-title">Rate your experience</h2>
            <p className="td-review-modal-sub">How was your visit to {data.name}?</p>
            <div className="td-review-modal-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`td-modal-star ${star <= reviewRating ? "active" : ""}`}
                  onClick={() => setReviewRating(star)}
                >★</span>
              ))}
            </div>
            <textarea
              className="td-review-modal-textarea"
              placeholder="Share your thoughts…"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <button className="td-review-modal-submit">Submit Review</button>
            <button className="td-review-modal-cancel" onClick={() => setShowReviewModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TOAST
      ══════════════════════════════════════════════════════════════════════════ */}
      {showToast && (
        <div className="td-toast">
          <span>{toastMessage}</span>
          {isAddedToTrip && !toastMessage.includes("removed") && !toastMessage.includes("moved") && (
            <button
              className="td-toast-view"
              onClick={() => window.navigateToTripResult?.({ tripId: addedTripId })}
            >
              View
            </button>
          )}
        </div>
      )}

      <Footer />
    </>
  );
};

export default TripDetails;