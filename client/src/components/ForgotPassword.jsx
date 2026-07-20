import React, { useState } from "react";
import axios from "axios";

function ForgotPassword({ onBack }) {

  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [resetStep, setResetStep] = useState(1);

  // Send OTP
const handleSendOtp = async (e) => {
  e.preventDefault();

  if (!resetEmail) {
    return alert("Please enter your registered email!");
  }

  try {
    const res = await axios.post(
      "http://localhost:5000/api/courses/send-otp",
      {
        email: resetEmail,
      }
    );

    if (res.data.success) {
      alert(res.data.message);
      setResetStep(2);
    }

  } catch (err) {
    alert(err.response?.data?.message || "Failed to send OTP");
  }
};


// Verify OTP & Reset Password
const handleResetPassword = async (e) => {
  e.preventDefault();

  if (!otp || !newPassword) {
    return alert("Please fill all fields!");
  }

  try {
    const res = await axios.post(
      "http://localhost:5000/api/courses/reset-password-otp",
      {
        email: resetEmail,
        otp,
        newPassword,
      }
    );

    if (res.data.success) {
      alert(res.data.message);

      // Reset all states
      setResetStep(1);
      setResetEmail("");
      setOtp("");
      setNewPassword("");

      // Back to Login Page
      onBack();
    }

  } catch (err) {
    alert(err.response?.data?.message || "Invalid or Expired OTP");
  }
};



return (
  <div>

    <h2 className="login-title">Reset Password</h2>

    <p className="login-subtitle">
      {resetStep === 1
        ? "Enter your registered email to receive OTP"
        : "Enter OTP and your new password"}
    </p>

    {resetStep === 1 ? (

      <form onSubmit={handleSendOtp}>

        <input
          type="email"
          className="login-input"
          placeholder="Registered Email"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          required
        />

        <button type="submit" className="login-btn">
          Send OTP
        </button>

      </form>

    ) : (

      <form onSubmit={handleResetPassword}>

        <input
          type="text"
          className="login-input"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          required
        />

        <input
          type="password"
          className="login-input"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button type="submit" className="login-btn">
          Verify OTP & Reset Password
        </button>

      </form>

    )}

    <p className="login-footer">

      <span
        onClick={onBack}
        style={{
          cursor: "pointer",
          color: "#4f46e5",
          fontWeight: "600"
        }}
      >
        ← Back to Login
      </span>

    </p>

  </div>
);
}




export default ForgotPassword;