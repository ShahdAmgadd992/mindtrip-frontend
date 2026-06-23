import React, { useState, useRef, useEffect } from "react";
import chatIconImg from "../../assets/ai-planner/chat_icon.svg";
import sendIconImg from "../../assets/ai-planner/material-symbols_send-outline.svg";
import aiService from "../../services/aiService";
import "./AiPlanner.css";

const STATIC_GREETING =
  "Hi! I'm Mindy, your AI travel assistant\nI can help you plan your perfect trip in Egypt.\nWhat would you like to do today?";

const EMPTY_COLLECTED = {
  destination: null,
  days: null,
  budget: null,
  interests: [],
  people: null,
  mustInclude: [],
};

const hasAnyValue = (obj) =>
  !!obj &&
  Object.values(obj).some((v) =>
    Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined && v !== "",
  );

// ─── Trip Summary Card ────────────────────────────────────────────────────────
// Renders at the bottom of the chat once the AI returns status "complete"
// or "plan_ready". Matches the UI screenshot exactly:
//   • Left side  — destination photo (fallback gradient if no image)
//   • Right side — 📍 destination, 🗓 duration, 👥 travelers, 💰 budget
//   • Full-width "Full Plan ›" button that calls onViewPlan()
const TripSummaryCard = ({ summary, onViewPlan }) => {
  if (!summary) return null;

  const { image, destination, days, nights, people, budget } = summary;

  const nightsLabel = nights ?? (days ? days - 1 : null);

  return (
    <div className="chat-trip-card">
      {/* Photo */}
      <div className="chat-trip-card__photo-wrap">
        {image ? (
          <img
            src={image}
            alt={destination}
            className="chat-trip-card__photo"
          />
        ) : (
          <div className="chat-trip-card__photo-fallback">
            <span style={{ fontSize: "2rem" }}>🌍</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="chat-trip-card__info">
        {destination && (
          <p className="chat-trip-card__row">
            <span className="chat-trip-card__icon">📍</span>
            <span>
              <strong>Destination:</strong> {destination}
            </span>
          </p>
        )}
        {days && (
          <p className="chat-trip-card__row">
            <span className="chat-trip-card__icon">🗓</span>
            <span>
              <strong>Duration:</strong> {days} {days === 1 ? "Day" : "Days"}
              {nightsLabel != null
                ? `, ${nightsLabel} ${nightsLabel === 1 ? "Night" : "Nights"}`
                : ""}
            </span>
          </p>
        )}
        {people && (
          <p className="chat-trip-card__row">
            <span className="chat-trip-card__icon">👥</span>
            <span>
              <strong>Travelers:</strong> {people}
            </span>
          </p>
        )}
        {budget && (
          <p className="chat-trip-card__row">
            <span className="chat-trip-card__icon">💰</span>
            <span>
              <strong>Est. Budget:</strong>{" "}
              <span className="chat-trip-card__budget">
                *{budget} EGP / person
              </span>
            </span>
          </p>
        )}

        {/* CTA */}
        <button className="chat-trip-card__btn" onClick={onViewPlan}>
          Full Plan &rsaquo;
        </button>
      </div>
    </div>
  );
};

// ─── Budget breakdown row (transport / activities / meals / entry fees) ───────
// Matches the small icon row shown at the very bottom of the chat in the UI.
const BudgetBreakdown = ({ breakdown }) => {
  if (!breakdown) return null;
  const items = [
    { label: "Transport", icon: "🚌", value: breakdown.transport },
    { label: "Activities", icon: "🎯", value: breakdown.activities },
    { label: "Meals", icon: "🍽️", value: breakdown.meals },
    {
      label: "Entry fees",
      icon: "🎟️",
      value: breakdown.entryFees ?? breakdown.entry_fees,
    },
  ].filter((i) => i.value != null);

  if (!items.length) return null;

  return (
    <div className="chatbot-msg-row chatbot-msg-row--ai">
      <div className="chatbot-avatar">
        <img src={chatIconImg} alt="AI" className="chatbot-avatar-icon" />
      </div>
      <div className="chatbot-bubble-wrap">
        <div className="chatbot-sender-info">
          <span className="chatbot-sender-name">Ai Assistant</span>
        </div>
        <div className="chatbot-bubble chatbot-bubble--ai chat-budget-breakdown">
          {items.map((item) => (
            <div key={item.label} className="chat-budget-breakdown__item">
              <span className="chat-budget-breakdown__icon">{item.icon}</span>
              <span className="chat-budget-breakdown__label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── ChatBot ──────────────────────────────────────────────────────────────────
/**
 * Props
 * ─────
 * userName        – display name shown in the header  (default "Laila")
 * onClose         – called when the user taps ← back
 * userId          – passed through to aiService calls
 * initialCollected– answers already picked in the AiPlanner wizard
 * onTripReady     – (tripPlan) => void
 *                   Called when the AI returns status "complete" / "plan_ready"
 *                   AND the plan data is parsed into a TripResult-compatible
 *                   object. The parent (AiPlanner) should store it and render
 *                   <TripResult tripPlan={...} /> after closing the chatbot.
 */
const ChatBot = ({
  userName = "Laila",
  onClose,
  userId = "guest",
  initialCollected = null,
  onTripReady, // ← NEW: parent callback
}) => {
  const startedFromSelections = hasAnyValue(initialCollected);

  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [chatError, setChatError] = useState(null);
  const [sessionId] = useState(() => `session-${Date.now()}`);

  // Accumulated answers
  const [collected, setCollected] = useState({
    ...EMPTY_COLLECTED,
    ...(initialCollected || {}),
  });

  // Trip summary card state — shown once plan is ready
  const [tripSummary, setTripSummary] = useState(null); // { destination, days, nights, people, budget, image }
  const [tripPlanData, setTripPlanData] = useState(null); // full TripResult-compatible object
  const [budgetBreakdown, setBudgetBreakdown] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, tripSummary, bottomRef]);

  useEffect(() => {
    kickoffConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Parse whatever the backend sends when status is "complete" / "plan_ready"
   * into the shape that both the TripSummaryCard and TripResult expect.
   */
  const parsePlanFromResponse = (data, currentCollected) => {
    const rawData = Array.isArray(data?.plan)
      ? data.plan[0]
      : (data?.plan ?? data?.collected ?? data);

    const destination =
      currentCollected?.destination ??
      rawData?.destination ??
      rawData?.city ??
      null;

    const days = currentCollected?.days ?? rawData?.days ?? null;

    const nights = days ? days - 1 : null;

    const people = currentCollected?.people
      ? `${currentCollected.people} ${currentCollected.people === 1 ? "Person" : "People"}`
      : rawData?.people
        ? `${rawData.people} ${rawData.people === 1 ? "Person" : "People"}`
        : null;

    const budget =
      currentCollected?.budget ??
      rawData?.budget_per_person ??
      rawData?.budget ??
      null;

    // First photo from any day slot
    const FALLBACK_IMG =
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80";

    const findFirstPhoto = (plan) => {
      if (!plan) return null;
      for (let d = 1; d <= 7; d++) {
        const dayData = plan[`day${d}`];
        if (!dayData) continue;
        for (const slot of ["morning", "afternoon", "evening"]) {
          const photo = (dayData[slot] ?? []).find(
            (p) => p?.photo_url,
          )?.photo_url;
          if (photo) return photo;
        }
      }
      return null;
    };

    const image = findFirstPhoto(rawData) ?? FALLBACK_IMG;

    // Budget breakdown
    const breakdown =
      rawData?.budget_breakdown ?? data?.budget_breakdown ?? null;
    if (breakdown) setBudgetBreakdown(breakdown);

    // Build itinerary for TripResult
    const itinerary = [];
    const dayDetails = {};
    const numDays = days ?? 3;

    for (let d = 1; d <= numDays; d++) {
      const dayKey = `day${d}`;
      const dayData = rawData?.[dayKey];

      const slots = ["morning", "afternoon", "evening"].map((slot) => {
        const items = dayData?.[slot] ?? [];
        const titles = items
          .map((p) => p?.name ?? p?.title ?? "")
          .filter(Boolean);
        return {
          time: slot.charAt(0).toUpperCase() + slot.slice(1),
          title: titles[0] ?? `${slot} activities`,
          activities: titles.length ? titles : ["Explore the area"],
          rawItems: items,
        };
      });

      dayDetails[d] = slots;

      const allItems = ["morning", "afternoon", "evening"].flatMap(
        (s) => dayData?.[s] ?? [],
      );
      const tags = [
        ...new Set(allItems.map((p) => p?.category ?? p?.type).filter(Boolean)),
      ].slice(0, 3);

      const dayCost = allItems.reduce(
        (sum, p) => sum + (p?.cost ?? p?.price ?? 0),
        0,
      );

      const firstImg =
        allItems.find((p) => p?.photo_url)?.photo_url ?? FALLBACK_IMG;

      itinerary.push({
        day: d,
        description: dayData?.title ?? `Day ${d} in ${destination ?? "Egypt"}`,
        duration: `${allItems.length} stops`,
        type: "Full day",
        cost: dayCost,
        tags: tags.length ? tags : ["Explore"],
        img: firstImg,
      });
    }

    // Hotel / accommodation
    const accommodationRaw = rawData?.accommodation ?? null;
    const firstHotel = Array.isArray(accommodationRaw)
      ? accommodationRaw[0]
      : accommodationRaw;
    const hotel = firstHotel
      ? {
          name: firstHotel.name,
          city: firstHotel.city ?? firstHotel.city_en,
          address: firstHotel.address,
          photoUrl: firstHotel.photo_url,
          price: firstHotel.cost ?? firstHotel.price,
          rating: firstHotel.rating,
          checkIn: null,
          checkOut: null,
          nights,
        }
      : null;

    const fullTripPlan = {
      destination,
      days: numDays,
      nights,
      people: currentCollected?.people ?? null,
      budget: budget ?? null,
      itinerary,
      dayDetails,
      hotel,
      accommodation: accommodationRaw,
      rawPlan: rawData,
      collected: currentCollected,
    };

    return {
      summary: { destination, days: numDays, nights, people, budget, image },
      fullTripPlan,
    };
  };
  const tryExtractSummaryFromText = (text, currentCollected) => {
    // لازم كل المعلومات الأساسية تكون موجودة الأول
    const isComplete =
      currentCollected?.destination &&
      currentCollected?.days &&
      currentCollected?.budget &&
      currentCollected?.people;

    if (!isComplete) return null;

    // وبعدين نتأكد إن الـ AI قال إن الـ plan جاهز
    const hasConfirmation =
      /plan(?:ning|ned)?|itinerary|get ready|you(?:'re| are) all set|here(?:'s| is) your/i.test(
        text,
      );
    if (!hasConfirmation) return null;

    return {
      destination: currentCollected?.destination ?? null,
      days: currentCollected?.days ?? null,
      nights: currentCollected?.days ? currentCollected.days - 1 : null,
      people: currentCollected?.people
        ? `${currentCollected.people} ${currentCollected.people === 1 ? "Person" : "People"}`
        : null,
      budget: currentCollected?.budget ?? null,
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80",
    };
  };
  // ── Kickoff ───────────────────────────────────────────────────────────────

  const kickoffConversation = async () => {
    setIsTyping(true);
    setChatError(null);
    try {
      const chatPayload = {
        sessionId,
        message: startedFromSelections
          ? "Let's continue planning my trip with what I've already chosen."
          : "Hi",
        collected: { ...collected },
        cardAnswers: {
          destination: collected.destination,
          days: collected.days,
          budget: collected.budget,
          interests: collected.interests,
          people: collected.people,
          must_include: collected.mustInclude,
        },
      };
      const response = await aiService.chat(chatPayload);
      const data = response.data;

      if (data?.collected) {
        setCollected((prev) => ({ ...prev, ...data.collected }));
      }

      const reply =
        data?.output ??
        data?.reply ??
        data?.message ??
        data?.content?.[0]?.text ??
        "Sorry, I didn't get a usable response from the server.";

      setMessages([
        {
          id: Date.now(),
          from: "ai",
          text: reply,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);

      // Check if plan is immediately ready (e.g. user had all info pre-filled)

      if (data?.status === "complete" || data?.status === "plan_ready") {
        const mergedCollected = { ...collected, ...(data.collected ?? {}) };
        const { summary, fullTripPlan } = parsePlanFromResponse(
          data,
          mergedCollected,
        );
        setTripSummary(summary);
        setTripPlanData(fullTripPlan);
      } else {
        const fallbackSummary = tryExtractSummaryFromText(reply, collected);
        if (fallbackSummary && fallbackSummary.destination) {
          setTripSummary(fallbackSummary);
        }
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.output ??
        err.response?.data?.message ??
        err.message ??
        "Failed to get response. Please try again.";
      setChatError(errorMsg);
      setMessages([
        {
          id: Date.now(),
          from: "ai",
          text: STATIC_GREETING,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // ── Send message ──────────────────────────────────────────────────────────

  const sendMessage = async () => {
    if (!inputVal.trim()) return;
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const userMsg = {
      id: Date.now(),
      from: "user",
      text: inputVal.trim(),
      time: now,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);
    setChatError(null);

    try {
      const chatPayload = {
        sessionId,
        message: userMsg.text,
        collected: {
          destination: collected.destination,
          days: collected.days,
          budget: collected.budget,
          interests: collected.interests,
          people: collected.people,
          mustInclude: collected.mustInclude,
        },
        cardAnswers: {
          destination: collected.destination,
          days: collected.days,
          budget: collected.budget,
          interests: collected.interests,
          people: collected.people,
          must_include: collected.mustInclude,
        },
      };
      const response = await aiService.chat(chatPayload);
      const data = response.data;

      let mergedCollected = { ...collected };
      if (data?.collected) {
        mergedCollected = { ...collected, ...data.collected };
        setCollected(mergedCollected);
      }

      const reply =
        data?.output ??
        data?.reply ??
        data?.message ??
        data?.content?.[0]?.text ??
        "Sorry, I didn't get a usable response from the server.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "ai",
          text: reply,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);

      // ── Plan ready → show the Trip Summary Card ──
      if (data?.status === "complete" || data?.status === "plan_ready") {
        const mergedCollected = { ...collected, ...(data.collected ?? {}) };
        const { summary, fullTripPlan } = parsePlanFromResponse(
          data,
          mergedCollected,
        );
        setTripSummary(summary);
        setTripPlanData(fullTripPlan);
      } else {
        const fallbackSummary = tryExtractSummaryFromText(reply, collected);
        if (fallbackSummary && fallbackSummary.destination) {
          setTripSummary(fallbackSummary);
        }
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.output ??
        err.response?.data?.message ??
        err.message ??
        "Failed to get response. Please try again.";
      setChatError(errorMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "ai",
          text: `⚠️ ${errorMsg}`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── "Full Plan" button handler ────────────────────────────────────────────
  const handleViewFullPlan = () => {
    if (tripPlanData && onTripReady) {
      onTripReady(tripPlanData);
    }
    onClose?.();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="chatbot-overlay" onClick={onClose}>
      <div className="chatbot-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="chatbot-header">
          <button className="chatbot-back-btn" onClick={onClose}>
            ←
          </button>
          <h2 className="chatbot-title">Hello, {userName}</h2>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chatbot-msg-row chatbot-msg-row--${msg.from}`}
            >
              {msg.from === "ai" && (
                <div className="chatbot-avatar">
                  <img
                    src={chatIconImg}
                    alt="AI"
                    className="chatbot-avatar-icon"
                  />
                </div>
              )}
              <div className="chatbot-bubble-wrap">
                {msg.from === "ai" && (
                  <div className="chatbot-sender-info">
                    <span className="chatbot-time">{msg.time}</span>
                    <span className="chatbot-sender-name">Ai Assistant</span>
                  </div>
                )}
                <div className={`chatbot-bubble chatbot-bubble--${msg.from}`}>
                  {msg.text.split("\n").map((line, i, arr) => (
                    <span key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="chatbot-msg-row chatbot-msg-row--ai">
              <div className="chatbot-avatar">
                <img
                  src={chatIconImg}
                  alt="AI"
                  className="chatbot-avatar-icon"
                />
              </div>
              <div className="chatbot-bubble-wrap">
                <div className="chatbot-sender-info">
                  <span className="chatbot-sender-name">Ai Assistant</span>
                </div>
                <div className="chatbot-bubble chatbot-bubble--ai chatbot-typing">
                  <span className="chatbot-dot" />
                  <span className="chatbot-dot" />
                  <span className="chatbot-dot" />
                </div>
              </div>
            </div>
          )}

          {/* ── Trip Summary Card — appears once AI says plan is complete ── */}
          {tripSummary && !isTyping && (
            <>
              {/* Budget breakdown icons row (optional, from backend) */}
              <BudgetBreakdown breakdown={budgetBreakdown} />

              {/* The card itself */}
              <div className="chatbot-msg-row chatbot-msg-row--ai">
                <div className="chatbot-avatar">
                  <img
                    src={chatIconImg}
                    alt="AI"
                    className="chatbot-avatar-icon"
                  />
                </div>
                <div className="chatbot-bubble-wrap" style={{ width: "100%" }}>
                  <div className="chatbot-sender-info">
                    <span className="chatbot-time">
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="chatbot-sender-name">Ai Assistant</span>
                  </div>
                  <TripSummaryCard
                    summary={tripSummary}
                    onViewPlan={handleViewFullPlan}
                  />
                </div>
              </div>
            </>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Error */}
        {chatError && <div className="chatbot-error">{chatError}</div>}

        {/* Input */}
        <div className="chatbot-input-row">
          <div className="chatbot-input-wrap">
            <input
              ref={inputRef}
              className="chatbot-input"
              placeholder="Type a message"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKey}
            />
          </div>
          <button
            className="chatbot-send-btn"
            onClick={sendMessage}
            disabled={!inputVal.trim()}
          >
            <img src={sendIconImg} alt="Send" className="chatbot-send-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
