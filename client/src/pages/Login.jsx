import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      localStorage.setItem("token", res.data.token);

      alert("Login Successful!");
      navigate("/admin");
    } catch (err) {
      alert(err.response?.data?.msg || "Login Failed!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h2 className="login-title">
          Admin Login
        </h2>

        <form onSubmit={handleLogin}>

          <input
            className="login-input"
            type="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
            required
          />

          <input
            className="login-input"
            type="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({
                ...formData,
                password: e.target.value,
              })
            }
            required
          />

          <button
            type="submit"
            className="login-btn"
          >
            Login
          </button>

        </form>

      </div>
    </div>
  );
}

export default Login;