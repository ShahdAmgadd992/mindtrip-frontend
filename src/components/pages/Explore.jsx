import React, { useState, useRef, useEffect } from "react";
import "./Explore.css";
import exploreBg from "../../assets/explore/explore.jpg";
import starRate from "../../assets/explore/star-rate.svg";
import favList from "../../assets/explore/fav-list.svg";
import timeIcon from "../../assets/explore/bx_time.jpg";

import AttractionsIcon from "../../assets/explore/Attractions.svg";
import NightToursIcon from "../../assets/explore/Night_tours.svg";
import TravelServiceIcon from "../../assets/explore/Travel_service.svg";
import DayToursIcon from "../../assets/explore/DayTours.svg";

import heritageImg1 from "../../assets/explore/complex-of-religions-cairo.jpg";
import heritageImg2 from "../../assets/explore/al-muizz-street.jpg";
import heritageImg3 from "../../assets/explore/karnak-temple.jpg";
import heritageImg4 from "../../assets/explore/valley-of-the-kings.jpg";
import heritageImg5 from "../../assets/explore/saqqara-step-pyramid.jpg";
import heritageImg6 from "../../assets/explore/philae-temple.jpg";

import { MapContainer, TileLayer, Circle, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ExperiencesIcon from "../../assets/explore/Experiences.svg";
import {
  toursData,
  popularDestinations,
  cityCoordinates,
} from "../../data/exploreData";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

const cities = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Luxor",
  "Aswan",
  "Hurghada",
  "Sharm El-Sheikh",
  "Dahab",
  "Siwa",
  "Marsa Matruh",
  "Saint Catherine",
  "Port Said",
  "Suez",
  "Ismailia",
  "Mansoura",
  "Tanta",
  "Zagazig",
  "Minya",
  "Sohag",
  "Qena",
  "Beni Suef",
  "Faiyum",
  "Asyut",
  "Damanhur",
  "Kafr El-Sheikh",
  "Damietta",
  "Beheira",
  "Sharqia",
  "Monufia",
  "Gharbia",
  "Dakahlia",
  "North Sinai",
  "South Sinai",
  "Red Sea",
  "New Valley",
  "Matrouh",
];

const categories = [
  { icon: AttractionsIcon, label: "Attractions" },
  { icon: TravelServiceIcon, label: "Travel Services" },
  { icon: ExperiencesIcon, label: "Experiences" },
  { icon: DayToursIcon, label: "Day Tours" },
  { icon: NightToursIcon, label: "Night Tours" },
];

const travelExperiences = [
  "Heritage",
  "Adventure",
  "Coastal",
  "Marine",
  "Wellness",
];
const sortOptions = [
  "Popularity",
  "Price: Low to High",
  "Price: High to Low",
  "Rating",
];

const circleColors = {
  Heritage: "#8B5CF6",
  Adventure: "#F59E0B",
  Marine: "#10B981",
  Coastal: "#3B82F6",
  Wellness: "#EC4899",
  popular: "#5596fe",
};

const momentImages = [
  heritageImg1,
  heritageImg2,
  heritageImg3,
  heritageImg4,
  heritageImg5,
  heritageImg6,
];

