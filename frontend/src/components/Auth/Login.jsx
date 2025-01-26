import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { validateEmail, validatePassword } from '../../utils/validation';
import '../../styles/Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
  
    if (!validateEmail(email)) {
      setError('Invalid email format');
      return;
    }
  
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5001/auth/login', {
        email,
        password,
      });
  
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
  
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          localStorage.setItem('user', JSON.stringify({ username: 'Guest' }));
        }
  
        navigate('/dashboard');
      } else {
        throw new Error('Invalid server response');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };  

  return (
    <div className="auth-container">
      <h1>Login</h1>
      {error && <p className="error">{error}</p>}
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
