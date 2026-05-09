import React from "react";
import logo from "../../assets/general/logo.png";
import "../pages/Home.css";

const Navbar = ({ activePage = "home" }) => {
  const handleNavigation = (page) => {
    if (page === "explore") window.navigateToExplore?.();
    if (page === "home") window.navigateToHome?.();
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <img src={logo} alt="Mind Trip" style={{ width: "80px" }} />
      </div>
      <ul className="nav-links">
        <li
          className={activePage === "home" ? "active" : ""}
          onClick={() => handleNavigation("home")}
        >
          Home
        </li>
        <li
          className={activePage === "explore" ? "active" : ""}
          onClick={() => handleNavigation("explore")}
        >
          Explore
        </li>
        <li>About Us</li>
        <li>Tour Packages</li>
        <li>Ai Planner</li>
      </ul>
      <div className="nav-right">
        <span className="lang">🌐 EN ▾</span>
        <span className="menu-icon">☰</span>
      </div>
    </nav>
  );
};

export default Navbar;
