import { useState } from "react";
import { useAuth } from "../../context/useAuth";
function ForgetPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setError("");

    try {
      await forgotPassword(email);

      // Store email for verification page
      sessionStorage.setItem("resetEmail", email);

      // Navigate to reset password verification
      if (typeof window.navigateToVerify === "function") {
        window.navigateToVerify();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send recovery email");
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
          <span style={{ color: "#5b9eff" }}>Forget </span>
          <span style={{ color: "#374151" }}>Password ?</span>
        </h1>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <img
            src="/Forget password.svg"
            alt="Forget Password"
            style={{ width: 220, height: "auto" }}
          />
        </div>

        <h2
          style={{
            fontSize: 19,
            fontWeight: 700,
            color: "#1f2937",
            margin: "0 0 10px",
          }}
        >
          Please enter your registered email
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "#9ca3af",
            margin: "0 0 30px",
            lineHeight: 1.6,
          }}
        >
          We will send a verification code to your registered email
        </p>

        {error && (
          <p style={{ fontSize: 14, color: "#dc2626", marginBottom: 16 }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
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
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "15px 20px 15px 50px",
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
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              width: "100%",
              padding: "15px",
              border: "2px solid #5b9eff",
              borderRadius: 50,
              background: "white",
              color: "#5b9eff",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.25s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#5b9eff";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.color = "#5b9eff";
            }}
          >
            {status === "loading" ? "Sending..." : "Recover Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgetPassword;
