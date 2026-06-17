import React, { useState } from "react";
import robotImg from "../../assets/ai-planner/Robot - Modern cute chatbot 1.svg";
import ellipseImg from "../../assets/ai-planner/Ellipse 21.svg";
import chatIconImg from "../../assets/ai-planner/chat_icon.svg";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
// import aiService from "../../services/aiService";
import { useAuth } from "../../context/useAuth";
import ChatBot from "./ChatBot";
import TripResult from "./TripResult";
import "./AiPlanner.css";

const destinations = [
  "Cairo","Giza","Alexandria","Aswan","Luxor","Asyut",
  "Beheira","Fayoum","Ismailia","Port Said","Matroh","Suez",
  "Red Sea","Sinai","Hurghada","Sharm Elsheikh",
];

const budgetOptions = [
  { label: "Basic", price: "$300", emoji: "🧳" },
  { label: "Standard", price: "$500", emoji: "🙂" },
  { label: "Comfort", price: "$1000", emoji: "💸" },
  { label: "Premium", price: "$2000", emoji: "💎" },
];

const interestOptions = [
  { label: "Cafés", emoji: "☕" },
  { label: "Bakeries", emoji: "🥐" },
  { label: "Music", emoji: "🎵" },
  { label: "Street Food Spots", emoji: "🥙" },
  { label: "Restaurants", emoji: "🍽️" },
  { label: "Fine Dining", emoji: "❤️" },
  { label: "Bowling", emoji: "🎳" },
  { label: "Food Trucks", emoji: "🚚" },
  { label: "Escape Rooms", emoji: "🏠" },
  { label: "Corniche", emoji: "🏖️" },
  { label: "Healthy Spots", emoji: "🌿" },
  { label: "Picnic Spots", emoji: "🌸" },
  { label: "Rooftop Views", emoji: "🏙️" },
  { label: "Theaters", emoji: "🎭" },
  { label: "Art Workshops", emoji: "🎨" },
  { label: "Handmade Crafts", emoji: "📦" },
];

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { let day = new Date(year, month, 1).getDay(); return day === 0 ? 6 : day - 1; }
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Mo","Tu","We","Th","Fr","Sa","Su"];