// ===== Tour Card =====
const TourCard = ({ tour }) => {
  const [liked, setLiked] = useState(false);
  return (
    <div className="tour-card">
      <div className="tour-card-img-wrap">
        <img src={tour.image} alt={tour.title} className="tour-card-img" />
        {tour.badge && (
          <span
            className={`tour-badge ${tour.badge === "New" ? "badge-new" : "badge-discount"}`}
          >
            {tour.badge}
          </span>
        )}
        <button
          className={`fav-btn ${liked ? "liked" : ""}`}
          onClick={() => setLiked(!liked)}
        >
          <img src={favList} alt="favourite" />
        </button>
      </div>
      <div className="tour-card-body">
        <h3 className="tour-card-title">{tour.title}</h3>
        <div className="tour-card-meta">
          <span className="tour-card-city">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#888"
              strokeWidth="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {tour.city}
          </span>
          <span className="tour-card-rating">
            <img src={starRate} alt="rating" className="star-icon" />
            {tour.rating} ({tour.reviews} reviews)
          </span>
        </div>
        <div className="tour-card-duration">
          <img src={timeIcon} alt="duration" className="time-icon" />
          {tour.duration}
        </div>
        <div className="tour-card-footer">
          <span className="tour-card-price">
            Start from :{" "}
            <strong style={{ color: "#5596fe" }}>{tour.price}$</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

// ===== Explore Page =====
const Explore = () => {
  const [selectedCity, setSelectedCity] = useState("Cairo");
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [filterCity, setFilterCity] = useState([]);
  const [priceRange, setPriceRange] = useState(2500);
  const [tourNameSearch, setTourNameSearch] = useState("");
  const [sortBy, setSortBy] = useState("Popularity");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [showMorePopular, setShowMorePopular] = useState(false);

  const dropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target)
      )
        setSortDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim())
      console.log(`Searching: ${searchQuery} in ${selectedCity}`);
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const toggleFilterCity = (city) => {
    setFilterCity((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city],
    );
  };

  const getFilteredTours = () => {
    let source = selectedExperience ? toursData[selectedExperience] || [] : [];
    if (filterCity.length > 0)
      source = source.filter((t) => filterCity.includes(t.city));
    if (tourNameSearch)
      source = source.filter((t) =>
        t.title.toLowerCase().includes(tourNameSearch.toLowerCase()),
      );
    source = source.filter((t) => t.price <= priceRange);
    if (sortBy === "Price: Low to High")
      source = [...source].sort((a, b) => a.price - b.price);
    else if (sortBy === "Price: High to Low")
      source = [...source].sort((a, b) => b.price - a.price);
    else if (sortBy === "Rating")
      source = [...source].sort((a, b) => b.rating - a.rating);
    return source;
  };

  const filteredTours = getFilteredTours();

  const getMapCircles = () => {
    const tours = selectedExperience ? filteredTours : popularDestinations;
    const citiesInTours = [...new Set(tours.map((t) => t.city))];
    return citiesInTours
      .filter((city) => cityCoordinates[city])
      .map((city) => ({
        city,
        coords: cityCoordinates[city],
        color: selectedExperience
          ? circleColors[selectedExperience]
          : circleColors.popular,
      }));
  };

  const mapCircles = getMapCircles();
  const displayedPopular = showMorePopular
    ? popularDestinations
    : popularDestinations.slice(0, 6);
  const clearFilter = () => {
    setSelectedExperience(null);
    setFilterCity([]);
  };

  return (
    <>
      {/* ===== Hero Section ===== */}
      <div
        className="explore-container"
        style={{ backgroundImage: `url(${exploreBg})` }}
      >
        <div className="overlay" />

        <Navbar activePage="explore" />

        <div className="explore-content" style={{ marginLeft: "15%" }}>
          <h1>Discover more</h1>
          <div className="search-container">
            <div className="custom-select-wrapper" ref={dropdownRef}>
              <div
                className={`custom-select-trigger ${dropdownOpen ? "open" : ""}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span>{selectedCity}</span>
                <svg
                  className={`chevron ${dropdownOpen ? "rotate" : ""}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              {dropdownOpen && (
                <div className="custom-dropdown-menu">
                  {cities.map((city) => (
                    <div
                      key={city}
                      className={`custom-dropdown-item ${selectedCity === city ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedCity(city);
                        setDropdownOpen(false);
                      }}
                    >
                      {city}
                      {selectedCity === city && (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#5596fe"
                          strokeWidth="2.5"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Search attractions and tours"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="search-btn" onClick={handleSearch}>
              🔍 Search
            </button>
          </div>
        </div>
      </div>

      {/* ===== Categories Bar ===== */}
      <div className="categories-bar">
        <div className="categories-list">
          {categories.map((cat, index) => (
            <div
              key={index}
              className={`category-item ${activeCategory === index ? "active" : ""}`}
              onClick={() => setActiveCategory(index)}
            >
              <img src={cat.icon} alt={cat.label} className="category-icon" />
              {cat.label && <span>{cat.label}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="explore-main">
        <aside className="explore-sidebar">
          <div className="sidebar-section">
            <h4>Select by tour name</h4>
            <div className="sidebar-search">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#aaa"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="E.g. Luxor tour"
                value={tourNameSearch}
                onChange={(e) => setTourNameSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="sidebar-section">
            <h4>Select City</h4>
            <div className="sidebar-city-list">
              {cities.map((city) => (
                <label key={city} className="sidebar-checkbox">
                  <input
                    type="checkbox"
                    checked={filterCity.includes(city)}
                    onChange={() => toggleFilterCity(city)}
                  />
                  <span>{city}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h4>Select Travel Experience</h4>
            {travelExperiences.map((exp) => (
              <label key={exp} className="sidebar-checkbox">
                <input
                  type="checkbox"
                  checked={selectedExperience === exp}
                  onChange={() =>
                    setSelectedExperience(
                      selectedExperience === exp ? null : exp,
                    )
                  }
                />
                <span>{exp}</span>
              </label>
            ))}
          </div>

          <div className="sidebar-section">
            <h4>Price Range</h4>
            <input
              type="range"
              min="60"
              max="2500"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="price-slider"
            />
            <div className="price-range-labels">
              <span>60$</span>
              <span>{priceRange}$</span>
            </div>
          </div>

          <div className="sidebar-section">
            <h4>Moments from Trippers</h4>
            <div className="moments-grid">
              {momentImages.map((img, i) => (
                <img key={i} src={img} alt="moment" className="moment-thumb" />
              ))}
            </div>
          </div>
        </aside>

        <div className="explore-cards-section">
          {selectedExperience ? (
            <>
              <div className="cards-header">
                <h2>
                  {filteredTours.length} {selectedExperience} Tours
                </h2>
                <div className="sort-wrapper" ref={sortDropdownRef}>
                  <span className="sort-label">Sort by :</span>
                  <div
                    className={`sort-trigger ${sortDropdownOpen ? "open" : ""}`}
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  >
                    <span>{sortBy}</span>
                    <svg
                      className={`chevron ${sortDropdownOpen ? "rotate" : ""}`}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {sortDropdownOpen && (
                    <div className="sort-dropdown">
                      {sortOptions.map((opt) => (
                        <div
                          key={opt}
                          className={`sort-option ${sortBy === opt ? "selected" : ""}`}
                          onClick={() => {
                            setSortBy(opt);
                            setSortDropdownOpen(false);
                          }}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="active-filters">
                <span className="filter-tag">
                  {selectedExperience} <button onClick={clearFilter}>✕</button>
                </span>
                <button className="clear-all-btn" onClick={clearFilter}>
                  Clear all
                </button>
              </div>
              <div className="tours-grid">
                {filteredTours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="cards-header">
                <h2>
                  <span className="text-blue">Popular</span> Destinations
                </h2>
              </div>
              <div className="tours-grid">
                {displayedPopular.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
              {!showMorePopular && popularDestinations.length > 6 && (
                <div className="show-more-wrap">
                  <button
                    className="show-more-btn"
                    onClick={() => setShowMorePopular(true)}
                  >
                    Show More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ===== Egypt Map ===== */}
      <div className="map-section">
        <h2 className="map-title">
          <span className="text-blue">Egypt</span> Map
        </h2>
        <p className="map-subtitle">Warm winter escapes.</p>
        <div className="map-container-wrap">
          <MapContainer
            center={[26.5, 29.8]}
            zoom={7}
            scrollWheelZoom={false}
            className="leaflet-map"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {mapCircles.map(({ city, coords, color }) => (
              <Circle
                key={city}
                center={[coords.lat, coords.lng]}
                radius={80000}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.25,
                  weight: 2,
                }}
              >
                <Tooltip
                  permanent
                  direction="center"
                  className="map-city-tooltip"
                >
                  <span>{city}</span>
                </Tooltip>
              </Circle>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* ===== Footer ===== */}
      <Footer />
    </>
  );
};

export default Explore;
