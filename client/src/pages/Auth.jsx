import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import ForgotPassword from "../components/ForgotPassword";

function Auth() {
  const navigate = useNavigate();

  // Login / Signup Toggle
  const [isLogin, setIsLogin] = useState(true);

  // Forgot Password Toggle
  const [showForgot, setShowForgot] = useState(false);

  // Signup/Login Form
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  
  // Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= LOGIN =================
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/courses/user-login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      if (res.data.success) {
        localStorage.setItem("userEmail", res.data.email);
        localStorage.setItem("userName", res.data.userName);

        alert("Login Successful!");

        navigate("/home");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  // ================= SIGNUP =================
  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/courses/user-signup",
        {
          userName: formData.username,
          userEmail: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        }
      );

      alert(res.data.message);

      setIsLogin(true);

      setFormData({
        username: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
      });

    } catch (err) {
      alert(err.response?.data?.message || "Signup Failed");
    }
  };

  // ================= FORGOT PASSWORD =================
  
    return (
    <div className="auth-container">

      {/* Left Section */}
      <div className="auth-left">
        <h1>SmartLearn</h1>

        <p>
          Learn today's most demanding skills from industry experts.
          Join thousands of learners and build your career with
          professional online courses.
        </p>
      </div>

      {/* Right Section */}
      <div className="auth-right">
        <div className="auth-card">

          {!showForgot ? (
            <>
              <h2>{isLogin ? "Student Login" : "Create Account"}</h2>

              <p className="subtitle">
                {isLogin
                  ? "Login to continue learning"
                  : "Create your SmartLearn account"}
              </p>

              <form onSubmit={isLogin ? handleLogin : handleSignup}>

                {!isLogin && (
                  <>
                    <input
                      type="text"
                      name="username"
                      placeholder="Full Name"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />

                    <input
                      type="text"
                      name="phoneNumber"
                      placeholder="Phone Number"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                    />
                  </>
                )}

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                {!isLogin && (
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                )}

                <button type="submit" className="auth-btn">
                  {isLogin ? "Login" : "Sign Up"}
                </button>

              </form>

              {isLogin && (
                <p className="forgot">
                  <span
                    onClick={() => setShowForgot(true)}
                    style={{ cursor: "pointer", color: "#4f46e5" }}
                  >
                    Forgot Password?
                  </span>
                </p>
              )}

              <p className="switch">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}

                <span onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? " Sign Up" : " Login"}
                </span>
              </p>
            </>
          ) : (
  
  <ForgotPassword
    onBack={() => setShowForgot(false)}
  />
          )}

      </div>
    </div>
  </div>
);

}

export default Auth;