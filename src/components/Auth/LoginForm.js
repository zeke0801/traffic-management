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
      const response = await fetch('https://traffic-management-hvn8.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Use the dynamic routes passed from App.js
        const route = data.user.role === 'admin' ? props.routes.master : props.routes.client;
        navigate(route);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
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
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
