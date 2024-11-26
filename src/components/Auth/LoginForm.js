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
      const response = await login(username, password);
      if (response.success) {
        const userType = response.userType;
        // Use the dynamic routes passed from App.js
        const route = userType === 'admin' ? props.routes.master : props.routes.client;
        navigate(route);
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
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
