import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
  
    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });
  
      console.log("Response:", response.data); // Debugging line
  
      if (response.data.message === "Login successful") {
        const user = {
          name: response.data.name, // ✅ Store name properly
          role: response.data.role, // ✅ Store role (if needed)
        };
  
        localStorage.setItem("user", JSON.stringify(user));
        console.log("User stored:", user); // ✅ Debugging
  
        navigate("/"); // ✅ Use correct navigation
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error("Login error:", err.response ? err.response.data : err);
      setError(err.response?.data?.message || "Invalid email or password!");
    }
  };
  
  
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
