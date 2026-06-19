import React, { useState, useEffect } from "react";
import robotImg from "../../assets/ai-planner/Robot - Modern cute chatbot 1.svg";
import ellipseImg from "../../assets/ai-planner/Ellipse 21.svg";
import chatIconImg from "../../assets/ai-planner/chat_icon.svg";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import { useAuth } from "../../context/useAuth";
import ChatBot from "./ChatBot";
import TripResult from "./TripResult";
import "./AiPlanner.css";
import searchIcon from "../../assets/icons/search.png";
const destinations = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Aswan",
  "Luxor",
  "Asyut",
  "Beheira",
  "Fayoum",
  "Ismailia",
  "Port Said",
  "Matroh",
  "Suez",
  "Red Sea",
  "Sinai",
  "Hurghada",
  "Sharm Elsheikh",
];

const interestOptions = [
  { label: "Arts & Crafts", emoji: "🎨" },
  { label: "Bakery", emoji: "🥐" },
  { label: "Beaches & Water", emoji: "🏖️" },
  { label: "Cafe", emoji: "☕" },
  { label: "Entertainment", emoji: "🎭" },
  { label: "History & Antiquities", emoji: "🏛️" },
  { label: "Mosques & Churches", emoji: "🕌" },
  { label: "Music", emoji: "🎵" },
  { label: "Nature", emoji: "🌿" },
  { label: "Nightlife", emoji: "🌃" },
  { label: "Outdoor", emoji: "🏕️" },
  { label: "Park", emoji: "🌸" },
  { label: "Restaurants", emoji: "🍽️" },
  { label: "Seafood", emoji: "🦐" },
  { label: "Shopping", emoji: "🛍️" },
  { label: "Street Food", emoji: "🥙" },
  { label: "Tourism", emoji: "🗺️" },
  { label: "Waterfront", emoji: "🌊" },
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  let day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const AiPlanner = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(
    "Mindy is working his magic...",
  );
  const [planError, setPlanError] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [tripPlan, setTripPlan] = useState(null);
  const totalSteps = 5;

  const [selectedDest, setSelectedDest] = useState(null);
  const [search, setSearch] = useState("");

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [pets, setPets] = useState(0);

  const [selectedInterests, setSelectedInterests] = useState([]);

  const [selectedBudget, setSelectedBudget] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [apiMinBudget, setApiMinBudget] = useState(300);

  const [showChatbot, setShowChatbot] = useState(false);

  const progressPercent = (step / totalSteps) * 100;

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else setCalMonth((m) => m - 1);
  };
  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else setCalMonth((m) => m + 1);
  };

  const handleDayClick = (day) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate({ year: calYear, month: calMonth, day });
      setEndDate(null);
    } else {
      const s = new Date(startDate.year, startDate.month, startDate.day);
      const e = new Date(calYear, calMonth, day);
      if (e < s) {
        setStartDate({ year: calYear, month: calMonth, day });
        setEndDate(null);
      } else {
        setEndDate({ year: calYear, month: calMonth, day });
      }
    }
  };

  const isDayStart = (day) =>
    startDate &&
    calYear === startDate.year &&
    calMonth === startDate.month &&
    day === startDate.day;
  const isDayEnd = (day) =>
    endDate &&
    calYear === endDate.year &&
    calMonth === endDate.month &&
    day === endDate.day;
  const isDayInRange = (day) => {
    if (!startDate || !endDate) return false;
    const d = new Date(calYear, calMonth, day);
    const s = new Date(startDate.year, startDate.month, startDate.day);
    const e = new Date(endDate.year, endDate.month, endDate.day);
    return d > s && d < e;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    const prevMonthDays = getDaysInMonth(
      calYear,
      calMonth === 0 ? 11 : calMonth - 1,
    );
    const cells = [];
    for (let i = firstDay - 1; i >= 0; i--)
      cells.push(
        <div key={`prev-${i}`} className="aip-cal-day aip-cal-day--other">
          {prevMonthDays - i}
        </div>,
      );
    for (let d = 1; d <= daysInMonth; d++) {
      const isStart = isDayStart(d);
      const isEnd = isDayEnd(d);
      const inRange = isDayInRange(d);
      let cls = "aip-cal-day";
      if (isStart || isEnd) cls += " aip-cal-day--selected";
      else if (inRange) cls += " aip-cal-day--range";
      cells.push(
        <div key={`d-${d}`} className={cls} onClick={() => handleDayClick(d)}>
          {d}
        </div>,
      );
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++)
      cells.push(
        <div key={`next-${d}`} className="aip-cal-day aip-cal-day--other">
          {d}
        </div>,
      );
    return cells;
  };

  const changeCount = (setter, val, delta) => setter(Math.max(0, val + delta));
  const hasBudget = selectedBudget !== null || customAmount.trim() !== "";
  const toggleInterest = (label) =>
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
    );

  const getTripDays = () => {
    if (!startDate || !endDate) return 3;
    const s = new Date(startDate.year, startDate.month, startDate.day);
    const e = new Date(endDate.year, endDate.month, endDate.day);
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff + 1 : 1;
  };

  const basicPrice = apiMinBudget;
  const standardPrice = Math.ceil(basicPrice * 1.5);
  const comfortPrice = Math.ceil(standardPrice * 1.5);
  const premiumPrice = Math.ceil(comfortPrice * 1.5);

  const dynamicBudgetOptions = [
    { label: "Basic", price: basicPrice, emoji: "🧳" },
    { label: "Standard", price: standardPrice, emoji: "🙂" },
    { label: "Comfort", price: comfortPrice, emoji: "💸" },
    { label: "Premium", price: premiumPrice, emoji: "💎" },
  ];

  const getBudgetAmount = () => {
    if (customAmount) return parseFloat(customAmount);
    if (selectedBudget === "Basic") return basicPrice;
    if (selectedBudget === "Standard") return standardPrice;
    if (selectedBudget === "Comfort") return comfortPrice;
    if (selectedBudget === "Premium") return premiumPrice;
    return 0;
  };

  const extractBudgetFloor = (data, peopleCount) => {
    if (!data) return null;
    const errorMsg = data?.budget_validation?.message || data?.message || "";
    if (
      data?.status === "budget_unfeasible" ||
      data?.budget_validation?.status === "budget_unfeasible" ||
      errorMsg.includes("floor")
    ) {
      const match = errorMsg.match(/use at least ([\d,.]+)/);
      if (match) {
        const totalMin = parseFloat(match[1].replace(/,/g, ""));
        return Math.ceil(totalMin / peopleCount);
      }
    }
    return null;
  };

  const handleContinue = () => {
    if (step < 4) {
      setStep((s) => s + 1);
    } else if (step === 4) {
      fetchMinimumBudget();
    } else if (step === 5) {
      handleGeneratePlan();
    }
  };

  const fetchMinimumBudget = async () => {
    setIsLoading(true);
    setLoadingText("Calculating best prices...");
    setPlanError(null);

    try {
      const days = getTripDays();
      const peopleCount = Math.max(1, adults + children);

      const requestPayload = {
        city: selectedDest,
        days: Math.min(days, 7),
        budget: 1,
        people: peopleCount,
        interests: selectedInterests.length > 0 ? selectedInterests : ["Cafe"],
      };

      const { default: aiService } = await import("../../services/aiService");
      const response = await aiService.generatePlan(requestPayload);

      const floorPerPerson = extractBudgetFloor(response.data, peopleCount);

      if (floorPerPerson) {
        setApiMinBudget(floorPerPerson);
      } else {
        setApiMinBudget(300);
      }
    } catch (err) {
      const peopleCount = Math.max(1, adults + children);
      const floorPerPerson = extractBudgetFloor(
        err.response?.data,
        peopleCount,
      );

      if (floorPerPerson) {
        setApiMinBudget(floorPerPerson);
      } else {
        setApiMinBudget(300);
      }
    } finally {
      setStep(5);
      setIsLoading(false);
      setLoadingText("Mindy is working his magic...");
    }
  };

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setPlanError(null);

    try {
      const days = getTripDays();
      const peopleCount = Math.max(1, adults + children);
      const perPersonBudget = parseFloat(getBudgetAmount()) || 0;

      const totalBudget = perPersonBudget * peopleCount;

      const requestPayload = {
        city: selectedDest,
        days: Math.min(days, 7),
        budget: totalBudget,
        people: peopleCount,
        interests: selectedInterests.length > 0 ? selectedInterests : ["Cafe"],
      };

      const { default: aiService } = await import("../../services/aiService");
      const response = await aiService.generatePlan(requestPayload);

      const floorPerPerson = extractBudgetFloor(response.data, peopleCount);
      if (floorPerPerson) {
        setApiMinBudget(floorPerPerson);
        setSelectedBudget(null);
        setCustomAmount("");
        setPlanError(
          `The AI calculated a new minimum floor: ${floorPerPerson} EGP per person. Please adjust.`,
        );
        setIsLoading(false);
        return;
      }

      const rawData = Array.isArray(response.data)
        ? response.data[0]
        : response.data;
      const rawPlan = rawData?.plan ?? rawData;

      const itinerary = [];
      const dayDetails = {};
      const FALLBACK_IMG =
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80";

      for (let d = 1; d <= days; d++) {
        const dayKey = `day${d}`;
        const dayData = rawPlan?.[dayKey];

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

        const firstImg =
          ["morning", "afternoon", "evening"]
            .flatMap((s) => dayData?.[s] ?? [])
            .find((p) => p?.photo_url)?.photo_url ?? FALLBACK_IMG;

        const allItems = ["morning", "afternoon", "evening"].flatMap(
          (s) => dayData?.[s] ?? [],
        );
        const tags = [
          ...new Set(
            allItems.map((p) => p?.category ?? p?.type).filter(Boolean),
          ),
        ].slice(0, 3);

        const dayCost = allItems.reduce(
          (sum, p) => sum + (p?.cost ?? p?.price ?? 0),
          0,
        );

        itinerary.push({
          day: d,
          description: dayData?.title ?? `Day ${d} in ${selectedDest}`,
          duration: `${allItems.length} stops`,
          type: "Full day",
          cost: dayCost,
          tags: tags.length ? tags : ["Explore"],
          img: firstImg,
        });
      }

      const accommodation = rawPlan?.accommodation ?? null;

      setTripPlan({
        destination: selectedDest,
        days,
        nights: days - 1,
        adults,
        children,
        pets,
        budget: perPersonBudget,
        itinerary,
        dayDetails,
        accommodation,
        rawPlan,
        requestPayload,
      });

      setShowResult(true);
    } catch (err) {
      console.error("Error generating plan:", err);
      const status = err.response?.status;
      const data = err.response?.data;
      const errorMsg = data?.budget_validation?.message || data?.message || "";

      const userMsg =
        status === 503
          ? "Our AI service is temporarily busy. Please wait a moment and try again."
          : status === 401 || status === 403
            ? "Session expired. Please log in and try again."
            : status === 400
              ? errorMsg ||
                "Some trip details are invalid. Please check your selections."
              : "Something went wrong generating your plan. Please try again.";
      setPlanError(userMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => setStep((s) => s - 1);
  const totalTravelers = adults + children + pets;

  const canContinue = () => {
    if (step === 1) return selectedDest !== null;
    if (step === 2) return startDate !== null && endDate !== null;
    if (step === 3) return totalTravelers > 0;
    if (step === 4) return selectedInterests.length > 0;
    if (step === 5) {
      if (!hasBudget) return false;
      if (customAmount) {
        const val = parseFloat(customAmount);
        if (apiMinBudget && val < basicPrice) return false;
      }
      return true;
    }
    return false;
  };

  const filteredDests = destinations.filter((d) =>
    d.toLowerCase().includes(search.toLowerCase()),
  );

  const botMessages = {
    1: "Tap the bot if you need some inspiration.",
    2: "Not sure about the dates? Ask AI",
    3: "Skip the clicks! Tell AI who's joining.",
    4: "Select what you'd love to do on this trip.",
    5: "Need help estimating your budget? Ask AI",
  };

  if (isLoading) {
    return (
      <div className="aip-loading-screen">
        <div className="aip-loading-robot-wrapper">
          <img src={ellipseImg} alt="" className="aip-loading-ellipse" />
          <img src={robotImg} alt="Mindy" className="aip-loading-robot" />
        </div>
        <div className="aip-loading-spinner" />
        <h2 className="aip-loading-title">{loadingText}</h2>
        <p className="aip-loading-sub">
          Analyzing best spots and matching your trip...
        </p>
      </div>
    );
  }

  if (showResult && tripPlan) {
    return <TripResult tripPlan={tripPlan} user={user} />;
  }

  return (
    <div className="aip-page">
      <Navbar activePage="aiplanner" />
      <div className="aip-hero">
        <h1 className="aip-title">
          <span className="aip-title-ai">AI</span> Planner
        </h1>
        <p className="aip-subtitle">
          Design your dream trip in seconds. Answer a few quick questions, and
          let Mindy do the magic!
        </p>
      </div>

      {planError && (
        <div className="plan-error-banner">
          <span className="plan-error-icon">⚠️</span>
          <span className="plan-error-msg">{planError}</span>
          <button
            className="plan-error-retry"
            onClick={() => setPlanError(null)}
          >
            Got it
          </button>
        </div>
      )}

      <div className="aip-card">
        <div className="aip-progress-bar">
          <div
            className="aip-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {step === 1 && (
          <>
            <div className="aip-question-header">
              <h2 className="aip-question-title">
                Where do you want to go? 📍
              </h2>
              <p className="aip-question-sub">
                Pick a destination or type your dream place or chat with your.
              </p>
            </div>
            <div className="aip-search-wrapper">
              <span className="aip-search-icon">
                <img
                  src={searchIcon}
                  alt="Search"
                  style={{ width: "20px", height: "20px" }}
                />
              </span>
              <input
                className="aip-search-input"
                type="text"
                placeholder="Destinations, trips, activities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="aip-grid" style={{ marginBottom: "28px" }}>
              {filteredDests.map((dest) => (
                <button
                  key={dest}
                  className={`aip-dest-btn ${selectedDest === dest ? "aip-dest-btn--active" : ""}`}
                  onClick={() => setSelectedDest(dest)}
                >
                  {dest}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="aip-question-header">
              <button className="aip-back-btn" onClick={handleBack}>
                ←
              </button>
              <h2 className="aip-question-title">How long is your trip? 🗓️</h2>
              <p className="aip-question-sub">
                Choose how many days you're planning to travel.
              </p>
            </div>
            <div className="aip-calendar">
              <div className="aip-cal-header">
                <button className="aip-cal-nav" onClick={handlePrevMonth}>
                  ‹
                </button>
                <span className="aip-cal-month">
                  {MONTH_NAMES[calMonth]} {calYear}
                </span>
                <button className="aip-cal-nav" onClick={handleNextMonth}>
                  ›
                </button>
              </div>
              <div className="aip-cal-divider" />
              <div className="aip-cal-days-header">
                {DAY_NAMES.map((d, i) => (
                  <div key={i} className="aip-cal-day-name">
                    {d}
                  </div>
                ))}
              </div>
              <div className="aip-cal-grid">{renderCalendar()}</div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="aip-question-header">
              <button className="aip-back-btn" onClick={handleBack}>
                ←
              </button>
              <h2 className="aip-question-title">Who's traveling? 👥</h2>
              <p className="aip-question-sub">
                Tell us how many people are joining.
              </p>
            </div>
            <div className="aip-travelers-grid">
              {[
                { label: "Adults", emoji: "👤", val: adults, set: setAdults },
                {
                  label: "Children",
                  emoji: "👨‍👧",
                  val: children,
                  set: setChildren,
                },
                { label: "Pets", emoji: "🐾", val: pets, set: setPets },
              ].map(({ label, emoji, val, set }) => (
                <div
                  key={label}
                  className={`aip-traveler-card ${val > 0 ? "aip-traveler-card--active" : ""}`}
                >
                  <span
                    className={`aip-traveler-emoji ${val > 0 ? "aip-traveler-emoji--active" : ""}`}
                  >
                    {emoji}
                  </span>
                  <span className="aip-traveler-label">{label}</span>
                  <div className="aip-counter">
                    <button
                      className="aip-counter-btn"
                      onClick={() => changeCount(set, val, -1)}
                    >
                      −
                    </button>
                    <span
                      className={`aip-counter-val ${val > 0 ? "aip-counter-val--active" : ""}`}
                    >
                      {val}
                    </span>
                    <button
                      className="aip-counter-btn"
                      onClick={() => changeCount(set, val, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="aip-question-header">
              <button className="aip-back-btn" onClick={handleBack}>
                ←
              </button>
              <h2 className="aip-question-title">What are you into? 🎯</h2>
              <p className="aip-question-sub">
                Select what you'd love to do on this trip.
              </p>
            </div>
            <div className="aip-interests-grid">
              {interestOptions.map(({ label, emoji }) => (
                <button
                  key={label}
                  className={`aip-interest-btn ${selectedInterests.includes(label) ? "aip-interest-btn--active" : ""}`}
                  onClick={() => toggleInterest(label)}
                >
                  {emoji} {label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <div className="aip-question-header">
              <button className="aip-back-btn" onClick={handleBack}>
                ←
              </button>
              <h2 className="aip-question-title">What's your budget? 💰</h2>
              <p className="aip-question-sub">
                This is your budget per person.
              </p>
            </div>
            <div className="aip-budget-grid">
              {dynamicBudgetOptions.map(({ label, price, emoji }) => (
                <button
                  key={label}
                  className={`aip-budget-btn ${selectedBudget === label ? "aip-budget-btn--active" : ""}`}
                  onClick={() => {
                    setSelectedBudget(label);
                    setCustomAmount("");
                  }}
                >
                  <span className="aip-budget-emoji">{emoji}</span>
                  <span className="aip-budget-label">{label}</span>
                  <span className="aip-budget-price">{price} EGP</span>
                </button>
              ))}
            </div>
            <div className="aip-or-divider">OR</div>
            <input
              className="aip-custom-input"
              type="number"
              placeholder="Enter your custom amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedBudget(null);
              }}
            />
            {customAmount && parseFloat(customAmount) < basicPrice && (
              <p
                style={{
                  color: "#e53935",
                  fontSize: "13px",
                  marginTop: "8px",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                * Minimum practical budget is {basicPrice} EGP per person.
              </p>
            )}
          </>
        )}

        <button
          className={`aip-continue-btn ${canContinue() ? "aip-continue-btn--active" : ""}`}
          onClick={handleContinue}
          disabled={!canContinue()}
        >
          {step === 5 ? "Generate your plan" : "Continue"}
        </button>
      </div>

      {botMessages[step] && (
        <div className="aip-bot-wrapper">
          <p className="aip-bot-text">{botMessages[step]}</p>
          <button className="aip-bot-btn" onClick={() => setShowChatbot(true)}>
            <img
              src={chatIconImg}
              alt="Chat with Mindy"
              className="aip-bot-btn-icon"
            />
          </button>
        </div>
      )}

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

export default AiPlanner;
