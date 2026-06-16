import React, { useState } from "react";
import "./Interests.css";
import logo from "../../assets/general/logo.png";

const interests = [
  { id: 1, emoji: "🌿", label: "Nature & Oasis" },
  { id: 2, emoji: "🕌", label: "Islamic Architecture & Arts" },
  { id: 3, emoji: "⛰️", label: "Mountains & Highs" },
  { id: 4, emoji: "💎", label: "Hidden Gems" },
  { id: 5, emoji: "🏛️", label: "Historical Sites & Ruins" },
  { id: 6, emoji: "🏖️", label: "Coastal Escapes" },
  { id: 7, emoji: "🛍️", label: "Shopping & Nightlife" },
  { id: 8, emoji: "🌐", label: "Local Culture & Folklore" },
  { id: 9, emoji: "🤿", label: "Diving & Marine Life" },
  { id: 10, emoji: "👨‍👩‍👧", label: "Family Friendly" },
  { id: 11, emoji: "🧘", label: "Relaxation & Wellness" },
  { id: 12, emoji: "🏄", label: "Adventure & Sports" },
  { id: 13, emoji: "🍽️", label: "Local Cuisine" },
  { id: 14, emoji: "🐪", label: "Desert Safari" },
  { id: 15, emoji: "🎳", label: "Bowling" },
  { id: 16, emoji: "🎭", label: "Theaters" },
];

const Interests = () => {
  const [selected, setSelected] = useState([]);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleContinue = () => {
    // Save interests and navigate to next page
    localStorage.setItem("userInterests", JSON.stringify(selected));
    // Navigate to home temporarily until next page is ready
    window.navigateToHome?.();
  };

  return (
    <div className="interests-wrapper">
      <div className="interests-card">
        {/* Logo */}
        <div className="interests-logo">
          <img src={logo} alt="Mind Trip" />
        </div>

        {/* Title */}
        <h1 className="interests-title">What are your interests?</h1>
        <p className="interests-subtitle">
          Select your favorite vibes to help our AI customize your perfect
          journey.
        </p>

        {/* Tags Grid */}
        <div className="interests-grid">
          {interests.map((item) => (
            <button
              key={item.id}
              className={`interest-tag ${selected.includes(item.id) ? "selected" : ""}`}
              onClick={() => toggle(item.id)}
            >
              <span className="interest-emoji">{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Save & Continue */}
        <button
          className="interests-continue-btn"
          onClick={handleContinue}
          disabled={selected.length === 0}
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default Interests;
