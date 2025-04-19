import React, { useEffect, useState } from "react";
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
            Discover personalized skin care solutions powered by AI.
          </p>
        </div>
      </div>

      <div className="features">
        <h2 className="animated-title">Why Choose Us?</h2>
        <div className="feature-cards">
          <div className="card animated-card">
            <h3>AI-Powered Predictions</h3>
            <p>Get accurate skin condition predictions powered by advanced AI models.</p>
          </div>
          <div className="card animated-card">
            <h3>Personalized Solutions</h3>
            <p>Receive personalized treatment plans based on your skin type and condition.</p>
          </div>
          <div className="card animated-card">
            <h3>Expert Advice</h3>
            <p>Our platform provides expert skincare advice for every skin type.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
