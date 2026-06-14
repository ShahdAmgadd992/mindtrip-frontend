import React, { useState, useRef, useEffect } from "react";
import robotImg from "../../assets/ai-planner/Robot - Modern cute chatbot 1.svg";
import ellipseImg from "../../assets/ai-planner/Ellipse 21.svg";
import chatIconImg from "../../assets/ai-planner/chat_icon.svg";
import sendIconImg from "../../assets/ai-planner/material-symbols_send-outline.svg";
import voiceIconImg from "../../assets/ai-planner/mingcute_voice-line.svg";
import addIconImg from "../../assets/ai-planner/add-rounded.svg";
import cameraIconImg from "../../assets/ai-planner/camera.svg";
import photoIconImg from "../../assets/ai-planner/photo.svg";
import fileIconImg from "../../assets/ai-planner/file.svg";
import videoIconImg from "../../assets/ai-planner/video.svg";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
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

const defaultDayDetails = {
  1: [
    { time: "Morning", title: "Arrival & Check-in", activities: ["Check in", "Relax", "Promenade walk"] },
    { time: "Afternoon", title: "Beach Time", activities: ["Beach time", "Seaside lunch", "Light activities"] },
    { time: "Evening", title: "Sunset & Vibes", activities: ["Sunset", "Café time", "Dinner"] },
  ],
  2: [
    { time: "Morning", title: "Desert Start", activities: ["Early breakfast", "Desert tour", "Camel ride"] },
    { time: "Afternoon", title: "Local Life", activities: ["Local market", "Street food", "Cultural visit"] },
    { time: "Evening", title: "Night Out", activities: ["Local restaurant", "Music", "Night walk"] },
  ],
  3: [
    { time: "Morning", title: "Snorkeling", activities: ["Early dive", "Coral reef", "Underwater photos"] },
    { time: "Afternoon", title: "Blue Waters", activities: ["Boat trip", "Swimming", "Beach lunch"] },
    { time: "Evening", title: "Farewell", activities: ["Sunset view", "Dinner", "Pack & rest"] },
  ],
  4: [
    { time: "Morning", title: "Hidden Gems", activities: ["Old town walk", "Local guide", "Photo spots"] },
    { time: "Afternoon", title: "Culture & Food", activities: ["Cultural site", "Local lunch", "Souvenir shopping"] },
    { time: "Evening", title: "Night Life", activities: ["Rooftop dinner", "Night market", "Live music"] },
  ],
  5: [
    { time: "Morning", title: "Last Explore", activities: ["Final sightseeing", "Breakfast cafe", "Packing"] },
    { time: "Afternoon", title: "Relaxation", activities: ["Spa", "Pool time", "Light lunch"] },
    { time: "Evening", title: "Farewell", activities: ["Sunset view", "Farewell dinner", "Check out"] },
  ],
};

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { let day = new Date(year, month, 1).getDay(); return day === 0 ? 6 : day - 1; }
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Mo","Tu","We","Th","Fr","Sa","Su"];

