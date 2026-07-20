import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // 🔥 FORGOT PASSWORD STATES
  const [showForgot, setShowForgot] = useState(false); // Controls if reset mode is open
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState(1); // 1: Send Email, 2: Enter OTP & New Pass

  const navigate = useNavigate();

  // NORMAL USER LOGIN HANDLER
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/courses/user-login",
        { email, password }
      );

      if (res.data.success) {
        localStorage.setItem("userEmail", res.data.email);
        localStorage.setItem("userName", res.data.userName);
        alert("Login Successful! Welcome " + res.data.userName);
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Invalid Email or Password. Please try again.";
      alert(errorMsg);
    }
  };

  // 🔥 OTP SEND HANDLER
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!resetEmail) return alert("Please enter your registered email!");
    
    try {
      const res = await axios.post("http://localhost:5000/api/courses/send-otp", { email: resetEmail });
      if (res.data.success) {
        alert(res.data.message);
        setResetStep(2); // Jump to OTP entry step
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP. Please check your email.");
    }
  };

  // 🔥 PASSWORD RESET VERIFY HANDLER
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) return alert("All fields are strictly required!");

    try {
      const res = await axios.post("http://localhost:5000/api/courses/reset-password-otp", {
        email: resetEmail,
        otp,
        newPassword
      });
      if (res.data.success) {
        alert(res.data.message);
        // Reset everything back to normal login state
        setShowForgot(false);
        setResetStep(1);
        setResetEmail("");
        setOtp("");
        setNewPassword("");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Invalid or Expired OTP!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        {/* CONDITION 1: SHOW FORGOT PASSWORD SCREEN */}
        {showForgot ? (
          <>
            <h2 className="login-title">Reset Password</h2>
            <p className="login-subtitle">
              {resetStep === 1 
                ? "Enter your registered email to receive a secure 6-digit OTP" 
                : "Enter the code sent to your Gmail account to change password"}
            </p>

            {resetStep === 1 ? (
              <form onSubmit={handleSendOtp}>
                <input
                  type="email"
                  className="login-input"
                  placeholder="Enter your registered email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
                <button type="submit" className="login-btn">
                  Send Verification OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <input
                  type="text"
                  className="login-input"
                  placeholder="Enter 6-Digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  style={{ textAlign: 'center', letterSpacing: '2px', fontWeight: 'bold' }}
                />
                <input
                  type="password"
                  className="login-input"
                  placeholder="Enter New Secure Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button type="submit" className="login-btn">
                  Verify & Update Password
                </button>
              </form>
            )}

            {/* Back to normal login option */}
            <p className="login-footer" style={{ marginTop: '15px' }}>
              <span 
                className="login-link" 
                onClick={() => { setShowForgot(false); setResetStep(1); }}
                style={{ cursor: 'pointer', fontWeight: '600' }}
              >
                ← Back to Student Login
              </span>
            </p>
          </>
        ) : (
          
          /* CONDITION 2: SHOW NORMAL LOGIN SCREEN (Aapka Original Form) */
          <>
            <h2 className="login-title">Student Login</h2>
            <p className="login-subtitle">
              Login to access your purchased courses
            </p>

            <form onSubmit={handleLogin}>
              <input
                type="email"
                className="login-input"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                className="login-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* 🔥 FORGOT PASSWORD LINK INJECTED HERE */}
              <div style={{ textAlign: "right", marginBottom: "15px", marginTop: "-5px" }}>
                <span
                  onClick={() => setShowForgot(true)}
                  style={{
                    color: "var(--primary-color, #4f46e5)",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontWeight: "500"
                  }}
                >
                  Forgot Password?
                </span>
              </div>

              <button type="submit" className="login-btn">
                Login Now
              </button>
            </form>

            <p className="login-footer">
              New Student?{" "}
              <Link to="/" className="login-link">
                Enroll in a Course
              </Link>
            </p>
          </>
        )}

      </div>
    </div>
  );
}

export default UserLogin;