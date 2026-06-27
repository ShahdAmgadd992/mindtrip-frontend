import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Explore.css";
import exploreBg from "../../assets/explore/explore.jpg";
import starRate from "../../assets/explore/star-rate.svg";
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
import { useSavedPlaces } from "../../context/SavedPlacesContext";

import { MapContainer, TileLayer, Circle, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import ExperiencesIcon from "../../assets/explore/Experiences.svg";
import {
  cityCoordinates,
  uniqueExperiences,
} from "../../data/exploreData";

import { fetchHomePlaces } from "../../services/tripmindApi";
import apiClient from "../../services/apiClient";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

// ── Constants ─────────────────────────────────────────────────────────────
const PAGE_SIZE = 9;

const sidebarCities = [
  "Cairo", "Giza", "Alexandria", "Luxor", "Aswan",
  "Sharm El Sheikh", "Hurghada", "Port Said", "Ismailia",
  "Marsa Matrouh", "Fayoum",
];

const targetCategories = [
  "historical_sites", "arts_culture", "cafe", "food",
  "beaches", "shopping", "nature",
  "religious_sites", "entertainment",
];

const categoryLabels = {
  historical_sites: "Historical Sites",
  arts_culture: "Arts & Culture",
  cafe: "Cafe",
  food: "Food",
  beaches: "Beaches",
  shopping: "Shopping",
  nature: "Nature",
  religious_sites: "Religious Sites",
  entertainment: "Entertainment",
};

const categories = [
  { icon: AttractionsIcon, label: "Attractions" },
  { icon: TravelServiceIcon, label: "Travel Services" },
  { icon: ExperiencesIcon, label: "Experiences" },
  { icon: DayToursIcon, label: "Day Tours" },
  { icon: NightToursIcon, label: "Night Tours" },
];

const sortOptions = [
  "Popularity",
  "Price: Low to High",
  "Price: High to Low",
  "Rating",
];

const momentImages = [
  heritageImg1, heritageImg2, heritageImg3,
  heritageImg4, heritageImg5, heritageImg6,
];

const defaultLocationImages = [
  heritageImg1, heritageImg2, heritageImg3,
  heritageImg4, heritageImg5, heritageImg6,
];

// ── Helpers ───────────────────────────────────────────────────────────────
const mapPlaceToTour = (place, idx) => ({
  id: place.place_id || `p-${idx}`,
  title: place.name || "Unknown Place",
  city: place.city || "Unknown",
  duration: "1 day",
  rating: place.rating ?? 4.5,
  reviews: place.reviews_count ?? 0,
  price: place.price ?? 0,
  category: place.category || "",
  badge: place.is_hidden_gem ? "Hidden Gem" : null,
  image: place.photo_url || defaultLocationImages[idx % defaultLocationImages.length],
  image_urls: place.image_urls || [],
  opening_hours: place.opening_hours || "",
  description: place.description || "",
  maps_url: place.maps_url,
  lat: place.lat,
  lng: place.lng,
});

// ─────────────────────────────────────────────────────────────────────────────
// TourCard
const staticTrendingDestinations = [
  {
    id: 201, title: "The Blue Hole", city: "Dahab",
    description: "Dive into one of the world's most famous dive sites, with crystal-clear waters plunging over 100 meters deep.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
  },
  {
    id: 202, title: "Salt Lakes", city: "Siwa",
    description: "Float in crystal clear salt lakes for a surreal natural spa experience.",
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800",
  },
  {
    id: 203, title: "Orange Bay", city: "Hurghada",
    description: "Escape to a secluded paradise island surrounded by turquoise waters and vibrant coral reefs.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  },
  {
    id: 204, title: "White Desert", city: "Farafra",
    description: "Wander through a surreal moonscape of chalk-white rock formations sculpted by centuries of wind.",
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800",
  },
  {
    id: 205, title: "Karnak Temple", city: "Luxor",
    description: "Walk through the largest ancient religious site in the world, built over 2,000 years of pharaonic history.",
    image: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800",
  },
  {
    id: 206, title: "Siwa Oasis", city: "Siwa",
    description: "Discover a remote desert oasis where ancient ruins, palm groves, and freshwater springs coexist.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
  },
  {
    id: 207, title: "Mount Sinai", city: "Saint Catherine",
    description: "Trek to the summit at dawn and witness a breathtaking sunrise above the clouds from a biblical peak.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
  },
  {
    id: 208, title: "Nile Cruise", city: "Luxor",
    description: "Sail the world's longest river past ancient temples, fertile banks, and golden sunsets.",
    image: "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TourCard
// ─────────────────────────────────────────────────────────────────────────────
const TourCard = ({ tour, selectedCategories = [] }) => {
  const { toggleSaved, isSaved } = useSavedPlaces();
  const liked = isSaved(tour.id);

  const handleToggle = () => {
    const type = selectedCategories.includes("hotels")
      ? "Hotels"
      : selectedCategories.includes("cafe")
        ? "Restaurants"
        : "Trips";
    toggleSaved({ ...tour, placeType: type });
  };

  const isVariablePrice = ["cafe", "food"].includes(tour.category);
  const priceDisplay = tour.price > 0
    ? `${isVariablePrice ? "~" : ""}${tour.price} EGP`
    : null;

  return (
    <div className="tour-card">
      <div className="tour-card-img-wrap">
        <img src={tour.image} alt={tour.title} className="tour-card-img" />
        {tour.badge && (
          <span className={`tour-badge ${tour.badge === "New" ? "badge-new" : "badge-discount"}`}>
            {tour.badge}
          </span>
        )}
        <button className={`fav-btn ${liked ? "liked" : ""}`} onClick={handleToggle}>
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={liked ? "#e63946" : "none"} stroke={liked ? "#e63946" : "#aaa"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className="tour-card-body">
        <h3 className="tour-card-title">{tour.title}</h3>
        <div className="tour-card-meta">
          <span className="tour-card-city">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {tour.city}
          </span>
          <span className="tour-card-rating">
            <img src={starRate} alt="rating" className="star-icon" />
            <strong>{tour.rating}</strong> ({tour.reviews} reviews)
          </span>
        </div>
        {priceDisplay && <div className="tour-card-price">{priceDisplay}</div>}
        <div className="tour-card-duration">
          <img src={timeIcon} alt="duration" className="time-icon" />
          {tour.duration}
        </div>
        <button
          className="tour-card-view-btn"
          onClick={() =>
            window.navigateToTripDetails &&
            window.navigateToTripDetails({ ...tour, category: tour.category || "attraction" })
          }
        >
          View Details
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Trending Now Section — calls /api/v1/ai/places/recommend
// UI: 2-col image cards with heart icon, name, city overlay
// ─────────────────────────────────────────────────────────────────────────────
const TrendingNowCard = ({ item }) => {
  const { toggleSaved, isSaved } = useSavedPlaces();
  const liked = isSaved(item.id);

  return (
    <div
      className="trending-now-card"
      style={{ backgroundImage: `url(${item.image})` }}
    >
      <div className="trending-now-overlay" />
      <button
        className={`trending-now-heart ${liked ? "liked" : ""}`}
        onClick={() => toggleSaved({ ...item, placeType: "Trips" })}
      >
        <svg width="18" height="18" viewBox="0 0 24 24"
          fill={liked ? "#e63946" : "none"}
          stroke={liked ? "#e63946" : "white"}
          strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
      <div className="trending-now-info">
        <h3 className="trending-now-title">{item.title}</h3>
        <p className="trending-now-city">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {item.city}
        </p>
      </div>
    </div>
  );
};

const TrendingNowSection = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const res = await apiClient.post("/ai/places/recommend", { seed: 12345 });

        // Log the full raw response so we can see the exact structure
        console.log("🔍 /ai/places/recommend RAW response:", res);
        console.log("🔍 res.data:", res?.data);

        // Try every possible key the API might return
        const raw =
          res?.data?.places ??
          res?.data?.featured ??
          res?.data?.recommended ??
          res?.data?.results ??
          res?.data?.data ??
          (Array.isArray(res?.data) ? res.data : null) ??
          [];

        console.log("🔍 raw places array:", raw);

        const mapped = (Array.isArray(raw) ? raw : []).map((p, idx) => {
          console.log(`🔍 place[${idx}]:`, p); // log each place to see its fields
          return {
            id: p.place_id || p.id || `rec-${idx}`,
            title: p.name || p.title || "Unknown",
            city: p.city || p.location || "",
            image:
              p.photo_url ||
              p.image ||
              p.image_url ||
              p.thumbnail ||
              defaultLocationImages[idx % defaultLocationImages.length],
            category: p.category || "attraction",
            rating: p.rating ?? 4.5,
            reviews: p.reviews_count ?? p.reviews ?? 0,
            price: p.price ?? 0,
          };
        });

        if (mapped.length > 0) {
          setPlaces(mapped);
        } else {
          console.warn("⚠️ API returned no places, using static fallback");
          setPlaces(staticTrendingDestinations);
        }
      } catch (err) {
        console.error("❌ /ai/places/recommend error:", err);
        setPlaces(staticTrendingDestinations);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommended();
  }, []);

  const displayed = showAll ? places : places.slice(0, 4);

  return (
    <div className="trending-now-section">
      <hr className="unique-exp-divider" />
      <h2 className="trending-now-heading">
        <span className="text-blue">Trending</span> Now
      </h2>
      <p className="trending-now-subtitle">What's hot right now in Egypt</p>

      {loading ? (
        <div className="loading-placeholder" style={{ padding: "40px 0" }}>Loading trending places...</div>
      ) : (
        <div className="trending-now-grid">
          {displayed.map((item) => (
            <TrendingNowCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {!loading && !showAll && places.length > 4 && (
        <div className="show-more-wrap">
          <button className="show-more-btn" onClick={() => setShowAll(true)}>
            Show More
          </button>
        </div>
      )}
      <hr className="unique-exp-divider" />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Unique Experience Carousel — uses entertainment places from API
// ─────────────────────────────────────────────────────────────────────────────
const UniqueExperienceCard = ({ item }) => (
  <div className="unique-exp-card">
    <div className="unique-exp-img-wrap">
      <img src={item.image} alt={item.title} className="unique-exp-img" />
      <div className="unique-exp-rating">
        <img src={starRate} alt="star" className="unique-exp-star" />
        <span>{item.rating}</span>
      </div>
    </div>
    <div className="unique-exp-body">
      <h3 className="unique-exp-title">{item.title}</h3>
      <p className="unique-exp-vibe">Vibe: {item.vibe || item.city}</p>
      <p className="unique-exp-reviews">({item.reviews} reviews)</p>
      <button
        className="unique-exp-btn"
        onClick={() =>
          window.navigateToTripDetails &&
          window.navigateToTripDetails({ ...item, category: item.category || "entertainment" })
        }
      >
        More Details
      </button>
    </div>
  </div>
);

const UniqueExperienceSection = ({ entertainmentPlaces = [] }) => {
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Map API entertainment places to card shape
  const apiItems = entertainmentPlaces.map((place, idx) => ({
    id: place.place_id || `ent-${idx}`,
    title: place.name || "Unknown",
    city: place.city || "",
    image: place.photo_url || defaultLocationImages[idx % defaultLocationImages.length],
    rating: place.rating ?? 4.5,
    reviews: place.reviews_count ?? 0,
    vibe: place.city || "Entertainment",
    price: place.price || 0,
    category: place.category || "entertainment",
  }));

  // Use API data if available, otherwise fall back to static uniqueExperiences
  const displayItems = apiItems.length > 0 ? apiItems : uniqueExperiences;

  const updateScrollState = () => {
    const el = carouselRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (el) {
      el.addEventListener("scroll", updateScrollState);
      updateScrollState();
      return () => el.removeEventListener("scroll", updateScrollState);
    }
  }, [displayItems]);

  const scroll = (dir) => {
    const el = carouselRef.current;
    if (el) {
      const card = el.querySelector(".unique-exp-card");
      const itemWidth = (card?.clientWidth || 260) + 20;
      el.scrollBy({ left: dir * itemWidth * 4, behavior: "smooth" });
    }
  };

  return (
    <div className="unique-exp-section">
      <hr className="unique-exp-divider" />
      <h2 className="unique-exp-heading"><span className="text-blue">Unique</span> Experience</h2>
      <div className="unique-exp-carousel-wrapper">
        {canScrollLeft && (
          <button className="unique-exp-arrow unique-exp-arrow-left" onClick={() => scroll(-1)}>&#8249;</button>
        )}
        <div className="unique-exp-carousel" ref={carouselRef}>
          {displayItems.map((item) => <UniqueExperienceCard key={item.id} item={item} />)}
        </div>
        {canScrollRight && (
          <button className="unique-exp-arrow unique-exp-arrow-right" onClick={() => scroll(1)}>&#8250;</button>
        )}
      </div>
      <hr className="unique-exp-divider" />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Explore Component
// ─────────────────────────────────────────────────────────────────────────────
const Explore = ({ hiddenGems = false, onHiddenGemsConsumed }) => {
  const [searchBoxCity, setSearchBoxCity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Sidebar filter state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [filterCity, setFilterCity] = useState([]);
  const [priceRange, setPriceRange] = useState(10000);
  const [tourNameSearch, setTourNameSearch] = useState("");
  const [sortBy, setSortBy] = useState("Popularity");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [showHiddenGems, setShowHiddenGems] = useState(hiddenGems);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Sync hiddenGems prop (e.g. when navigating from Home "View All Hidden Gems")
  useEffect(() => {
    if (hiddenGems) {
      setShowHiddenGems(true);
      onHiddenGemsConsumed?.();
    }
  }, [hiddenGems]);

  // ── All places pool fetched from API across all cities ────────────────────
  // allPlaces = { featured: [], hidden_gems: [], trending: [] } merged from all city calls
  const [allPlaces, setAllPlaces] = useState({ featured: [], hidden_gems: [], trending: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all cities in parallel on mount, then keep the pool updated
  const fetchAllCities = useCallback(async (citiesToFetch = sidebarCities) => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        citiesToFetch.map((city) =>
          fetchHomePlaces(city).catch(() => ({ featured: [], hidden_gems: [], trending: [] }))
        )
      );

      // Merge all results, deduplicate by place_id
      const seen = new Set();
      const merged = { featured: [], hidden_gems: [], trending: [] };

      results.forEach((res) => {
        const data = res?.data ?? res; // handle both { data: ... } and direct object
        ["featured", "hidden_gems", "trending"].forEach((key) => {
          (data?.[key] || []).forEach((place) => {
            const pid = place.place_id || place.name;
            if (!seen.has(pid)) {
              seen.add(pid);
              merged[key].push(place);
            }
          });
        });
      });

      setAllPlaces(merged);
    } catch (err) {
      setError("Failed to load destinations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount: fetch ALL cities
  useEffect(() => {
    fetchAllCities(sidebarCities);
  }, [fetchAllCities]);

  const dropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target))
        setSortDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hero Search — re-fetch from API when a city is selected, otherwise filter locally
  const handleSearch = () => {
    if (searchBoxCity) {
      // Fetch fresh data for the selected city from the API
      fetchAllCities([searchBoxCity]);
      setFilterCity([searchBoxCity]);
    }
    if (searchQuery.trim()) setTourNameSearch(searchQuery.trim());
    setVisibleCount(PAGE_SIZE);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // Sidebar city checkbox toggle — pure local filtering, no re-fetch needed
  // because we already have ALL cities data in allPlaces
  const toggleFilterCity = (city) => {
    setFilterCity((prev) => {
      const next = prev.includes(city)
        ? prev.filter((c) => c !== city)
        : [...prev, city];
      return next;
    });
    setVisibleCount(PAGE_SIZE);
  };

  // ── Derived data ──────────────────────────────────────────────────────────

  // Combine featured + hidden_gems into one unified pool.
  // Hidden gems are marked with is_hidden_gem=true so they show their badge.
  // They live in the same grid — only filtered out when "Show Hidden Gems Only" is OFF
  // and user wants to see only hidden gems (which is the sidebar toggle behaviour).
  const allPoolRaw = [
    ...allPlaces.featured,
    ...allPlaces.hidden_gems.map((p) => ({ ...p, is_hidden_gem: true })),
  ];

  // Deduplicate by place_id in case API returns same place in both buckets
  const seenPool = new Set();
  const allPool = allPoolRaw.filter((p) => {
    const pid = p.place_id || p.name;
    if (seenPool.has(pid)) return false;
    seenPool.add(pid);
    return true;
  });

  // ── Smart filtered explore source ─────────────────────────────────────────
  const getExploreSource = () => {
    let source = allPool.map(mapPlaceToTour);

    // City filter
    if (filterCity.length > 0)
      source = source.filter((t) => filterCity.includes(t.city));

    // Category filter
    if (selectedCategories.length > 0)
      source = source.filter((t) => selectedCategories.includes(t.category));

    // Name search
    if (tourNameSearch)
      source = source.filter((t) =>
        t.title.toLowerCase().includes(tourNameSearch.toLowerCase())
      );

    // Price filter
    source = source.filter((t) => t.price === 0 || t.price <= priceRange);

    // "Show Hidden Gems Only" — filter to only hidden gem places
    // Works together with city/category filters above
    if (showHiddenGems)
      source = source.filter((t) => t.badge === "Hidden Gem");

    // Sort
    if (sortBy === "Price: Low to High")
      source = [...source].sort((a, b) => a.price - b.price);
    else if (sortBy === "Price: High to Low")
      source = [...source].sort((a, b) => b.price - a.price);
    else if (sortBy === "Rating")
      source = [...source].sort((a, b) => b.rating - a.rating);

    return source;
  };

  const exploreSource = getExploreSource();
  const displayedExplore = exploreSource.slice(0, visibleCount);
  const hasMoreExplore = visibleCount < exploreSource.length;

  const hasActiveFilter =
    filterCity.length > 0 ||
    tourNameSearch ||
    showHiddenGems ||
    selectedCategories.length > 0 ||
    priceRange < 10000;

  // Entertainment + Nature places for Unique Experience section
  const entertainmentPlaces = allPool.filter((p) => {
    const cat = (p.category || "").toLowerCase();
    return cat === "entertainment" || cat === "nature";
  });

  // Map circles — from all places
  const mapCircles = [...new Set(allPool.map((p) => p.city))]
    .filter((city) => cityCoordinates[city])
    .map((city) => ({ city, coords: cityCoordinates[city], color: "#5596fe" }));

  const clearAllFilters = () => {
    setFilterCity([]);
    setShowHiddenGems(false);
    setSelectedCategories([]);
    setTourNameSearch("");
    setPriceRange(10000);
    setVisibleCount(PAGE_SIZE);
    setSortBy("Popularity");
  };

  return (
    <>
      {/* ── Hero / Search ── */}
      <div className="explore-container" style={{ backgroundImage: `url(${exploreBg})` }}>
        <div className="overlay" />
        <Navbar activePage="explore" />
        <div className="explore-content">
          <h1>Discover more</h1>
          <div className="search-container">
            <div className="custom-select-wrapper" ref={dropdownRef}>
              <div
                className={`custom-select-trigger ${dropdownOpen ? "open" : ""}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className={!searchBoxCity ? "city-placeholder" : ""}>
                  {searchBoxCity || "Select City"}
                </span>
                <svg className={`chevron ${dropdownOpen ? "rotate" : ""}`}
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              {dropdownOpen && (
                <div className="custom-dropdown-menu">
                  {sidebarCities.map((city) => (
                    <div
                      key={city}
                      className={`custom-dropdown-item ${searchBoxCity === city ? "selected" : ""}`}
                      onClick={() => { setSearchBoxCity(city); setDropdownOpen(false); }}
                    >
                      {city}
                      {searchBoxCity === city && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5596fe" strokeWidth="2.5">
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
            <button className="search-btn" onClick={handleSearch}>🔍 Search</button>
          </div>
        </div>
      </div>

      {/* ── Category icon bar ── */}
      <div className="categories-bar">
        <div className="categories-list">
          {categories.map((cat, index) => (
            <div
              key={index}
              className={`category-item ${activeCategory === index ? "active" : ""}`}
              onClick={() => setActiveCategory(activeCategory === index ? null : index)}
            >
              <img src={cat.icon} alt={cat.label} className="category-icon" />
              {cat.label && <span>{cat.label}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="explore-main">
        {/* ── Sidebar ── */}
        <aside className="explore-sidebar">
          <div className="sidebar-section">
            <h4>Select by tour name</h4>
            <div className="sidebar-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
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
              {sidebarCities.map((city) => (
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
            <h4>Special Filter</h4>
            <label className="sidebar-checkbox">
              <input
                type="checkbox"
                checked={showHiddenGems}
                onChange={() => {
                  setShowHiddenGems((prev) => !prev);
                  setVisibleCount(PAGE_SIZE);
                }}
              />
              <span>Show hidden gems only</span>
            </label>
          </div>

          <div className="sidebar-section">
            <h4>Select Category</h4>
            <div className="sidebar-city-list">
              {targetCategories.map((cat) => (
                <label key={cat} className="sidebar-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() =>
                      setSelectedCategories((prev) =>
                        prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                      )
                    }
                  />
                  <span>{categoryLabels[cat]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h4>Price Range</h4>
            <input
              type="range" min="160" max="10000" value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="price-slider"
            />
            <div className="price-range-labels">
              <span>160 EGP</span>
              <span>{priceRange.toLocaleString()} EGP</span>
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

        {/* ── Cards section ── */}
        <div className="explore-cards-section">
          {/* Header always shows "Explore Destinations" */}
          <div className="cards-header">
            <h2>
              <span className="text-blue">Explore</span> Destinations
              {hasActiveFilter && (
                <span style={{ fontSize: "1rem", fontWeight: "normal", color: "#666", marginLeft: "10px" }}>
                  — {exploreSource.length} result{exploreSource.length !== 1 ? "s" : ""}
                </span>
              )}
            </h2>
            <div className="sort-wrapper" ref={sortDropdownRef}>
              <span className="sort-label">Sort by :</span>
              <div
                className={`sort-trigger ${sortDropdownOpen ? "open" : ""}`}
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              >
                <span>{sortBy}</span>
                <svg className={`chevron ${sortDropdownOpen ? "rotate" : ""}`}
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              {sortDropdownOpen && (
                <div className="sort-dropdown">
                  {sortOptions.map((opt) => (
                    <div
                      key={opt}
                      className={`sort-option ${sortBy === opt ? "selected" : ""}`}
                      onClick={() => { setSortBy(opt); setSortDropdownOpen(false); }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active filter tags */}
          {hasActiveFilter && (
            <div className="active-filters">
              {showHiddenGems && (
                <span className="filter-tag">
                  Hidden Gems <button onClick={() => setShowHiddenGems(false)}>✕</button>
                </span>
              )}
              {selectedCategories.map((cat) => (
                <span key={cat} className="filter-tag">
                  {categoryLabels[cat]}{" "}
                  <button onClick={() =>
                    setSelectedCategories((prev) => prev.filter((c) => c !== cat))
                  }>✕</button>
                </span>
              ))}
              {filterCity.map((city) => (
                <span key={city} className="filter-tag">
                  {city} <button onClick={() => toggleFilterCity(city)}>✕</button>
                </span>
              ))}
              <button className="clear-all-btn" onClick={clearAllFilters}>
                Clear all
              </button>
            </div>
          )}

          {error && <div className="fetch-error">{error}</div>}

          <div className="tours-grid">
            {loading ? (
              <div className="loading-placeholder">Loading destinations from all cities...</div>
            ) : displayedExplore.length > 0 ? (
              displayedExplore.map((tour) => (
                <TourCard key={tour.id} tour={tour} selectedCategories={selectedCategories} />
              ))
            ) : (
              <div className="loading-placeholder">No results found.</div>
            )}
          </div>

          {/* Show More button */}
          {!loading && hasMoreExplore && (
            <div className="show-more-wrap">
              <button
                className="show-more-btn"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                Show More ({exploreSource.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Egypt Map ── */}
      <div className="map-section">
        <h2 className="map-title"><span className="text-blue">Egypt</span> Map</h2>
        <p className="map-subtitle">Warm winter escapes.</p>
        <div className="map-container-wrap">
          <MapContainer center={[26.5, 29.8]} zoom={7} scrollWheelZoom={false} className="leaflet-map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {mapCircles.map(({ city, coords, color }) => (
              <Circle key={city} center={[coords.lat, coords.lng]} radius={80000}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.25, weight: 2 }}>
                <Tooltip permanent direction="center" className="map-city-tooltip">
                  <span>{city}</span>
                </Tooltip>
              </Circle>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* ── Unique Experience — entertainment + nature places ── */}
      <UniqueExperienceSection entertainmentPlaces={entertainmentPlaces} />

      {/* ── Trending Now — from /ai/places/recommend ── */}
      <TrendingNowSection />

      <Footer />
    </>
  );
};

export default Explore;