// ── Main Component ──
const AiPlanner = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
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
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);

  // ── Chatbot state ──
  const [showChatbot, setShowChatbot] = useState(false);

  const progressPercent = (step / totalSteps) * 100;

  const handlePrevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); } else setCalMonth((m) => m - 1); };
  const handleNextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); } else setCalMonth((m) => m + 1); };

  const handleDayClick = (day) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate({ year: calYear, month: calMonth, day });
      setEndDate(null);
    } else {
      const s = new Date(startDate.year, startDate.month, startDate.day);
      const e = new Date(calYear, calMonth, day);
      if (e < s) { setStartDate({ year: calYear, month: calMonth, day }); setEndDate(null); }
      else { setEndDate({ year: calYear, month: calMonth, day }); }
    }
  };

  const isDayStart = (day) => startDate && calYear === startDate.year && calMonth === startDate.month && day === startDate.day;
  const isDayEnd = (day) => endDate && calYear === endDate.year && calMonth === endDate.month && day === endDate.day;
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
    const prevMonthDays = getDaysInMonth(calYear, calMonth === 0 ? 11 : calMonth - 1);
    const cells = [];
    for (let i = firstDay - 1; i >= 0; i--) cells.push(<div key={`prev-${i}`} className="aip-cal-day aip-cal-day--other">{prevMonthDays - i}</div>);
    for (let d = 1; d <= daysInMonth; d++) {
      const isStart = isDayStart(d);
      const isEnd = isDayEnd(d);
      const inRange = isDayInRange(d);
      let cls = "aip-cal-day";
      if (isStart || isEnd) cls += " aip-cal-day--selected";
      else if (inRange) cls += " aip-cal-day--range";
      cells.push(<div key={`d-${d}`} className={cls} onClick={() => handleDayClick(d)}>{d}</div>);
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) cells.push(<div key={`next-${d}`} className="aip-cal-day aip-cal-day--other">{d}</div>);
    return cells;
  };

  const changeCount = (setter, val, delta) => setter(Math.max(0, val + delta));
  const totalTravelers = adults + children + pets;
  const hasBudget = selectedBudget !== null || customAmount.trim() !== "";
  const toggleInterest = (label) => setSelectedInterests((prev) => prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]);

  const getBudgetAmount = () => {
    if (customAmount) return customAmount;
    if (selectedBudget === "Basic") return 300;
    if (selectedBudget === "Standard") return 500;
    if (selectedBudget === "Comfort") return 1000;
    if (selectedBudget === "Premium") return 2000;
    return 0;
  };

  const getTripDays = () => {
    if (!startDate || !endDate) return 3;
    const s = new Date(startDate.year, startDate.month, startDate.day);
    const e = new Date(endDate.year, endDate.month, endDate.day);
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const handleContinue = () => {
    if (step < totalSteps) {
      setStep((s) => s + 1);
    } else {
      handleGeneratePlan();
    }
  };

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setPlanError(null);

    try {
      const days = getTripDays();

      // ── MOCK MODE: Using local data instead of API ──
      // Simulating API call delay for UX
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create mock itinerary with dummy data
      const mockItinerary = Array.from({ length: days }, (_, i) => {
        const dayNum = i + 1;
        const imgs = [
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80",
          "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=80",
          "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&q=80",
          "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=400&q=80",
          "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80",
        ];
        const descriptions = [
          "Arrival & Chill in " + selectedDest,
          "Desert Vibes & Local Life",
          "Adventure & Blue Magic",
          "Hidden Gems & Local Culture",
          "Relaxation & Farewell",
        ];
        const tagSets = [
          ["Relax", "Beach", "Culture"],
          ["Culture", "Local", "Relax"],
          ["Adventure", "Snorkeling", "Nature"],
          ["Culture", "History", "Food"],
          ["Relax", "Nature", "Sunset"],
        ];
        const idx = Math.min(i, imgs.length - 1);
        return {
          day: dayNum,
          description: descriptions[idx],
          duration: "4 hrs",
          type: "Full day",
          cost: 1000,
          tags: tagSets[idx],
          img: imgs[idx],
        };
      });

      // Set trip plan with mock data
      setTripPlan({
        destination: selectedDest,
        days,
        nights: days - 1,
        adults,
        children,
        pets,
        budget: getBudgetAmount(),
        itinerary: mockItinerary,
      });

      setShowResult(true);

      // ── COMMENTED API CODE (kept for reference) ──
      // const requestPayload = {
      //   city: selectedDest,
      //   days,
      //   budget: parseFloat(getBudgetAmount()),
      //   people: totalTravelers,
      //   interests: selectedInterests.length > 0 ? selectedInterests : undefined,
      // };
      // console.log('Generating plan with payload:', requestPayload);
      // const response = await aiService.generatePlan(requestPayload);
      // console.log('Plan generated response:', response.data);

    } catch (err) {
      console.error('Error in plan generation:', err);
      setPlanError("An error occurred while generating your plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => setStep((s) => s - 1);

  const canContinue = () => {
    if (step === 1) return selectedDest !== null;
    if (step === 2) return startDate !== null && endDate !== null;
    if (step === 3) return totalTravelers > 0;
    if (step === 4) return hasBudget;
    if (step === 5) return selectedInterests.length > 0;
    return false;
  };

  const filteredDests = destinations.filter((d) => d.toLowerCase().includes(search.toLowerCase()));

  const botMessages = {
    1: "Tap the bot if you need some inspiration.",
    2: "Not sure about the dates? Ask AI",
    3: "Skip the clicks! Tell AI who's joining.",
    4: "Need help estimating your budget? Ask AI",
    5: null,
  };

  // ── Loading Screen ──
  if (isLoading) {
    return (
      <div className="aip-loading-screen">
        <div className="aip-loading-robot-wrapper">
          <img src={ellipseImg} alt="" className="aip-loading-ellipse" />
          <img src={robotImg} alt="Mindy" className="aip-loading-robot" />
        </div>
        <div className="aip-loading-spinner" />
        <h2 className="aip-loading-title">Mindy is working his magic...</h2>
        <p className="aip-loading-sub">Analyzing best spots and matching your budget...</p>
      </div>
    );
  }

  // ── Result Screen ──
  if (showResult && tripPlan) {
    return <TripResult tripPlan={tripPlan} user={user} />;
  }

  // ── Main Component ──
  return (
    <div className="aip-page">
      <Navbar activePage="aiplanner" />
      <div className="aip-hero">
        <h1 className="aip-title"><span className="aip-title-ai">AI</span> Planner</h1>
        <p className="aip-subtitle">Design your dream trip in seconds. Answer a few quick questions, and let Mindy do the magic!</p>
      </div>

      {/* Show plan error if exists */}
      {planError && (
        <div className="plan-error-banner">{planError}</div>
      )}

      <div className="aip-card">
        <div className="aip-progress-bar">
          <div className="aip-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        {step === 1 && (
          <>
            <div className="aip-question-header">
              <h2 className="aip-question-title">Where do you want to go? 📍</h2>
              <p className="aip-question-sub">Pick a destination or type your dream place or chat with your.</p>
            </div>
            <div className="aip-search-wrapper">
              <span className="aip-search-icon">🔍</span>
              <input className="aip-search-input" type="text" placeholder="Destinations, trips, activities..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="aip-grid" style={{ marginBottom: "28px" }}>
              {filteredDests.map((dest) => (
                <button key={dest} className={`aip-dest-btn ${selectedDest === dest ? "aip-dest-btn--active" : ""}`} onClick={() => setSelectedDest(dest)}>{dest}</button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="aip-question-header">
              <button className="aip-back-btn" onClick={handleBack}>←</button>
              <h2 className="aip-question-title">How long is your trip? 🗓️</h2>
              <p className="aip-question-sub">Choose how many days you're planning to travel.</p>
            </div>
            <div className="aip-calendar">
              <div className="aip-cal-header">
                <button className="aip-cal-nav" onClick={handlePrevMonth}>‹</button>
                <span className="aip-cal-month">{MONTH_NAMES[calMonth]} {calYear}</span>
                <button className="aip-cal-nav" onClick={handleNextMonth}>›</button>
              </div>
              <div className="aip-cal-divider" />
              <div className="aip-cal-days-header">{DAY_NAMES.map((d, i) => <div key={i} className="aip-cal-day-name">{d}</div>)}</div>
              <div className="aip-cal-grid">{renderCalendar()}</div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="aip-question-header">
              <button className="aip-back-btn" onClick={handleBack}>←</button>
              <h2 className="aip-question-title">Who's traveling? 👥</h2>
              <p className="aip-question-sub">Tell us how many people are joining.</p>
            </div>
            <div className="aip-travelers-grid">
              {[
                { label: "Adults", emoji: "👤", val: adults, set: setAdults },
                { label: "Children", emoji: "👨‍👧", val: children, set: setChildren },
                { label: "Pets", emoji: "🐾", val: pets, set: setPets },
              ].map(({ label, emoji, val, set }) => (
                <div key={label} className={`aip-traveler-card ${val > 0 ? "aip-traveler-card--active" : ""}`}>
                  <span className={`aip-traveler-emoji ${val > 0 ? "aip-traveler-emoji--active" : ""}`}>{emoji}</span>
                  <span className="aip-traveler-label">{label}</span>
                  <div className="aip-counter">
                    <button className="aip-counter-btn" onClick={() => changeCount(set, val, -1)}>−</button>
                    <span className={`aip-counter-val ${val > 0 ? "aip-counter-val--active" : ""}`}>{val}</span>
                    <button className="aip-counter-btn" onClick={() => changeCount(set, val, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="aip-question-header">
              <button className="aip-back-btn" onClick={handleBack}>←</button>
              <h2 className="aip-question-title">What's your budget? 💰</h2>
              <p className="aip-question-sub">This is your budget per person.</p>
            </div>
            <div className="aip-budget-grid">
              {budgetOptions.map(({ label, price, emoji }) => (
                <button key={label} className={`aip-budget-btn ${selectedBudget === label ? "aip-budget-btn--active" : ""}`} onClick={() => { setSelectedBudget(label); setCustomAmount(""); }}>
                  <span className="aip-budget-emoji">{emoji}</span>
                  <span className="aip-budget-label">{label}</span>
                  <span className="aip-budget-price">{price}</span>
                </button>
              ))}
            </div>
            <div className="aip-or-divider">OR</div>
            <input className="aip-custom-input" type="number" placeholder="Enter your custom amount" value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setSelectedBudget(null); }} />
          </>
        )}

        {step === 5 && (
          <>
            <div className="aip-question-header">
              <button className="aip-back-btn" onClick={handleBack}>←</button>
              <h2 className="aip-question-title">What are you into? 🎯</h2>
              <p className="aip-question-sub">Select what you'd love to do on this trip.</p>
            </div>
            <div className="aip-interests-grid">
              {interestOptions.map(({ label, emoji }) => (
                <button key={label} className={`aip-interest-btn ${selectedInterests.includes(label) ? "aip-interest-btn--active" : ""}`} onClick={() => toggleInterest(label)}>
                  {emoji} {label}
                </button>
              ))}
            </div>
          </>
        )}

        <button className={`aip-continue-btn ${canContinue() ? "aip-continue-btn--active" : ""}`} onClick={handleContinue} disabled={!canContinue()}>
          {step === 5 ? "Generate your plan" : "Continue"}
        </button>
      </div>

      {/* Bot bubble */}
      {botMessages[step] && (
        <div className="aip-bot-wrapper">
          <p className="aip-bot-text">{botMessages[step]}</p>
          <button className="aip-bot-btn" onClick={() => setShowChatbot(true)}>
            <img src={chatIconImg} alt="Chat with Mindy" className="aip-bot-btn-icon" />
          </button>
        </div>
      )}

      {/* Chatbot panel */}
      {showChatbot && <ChatBot userId={user?.userId} onClose={() => setShowChatbot(false)} />}

      <Footer />
    </div>
  );
};

export default AiPlanner;