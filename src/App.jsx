import { useEffect, useState } from "react";
import SignUp from "./components/auth/SignUp";
import SignIn from "./components/auth/SignIn";
import ForgetPassword from "./components/auth/ForgetPassword";
import VerifyEmail from "./components/auth/VerifyEmail";
import ResetPassword from "./components/auth/ResetPassword";
import Home from "./components/pages/Home";
import Explore from "./components/pages/Explore";
// import Explore from "./components/Explore";
import { AuthProvider } from "./context/AuthContext";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

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
      } else {
        setCurrentPage("home");
      }
    };

    updatePageFromPath();

    window.addEventListener("popstate", updatePageFromPath);

    window.navigateToHome = () => {
      window.history.pushState({}, "", "/");
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

    return () => {
      window.removeEventListener("popstate", updatePageFromPath);
      delete window.navigateToHome;
      delete window.navigateToSignIn;
      delete window.navigateToSignUp;
      delete window.navigateToForgetPassword;
      delete window.navigateToVerify;
      delete window.navigateToResetPassword;
      delete window.navigateToExplore;
    };
  }, []);

  const pages = {
    home: <Home />,
    signup: <SignUp />,
    signin: <SignIn />,
    forgetPassword: <ForgetPassword />,
    verifyEmail: <VerifyEmail />,
    resetPassword: <ResetPassword />,
    explore: <Explore />,
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
