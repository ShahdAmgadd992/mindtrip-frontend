import React, { useState, useRef, useEffect } from "react";
import chatIconImg from "../../assets/ai-planner/chat_icon.svg";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import ChatBot from "./ChatBot";
import "./AiPlanner.css";

// ─── Edit caller — uses aiService.edit ───────────────────────────────────────
const callEdit = async (payload) => {
  const mod = await import("../../services/aiService");
  const svc = mod.default ?? mod;
  if (typeof svc.edit !== "function") {
    throw new Error("aiService.edit is not exported from aiService.");
  }
  return svc.edit(payload);
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconEdit = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconTrash = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const IconDots = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);

// ─── Per-card 3-dot menu ──────────────────────────────────────────────────────
const DayMenu = ({ day, onEdit, onRemove }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="aip-day-menu-wrap" ref={ref}>
      <button
        className="aip-day-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Day options"
      >
        <IconDots />
      </button>

      {open && (
        <div className="aip-day-menu-dropdown">
          <button
            className="aip-day-menu-item"
            onClick={() => {
              setOpen(false);
              onEdit(day);
            }}
          >
            <span className="aip-day-menu-icon">
              <IconEdit />
            </span>
            <span>Edit With AI</span>
          </button>

          <button
            className="aip-day-menu-item"
            onClick={() => {
              setOpen(false);
              onRemove(day);
            }}
          >
            <span className="aip-day-menu-icon">
              <IconTrash />
            </span>
            <span>Remove Day</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TripResult = ({ tripPlan, user }) => {
  const [itinerary, setItinerary] = useState(tripPlan?.itinerary ?? []);
  const [dayDetails, setDayDetails] = useState(tripPlan?.dayDetails ?? {});
  const [expandedDay, setExpandedDay] = useState(null);

  // edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [editText, setEditText] = useState("");
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // remove day popup
  const [showRemoveDayPopup, setShowRemoveDayPopup] = useState(false);
  const [removingDay, setRemovingDay] = useState(null);

  // save / manage
  const [isSaved, setIsSaved] = useState(false);
  const [showSavedPopup, setShowSavedPopup] = useState(false);

  // chatbot
  const [showChatbot, setShowChatbot] = useState(false);

  const editSuggestions = [
    "Water Sports",
    "Relaxation",
    "More Activity",
    "Budget-Friendly",
  ];
  const suggestionColors = ["#C4E0F9", "#EDF9F0", "#FCE8D1", "#D7F1F3"];
  const suggestionTextColors = ["#3b82f6", "#22c55e", "#f97316", "#06b6d4"];

  // ── helpers ───────────────────────────────────────────────────────────────
  const openEdit = (day) => {
    setEditingDay(day);
    setEditText("");
    setEditError("");
    setShowEditModal(true);
  };

  const openRemoveDay = (day) => {
    setRemovingDay(day);
    setShowRemoveDayPopup(true);
  };

  const confirmRemoveDay = () => {
    setItinerary((prev) => prev.filter((item) => item.day !== removingDay));
    setDayDetails((prev) => {
      const next = { ...prev };
      delete next[removingDay];
      return next;
    });
    if (expandedDay === removingDay) setExpandedDay(null);
    setShowRemoveDayPopup(false);
    setRemovingDay(null);
  };

  const toggleExpand = (day) =>
    setExpandedDay((prev) => (prev === day ? null : day));

  // ── edit API ──────────────────────────────────────────────────────────────
  const handleUpdateItinerary = async () => {
    if (!editText.trim()) return;
    setIsEditLoading(true);
    setEditError("");

    try {
      const existingPlanFlat = Object.values(dayDetails)
        .flat()
        .flatMap((slot) => slot.rawItems ?? []);

      const editPayload = {
        targetChange: editText,
        destination: tripPlan.destination,
        days: tripPlan.days,
        budget: tripPlan.budget,
        people: Math.max(1, (tripPlan.adults ?? 1) + (tripPlan.children ?? 0)),
        interests: tripPlan.requestPayload?.interests ?? [],
        existingPlan: existingPlanFlat,
      };

      const response = await callEdit(editPayload);
      const data = response.data;
      const mode = data?.mode;

      if (mode === "surgical" || mode === "add") {
        const updatedRaw = data.plan;
        if (updatedRaw) {
          const newDayDetails = { ...dayDetails };
          for (let d = 1; d <= tripPlan.days; d++) {
            const dayKey = `day${d}`;
            const dayData = updatedRaw[dayKey];
            if (!dayData) continue;
            newDayDetails[d] = ["morning", "afternoon", "evening"].map(
              (slot) => {
                const items = dayData[slot] ?? [];
                const titles = items
                  .map((p) => p?.name ?? p?.title ?? "")
                  .filter(Boolean);
                return {
                  time: slot.charAt(0).toUpperCase() + slot.slice(1),
                  title: titles[0] ?? `${slot} activities`,
                  activities: titles.length ? titles : ["Explore the area"],
                  rawItems: items,
                };
              },
            );
          }
          setDayDetails(newDayDetails);
        }
        setShowEditModal(false);
        setEditText("");
      } else if (mode === "remove") {
        const name = data?.removed_item?.name ?? "the item";
        setEditError(`"${name}" was removed. Please describe a replacement.`);
      } else if (mode === "replan") {
        setShowEditModal(false);
      } else {
        setEditError(data?.message ?? "No changes were made.");
      }
    } catch (err) {
      setEditError(
        err.response?.data?.message ??
          err.message ??
          "Failed to update. Please try again.",
      );
    } finally {
      setIsEditLoading(false);
    }
  };

  // ── save trip ─────────────────────────────────────────────────────────────
  const handleSaveTrip = () => {
    setIsSaved(true);
    setShowSavedPopup(true);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="aip-page">
      <Navbar activePage="aiplanner" />

      {/* ── Header ── */}
      <div className="aip-result-header">
        <h1 className="aip-result-title">
          <span className="aip-result-dest">Your</span>{" "}
          <span className="aip-result-dest-name">{tripPlan.destination}</span>{" "}
          <span className="aip-result-dest">Getaway</span>
        </h1>
        <p className="aip-result-meta">
          {tripPlan.days} Days, {tripPlan.nights} Nights &nbsp;|&nbsp;
          {tripPlan.adults} Adults
          {tripPlan.children > 0 ? `, ${tripPlan.children} Kid` : ""}
          {tripPlan.pets > 0 ? `, ${tripPlan.pets} Pet` : ""}
          &nbsp;|&nbsp; Est. {tripPlan.budget} EGP / person
        </p>
      </div>

      {/* ── Body ── */}
      <div className="aip-result-container">
        <div className="aip-result-left">
          <div className="aip-result-days">
            {itinerary.map((item) => {
              const isExpanded = expandedDay === item.day;
              const details = dayDetails[item.day] ?? [];

              // stops count: from data or count activities
              const stopsCount =
                item.stops != null
                  ? item.stops
                  : details.reduce(
                      (acc, slot) => acc + (slot.activities?.length ?? 0),
                      0,
                    ) || null;

              return (
                <div
                  key={item.day}
                  className={`aip-result-day-card ${isExpanded ? "aip-result-day-card--expanded" : ""}`}
                >
                  <img
                    src={item.img}
                    alt={item.description}
                    className="aip-result-day-img"
                  />

                  <div className="aip-result-day-info">
                    <div className="aip-result-day-header-row">
                      <p className="aip-result-day-label">Day {item.day}</p>
                      <DayMenu
                        day={item.day}
                        onEdit={openEdit}
                        onRemove={openRemoveDay}
                      />
                    </div>

                    <h3 className="aip-result-day-title">{item.description}</h3>

                    <div className="aip-result-day-meta">
                      {stopsCount && <span>📍 {stopsCount} stops</span>}
                      <span>🕐 {item.type || item.duration || "Full day"}</span>
                      <span className="aip-result-cost">~{item.cost} EGP</span>
                    </div>

                    <div className="aip-result-tags">
                      {item.tags.map((tag) => (
                        <span key={tag} className="aip-result-tag">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {isExpanded && (
                      <div className="aip-day-details">
                        <div className="aip-timeline-dots">
                          {details.map((_, i) => (
                            <React.Fragment key={i}>
                              <div
                                className={`aip-timeline-dot ${i === 0 ? "aip-timeline-dot--active" : ""}`}
                              />
                              {i < details.length - 1 && (
                                <div className="aip-timeline-line" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                        <div className="aip-day-columns">
                          {details.map((slot, i) => (
                            <div key={i} className="aip-day-column">
                              <p className="aip-day-slot-time">{slot.time} —</p>
                              <p className="aip-day-slot-title">{slot.title}</p>
                              <ul className="aip-day-slot-list">
                                {(slot.rawItems && slot.rawItems.length > 0
                                  ? slot.rawItems
                                  : (slot.activities || []).map((act) => ({
                                      name: act,
                                    }))
                                ).map((place, j) => {
                                  const isStringOnly =
                                    typeof place === "string";
                                  const placeName = isStringOnly
                                    ? place
                                    : (place.name ?? place.title ?? "Activity");
                                  const placeCost = isStringOnly
                                    ? null
                                    : (place.cost ?? place.price ?? null);
                                  const isHiddenGem =
                                    !isStringOnly && !!place.is_hidden_gem;

                                  return (
                                    <li key={j} className="aip-day-slot-item">
                                      <span className="aip-day-slot-bullet">
                                        •
                                      </span>
                                      <span className="aip-day-slot-name">
                                        {placeName}
                                      </span>
                                      {isHiddenGem && (
                                        <span
                                          className="aip-hidden-gem-badge"
                                          title="Hidden Gem"
                                        >
                                          💎 Hidden gem
                                        </span>
                                      )}
                                      {placeCost != null && (
                                        <span className="aip-day-slot-cost">
                                          ~{placeCost} EGP
                                        </span>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      className="aip-result-view-btn"
                      onClick={() => toggleExpand(item.day)}
                    >
                      {isExpanded ? "View less ›" : "View ›"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Map ── */}
        <div className="aip-result-map">
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80"
            alt="Map"
            className="aip-result-map-img"
          />
        </div>
      </div>

      {/* ── Save / Manage button ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "0 0 40px",
        }}
      >
        {!isSaved ? (
          <button className="aip-save-btn" onClick={handleSaveTrip}>
            Save Trip
          </button>
        ) : (
          <button
            className="aip-save-btn aip-manage-btn"
            onClick={() => setShowSavedPopup(true)}
          >
            Manage Trip
          </button>
        )}
      </div>

      {/* ══════════════════════════════
          POPUP — Trip saved
      ══════════════════════════════ */}
      {showSavedPopup && (
        <div
          className="aip-modal-overlay"
          onClick={() => setShowSavedPopup(false)}
        >
          <div
            className="aip-popup aip-saved-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="aip-popup-close"
              onClick={() => setShowSavedPopup(false)}
            >
              ✕
            </button>
            <p className="aip-popup-title">Trip saved to My Trip</p>
            <button
              className="aip-popup-primary-btn"
              onClick={() => {
                setShowSavedPopup(false);

                if (window.navigateToProfile) window.navigateToProfile();
              }}
            >
              View in My Trips
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          POPUP — Remove Day
      ══════════════════════════════ */}
      {showRemoveDayPopup && (
        <div
          className="aip-modal-overlay"
          onClick={() => setShowRemoveDayPopup(false)}
        >
          <div
            className="aip-popup aip-remove-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="aip-popup-close"
              onClick={() => setShowRemoveDayPopup(false)}
            >
              ✕
            </button>
            <p className="aip-popup-title">
              Remove Day {removingDay} from your trip?
            </p>
            <button
              className="aip-popup-outline-btn"
              onClick={() => setShowRemoveDayPopup(false)}
            >
              Cancel
            </button>
            <button className="aip-popup-danger-btn" onClick={confirmRemoveDay}>
              Remove
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          AI EDIT MODAL
      ══════════════════════════════ */}
      {showEditModal && (
        <div
          className="aip-modal-overlay"
          onClick={() => !isEditLoading && setShowEditModal(false)}
        >
          <div className="aip-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="aip-modal-close"
              onClick={() => !isEditLoading && setShowEditModal(false)}
              disabled={isEditLoading}
            >
              ✕
            </button>
            <h3 className="aip-modal-title">Customize Day {editingDay}</h3>
            <textarea
              className="aip-modal-textarea"
              placeholder="What would you like to change?"
              value={editText}
              onChange={(e) => {
                setEditText(e.target.value);
                setEditError("");
              }}
              disabled={isEditLoading}
            />
            <div className="aip-modal-suggestions">
              {editSuggestions.map((s, i) => (
                <button
                  key={s}
                  className="aip-modal-suggestion"
                  style={{
                    background: suggestionColors[i],
                    color: suggestionTextColors[i],
                  }}
                  onClick={() => {
                    setEditText(s);
                    setEditError("");
                  }}
                  disabled={isEditLoading}
                >
                  {s}
                </button>
              ))}
            </div>
            {editError && <p className="aip-modal-error">{editError}</p>}
            <button
              className="aip-modal-update-btn"
              onClick={handleUpdateItinerary}
              disabled={isEditLoading || !editText.trim()}
              style={{ opacity: isEditLoading || !editText.trim() ? 0.6 : 1 }}
            >
              {isEditLoading ? (
                <span className="aip-modal-loading">
                  <span className="aip-modal-spinner" /> Updating...
                </span>
              ) : (
                "Update Itinerary"
              )}
            </button>
            <button
              className="aip-modal-cancel-btn"
              onClick={() => !isEditLoading && setShowEditModal(false)}
              disabled={isEditLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Chatbot FAB ── */}
      <button className="aip-bot-fab" onClick={() => setShowChatbot(true)}>
        <img src={chatIconImg} alt="Chat" className="aip-bot-fab-icon" />
      </button>
      {showChatbot && (
        <ChatBot
          userId={user?.userId}
          userName={user?.displayName}
          onClose={() => setShowChatbot(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default TripResult;
