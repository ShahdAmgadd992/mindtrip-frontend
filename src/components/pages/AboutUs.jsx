import React, { useEffect, useRef } from "react";
import "./AboutUs.css";
import Navbar from "../layout/Navbar";
import aboutHero from "../../assets/general/About.png";
import story1 from "../../assets/general/story1.png";
import story2 from "../../assets/general/story2.png";
import mission1 from "../../assets/general/mission1.png";
import mission2 from "../../assets/general/mission2.png";
import ph1 from "../../assets/general/ph1.png";
import ph2 from "../../assets/general/ph2.png";
import ph3 from "../../assets/general/ph3.png";
import ph4 from "../../assets/general/ph4.png";
import about2 from "../../assets/general/About2.png";
import Footer from "../layout/Footer";

const AboutUs = () => {
  return (
    <div className="about-wrapper">
      <Navbar activePage="aboutus" />

      <section
        className="about-hero"
        style={{ backgroundImage: `url(${aboutHero})` }}
      >
        <div className="about-hero-overlay">
          <h1>About us ?</h1>
          <p>
            Beyond the pyramids, there's a soul to Egypt that we're here to help
            you discover.
          </p>
        </div>
      </section>

      <section className="about-story">
        <h2 className="section-title">
          <span className="blue">Our</span> Story
        </h2>

        <div className="story-content">
          <div className="story-text">
            <p>
              MindTrip was created with one simple idea: to make travel planning
              smarter, easier, and truly personalized. We saw how overwhelming
              organizing a trip can be from managing budgets to uncovering
              authentic hidden gems that typical searches often miss. So we
              built an AI-powered platform to cut through the noise. Today,
              MindTrip helps travelers design journeys that don't just follow a
              map, but reflect their unique style, budget, and dreams.
            </p>
          </div>
          <div className="story-image">
            <img src={story1} alt="MindTrip platform" />
          </div>
        </div>

        <div className="story-content">
          <div className="story-image">
            <img src={story2} alt="MindTrip journey" />
          </div>
          <div className="story-text">
            <p>
              But MindTrip is more than just a planning tool. It's a smart
              travel companion built to inspire confidence and curiosity. We
              believe travel should feel exciting not stressful. By combining
              intelligent recommendations with human-centered design, we
              transform complex decisions into seamless experiences. Every
              feature we create is designed to give travelers clarity, control,
              and the freedom to explore boldly.
            </p>
          </div>
        </div>
      </section>

      <section className="about-mission">
        <h2 className="section-title">
          <span className="blue">Mission</span> &amp;Vision
        </h2>
        <div className="mission-grid">
          <div className="mission-card">
            <img src={mission1} alt="Our Mission" />
          </div>
          <div className="mission-card">
            <img src={mission2} alt="Our Vision" />
          </div>
        </div>
      </section>

      <section className="about-why">
        <h2 className="section-title">
          <span className="blue">Why</span> MindTrip is Different
        </h2>
        <div className="why-list">
          <div className="why-item">
            <img src={ph1} alt="AI Travel Planner" />
            <div className="why-card">
              <h4>AI Travel Planner</h4>
              <p>
                Get personalized itineraries based on your interests and travel
                style.
              </p>
            </div>
          </div>
          <div className="why-item right">
            <img src={ph2} alt="Budget Optimizer" />
            <div className="why-card">
              <h4>Budget Optimizer</h4>
              <p>
                Plan your trips within your budget limits and track your
                estimated expenses effortlessly.
              </p>
            </div>
          </div>
          <div className="why-item">
            <img src={ph3} alt="Hidden Gems Discovery" />
            <div className="why-card">
              <h4>Hidden Gems Discovery</h4>
              <p>
                Uncover authentic, lesser-known spots in Egypt that typical
                tourist maps usually miss.
              </p>
            </div>
          </div>
          <div className="why-item right">
            <img src={ph4} alt="Smart Recommendations" />
            <div className="why-card">
              <h4>Smart Recommendations</h4>
              <p>
                Receive tailored suggestions for activities, dining, and stays
                that match your vibe.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-team">
        <h2 className="section-title">
          <span className="blue">Meet</span> Our Team
        </h2>
        <p className="team-subtitle">
          Built by a team of ambitious developers and designers.
        </p>
        <div className="team-grid">
          {[
            { name: "Zeina Ahmed", role: "UI/UX Designer" },
            { name: "Shahd Amgad", role: "Frontend Developer" },
            { name: "Shada Mohamed", role: "Frontend Developer" },
            { name: "Safaa Mohamed", role: "AI Developer" },
            { name: "Seif Eldin Yehia", role: "Backend Developer" },
            { name: "Mohamed Ismail", role: "Flutter Developer" },
            { name: "Ahmed Mohamed", role: "AI Developer" },
          ].map((member, i) => (
            <div className="team-card" key={i}>
              <div className="team-avatar-placeholder">
                <span>{member.name.charAt(0)}</span>
              </div>
              <h4>{member.name}</h4>
              <p>{member.role}</p>
              <button className="team-plus">+</button>
            </div>
          ))}
        </div>
      </section>

      <section
        className="about-cta"
        style={{ backgroundImage: `url(${about2})` }}
      >
        <h2>Ready to Plan Your Next Adventure?</h2>
        <button onClick={() => window.navigateToAiPlanner()}>
          Start Planning now
        </button>
      </section>
      <Footer />
    </div>
  );
};

export default AboutUs;
