import React, { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import SignUp from "./components/auth/SignUp";
import SignIn from "./components/auth/SignIn";
import ForgetPassword from "./components/auth/ForgetPassword";
import VerifyEmail from "./components/auth/VerifyEmail";
import ResetPassword from "./components/auth/ResetPassword";
import Home from "./components/pages/Home";
import Explore from "./components/pages/Explore";
import { AuthProvider } from "./context/AuthContext";
import Profile from "./components/pages/Profile";
import AiPlanner from "./components/pages/AiPlanner";
import Landing from "./components/pages/landing";
import CalendarPage from "./components/pages/Calendar";
import AboutUs from "./components/pages/AboutUs.jsx";
import Interests from "./components/pages/Interests";
import UserHome from "./components/pages/Userhome";
import SavedPlaces from "./components/pages/SavedPlaces";
import TripDetails from "./components/pages/TripDetails";
import { SavedPlacesProvider } from "./context/SavedPlacesContext";
import TripResult from "./components/pages/Tripresult";

function App() {
  const [exploreHiddenGems, setExploreHiddenGems] = useState(false);
  const [currentTripPlan, setCurrentTripPlan] = useState(null);
  // ✅ FIX: key بيتغير كل ما الـ plan يتحدث → بيخلي TripResult يعمل re-mount ويجيب أحدث داتا
  const [tripResultKey, setTripResultKey] = useState(0);

  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname;
    if (path === "/signin" || path === "/sign-in") return "signin";
    if (path === "/signup" || path === "/sign-up") return "signup";
    if (path === "/forget-password") return "forgetPassword";
    if (path === "/verify-email") return "verifyEmail";
    if (path === "/reset-password") return "resetPassword";
    if (path === "/explore") return "explore";
    if (path === "/profile") return "profile";
    if (path === "/ai-planner") return "aiplanner";
    if (path === "/home") return "userhome";
    if (path === "/calendar") return "calendar";
    if (path === "/about-us") return "aboutus";
    if (path === "/interests") return "interests";
    if (path === "/user-home") return "userhome";
    return "landing";
  });

  useEffect(() => {
    const updatePageFromPath = () => {
      const path = window.location.pathname;
      const isLoggedIn = !!localStorage.getItem("accessToken");

      if (path === "/signin" || path === "/sign-in") setCurrentPage("signin");
      else if (path === "/signup" || path === "/sign-up")
        setCurrentPage("signup");
      else if (path === "/forget-password") setCurrentPage("forgetPassword");
      else if (path === "/verify-email") setCurrentPage("verifyEmail");
      else if (path === "/reset-password") setCurrentPage("resetPassword");
      else if (path === "/explore") setCurrentPage("explore");
      else if (path === "/profile") setCurrentPage("profile");
      else if (path === "/ai-planner") setCurrentPage("aiplanner");
      else if (path === "/home") {
        if (isLoggedIn) setCurrentPage("userhome");
        else setCurrentPage("home");
      } else if (path === "/user-home") setCurrentPage("userhome");
      else if (path === "/calendar") setCurrentPage("calendar");
      else if (path === "/about-us") setCurrentPage("aboutus");
      else if (path === "/interests") setCurrentPage("interests");
      else if (path === "/trip-details") setCurrentPage("tripdetails");
      else setCurrentPage("landing");
    };
    updatePageFromPath();
    window.addEventListener("popstate", updatePageFromPath);

    window.navigateToLanding = () => {
      window.history.pushState({}, "", "/");
      setCurrentPage("landing");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.navigateToHome = () => {
      window.history.pushState({}, "", "/home");
      const isLoggedIn = !!localStorage.getItem("accessToken");
      setCurrentPage(isLoggedIn ? "userhome" : "home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.navigateToDashboard = () => {
      window.history.pushState({}, "", "/interests");
      setCurrentPage("interests");
    };
    window.navigateToSignIn = () => {
      window.history.pushState({}, "", "/signin");
      setCurrentPage("signin");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.navigateToSignUp = () => {
      window.history.pushState({}, "", "/signup");
      setCurrentPage("signup");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.navigateToForgetPassword = () => {
      window.history.pushState({}, "", "/forget-password");
      setCurrentPage("forgetPassword");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.navigateToVerify = () => {
      window.history.pushState({}, "", "/verify-email");
      setCurrentPage("verifyEmail");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.navigateToResetPassword = () => {
      window.history.pushState({}, "", "/reset-password");
      setCurrentPage("resetPassword");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.navigateToExplore = () => {
      window.history.pushState({}, "", "/explore");
      setCurrentPage("explore");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.navigateToExploreHiddenGems = () => {
      setExploreHiddenGems(true);
      window.history.pushState({}, "", "/explore");
      setCurrentPage("explore");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.navigateToProfile = () => {
      window.history.pushState({}, "", "/profile");
      setCurrentPage("profile");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.navigateToAiPlanner = () => {
      window.history.pushState({}, "", "/ai-planner");
      setCurrentPage("aiplanner");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.navigateToCalendar = () => {
      window.history.pushState({}, "", "/calendar");
      setCurrentPage("calendar");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.navigateToAboutUs = () => {
      window.history.pushState({}, "", "/about-us");
      setCurrentPage("aboutus");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.navigateToInterests = () => {
      window.history.pushState({}, "", "/interests");
      setCurrentPage("interests");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.navigateToSavedPlaces = () => {
      window.history.pushState({}, "", "/saved-places");
      setCurrentPage("savedplaces");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.navigateToUserHome = () => {
      const hasSeenInterests = localStorage.getItem("hasSeenInterests");
      if (!hasSeenInterests) {
        window.history.pushState({}, "", "/interests");
        setCurrentPage("interests");
      } else {
        window.history.pushState({}, "", "/home");
        setCurrentPage("userhome");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.navigateToWishlist = () => {
      window.history.pushState({}, "", "/saved-places");
      setCurrentPage("savedplaces");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.navigateToTripDetails = (placeData) => {
      window.__tripDetailsData = placeData;
      window.history.pushState({}, "", "/trip-details");
      setCurrentPage("tripdetails");
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
    };
    window.navigateToTripResult = (tripData) => {
      // ✅ FIX: نحفظ الداتا ونعمل bump للـ key عشان TripResult يعمل fresh fetch
      window.__tripResultData = tripData;
      window.history.pushState({}, "", "/trip-result");
      setCurrentPage("tripresult");
      setTripResultKey((k) => k + 1); // force re-mount → fresh API fetch
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // ✅ FIX: لما useAddToTrip يطلق tripPlanUpdated (بعد add/move/remove)،
    // لو المستخدم راجع لـ TripResult نعمل re-mount تاني عشان يجيب الداتا الجديدة
    const handleTripPlanUpdated = (e) => {
      const updatedTripId = e.detail?.tripId;
      const currentTripId = window.__tripResultData?.tripId;
      if (updatedTripId && currentTripId && updatedTripId === currentTripId) {
        setTripResultKey((k) => k + 1);
      }
    };
    window.addEventListener("tripPlanUpdated", handleTripPlanUpdated);
    return () => {
      window.removeEventListener("popstate", updatePageFromPath);
      window.removeEventListener("tripPlanUpdated", handleTripPlanUpdated);
      delete window.navigateToLanding;
      delete window.navigateToHome;
      delete window.navigateToDashboard;
      delete window.navigateToSignIn;
      delete window.navigateToSignUp;
      delete window.navigateToForgetPassword;
      delete window.navigateToVerify;
      delete window.navigateToResetPassword;
      delete window.navigateToExplore;
      delete window.navigateToExploreHiddenGems;
      delete window.navigateToProfile;
      delete window.navigateToAiPlanner;
      delete window.navigateToCalendar;
      delete window.navigateToAboutUs;
      delete window.navigateToInterests;
      delete window.navigateToUserHome;
      delete window.navigateToTripDetails;
      delete window.navigateToTripResult;
      delete window.navigateToWishlist;
    };
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return <Landing onNavigate={setCurrentPage} />;
      case "home":
        return <Home />;
      case "signup":
        return <SignUp />;
      case "signin":
        return <SignIn />;
      case "forgetPassword":
        return <ForgetPassword />;
      case "verifyEmail":
        return <VerifyEmail />;
      case "resetPassword":
        return <ResetPassword />;
      case "explore":
        return (
          <Explore
            hiddenGems={exploreHiddenGems}
            onHiddenGemsConsumed={() => setExploreHiddenGems(false)}
          />
        );
      case "profile":
        return <Profile />;
      case "aiplanner":
        return <AiPlanner />;
      case "calendar":
        return <CalendarPage />;
      case "aboutus":
        return <AboutUs />;
      case "interests":
        return <Interests />;
      case "userhome":
        return <UserHome />;
      case "savedplaces":
        return <SavedPlaces />;
      case "tripdetails":
        return <TripDetails place={window.__tripDetailsData} />;
      case "tripresult":
        return <TripResult key={tripResultKey} tripPlan={window.__tripResultData} />;
      default:
        return <Landing onNavigate={setCurrentPage} />;
    }
  };
  return (
    <BrowserRouter>
      <AuthProvider>
        <SavedPlacesProvider>
          <div style={{ width: "100%", overflowY: "auto" }}>{renderPage()}</div>
        </SavedPlacesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;