
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Iski CSS hum abhi banayenge

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">🎓 E-Learning</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/admin">Admin Panel</Link></li>
        {/* Future mein Login/Signup yahan add kar sakte hain */}
      </ul>
    </nav>
  );
}

export default Navbar;
