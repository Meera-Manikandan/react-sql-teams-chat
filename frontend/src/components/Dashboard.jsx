import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      navigate('/login');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error('Failed to parse user data:', error);
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div>
      <h1>Welcome, {user?.username || 'Guest'}!</h1>
      <button onClick={() => {
        localStorage.clear();
        navigate('/');
      }}>
        Sign Out
      </button>
    </div>
  );
}

export default Dashboard;