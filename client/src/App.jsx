import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Auth from "./pages/Auth";
import Home from './pages/Home';
import Admin from './pages/Admin';
import CourseDetails from './pages/CourseDetails';

import Login from './pages/Login';   
import UserLogin from './pages/UserLogin'; 
import UserDashboard from './pages/UserDashboard';
import './App.css';
import VideoPlayer from './pages/VideoPlayer';

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // Admin Token
  const userEmail = localStorage.getItem('userEmail'); // Student Email
  // const userEmail = sessionStorage.getItem("userEmail");

  const handleLogout = () => {
    localStorage.clear(); 
    alert("Logged out successfully!");
    navigate('/'); 
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-logo">
          <Link to="/"><span>SmartLearn</span></Link>
        </div>
        <div className="nav-links">
          <Link to="/" className="nav-item">Courses</Link>

          {/* --- ADMIN LINKS --- */}
          {token && <Link to="/admin" className="nav-item">Admin Panel</Link>}

          {/* --- STUDENT LINKS --- */}
          {userEmail && <Link to="/dashboard" className="nav-item">My Courses</Link>}

          {/* --- DYNAMIC BUTTONS (Logout ya Login) --- */}
          {(token || userEmail) ? (
            <button onClick={handleLogout} className="nav-btn" style={{ backgroundColor: '#e74c3c' }}>
              Logout
            </button>
          ) : (
            <>
              
              <Link to="/user-login" className="nav-item">Student Login</Link>
              <Link to="/login" className="nav-item">Admin</Link>
              
            </>
          )}
        </div>
      </nav>

      <div className="content-area">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/home" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/course/:id" element={<CourseDetails />} />
          
          <Route path="/login" element={<Login />} />
          
        
          <Route path="/user-login" element={<UserLogin />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/watch" element={<VideoPlayer />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;