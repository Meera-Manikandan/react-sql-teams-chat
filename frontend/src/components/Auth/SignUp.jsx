import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/Auth.css";
import logo from "../../assets/icon-left-font-monochrome-white.svg";
function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    setError("");

    try {
      const response = await axios.post("http://localhost:5001/auth/signup", {
        username,
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to sign up");
    }
  };

  return (
    <div className="auth-page">
      <Link to="/" className="home-link">
        Home
      </Link>
      <div className="auth-container">
        <span>
          <img src={logo} alt="Company Logo" className="auth-logo" />
        </span>

        <h1>Sign Up</h1>
        {error && (
          <p className="error" aria-live="polite">
            {error}
          </p>
        )}

        <label htmlFor="username">Enter Username</label>
        <input
          id="username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="email">Enter Email</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Enter Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleSignup}>Sign Up</button>
      </div>
    </div>
  );
}

export default SignUp;
