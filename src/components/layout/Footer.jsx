import React from "react";
import logo from "../../assets/general/logo.png";
import airbnb from "../../assets/partners/airbnb.png";
import Uber from "../../assets/partners/Uber.png";
import TripAdvisor from "../../assets/partners/TripAdvisor.png";
import Expedia from "../../assets/partners/Expedia.png";
import booking from "../../assets/partners/Booking.png";
import "../pages/Home.css";

const Footer = () => {
  return (
    <>
      <div className="partners-section">
        <h2 className="partners-title">
          <span className="blue-text">Our Trusted</span> Partners
        </h2>
        <div className="partners-row">
          <div className="partner-item">
            <img src={airbnb} alt="airbnb" style={{ width: "120px" }} />
          </div>
          <div className="partner-item">
            <img src={booking} alt="booking" style={{ width: "160px" }} />
          </div>
          <div className="partner-item">
            <img src={Uber} alt="Uber" style={{ width: "70px" }} />
          </div>
          <div className="partner-item">
            <img
              src={TripAdvisor}
              alt="TripAdvisor"
              style={{ width: "160px" }}
            />
          </div>
          <div className="partner-item">
            <img src={Expedia} alt="Expedia" style={{ width: "160px" }} />
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <img src={logo} alt="Mind Trip Logo" className="footer-logo" />
            <p className="footer-brand-name">Mind Trip</p>
            <p className="footer-tagline">
              Smart AI, Unforgettable Journeys. Personalized Egyptian trips,
              ready in seconds
            </p>
            <div className="footer-socials">
              <a href="#" className="social-icon" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#5596fe"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M13.5 8H15V6h-1.5C12.12 6 11 7.12 11 8.5V10H9.5v2H11v6h2v-6h1.5l.5-2H13V8.5c0-.28.22-.5.5-.5z"
                    fill="#5596fe"
                  />
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="6"
                    stroke="#5596fe"
                    strokeWidth="1.8"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    stroke="#5596fe"
                    strokeWidth="1.8"
                  />
                  <circle cx="17.5" cy="6.5" r="1" fill="#5596fe" />
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="2"
                    y="5"
                    width="20"
                    height="14"
                    rx="4"
                    stroke="#5596fe"
                    strokeWidth="1.8"
                  />
                  <polygon points="10,9 10,15 16,12" fill="#5596fe" />
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="Pinterest">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#5596fe"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M12 7c-2.76 0-5 2.24-5 5 0 2.12 1.31 3.93 3.18 4.71-.04-.37-.08-.94.02-1.35l.56-2.38s-.14-.29-.14-.71c0-.67.39-1.17.87-1.17.41 0 .61.31.61.68 0 .41-.26 1.03-.4 1.6-.11.48.24.87.71.87.85 0 1.51-.9 1.51-2.19 0-1.15-.82-1.95-2-1.95-1.36 0-2.16 1.02-2.16 2.07 0 .41.16.85.35 1.09.04.05.04.09.03.14l-.13.54c-.02.09-.08.11-.18.07-.63-.3-1.03-1.22-1.03-1.97 0-1.6 1.16-3.07 3.35-3.07 1.76 0 3.12 1.25 3.12 2.93 0 1.75-1.1 3.15-2.63 3.15-.51 0-1-.27-1.17-.58l-.32 1.19c-.11.44-.42.99-.63 1.32.47.15.97.22 1.49.22 2.76 0 5-2.24 5-5s-2.24-5-5-5z"
                    fill="#5596fe"
                  />
                </svg>
              </a>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>About</h4>
              <ul>
                <li>
                  <a href="#">About Us</a>
                </li>
                <li>
                  <a href="#">Our Story</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
                <li>
                  <a href="#">Press and media</a>
                </li>
                <li>
                  <a href="#">Sustainability</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Help</h4>
              <ul>
                <li>
                  <a href="#">Contact Us</a>
                </li>
                <li>
                  <a href="#">FAQS</a>
                </li>
                <li>
                  <a href="#">How to book</a>
                </li>
                <li>
                  <a href="#">Travel insurance</a>
                </li>
                <li>
                  <a href="#">Live Chat</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li>
                  <a href="#">Terms and conditions</a>
                </li>
                <li>
                  <a href="#">Privacy Policy</a>
                </li>
                <li>
                  <a href="#">Cookies Policy</a>
                </li>
                <li>
                  <a href="#">User Agreement</a>
                </li>
                <li>
                  <a href="#">Accessibility</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <ul>
                <li>
                  <a href="#">Travel Blog</a>
                </li>
                <li>
                  <a href="#">Destination Guides</a>
                </li>
                <li>
                  <a href="#">Trip Planner</a>
                </li>
                <li>
                  <a href="#">Customer Reviews</a>
                </li>
                <li>
                  <a href="#">Safety Tips</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-divider" />
        <p className="footer-copyright">@2026 MindTrip. All Rights Reserved</p>
      </footer>
    </>
  );
};

export default Footer;
