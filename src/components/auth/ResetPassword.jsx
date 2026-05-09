import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { validatePassword } from "../../utils/passwordValidator";
// import ResetPassword from "./components/auth/ResetPassword";
// import VerifyEmail from "./components/auth/VerifyEmail";

function ResetPassword() {
  const { resetPassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState("idle");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [passwordValidation, setPasswordValidation] = useState(null);

  useEffect(() => {
    // Get email and resetToken from sessionStorage
    const storedEmail = sessionStorage.getItem("resetEmail");
    const storedResetToken = sessionStorage.getItem("resetToken");

    if (storedEmail) {
      setEmail(storedEmail);
    }

    if (storedResetToken) {
      setResetToken(storedResetToken);
    } else if (storedEmail && !storedResetToken) {
      setError("Reset token not found. Please verify your OTP again.");
    }
  }, []);

  useEffect(() => {
    if (newPassword) {
      setPasswordValidation(validatePassword(newPassword));
    } else {
      setPasswordValidation(null);
    }
  }, [newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus("mismatch");
      return;
    }

    // Get fresh values from sessionStorage in case state didn't update
    const emailFromSession = sessionStorage.getItem("resetEmail") || email;
    const tokenFromSession = sessionStorage.getItem("resetToken") || resetToken;

    if (!emailFromSession || !tokenFromSession) {
      setError(
        "Missing email or reset token. Please start the password reset flow again.",
      );
      return;
    }

    setStatus("loading");
    setError("");

    try {
      // Log request for debugging
      console.log("Attempting password reset with:", {
        email: emailFromSession,
        resetToken: tokenFromSession
          ? `${tokenFromSession.substring(0, 10)}...`
          : "missing",
      });

      await resetPassword(
        emailFromSession,
        tokenFromSession,
        newPassword,
        confirmPassword,
      );

      // Clear stored data
      sessionStorage.removeItem("resetEmail");
      sessionStorage.removeItem("resetToken");

      setStatus("success");
    } catch (err) {
      // Better error logging
      console.error("Password reset error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Password reset failed. Please try again.";
      console.error("Error message:", errorMsg);
      setError(errorMsg);
      setStatus("idle");
    }
  };

  const EyeIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  const LockIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );

  // ✅ Success Page
  if (status === "success") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          fontFamily: "'Segoe UI', sans-serif",
          padding: "20px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 560, textAlign: "center" }}>
          <h1 style={{ fontSize: 38, fontWeight: 700, margin: "0 0 32px" }}>
            <span style={{ color: "#5b9eff" }}>You're Back In!</span>
          </h1>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <img
              src="/Safe-bro.svg"
              alt="Success"
              style={{ width: 220, height: "auto" }}
            />
          </div>
          <p
            style={{
              fontSize: 14,
              color: "#9ca3af",
              margin: "0 0 30px",
              lineHeight: 1.6,
            }}
          >
            Your password has been successfully updated. Click below to log in
          </p>
          <button
            onClick={() => window.navigateToSignIn?.()}
            style={{
              width: "100%",
              padding: "15px",
              border: "none",
              borderRadius: 50,
              background: "linear-gradient(to left, #97ceff 0%, #5596fe 100%)",
              color: "white",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(91,158,255,0.3)",
            }}
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  // Error - Invalid token or missing flow
  if (!resetToken) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          fontFamily: "'Segoe UI', sans-serif",
          padding: "20px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 560, textAlign: "center" }}>
          <h1
            style={{
              fontSize: 38,
              fontWeight: 700,
              margin: "0 0 32px",
              color: "#dc2626",
            }}
          >
            Invalid Reset Link
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#6b7280",
              margin: "0 0 30px",
              lineHeight: 1.6,
            }}
          >
            {error ||
              "Please request a password reset code first by clicking 'Forgot Password?' on the login page."}
          </p>
          <button
            onClick={() => window.navigateToForgetPassword?.()}
            style={{
              width: "100%",
              padding: "15px",
              border: "none",
              borderRadius: 50,
              background: "linear-gradient(to left, #97ceff 0%, #5596fe 100%)",
              color: "white",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Start Password Reset
          </button>
        </div>
      </div>
    );
  }

  // ✅ Reset Password Form
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          textAlign: "center",
          position: "relative",
        }}
      >
        <button
          onClick={() => window.history.back()}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6b7280",
            fontSize: 28,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            padding: "4px 8px",
          }}
        >
          ‹
        </button>

        <h1
          style={{
            fontSize: 38,
            fontWeight: 700,
            margin: "0 0 32px",
            paddingTop: 4,
          }}
        >
          <span style={{ color: "#5b9eff" }}>Reset </span>
          <span style={{ color: "#374151" }}>Password</span>
        </h1>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <img
            src="/Reset password.svg"
            alt="Reset Password"
            style={{ width: 220, height: "auto" }}
          />
        </div>

        <p
          style={{
            fontSize: 14,
            color: "#9ca3af",
            margin: "0 0 30px",
            lineHeight: 1.6,
          }}
        >
          Your new password must be different from previously used password
        </p>

        {error && (
          <div
            style={{
              fontSize: 13,
              color: "#dc2626",
              margin: "0 0 20px",
              padding: "12px",
              border: "1px solid #fca5a5",
              borderRadius: 8,
              background: "#fee2e2",
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        {/* New Password */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <span
            style={{
              position: "absolute",
              left: 20,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <LockIcon />
          </span>
          <input
            type={showNew ? "text" : "password"}
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setStatus("idle");
            }}
            style={{
              width: "100%",
              padding: "15px 50px 15px 50px",
              border: "1.5px solid #e5e7eb",
              borderRadius: 50,
              fontSize: 15,
              outline: "none",
              boxSizing: "border-box",
              color: "#374151",
              background: "white",
              transition: "border 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#5b9eff")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            style={{
              position: "absolute",
              right: 18,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              padding: 4,
            }}
          >
            {showNew ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        </div>

        {/* Password Requirements */}
        {passwordValidation && (
          <div
            style={{
              fontSize: 12,
              margin: "12px 0 16px",
              padding: 12,
              borderRadius: 8,
              background: passwordValidation.isValid ? "#ecfdf5" : "#fef2f2",
              border: `1px solid ${passwordValidation.isValid ? "#bbf7d0" : "#fecaca"}`,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                marginBottom: 8,
                color: passwordValidation.isValid ? "#065f46" : "#7f1d1d",
              }}
            >
              {passwordValidation.isValid
                ? "✓ Password is valid"
                : "Password requirements:"}
            </div>
            {!passwordValidation.isValid && (
              <ul style={{ margin: 0, paddingLeft: 20, color: "#7f1d1d" }}>
                {passwordValidation.errors.map((error, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>
                    {error}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Confirm Password */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <span
            style={{
              position: "absolute",
              left: 20,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <LockIcon />
          </span>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setStatus("idle");
            }}
            style={{
              width: "100%",
              padding: "15px 50px 15px 50px",
              border: `1.5px solid ${status === "mismatch" ? "#ef4444" : "#e5e7eb"}`,
              borderRadius: 50,
              fontSize: 15,
              outline: "none",
              boxSizing: "border-box",
              color: "#374151",
              background: "white",
              transition: "border 0.2s",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor =
                status === "mismatch" ? "#ef4444" : "#5b9eff")
            }
            onBlur={(e) =>
              (e.target.style.borderColor =
                status === "mismatch" ? "#ef4444" : "#e5e7eb")
            }
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            style={{
              position: "absolute",
              right: 18,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              padding: 4,
            }}
          >
            {showConfirm ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        </div>

        {status === "mismatch" && (
          <p
            style={{
              color: "#ef4444",
              fontSize: 13,
              margin: "-8px 0 12px",
              textAlign: "left",
              paddingLeft: 16,
            }}
          >
            Passwords do not match
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            disabled={
              status === "loading" ||
              newPassword !== confirmPassword ||
              !newPassword ||
              !confirmPassword ||
              !passwordValidation?.isValid
            }
            style={{
              width: "100%",
              padding: "15px",
              border: "2px solid #5b9eff",
              borderRadius: 50,
              background: "white",
              color: "#5b9eff",
              fontSize: 16,
              fontWeight: 600,
              cursor:
                status === "loading" ||
                newPassword !== confirmPassword ||
                !newPassword ||
                !passwordValidation?.isValid
                  ? "not-allowed"
                  : "pointer",
              transition: "all 0.25s",
              marginTop: 8,
              opacity:
                status === "loading" ||
                newPassword !== confirmPassword ||
                !newPassword ||
                !passwordValidation?.isValid
                  ? 0.6
                  : 1,
            }}
            onMouseEnter={(e) => {
              if (
                status !== "loading" &&
                newPassword === confirmPassword &&
                newPassword &&
                passwordValidation?.isValid
              ) {
                e.currentTarget.style.background = "#5b9eff";
                e.currentTarget.style.color = "white";
              }
            }}
            onMouseLeave={(e) => {
              if (
                status !== "loading" &&
                newPassword === confirmPassword &&
                newPassword &&
                passwordValidation?.isValid
              ) {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.color = "#5b9eff";
              }
            }}
          >
            {status === "loading" ? "Resetting..." : "Reset"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
