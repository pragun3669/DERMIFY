import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";  // Import Link from react-router-dom
import "../styles/Home.css"; // Link to the updated CSS file

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="home">
      <div className="hero-section">
        <div className="video-background">
          <video autoPlay loop muted className="background-video">
            <source src="/istockphoto-1441874147-640_adpp_is.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hero-content">
          <h1 className="animated-text">
            Welcome {user ? user.name : ""} to DERMIFY!
          </h1>
          <p className="hero-subtext">
            Discover personalized skin condition solutions powered by AI.
          </p>
        </div>
      </div>

      <div className="features">
        <h2 className="animated-title">Why Choose Us?</h2>
        <div className="feature-cards">
          {/* Card 1 - Login */}
          <Link to="/login" className="card-link">
            <div className="card animated-card">
              <h3>Login</h3>
              <p>Sign in to access AI-powered skin condition prediction.</p>
            </div>
          </Link>

          {/* Card 2 - Signup */}
          <Link to="/signup" className="card-link">
            <div className="card animated-card">
              <h3>Signup</h3>
              <p>Create an account to start your personalized AI-powered skin condition prediction.</p>
            </div>
          </Link>

          {/* Card 3 - Skin Prediction */}
          <Link to="/disease" className="card-link">
            <div className="card animated-card">
              <h3>Skin Prediction</h3>
              <p>Upload your image for an AI-powered skin condition prediction.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer with About and Contact Us */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-team">
            <ul>
              <li>PRAGUN SINGH</li>
              <li>TUSHAR MANISHI</li>
              <li>TANISH TAWER</li>
              <li>PRADYUMN RAWAT</li>
            </ul>
          </div>
          <div className="footer-description">
            <p>
              DERMIFY is your go-to platform for personalized skin care solutions powered by advanced AI technology. 
              Our goal is to provide accurate skin condition predictions and treatment plans based on your skin type and condition. 
              We ensure that each user receives expert advice tailored specifically to their needs.
            </p>
          </div>
        </div>
        <div className="footer-links">
          <Link to="/about" className="footer-link">About Us</Link>
          <Link to="/contact" className="footer-link">Contact Us</Link>
        </div>
      </footer>
    </div>
  );
};

export default Home;
