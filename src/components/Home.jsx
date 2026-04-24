import React, { useEffect } from "react";
import "./Home.css";
import bgImage from "../assets/egypt-bg.png";
import bgImage2 from "../assets/egypt2.jpg";
import dahab from "../assets/dahab.jpg";
import siwa from "../assets/siwa.jpg";
import luxor from "../assets/luxor.jpg";
import aswan from "../assets/aswan.jpg";
import saintCatherine from "../assets/saintCatherine.jpg";
import alexandria from "../assets/alexandria.jpg";
import marsaMatrouh from "../assets/marsaMatrouh.jpg";
import hurghada from "../assets/hurghada.jpg";
import logo from "../assets/logo.png";
import locationIcon from "../assets/location-icon.jpeg";

const Home = () => {
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

  return (
    <>
      {/* ===== Hero Section ===== */}
      <div
        className="home-container"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="overlay" />

        <nav className="navbar">
          <div className="logo">
            <img src={logo} alt="Mind Trip" style={{ width: "80px" }} />
          </div>
          <ul className="nav-links">
            <li className="active">Home</li>
            <li>Explore</li>
            <li>About Us</li>
            <li>Tour Packages</li>
            <li>Ai Planner</li>
          </ul>
          <div className="nav-right">
            <span className="lang">🌐 EN ▾</span>
            <span className="menu-icon">☰</span>
          </div>
        </nav>

        <div className="hero-content">
          <h1>Egypt</h1>
          <p>
            Plan smart, travel better, AI-powered itineraries, custom schedules,
            and budget optimization.
          </p>
          <button className="book-btn">Book Now</button>
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
            <div className="card-icon">✨</div>
            <p>
              <span className="blue">AI</span> <strong>builds</strong>{" "}
              <span className="blue">your</span>
              <br />
              <strong>plan</strong>
            </p>
          </div>
          <div className="card">
            <div className="card-icon">📈</div>
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
            <span style={{ color: "#5596FE" }}>Why Travelers </span>
            Choose Mind Trip
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
                <div className="feature-icon">✨</div>
                <div>
                  <h4>AI Trip Planner</h4>
                  <p>
                    Our AI designs trips based on your mood, time, and travel
                    style
                  </p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <div>
                  <h4>Smart Budget Optimizer</h4>
                  <p>
                    The best stays and activities, perfectly tailored to your
                    budget
                  </p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📍</div>
                <div>
                  <h4>Hidden Gems</h4>
                  <p>Discover places you won't find in typical travel guides</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Popular Destinations Section ===== */}
      <div className="popular-destinations">
        <div className="popular-content">
          <h2>
            <span className="blue-text">Popular</span> Destinations
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
                <span className="dest-region">📍 South Sinai</span>
              </div>
            </div>

            <div className="dest-card tall">
              <img src={siwa} alt="Siwa" />
              <div className="dest-overlay">
                <span className="dest-name">Siwa</span>
                <span className="dest-region">📍 Western Desert</span>
              </div>
            </div>

            <div className="dest-card featured">
              <img src={luxor} alt="Luxor" />
              <div className="dest-overlay">
                <span className="dest-name">Luxor</span>
                <span className="dest-region">📍 Upper Egypt</span>
              </div>
            </div>

            <div className="dest-card tall">
              <img src={aswan} alt="Aswan" />
              <div className="dest-overlay">
                <span className="dest-name">Aswan</span>
                <span className="dest-region">📍 Nubia</span>
              </div>
            </div>

            <div className="dest-card saint">
              <img src={saintCatherine} alt="Saint Catherine" />
              <div className="dest-overlay">
                <span className="dest-name">Saint Catherine</span>
                <span className="dest-region">📍 Mount Sinai</span>
              </div>
            </div>
          </div>

          <button className="more-btn">More destinations ↗</button>
        </div>
      </div>

      {/* ===== Explore Without Limits Section ===== */}
      <div className="explore-section">
        <div className="explore-content">
          <h2>
            <span className="blue-text">Explore</span> Without{" "}
            <span className="blue-text">Limits</span>
          </h2>
          <p className="explore-subtitle">
            Discover Egypt beyond the guidebooks. Browse through curated
            stories, vibrant cultures, and stunning destinations waiting for
            your arrival
          </p>

          <div className="explore-cards">
            <div className="explore-card">
              <img src={alexandria} alt="Alexandria" />
              <button className="arrow-btn">↗</button>
              <div className="explore-overlay">
                <span className="explore-name">Alexandria</span>
                <span className="explore-rating">⭐ 4.9</span>
              </div>
            </div>

            <div className="explore-card featured-explore">
              <img src={marsaMatrouh} alt="Marsa Matrouh" />
              <button className="arrow-btn">↗</button>
              <div className="explore-overlay">
                <span className="explore-name">Marsa Matrouh</span>
                <span className="explore-rating">⭐ 4.9</span>
              </div>
            </div>

            <div className="explore-card">
              <img src={hurghada} alt="Hurghada" />
              <button className="arrow-btn">↗</button>
              <div className="explore-overlay">
                <span className="explore-name">Hurghada</span>
                <span className="explore-rating">⭐ 4.9</span>
              </div>
            </div>
          </div>

          <button className="more-btn">Explore More ↗</button>
        </div>
      </div>
    </>
  );
};

export default Home;
