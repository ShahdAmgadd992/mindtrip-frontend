import React, { useState } from "react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import "./SavedPlaces.css";
import { useSavedPlaces } from "../../context/SavedPlacesContext";

const filters = [
  "All",
  "Hotels",
  "Trips",
  "Activities",
  "Restaurants",
  "Cafes",
];

const Stars = ({ rating }) => (
  <span className="sp-stars">
    {"★".repeat(Math.floor(rating))}
    {"☆".repeat(5 - Math.floor(rating))}
    <span className="sp-rating-num">{rating}</span>
  </span>
);

const PlaceCard = ({ item, onToggle }) => (
  <div className="sp-card">
    <div className="sp-card-img-wrap">
      {item.image ? (
        <img src={item.image} alt={item.title} className="sp-card-img" />
      ) : (
        <div className="sp-card-img sp-card-img-placeholder" />
      )}
      <button className="sp-heart-btn active" onClick={() => onToggle(item)}>
        ❤️
      </button>
    </div>
    <div className="sp-card-body">
      <h4 className="sp-card-title">{item.title}</h4>
      <p className="sp-card-location">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5596fe"
          strokeWidth="2"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {item.city}
      </p>
      {item.rating && <Stars rating={item.rating} />}
      {item.reviews && (
        <span className="sp-reviews"> ({item.reviews} reviews)</span>
      )}
      <div className="sp-card-footer">
        {item.price > 0 && <span className="sp-price-tag">{item.price}$</span>}
        {item.duration && (
          <span className="sp-duration">⏱ {item.duration}</span>
        )}
      </div>
    </div>
  </div>
);

const Section = ({
  title,
  children,
  onSeeMore,
  seeMoreLabel,
  activeFilter,
}) => (
  <div className="sp-section">
    <div className="sp-section-header">
      <h3 className="sp-section-title">{title}</h3>
      {activeFilter === "All" && (
        <button className="sp-see-more" onClick={onSeeMore}>
          See more
        </button>
      )}
    </div>
    <div className="sp-cards-grid">{children}</div>
    {activeFilter !== "All" && (
      <div className="sp-see-more-wrap">
        <button className="sp-see-more-btn" onClick={onSeeMore}>
          {seeMoreLabel}
        </button>
      </div>
    )}
  </div>
);

const SavedPlaces = () => {
  const { savedPlaces, toggleSaved } = useSavedPlaces();
  const [activeFilter, setActiveFilter] = useState("All");
  const [showMore, setShowMore] = useState({
    Hotels: false,
    Trips: false,
    Activities: false,
    Restaurants: false,
    Cafes: false,
  });

  // فلتر الأماكن حسب الـ placeType
  const getByType = (type) => savedPlaces.filter((p) => p.placeType === type);

  // كل الأنواع
  const hotels = getByType("Hotels");
  const trips = getByType("Trips");
  const activities = getByType("Activities");
  const restaurants = getByType("Restaurants");
  const cafes = getByType("Cafes");

  const toggleShowMore = (type) =>
    setShowMore((prev) => ({ ...prev, [type]: !prev[type] }));

  const show = (cat) => activeFilter === "All" || activeFilter === cat;

  const renderSection = (title, type, items) => {
    if (!show(type) || items.length === 0) return null;
    const sliced = showMore[type] ? items : items.slice(0, 3);
    return (
      <Section
        title={`Saved ${title}`}
        onSeeMore={() => toggleShowMore(type)}
        seeMoreLabel={showMore[type] ? "Show Less" : "Show More"}
        activeFilter={activeFilter}
      >
        {sliced.map((item) => (
          <PlaceCard key={item.id} item={item} onToggle={toggleSaved} />
        ))}
      </Section>
    );
  };

  const totalByFilter =
    activeFilter === "All"
      ? savedPlaces.length
      : getByType(activeFilter).length;

  return (
    <>
      <Navbar activePage="saved" />
      <div className="sp-page">
        <div className="sp-header">
          <h1 className="sp-main-title">
            <span className="sp-blue">Saved</span> Places
          </h1>
          <p className="sp-main-subtitle">
            All the places you saved in one spot, organized and easy to access.
          </p>
          <div className="sp-filters">
            {filters.map((f) => (
              <button
                key={f}
                className={`sp-filter-btn ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="sp-content">
          {totalByFilter === 0 ? (
            <div className="sp-empty">
              <div className="sp-empty-icon">❤️</div>
              <h3>No saved places yet</h3>
              <p>Go to Explore and tap the heart on any place you love!</p>
              <button
                className="sp-explore-btn"
                onClick={() => window.navigateToExplore?.()}
              >
                Start Exploring
              </button>
            </div>
          ) : (
            <>
              {renderSection("Hotels", "Hotels", hotels)}
              {renderSection("Trips", "Trips", trips)}
              {renderSection("Activities", "Activities", activities)}
              {renderSection("Restaurants", "Restaurants", restaurants)}
              {renderSection("Cafes", "Cafes", cafes)}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SavedPlaces;
