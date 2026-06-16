import React, { useEffect, useRef, useState } from "react";
import "./Home.css";
import SignUpModal from "../auth/SignUpModal";
import bgImage from "../../assets/general/egypt-bg.png";
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
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

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

const Home = () => {
  const sliderRef = useRef(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const visibleTestimonials = [
    testimonials[currentTestimonial % testimonials.length],
    testimonials[(currentTestimonial + 1) % testimonials.length],
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const heroContent = document.querySelector(".hero-content");
      const stats = document.querySelector(".stats");
      if (heroContent && stats) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContent.style.opacity = 1 - scrolled / 600;
        stats.style.transform = `translateY(${scrolled * 0.2}px)`;
        stats.style.opacity = 1 - scrolled / 500;
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
        className="home-container"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="overlay" />
        <Navbar activePage="home" />
        <div className="hero-content">
          <h1>Egypt</h1>
          <p>
            Plan smart, travel better, AI-powered itineraries, custom schedules,
            and budget optimization.
          </p>
          <button
            className="book-btn"
            onClick={() => window.navigateToSignUp?.()}
          >
            Get Started
          </button>
        </div>
        <div className="stats">
          <div className="stat-item">
            <h3>10K</h3>
            <p>Total Customers</p>
          </div>
          <div className="divider" />
          <div className="stat-item">
            <h3>01+</h3>
            <p>Years Of Experience</p>
          </div>
          <div className="divider" />
          <div className="stat-item">
            <h3>1k</h3>
            <p>Total Destinations</p>
          </div>
          <div className="divider" />
          <div className="stat-item">
            <h3>7.0</h3>
            <p>Average rating</p>
          </div>
        </div>
      </div>

      {/* ===== How It Works Section ===== */}
      <div className="how-it-works">
        <h2>
          <span className="blue">How </span>MindTrip
          <span className="blue"> Works</span>
        </h2>
        <p className="how-subtitle">
          Best-value trips designed by AI. We balance experiences, stays, and
          activities to get you the best trip within your budget.
        </p>
        <div className="cards-container">
          <div className="card">
            <div className="card-icon">
              <img
                src={locationIcon}
                alt="location"
                style={{ width: "50px" }}
              />
            </div>
            <p>
              <span className="blue"> Tell</span> us{" "}
              <span className="blue">your</span>
              <br />
              <strong>travel</strong> <span className="blue">style</span>
            </p>
          </div>
          <div className="card">
            <div className="card-icon">
              <img src={aiIcon} alt="ai-icon" style={{ width: "50px" }} />
            </div>
            <p>
              <span className="blue">AI</span> <strong>builds</strong>{" "}
              <span className="blue">your</span>
              <br />
              <strong>plan</strong>
            </p>
          </div>
          <div className="card">
            <div className="card-icon">
              <img
                src={travelIcon}
                alt="travel-icon"
                style={{ width: "50px" }}
              />
            </div>
            <p>
              <span className="blue">Travel</span> <strong>better</strong>
            </p>
          </div>
        </div>
      </div>

      {/* ===== Why Choose Section ===== */}
      <div className="why-choose">
        <div className="why-content">
          <h2>
            <span style={{ color: "#5596FE" }}>Why Travelers </span>Choose Mind
            Trip
          </h2>
          <p className="why-subtitle">
            Thoughtfully designed trips tailored to your mood, budget, and
            travel style. Discover Egypt beyond the usual, from iconic landmarks
            to hidden gems.
          </p>
          <div className="why-body">
            <div className="why-image">
              <img src={bgImage2} alt="Egypt" />
            </div>
            <div className="why-features">
              <div className="feature-card">
                <div className="feature-icon">
                  <img src={AiTrip} alt="Aitrip" style={{ width: "50px" }} />
                </div>
                <div>
                  <h4>AI Trip Planner</h4>
                  <p>
                    Our AI designs trips based on your mood, time, and travel
                    style
                  </p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <img src={smart} alt="smart" style={{ width: "50px" }} />
                </div>
                <div>
                  <h4>Smart Budget Optimizer</h4>
                  <p>
                    The best stays and activities, perfectly tailored to your
                    budget
                  </p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <img src={Hidden} alt="Hidden" style={{ width: "50px" }} />
                </div>
                <div>
                  <h4>Hidden Gems</h4>
                  <p>Discover places you won't find in typical travel guides</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
            <div className="package-card">
              <div className="package-img">
                <img src={siwaMysticRetreat} alt="Siwa Mystic Retreat" />
              </div>
              <div className="package-info">
                <h4>Siwa Mystic Retreat</h4>
                <div className="package-meta">
                  <span>
                    <img
                      src={calender}
                      alt="calender"
                      style={{ width: "12px" }}
                    />{" "}
                    4 days
                  </span>
                  <span>
                    <img
                      src={location3}
                      alt="location3"
                      style={{ width: "12px" }}
                    />{" "}
                    Western Desert
                  </span>
                </div>
                <p className="package-price">
                  USD 60 <span>/ person</span>
                </p>
                <button
                  className="book-now-btn"
                  onClick={() => setShowSignUpModal(true)}
                >
                  Customize with AI
                </button>
              </div>
            </div>
            <div className="package-card">
              <div className="package-img">
                <img src={nile} alt="The Nile Heritage Path" />
              </div>
              <div className="package-info">
                <h4>The Nile Heritage Path</h4>
                <div className="package-meta">
                  <span>
                    <img
                      src={calender}
                      alt="calender"
                      style={{ width: "12px" }}
                    />{" "}
                    6 days
                  </span>
                  <span>
                    <img
                      src={location3}
                      alt="location3"
                      style={{ width: "12px" }}
                    />{" "}
                    Luxor & Aswan
                  </span>
                </div>
                <p className="package-price">
                  USD 60 <span>/ person</span>
                </p>
                <button
                  className="book-now-btn"
                  onClick={() => setShowSignUpModal(true)}
                >
                  Customize with AI
                </button>
              </div>
            </div>
            <div className="package-card">
              <div className="package-img">
                <img src={deepBlue} alt="Deep Blue Serenity" />
              </div>
              <div className="package-info">
                <h4>Deep Blue Serenity</h4>
                <div className="package-meta">
                  <span>
                    <img
                      src={calender}
                      alt="calender"
                      style={{ width: "12px" }}
                    />{" "}
                    5 days
                  </span>
                  <span>
                    <img
                      src={location3}
                      alt="location3"
                      style={{ width: "12px" }}
                    />{" "}
                    Marsa Alam
                  </span>
                </div>
                <p className="package-price">
                  USD 60 <span>/ person</span>
                </p>
                <button
                  className="book-now-btn"
                  onClick={() => setShowSignUpModal(true)}
                >
                  Customize with AI
                </button>
              </div>
            </div>
            <div className="package-card">
              <div className="package-img">
                <img src={pyramid} alt="The Pyramid" />
              </div>
              <div className="package-info">
                <h4>The Pyramid</h4>
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
                    Giza
                  </span>
                </div>
                <p className="package-price">
                  USD 60 <span>/ person</span>
                </p>
                <button
                  className="book-now-btn"
                  onClick={() => setShowSignUpModal(true)}
                >
                  Customize with AI
                </button>
              </div>
            </div>
          </div>
          {/* ✅ Create Your Own Trip → يفتح Sign Up Modal */}
          <button
            className="more-packages-btn"
            onClick={() => setShowSignUpModal(true)}
          >
            Create Your Own Trip
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

      {/* ===== Sign Up Modal ===== */}
      {showSignUpModal && (
        <SignUpModal onClose={() => setShowSignUpModal(false)} />
      )}
    </>
  );
};

export default Home;
