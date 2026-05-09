import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
// import ResetPassword from "./components/auth/ResetPassword";
// import VerifyEmail from "./components/auth/VerifyEmail";

function VerifyEmail() {
  const { verifyEmail, resendEmailOtp, verifyPasswordOtp, resendPasswordOtp } =
    useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState("idle");
  const [email] = useState(() => {
    return (
      sessionStorage.getItem("resetEmail") ||
      sessionStorage.getItem("verifyEmail") ||
      ""
    );
  });
  const [error, setError] = useState(() => {
    const resetEmail = sessionStorage.getItem("resetEmail");
    const verifyEmailValue = sessionStorage.getItem("verifyEmail");
    return resetEmail || verifyEmailValue
      ? ""
      : "Email not found. Please try again.";
  });
  const [resendTimer, setResendTimer] = useState(0);
  const [verifyMode] = useState(() => {
    return sessionStorage.getItem("resetEmail") ? "password" : "email";
  });
  const inputs = useRef([]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleChange = (val, i) => {
    if (!/^\d?$/.test(val)) return;
    const newCode = [...code];
    newCode[i] = val;
    setCode(newCode);
    setError("");
    if (val && i < 5) inputs.current[i + 1].focus();
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputs.current[i - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newCode = [...code];
    pasted.split("").forEach((ch, i) => {
      newCode[i] = ch;
    });
    setCode(newCode);
    const nextEmpty = newCode.findIndex((v) => !v);
    inputs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleSubmit = async () => {
    if (code.some((d) => !d) || !email) return;

    setStatus("loading");
    setError("");

    try {
      const otp = code.join("");

      if (verifyMode === "email") {
        // Email verification after signup
        await verifyEmail(email, otp);
        sessionStorage.removeItem("verifyEmail");
        if (typeof window.navigateToSignIn === "function") {
          window.navigateToSignIn();
        }
      } else {
        // Password reset OTP verification
        const response = await verifyPasswordOtp(email, otp);
        // Store the resetToken for the next step (response is already unwrapped data from context)
        sessionStorage.setItem(
          "resetToken",
          response.resetToken || response.data?.resetToken,
        );
        // DON'T remove resetEmail here - we need it in the next step!

        if (typeof window.navigateToResetPassword === "function") {
          window.navigateToResetPassword();
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Verification failed. Please try again.",
      );
      setStatus("idle");
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setStatus("resending");
    setError("");

    try {
      if (verifyMode === "email") {
        await resendEmailOtp(email);
      } else {
        await resendPasswordOtp(email);
      }
      setResendTimer(60);
      setStatus("idle");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
      setStatus("idle");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 580,
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
            fontSize: 30,
            lineHeight: 1,
            padding: "2px 8px",
          }}
        >
          ‹
        </button>

        <h1 style={{ fontSize: 38, fontWeight: 700, margin: "0 0 36px" }}>
          <span style={{ color: "#5b9eff" }}>Verify </span>
          <span style={{ color: "#374151" }}>
            {verifyMode === "email" ? "your email" : "your identity"}
          </span>
        </h1>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <img
            src="/Email Verification.svg"
            alt="Verify"
            style={{ width: 240, height: "auto" }}
          />
        </div>

        <p style={{ fontSize: 15, color: "#374151", margin: "0 0 28px" }}>
          Please enter the 6-digit code that was sent to {email || "your email"}
        </p>

        {error && (
          <p style={{ fontSize: 14, color: "#dc2626", margin: "0 0 16px" }}>
            {error}
          </p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginBottom: 22,
          }}
        >
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              style={{
                width: 56,
                height: 56,
                textAlign: "center",
                fontSize: 24,
                fontWeight: 600,
                color: "#1f2937",
                border: digit ? "2px solid #5b9eff" : "1.5px solid #e5e7eb",
                borderRadius: 12,
                outline: "none",
                background: "white",
                transition: "all 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#5b9eff")}
              onBlur={(e) => {
                if (!digit) e.target.style.borderColor = "#e5e7eb";
              }}
            />
          ))}
        </div>

        <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 28 }}>
          didn't receive code?{" "}
          <span
            onClick={handleResend}
            style={{
              color: resendTimer > 0 ? "#9ca3af" : "#374151",
              fontWeight: 700,
              cursor: resendTimer > 0 ? "not-allowed" : "pointer",
              textDecoration: resendTimer > 0 ? "none" : "underline",
              opacity: resendTimer > 0 ? 0.6 : 1,
            }}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
          </span>
        </p>

        <button
          onClick={handleSubmit}
          disabled={code.some((d) => !d) || status === "loading" || !email}
          style={{
            width: "100%",
            padding: "16px",
            border: "none",
            borderRadius: 50,
            background:
              code.every((d) => d) && email
                ? "linear-gradient(to right, #93c5fd, #5b9eff)"
                : "#e5e7eb",
            color: code.every((d) => d) && email ? "white" : "#9ca3af",
            fontSize: 17,
            fontWeight: 600,
            cursor: code.every((d) => d) && email ? "pointer" : "not-allowed",
            transition: "all 0.3s",
          }}
        >
          {status === "loading" ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  );
}

export default VerifyEmail;
