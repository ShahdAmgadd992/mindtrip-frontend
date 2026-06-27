import React, { useEffect, useRef, useState, useContext } from "react";
import "./UserHome.css";
import bgImage from "../../assets/general/back.jpg";
import bgImage2 from "../../assets/general/egypt2.jpg";
import dahab from "../../assets/cities/dahab.jpg";
import siwa from "../../assets/cities/siwa.jpg";
import luxor from "../../assets/cities/luxor.jpg";
import aswan from "../../assets/cities/aswan.jpg";
import saintCatherine from "../../assets/cities/saintCatherine.jpg";
import siwaMysticRetreat from "../../assets/cities/siwa.jpg";
import nile from "../../assets/general/Nile.jpg";
import deepBlue from "../../assets/general/DeepBlue.jpg";
import pyramid from "../../assets/general/Pyramid.jpg";
import locationIcon from "../../assets/icons/location-icon.png";
import aiIcon from "../../assets/icons/ai-icon.png";
import travelIcon from "../../assets/icons/travel-icon.png";
import AiTrip from "../../assets/general/AiTrip.png";
import smart from "../../assets/general/smart.png";
import Hidden from "../../assets/general/Hidden.png";
import location2 from "../../assets/icons/location2.png";
import location3 from "../../assets/icons/location3.png";
import calender from "../../assets/icons/calender.png";
import clint1 from "../../assets/general/clint1.jpg";
import clint2 from "../../assets/general/clint2.jpg";
import clint3 from "../../assets/general/clint3.jpg";
import logo from "../../assets/general/logo.png";
import Footer from "../layout/Footer";
import AuthContext from "../../context/AuthContextValue";
import heartIcon from "../../assets/icons/heart.png";
import macbook from "../../assets/general/Macbook Pro 13_ Mockup.png";
import alexandria from "../../assets/cities/alexandria.jpg";
import marsaMatrouh from "../../assets/cities/marsaMatrouh.jpg";
import hurghada from "../../assets/cities/hurghada.jpg";
import Arrow from "../../assets/icons/Arrow.png";
import { fetchHomePlaces } from "../../services/tripmindApi";
import { useHomePlaces } from "../../services/useHomePlaces";
import { useSavedPlaces } from "../../context/SavedPlacesContext";

const testimonials = [
  {
    id: 1,
    name: "Sarah Jensen",
    role: "Digital Creator",
    rating: 4.9,
    image: clint1,
    review:
      "Mind Trip's AI planner is a lifesaver! It balanced my 4-day trip to Siwa perfectly, finding me the best eco-lodges within my tight budget. I saw things I never would've found on Google.",
  },
  {
    id: 2,
    name: "Ahmed Mamdouh",
    role: "Software Developer",
    rating: 5.0,
    image: clint2,
    review:
      "The best UI I've seen in a travel app. The AI-generated itinerary for our Luxor trip was so precise; it optimized our route to avoid crowds and saved us so much time.",
  },
  {
    id: 3,
    name: "Mona Khaled",
    role: "Travel Blogger",
    rating: 4.8,
    image: clint3,
    review:
      "I used MindTrip for my Cairo trip and the Google Maps integration was seamless. Everything was in my pocket — no need to switch between apps at all.",
  },
];

