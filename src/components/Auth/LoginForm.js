import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import nagaImage from '../../svg/naga.jpg';
//LoginForm css is within app.css

function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Convert credentials to match exactly what's in MongoDB
      const credentials = {
        username: username.trim().toLowerCase(),
        password: password.trim()
      };
      
      console.log('Attempting login with:', credentials);
      const response = await fetch('https://traffic-management-hvn8.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include' // Include cookies if the backend uses sessions
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok && data.success) {
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Use the dynamic routes passed from App.js
        const route = data.user.role === 'admin' ? props.routes.master : props.routes.client;
        navigate(route);
      } else {
        setError(data.message || 'Invalid credentials. Please try again.');
        console.error('Login failed:', data);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your connection and try again.');
    }
  };

  const handleClientView = () => {
    navigate('/client');
  };

  return (
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
            <div className="button-container">
              <button type="submit" className="login-button">Admin Login</button>
              <button type="button" onClick={handleClientView} className="client-button">Client Viewing</button>
            </div>
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
  );
}

export default LoginForm;
