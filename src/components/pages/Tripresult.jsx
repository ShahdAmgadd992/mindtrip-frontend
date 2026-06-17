import React, { useState } from "react";
import chatIconImg from "../../assets/ai-planner/chat_icon.svg";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import ChatBot from "./ChatBot";
import "./AiPlanner.css";

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

const TripResult = ({ tripPlan, user }) => {
  const [dayDetails, setDayDetails] = useState(defaultDayDetails);
  const [expandedDay, setExpandedDay] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [editText, setEditText] = useState("");
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const editSuggestions = ["Water Sports","Relaxation","More Activity","Budget-Friendly"];
  const suggestionColors = ["#C4E0F9","#EDF9F0","#FCE8D1","#D7F1F3"];
  const suggestionTextColors = ["#3b82f6","#22c55e","#f97316","#06b6d4"];

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

      {showChatbot && <ChatBot userId={user?.userId} onClose={() => setShowChatbot(false)} />}

      <Footer />
    </div>
  );
};

export default TripResult;