// ── Chatbot component ──
const ChatBot = ({ userName = "Laila", onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "ai",
      text: "Hi! I'm Mindy, your AI travel assistant\nI can help you plan your perfect trip in Egypt.\nWhat would you like to do today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const attachOptions = [
    { label: "Camera", icon: cameraIconImg },
    { label: "Photo", icon: photoIconImg },
    { label: "File", icon: fileIconImg },
    { label: "Video", icon: videoIconImg },
  ];

  const aiReplies = [
    "Amazing! I'll take care of everything for you\nI just need a few details first.\nWhere would you like to go in Egypt?",
    "Great choice! How many days are you planning to stay?",
    "Perfect! What's your budget per person?",
    "Wonderful! What activities do you enjoy?\n(e.g. beaches, history, food, adventure)",
    "I'm putting together your perfect trip now... 🗺️\nThis will just take a moment!",
  ];
  const [replyIndex, setReplyIndex] = useState(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!inputVal.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { id: Date.now(), from: "user", text: inputVal.trim(), time: now };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = aiReplies[replyIndex % aiReplies.length];
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: "ai", text: reply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ]);
      setReplyIndex((i) => i + 1);
      setIsTyping(false);
    }, 1200);
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div className="chatbot-overlay" onClick={onClose}>
      <div className="chatbot-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="chatbot-header">
          <button className="chatbot-back-btn" onClick={onClose}>←</button>
          <h2 className="chatbot-title">Hello, {userName}</h2>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chatbot-msg-row chatbot-msg-row--${msg.from}`}>
              {msg.from === "ai" && (
                <div className="chatbot-avatar">
                  <img src={chatIconImg} alt="AI" className="chatbot-avatar-icon" />
                </div>
              )}
              <div className={`chatbot-bubble-wrap`}>
                {msg.from === "ai" && (
                  <div className="chatbot-sender-info">
                    <span className="chatbot-time">{msg.time}</span>
                    <span className="chatbot-sender-name">Ai Assistant</span>
                  </div>
                )}
                <div className={`chatbot-bubble chatbot-bubble--${msg.from}`}>
                  {msg.text.split("\n").map((line, i) => (
                    <span key={i}>{line}{i < msg.text.split("\n").length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chatbot-msg-row chatbot-msg-row--ai">
              <div className="chatbot-avatar">
                <img src={chatIconImg} alt="AI" className="chatbot-avatar-icon" />
              </div>
              <div className="chatbot-bubble-wrap">
                <div className="chatbot-sender-info">
                  <span className="chatbot-sender-name">Ai Assistant</span>
                </div>
                <div className="chatbot-bubble chatbot-bubble--ai chatbot-typing">
                  <span className="chatbot-dot" /><span className="chatbot-dot" /><span className="chatbot-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Attach menu */}
        {showAttachMenu && (
          <div className="chatbot-attach-menu">
            {attachOptions.map((opt) => (
              <button key={opt.label} className="chatbot-attach-item" onClick={() => setShowAttachMenu(false)}>
                <img src={opt.icon} alt={opt.label} className="chatbot-attach-icon" />
                <span className="chatbot-attach-label">{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chatbot-input-row">
          <button
            className="chatbot-add-btn"
            onClick={() => setShowAttachMenu((v) => !v)}
          >
            <img src={addIconImg} alt="Add" className="chatbot-add-icon" />
          </button>
          <div className="chatbot-input-wrap">
            <input
              ref={inputRef}
              className="chatbot-input"
              placeholder="Type a message"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKey}
            />
            <button className="chatbot-voice-btn">
              <img src={voiceIconImg} alt="Voice" className="chatbot-voice-icon" />
            </button>
          </div>
          <button className="chatbot-send-btn" onClick={sendMessage} disabled={!inputVal.trim()}>
            <img src={sendIconImg} alt="Send" className="chatbot-send-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ──
const AiPlanner = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [tripPlan, setTripPlan] = useState(null);
  const totalSteps = 5;

  const [dayDetails, setDayDetails] = useState(defaultDayDetails);
  const [expandedDay, setExpandedDay] = useState(null);
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

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [editText, setEditText] = useState("");
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [showSavedModal, setShowSavedModal] = useState(false);

  // ── Chatbot state ──
  const [showChatbot, setShowChatbot] = useState(false);

  const editSuggestions = ["Water Sports","Relaxation","More Activity","Budget-Friendly"];
  const suggestionColors = ["#C4E0F9","#EDF9F0","#FCE8D1","#D7F1F3"];
  const suggestionTextColors = ["#3b82f6","#22c55e","#f97316","#06b6d4"];
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

  const handleUpdateItinerary = async () => {
    if (!editText.trim()) return;
    setIsEditLoading(true);
    setEditError("");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const mockUpdates = {
      "Water Sports": [
        { time: "Morning", title: "Water Sports", activities: ["Jet skiing", "Wakeboarding", "Speed boat"] },
        { time: "Afternoon", title: "Diving & Snorkeling", activities: ["Coral reef dive", "Underwater photos", "Fish feeding"] },
        { time: "Evening", title: "Beach Bonfire", activities: ["Sunset swim", "BBQ dinner", "Beach games"] },
      ],
      Relaxation: [
        { time: "Morning", title: "Spa Morning", activities: ["Full body massage", "Steam room", "Healthy breakfast"] },
        { time: "Afternoon", title: "Pool & Chill", activities: ["Pool lounging", "Light reading", "Juice bar"] },
        { time: "Evening", title: "Quiet Dinner", activities: ["Sunset view", "Fine dining", "Early rest"] },
      ],
      "More Activity": [
        { time: "Morning", title: "Adventure Start", activities: ["Hiking trail", "Rock climbing", "Zip line"] },
        { time: "Afternoon", title: "Extreme Sports", activities: ["ATV riding", "Paragliding", "Kayaking"] },
        { time: "Evening", title: "Night Adventure", activities: ["Night safari", "Campfire", "Stargazing"] },
      ],
      "Budget-Friendly": [
        { time: "Morning", title: "Free Beach", activities: ["Public beach", "Packed breakfast", "Morning walk"] },
        { time: "Afternoon", title: "Local Spots", activities: ["Street food lunch", "Local market", "Free museum"] },
        { time: "Evening", title: "Local Eats", activities: ["Local restaurant", "Night market", "Tea & sweets"] },
      ],
    };
    const matched = mockUpdates[editText] || [
      { time: "Morning", title: "Custom Morning", activities: [`${editText} activity`, "Breakfast", "Explore"] },
      { time: "Afternoon", title: "Custom Afternoon", activities: ["Local lunch", "Sightseeing", `${editText} tour`] },
      { time: "Evening", title: "Custom Evening", activities: ["Dinner", "Relax", `${editText} wrap-up`] },
    ];
    setDayDetails((prev) => ({ ...prev, [editingDay]: matched }));
    setShowEditModal(false);
    setEditText("");
    setIsEditLoading(false);
    setShowSavedModal(true);
  };

  const handleContinue = () => {
    if (step < totalSteps) {
      setStep((s) => s + 1);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        const days = getTripDays();
        setTripPlan({
          destination: selectedDest,
          days,
          nights: days - 1,
          adults,
          children,
          pets,
          budget: getBudgetAmount(),
          itinerary: Array.from({ length: days }, (_, i) => {
            const dayNum = i + 1;
            const imgs = [
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80",
              "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=80",
              "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&q=80",
              "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=400&q=80",
              "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80",
            ];
            const descriptions = ["Arrival & Chill in " + selectedDest,"Desert Vibes & Local Life","Adventure & Blue Magic","Hidden Gems & Local Culture","Relaxation & Farewell"];
            const tagSets = [["Relax","Beach","Culture"],["Culture","Local","Relax"],["Adventure","Snorkling","Nature"],["Culture","History","Food"],["Relax","Nature","Sunset"]];
            const idx = Math.min(i, imgs.length - 1);
            return { day: dayNum, description: descriptions[idx], duration: "4 hrs", type: "Full day", cost: 1000, tags: tagSets[idx], img: imgs[idx] };
          }),
        });
        setShowResult(true);
      }, 3000);
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
    return (
      <div className="aip-page">
        <Navbar activePage="aiplanner" />
        <div className="aip-result-header">
          <h1 className="aip-result-title">Your <span className="aip-result-dest">{tripPlan.destination}</span> Getaway</h1>
          <p className="aip-result-meta">
            {tripPlan.days} Days, {tripPlan.nights} Nights &nbsp;|&nbsp;
            {tripPlan.adults} Adults
            {tripPlan.children > 0 ? `, ${tripPlan.children} Kid` : ""}
            {tripPlan.pets > 0 ? `, ${tripPlan.pets} Pet` : ""}
            &nbsp;|&nbsp; Est. {tripPlan.budget} EGP / person
          </p>
        </div>

        <div className="aip-result-container">
          <div className="aip-result-left">
            <div className="aip-result-days">
              {tripPlan.itinerary.map((item) => {
                const isExpanded = expandedDay === item.day;
                const details = dayDetails[item.day] || [];
                return (
                  <div key={item.day} className={`aip-result-day-card ${isExpanded ? "aip-result-day-card--expanded" : ""}`}>
                    <img src={item.img} alt={item.description} className="aip-result-day-img" />
                    <div className="aip-result-day-info">
                      <div className="aip-result-day-header-row">
                        <p className="aip-result-day-label">Day {item.day}</p>
                        {isExpanded && (
                          <button className="aip-edit-ai-btn" onClick={() => { setEditingDay(item.day); setShowEditModal(true); setEditText(""); setEditError(""); }}>
                            ✏️ Edit with AI
                          </button>
                        )}
                      </div>
                      <h3 className="aip-result-day-title">{item.description}</h3>
                      <div className="aip-result-day-meta">
                        <span>🕐 {item.duration}</span>
                        <span>⏱ {item.type}</span>
                        <span className="aip-result-cost">~{item.cost} EGP</span>
                      </div>
                      <div className="aip-result-tags">
                        {item.tags.map((tag) => <span key={tag} className="aip-result-tag">{tag}</span>)}
                      </div>
                      {isExpanded && (
                        <div className="aip-day-details">
                          <div className="aip-timeline-dots">
                            {details.map((_, i) => (
                              <React.Fragment key={i}>
                                <div className={`aip-timeline-dot ${i === 0 ? "aip-timeline-dot--active" : ""}`} />
                                {i < details.length - 1 && <div className="aip-timeline-line" />}
                              </React.Fragment>
                            ))}
                          </div>
                          <div className="aip-day-columns">
                            {details.map((slot, i) => (
                              <div key={i} className="aip-day-column">
                                <p className="aip-day-slot-time">{slot.time} —</p>
                                <p className="aip-day-slot-title">{slot.title}</p>
                                <ul className="aip-day-slot-list">
                                  {slot.activities.map((act, j) => <li key={j}>• {act}</li>)}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <button className="aip-result-view-btn" onClick={() => setExpandedDay(isExpanded ? null : item.day)}>
                        {isExpanded ? "View less" : "View >"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="aip-result-map">
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80" alt="Map" className="aip-result-map-img" />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", padding: "0 0 40px" }}>
          <button className="aip-save-btn">Save Trip</button>
        </div>

        {/* AI Edit Modal */}
        {showEditModal && (
          <div className="aip-modal-overlay" onClick={() => !isEditLoading && setShowEditModal(false)}>
            <div className="aip-modal" onClick={(e) => e.stopPropagation()}>
              <button className="aip-modal-close" onClick={() => !isEditLoading && setShowEditModal(false)} disabled={isEditLoading}>✕</button>
              <h3 className="aip-modal-title">Customize Day {editingDay}</h3>
              <textarea className="aip-modal-textarea" placeholder="What would you like to change?" value={editText} onChange={(e) => { setEditText(e.target.value); setEditError(""); }} disabled={isEditLoading} />
              <div className="aip-modal-suggestions">
                {editSuggestions.map((s, i) => (
                  <button key={s} className="aip-modal-suggestion" style={{ background: suggestionColors[i], color: suggestionTextColors[i] }} onClick={() => { setEditText(s); setEditError(""); }} disabled={isEditLoading}>{s}</button>
                ))}
              </div>
              {editError && <p className="aip-modal-error">{editError}</p>}
              <button className="aip-modal-update-btn" onClick={handleUpdateItinerary} disabled={isEditLoading || !editText.trim()} style={{ opacity: isEditLoading || !editText.trim() ? 0.6 : 1 }}>
                {isEditLoading ? <span className="aip-modal-loading"><span className="aip-modal-spinner" /> Updating...</span> : "Update Itinerary"}
              </button>
              <button className="aip-modal-cancel-btn" onClick={() => !isEditLoading && setShowEditModal(false)} disabled={isEditLoading}>Cancel</button>
            </div>
          </div>
        )}

        {showSavedModal && (
          <div className="aip-modal-overlay" onClick={() => setShowSavedModal(false)}>
            <div className="aip-modal aip-saved-modal" onClick={(e) => e.stopPropagation()}>
              <button className="aip-modal-close" onClick={() => setShowSavedModal(false)}>✕</button>
              <p className="aip-saved-text">Trip saved to My Trip</p>
              <button className="aip-modal-update-btn" onClick={() => setShowSavedModal(false)}>View</button>
            </div>
          </div>
        )}

        {/* Chatbot floating button on result page too */}
        <button className="aip-bot-fab" onClick={() => setShowChatbot(true)}>
          <img src={chatIconImg} alt="Chat" className="aip-bot-fab-icon" />
        </button>

        {showChatbot && <ChatBot onClose={() => setShowChatbot(false)} />}

        <Footer />
      </div>
    );
  }

  // ── Main Planner ──
  return (
    <div className="aip-page">
      <Navbar activePage="aiplanner" />
      <div className="aip-hero">
        <h1 className="aip-title"><span className="aip-title-ai">AI</span> Planner</h1>
        <p className="aip-subtitle">Design your dream trip in seconds. Answer a few quick questions, and let Mindy do the magic!</p>
      </div>

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
      {showChatbot && <ChatBot onClose={() => setShowChatbot(false)} />}

      <Footer />
    </div>
  );
};

export default AiPlanner;