const UserHome = () => {
  const sliderRef = useRef(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const { user } = useContext(AuthContext);

  // Get first name only
  const firstName = user?.displayName?.split(" ")[0] || "Traveler";
  const { savedPlaces, toggleSaved, isSaved } = useSavedPlaces();
  const displayedSaved = savedPlaces.slice(0, 3);
  const { featured, loading } = useHomePlaces("Cairo");
  const [hiddenGemPlaces, setHiddenGemPlaces] = useState([]);

  useEffect(() => {
    const cities = ["Dahab", "Siwa", "Luxor", "Aswan", "Saint Catherine"];
    Promise.all(cities.map((city) => fetchHomePlaces(city)))
      .then((results) => {
        const places = results.map((data, idx) => {
          const allPlaces = [
            ...(data.featured ?? []),
            ...(data.hidden_gems ?? []),
          ];
          const best = allPlaces[0];
          return {
            city: cities[idx],
            region: [
              "South Sinai",
              "Western Desert",
              "Upper Egypt",
              "Nubia",
              "Mount Sinai",
            ][idx],
            image:
              best?.photo_url ||
              [dahab, siwa, luxor, aswan, saintCatherine][idx],
            place_id: best?.place_id,
          };
        });
        setHiddenGemPlaces(places);
      })
      .catch(() => {});
  }, []);
  const handleNavigation = (page) => {
    if (page === "explore") window.navigateToExplore?.();
    if (page === "home") window.navigateToUserHome?.();
    if (page === "profile") window.navigateToProfile?.();
    if (page === "aiplanner") window.navigateToAiPlanner?.();
    if (page === "calendar") window.navigateToCalendar?.();
  };
  const visibleTestimonials = [
    testimonials[currentTestimonial % testimonials.length],
    testimonials[(currentTestimonial + 1) % testimonials.length],
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const heroContent = document.querySelector(".uh-hero-content");
      if (heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContent.style.opacity = 1 - scrolled / 600;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    let isDown = false;
    let startX;
    let scrollLeft;
    const onMouseDown = (e) => {
      isDown = true;
      slider.style.cursor = "grabbing";
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };
    const onMouseLeave = () => {
      isDown = false;
      slider.style.cursor = "grab";
    };
    const onMouseUp = () => {
      isDown = false;
      slider.style.cursor = "grab";
    };
    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      slider.scrollLeft = scrollLeft - (x - startX) * 2;
    };
    slider.addEventListener("mousedown", onMouseDown);
    slider.addEventListener("mouseleave", onMouseLeave);
    slider.addEventListener("mouseup", onMouseUp);
    slider.addEventListener("mousemove", onMouseMove);
    return () => {
      slider.removeEventListener("mousedown", onMouseDown);
      slider.removeEventListener("mouseleave", onMouseLeave);
      slider.removeEventListener("mouseup", onMouseUp);
      slider.removeEventListener("mousemove", onMouseMove);
    };
  }, []);
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = 0;
    }
  }, [featured]);
  return (
    <>
      {/* ===== Hero Section ===== */}
      <div
        className="uh-home-container"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="uh-overlay" />

        {/* ===== Navbar (local to this page) ===== */}
        <nav className="navbar">
          <div
            className="logo"
            onClick={() => handleNavigation("home")}
            style={{ cursor: "pointer" }}
          >
            <img src={logo} alt="Mind Trip" style={{ width: "85px" }} />
          </div>

          <ul className="nav-links">
            <li className="active" onClick={() => handleNavigation("home")}>
              Home
            </li>
            <li onClick={() => handleNavigation("aiplanner")}>AI Planner</li>
            <li onClick={() => handleNavigation("explore")}>Explore</li>
            <li onClick={() => handleNavigation("calendar")}>Calendar</li>
            <li onClick={() => window.navigateToAboutUs?.()}>About Us</li>
          </ul>

          <div className="nav-right">
            <button
              className="nav-heart-btn"
              aria-label="Favorites"
              onClick={() => window.navigateToSavedPlaces?.()}
            >
              <img src={heartIcon} alt="heart" className="heart-icon" />
            </button>

            <div
              className="nav-profile-icon"
              onClick={() => window.navigateToProfile?.()}
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" fill="#5596FE" />
                  <path d="M4 20c0-4.42 3.58-8 8-8s8 3.58 8 8" fill="#5596FE" />
                </svg>
              )}
            </div>
          </div>
        </nav>

        <div className="uh-hero-content">
          <h1>Welcome Back, {firstName}!</h1>
          <p>
            Your next Egyptian adventure is just a few clicks away. Let our AI
            craft your perfect itinerary today.
          </p>
          <button
            className="uh-plan-btn"
            onClick={() => window.navigateToAiPlanner?.()}
          >
            Plan your new trip
          </button>
        </div>
      </div>
      {/* ===== Popular AI Itineraries Section ===== */}
      <div className="packages-section">
        <div className="packages-content">
          <h2>
            <span className="blue-text">Popular</span> Ai{" "}
            <span className="blue-text">Itineraries</span>
          </h2>
          <p className="packages-subtitle">
            Explore top-rated trips generated by our AI, fully customizable to
            your style
          </p>
          <div className="packages-slider-wrapper" style={{ position: "relative" }}>
            <button
              className="slider-arrow slider-arrow-left"
              onClick={() => {
                const el = sliderRef.current;
                if (el) el.scrollBy({ left: -340, behavior: "smooth" });
              }}
            >
              &#8249;
            </button>
          <div className="packages-row" ref={sliderRef}>
            {loading ? (
              <div style={{ padding: "20px", color: "#888" }}>Loading...</div>
            ) : (
              featured.slice(0, 6).map((place) => (
                <div className="package-card" key={place.place_id}>
                  <div className="package-img">
                    <img
                      src={place.photo_url || siwaMysticRetreat}
                      alt={place.name}
                    />
                  </div>
                  <div className="package-info">
                    <h4>{place.name}</h4>
                    <div className="package-meta">
                      <span>
                        <img
                          src={calender}
                          alt="calender"
                          style={{ width: "12px" }}
                        />{" "}
                        1 day
                      </span>
                      <span>
                        <img
                          src={location3}
                          alt="location3"
                          style={{ width: "12px" }}
                        />{" "}
                        {place.city}
                      </span>
                    </div>
                    <p className="package-price">
                      {place.price > 0 ? `EGP ${place.price}` : "Free"}{" "}
                      <span>/ person</span>
                    </p>
                    <button
                      className="book-now-btn"
                      onClick={() => window.navigateToAiPlanner?.()}
                    >
                      Customize with AI
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
            <button
              className="slider-arrow slider-arrow-right"
              onClick={() => {
                const el = sliderRef.current;
                if (el) el.scrollBy({ left: 340, behavior: "smooth" });
              }}
            >
              &#8250;
            </button>
          </div>
          <button
            className="more-packages-btn"
            onClick={() => window.navigateToAiPlanner?.()}
          >
            Create Your Own Trip
          </button>
        </div>
      </div>
      {/* ===== Smart Journey Organizer Section ===== */}
      <div className="journey-section">
        <h2 className="journey-title">
          <span className="blue-text">Smart</span> Journey{" "}
          <span className="blue-text">Organizer</span>
        </h2>
        <p className="journey-subtitle">
          No more messy itineraries. MindTrip automates your travel schedule day
          by day, hour by hour.
        </p>
        <div className="journey-mockup">
          <img src={macbook} alt="Smart Journey Organizer" />
        </div>
        <button
          className="journey-btn"
          onClick={() => handleNavigation("calendar")}
        >
          View My Calendar ↗
        </button>
      </div>

      {/* ===== Hidden Gems Section ===== */}
      <div className="popular-destinations">
        <div className="popular-content">
          <h2>
            <span className="blue-text">Explore</span> Hidden{" "}
            <span className="blue-text">Gems</span>
          </h2>
          <p className="popular-subtitle">
            Handpicked wonders tailored to your taste. Discover Egypt's most
            iconic spots and hidden gems.
          </p>
          <div className="destinations-row">
            {(hiddenGemPlaces.length > 0
              ? hiddenGemPlaces
              : [
                  { city: "Dahab", region: "South Sinai", image: dahab },
                  { city: "Siwa", region: "Western Desert", image: siwa },
                  { city: "Luxor", region: "Upper Egypt", image: luxor },
                  { city: "Aswan", region: "Nubia", image: aswan },
                  {
                    city: "Saint Catherine",
                    region: "Mount Sinai",
                    image: saintCatherine,
                  },
                ]
            ).map((dest, idx) => (
              <div
                key={dest.city}
                className={`dest-card ${["short", "tall", "featured", "tall", "saint"][idx]}`}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  dest.place_id
                    ? window.navigateToTripDetails?.({
                        place_id: dest.place_id,
                        title: dest.city,
                        city: dest.city,
                        image: dest.image,
                        image_urls: [dest.image],
                        category: "attraction",
                        rating: 4.5,
                        reviews: 0,
                        price: 0,
                      })
                    : window.navigateToExplore?.()
                }
              >
                <img src={dest.image} alt={dest.city} />
                <div className="dest-overlay">
                  <span className="dest-name">{dest.city}</span>
                  <span className="dest-region">
                    <img
                      src={location2}
                      alt="location2"
                      style={{ width: "8px" }}
                    />{" "}
                    {dest.region}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button
            className="more-btn"
            onClick={() => window.navigateToExploreHiddenGems?.()}
          >
            View All Hidden Gems ↗
          </button>
        </div>
      </div>

      {/* ===== My Saved Destinations Section ===== */}
      <div className="saved-section">
        <div className="saved-content">
          <h2 className="saved-title">
            <span className="blue-text">My</span> Saved{" "}
            <span className="blue-text">Destinations</span>
          </h2>
          <p className="saved-subtitle">
            Quickly access the places you've saved and start planning your next
            trip with AI.
          </p>
          <div className="saved-cards">
            {displayedSaved.length > 0
              ? displayedSaved.map((place, idx) => (
                  <div
                    key={place.id}
                    className={`saved-card ${idx === 1 ? "featured-saved" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      window.navigateToTripDetails?.({
                        place_id: place.id,
                        title: place.title,
                        city: place.city,
                        rating: place.rating,
                        reviews: place.reviews,
                        price: place.price,
                        description: place.description,
                        image_urls: place.image_urls || [place.image],
                        image: place.image,
                        opening_hours: place.opening_hours,
                        category: place.category || "attraction",
                      })
                    }
                  >
                    <img src={place.image} alt={place.title} />
                    <button
                      className="saved-heart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaved(place);
                      }}
                    >
                      ❤️
                    </button>
                    <div className="saved-overlay">
                      <span className="saved-name">{place.title}</span>
                      <span className="saved-rating">
                        ⭐ {place.rating ?? "4.9"}
                      </span>
                    </div>
                  </div>
                ))
              : // fallback لو مفيش saved places
                [
                  { img: alexandria, name: "Alexandria", rating: "4.9" },
                  { img: marsaMatrouh, name: "Marsa Matrouh", rating: "4.9" },
                  { img: hurghada, name: "Hurghada", rating: "4.9" },
                ].map((item, idx) => (
                  <div
                    key={item.name}
                    className={`saved-card ${idx === 1 ? "featured-saved" : ""}`}
                  >
                    <img src={item.img} alt={item.name} />
                    <button className="saved-heart-btn">❤️</button>
                    <div className="saved-overlay">
                      <span className="saved-name">{item.name}</span>
                      <span className="saved-rating">⭐ {item.rating}</span>
                    </div>
                  </div>
                ))}
          </div>{" "}
          <button
            className="view-saved-btn"
            onClick={() => window.navigateToSavedPlaces?.()}
          >
            View All Saved ↗
          </button>
        </div>
      </div>
      {/* ===== Testimonials Section ===== */}
      <div className="testimonials-section">
        <h2 className="testimonials-title">
          <span className="blue-text">What Our</span> Clients Say ?
        </h2>
        <div className="testimonials-wrapper">
          <div className="testimonials-track">
            {visibleTestimonials.map((t) => (
              <div className="testimonial-card" key={t.id}>
                <div className="testimonial-card-header">
                  <img src={t.image} alt={t.name} className="client-avatar" />
                  <div className="client-info">
                    <p className="client-name">{t.name}</p>
                    <p className="client-role">{t.role}</p>
                  </div>
                  <div className="client-rating">
                    <span className="star-icon">★</span>
                    <span className="rating-value">{t.rating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="client-review">{t.review}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="testimonials-dots">
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === currentTestimonial ? "dot-active" : ""}`}
              onClick={() => setCurrentTestimonial(i)}
            />
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default UserHome;