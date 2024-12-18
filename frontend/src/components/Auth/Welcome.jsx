import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Welcome.css';

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <header className="welcome-header">
        <img
          src="/vite.svg"
          alt="Company Logo"
          className="welcome-logo"
        />
        <h1 className="welcome-title">Welcome to Groupomania Teams Chat</h1>
        <p className="welcome-subtitle">A Platform to Connect and Collaborate with Your Team.</p>
      </header>
      <div className="welcome-buttons">
        <div className="welcome-section">
          <p className="welcome-helper-text">Already a user?</p>
          <button className="welcome-btn" onClick={() => navigate('/login')}>
            Login
          </button>
        </div>
        <div className="welcome-section">
          <p className="welcome-helper-text">Want to join and collaborate?</p>
          <button className="welcome-btn secondary" onClick={() => navigate('/signup')}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
