import React, { useContext } from "react";
import logo from "../../assets/general/logo.png";
import "../pages/Home.css";
import AuthContext from "../../context/AuthContextValue";
import heartWhite from "../../assets/icons/heart.png";
import heartGray from "../../assets/icons/heartg.png";

const Navbar = ({ activePage = "home", style = {} }) => {
  const isLoggedIn = !!localStorage.getItem("accessToken");
  const { user } = useContext(AuthContext);

  const handleNavigation = (page) => {
    if (page === "explore") window.navigateToExplore?.();
    if (page === "home") window.navigateToHome?.();
    if (page === "profile") window.navigateToProfile?.();
    if (page === "aiplanner") window.navigateToAiPlanner?.();
    if (page === "calendar") window.navigateToCalendar?.();
  };

  return (
    <nav className="navbar" style={style}>
      <div
        className="logo"
        onClick={() => handleNavigation("home")}
        style={{ cursor: "pointer" }}
      >
        <img src={logo} alt="Mind Trip" style={{ width: "85px" }} />
      </div>

      <ul className="nav-links">
        <li
          className={activePage === "home" ? "active" : ""}
          onClick={() => handleNavigation("home")}
        >
          Home
        </li>
        <li
          className={activePage === "aiplanner" ? "active" : ""}
          onClick={() => handleNavigation("aiplanner")}
        >
          AI Planner
        </li>
        <li
          className={activePage === "explore" ? "active" : ""}
          onClick={() => handleNavigation("explore")}
        >
          Explore
        </li>
        <li
          className={activePage === "calendar" ? "active" : ""}
          onClick={() => handleNavigation("calendar")}
        >
          Calendar
        </li>
        <li
          className={activePage === "aboutus" ? "active" : ""}
          onClick={() => window.navigateToAboutUs?.()}
        >
          About Us
        </li>
      </ul>
      <div className="nav-right">
        {activePage === "home" || !isLoggedIn ? (
          <button
            className="signin-btn"
            onClick={() => window.navigateToSignIn?.()}
          >
            Sign In
          </button>
        ) : (
          <>
            <img
              src={
                ["explore", "aboutus"].includes(activePage)
                  ? heartWhite
                  : heartGray
              }
              alt="wishlist"
              style={{
                width: "24px",
                height: "24px",
                cursor: "pointer",
                opacity: 0.9,
              }}
              onClick={() => window.navigateToWishlist?.()}
            />
            <div
              className="nav-profile-icon"
              onClick={() => handleNavigation("profile")}
              style={{ cursor: "pointer" }}
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #5596FE",
                  }}
                />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" fill="#5596FE" />
                  <path d="M4 20c0-4.42 3.58-8 8-8s8 3.58 8 8" fill="#5596FE" />
                </svg>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
