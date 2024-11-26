import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import MasterMapComponent from './components/Map/MasterMapComponent';
import './App.css';
import nagaImage from './svg/naga.jpg';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://traffic-management-hvn8.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to master view
      navigate('/master');
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Login error:', err);
    }
  };

  return (
    <Router>
      <ul className="background">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
      <Routes>
        <Route path="/" element={
          <div>
            <div className="welcome-screen">
              <div className="login-container">
                <div className="login-left">
                  <img src={nagaImage} alt="Traffic Management System" className="login-image" />
                </div>
                <div className="login-right">
                  <h2>CMS - Naga City</h2>
                  <h1><span>Hello,</span> <br />welcome!</h1>
                  <form onSubmit={handleLogin} className="credentials-container">
                    {error && <div className="error-message">{error}</div>}
                    <input
                      type="text"
                      placeholder="Username"
                      className="credential-input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      className="credential-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button type="submit" className="login-button">Login</button>
                  </form>
                  <div className="social-follow">
                    <span>FOLLOW</span>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-facebook"></i>
                    </a>
                  </div>
                </div>
              </div>
              <div className="footer-text">experimental - zeke</div>
            </div>
          </div>
        } />
        <Route path="/master" element={<MasterMapComponent />} />
      </Routes>
    </Router>
  );
}

export default App;
