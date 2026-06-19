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
          <div className="packages-row" ref={sliderRef}>
            {[
              {
                img: siwaMysticRetreat,
                title: "Siwa Mystic Retreat",
                days: "4 days",
                loc: "Western Desert",
              },
              {
                img: nile,
                title: "The Nile Heritage Path",
                days: "6 days",
                loc: "Luxor & Aswan",
              },
              {
                img: deepBlue,
                title: "Deep Blue Serenity",
                days: "5 days",
                loc: "Marsa Alam",
              },
              {
                img: pyramid,
                title: "The Pyramid",
                days: "1 day",
                loc: "Giza",
              },
            ].map((pkg) => (
              <div className="package-card" key={pkg.title}>
                <div className="package-img">
                  <img src={pkg.img} alt={pkg.title} />
                </div>
                <div className="package-info">
                  <h4>{pkg.title}</h4>
                  <div className="package-meta">
                    <span>
                      <img
                        src={calender}
                        alt="calender"
                        style={{ width: "12px" }}
                      />{" "}
                      {pkg.days}
                    </span>
                    <span>
                      <img
                        src={location3}
                        alt="location3"
                        style={{ width: "12px" }}
                      />{" "}
                      {pkg.loc}
                    </span>
                  </div>
                  <p className="package-price">
                    USD 60 <span>/ person</span>
                  </p>
                  <button
                    className="book-now-btn"
                    onClick={() => window.navigateToAiPlanner?.()}
                  >
                    Customize with AI
                  </button>
                </div>
              </div>
            ))}
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
            <div className="dest-card short">
              <img src={dahab} alt="Dahab" />
              <div className="dest-overlay">
                <span className="dest-name">Dahab</span>
                <span className="dest-region">
                  <img
                    src={location2}
                    alt="location2"
                    style={{ width: "8px" }}
                  />{" "}
                  South Sinai
                </span>
              </div>
            </div>
            <div className="dest-card tall">
              <img src={siwa} alt="Siwa" />
              <div className="dest-overlay">
                <span className="dest-name">Siwa</span>
                <span className="dest-region">
                  <img
                    src={location2}
                    alt="location2"
                    style={{ width: "8px" }}
                  />{" "}
                  Western Desert
                </span>
              </div>
            </div>
            <div className="dest-card featured">
              <img src={luxor} alt="Luxor" />
              <div className="dest-overlay">
                <span className="dest-name">Luxor</span>
                <span className="dest-region">
                  <img
                    src={location2}
                    alt="location2"
                    style={{ width: "8px" }}
                  />{" "}
                  Upper Egypt
                </span>
              </div>
            </div>
            <div className="dest-card tall">
              <img src={aswan} alt="Aswan" />
              <div className="dest-overlay">
                <span className="dest-name">Aswan</span>
                <span className="dest-region">
                  <img
                    src={location2}
                    alt="location2"
                    style={{ width: "8px" }}
                  />{" "}
                  Nubia
                </span>
              </div>
            </div>
            <div className="dest-card saint">
              <img src={saintCatherine} alt="Saint Catherine" />
              <div className="dest-overlay">
                <span className="dest-name">Saint Catherine</span>
                <span className="dest-region">
                  <img
                    src={location2}
                    alt="location2"
                    style={{ width: "8px" }}
                  />{" "}
                  Mount Sinai
                </span>
              </div>
            </div>
          </div>
          <button className="more-btn" onClick={() => setShowSignUpModal(true)}>
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
            <div className="saved-card">
              <img src={alexandria} alt="Alexandria" />
              <button className="saved-heart-btn">❤️</button>
              <div className="saved-overlay">
                <span className="saved-name">Alexandria</span>
                <span className="saved-rating">⭐ 4.9</span>
              </div>
            </div>
            <div className="saved-card featured-saved">
              <img src={marsaMatrouh} alt="Marsa Matrouh" />
              <button className="saved-heart-btn">❤️</button>
              <div className="saved-overlay">
                <span className="saved-name">Marsa Matrouh</span>
                <span className="saved-rating">⭐ 4.9</span>
              </div>
            </div>
            <div className="saved-card">
              <img src={hurghada} alt="Hurghada" />
              <button className="saved-heart-btn">❤️</button>
              <div className="saved-overlay">
                <span className="saved-name">Hurghada</span>
                <span className="saved-rating">⭐ 4.9</span>
              </div>
            </div>
          </div>
          <button
            className="view-saved-btn"
            onClick={() => handleNavigation("explore")}
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
