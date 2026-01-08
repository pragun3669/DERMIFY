import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css"; // Ensure this file exists

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ✅ Load user from localStorage on mount & updates when storage changes
  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    checkUser();
    window.addEventListener("storage", checkUser); // Listen for login/logout changes

    return () => {
      window.removeEventListener("storage", checkUser);
    };
  }, []);

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Dermify</Link>
      </div>
      <div className="nav-links">
      <Link to="/">Home</Link>
      <Link to="/upload">Live Camera detection</Link>
               <Link to="/disease">SkinDisease</Link>
        {user ? (
          <>
            <span className="welcome-text">Welcome, {user.name || "User"}!</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : (
          <>
    
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
