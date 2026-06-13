import { useEffect, useState } from "react";
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
import Landing from "./components/pages/Landing";

function App() {
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
    if (path === "/home") return "home";
    return "landing";
  });

  useEffect(() => {
    const updatePageFromPath = () => {
      const path = window.location.pathname;
      if (path === "/signin" || path === "/sign-in") {
        setCurrentPage("signin");
      } else if (path === "/signup" || path === "/sign-up") {
        setCurrentPage("signup");
      } else if (path === "/forget-password") {
        setCurrentPage("forgetPassword");
      } else if (path === "/verify-email") {
        setCurrentPage("verifyEmail");
      } else if (path === "/reset-password") {
        setCurrentPage("resetPassword");
      } else if (path === "/explore") {
        setCurrentPage("explore");
      } else if (path === "/profile") {
        setCurrentPage("profile");
      } else if (path === "/ai-planner") {
        setCurrentPage("aiplanner");
      } else if (path === "/home") {
        setCurrentPage("home");
      } else if (path === "/" || path === "") {
        setCurrentPage("landing");
      } else {
        setCurrentPage("landing");
      }
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
      setCurrentPage("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.navigateToDashboard = () => {
      window.history.pushState({}, "", "/home");
      setCurrentPage("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
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

    return () => {
      window.removeEventListener("popstate", updatePageFromPath);
      delete window.navigateToLanding;
      delete window.navigateToHome;
      delete window.navigateToDashboard;
      delete window.navigateToSignIn;
      delete window.navigateToSignUp;
      delete window.navigateToForgetPassword;
      delete window.navigateToVerify;
      delete window.navigateToResetPassword;
      delete window.navigateToExplore;
      delete window.navigateToProfile;
      delete window.navigateToAiPlanner;
    };
  }, []);

  const pages = {
    landing: <Landing onNavigate={setCurrentPage} />,
    home: <Home />,
    signup: <SignUp />,
    signin: <SignIn />,
    forgetPassword: <ForgetPassword />,
    verifyEmail: <VerifyEmail />,
    resetPassword: <ResetPassword />,
    explore: <Explore />,
    profile: <Profile />,
    aiplanner: <AiPlanner />,
  };

  return (
    <AuthProvider>
      <div style={{ width: "100%", overflowY: "auto" }}>
        {pages[currentPage]}
      </div>
    </AuthProvider>
  );
}

export default App;
