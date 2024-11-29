import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import nagaImage from '../../svg/naga.jpg';
//LoginForm css is within app.css

function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWakingServer, setIsWakingServer] = useState(false);
  const navigate = useNavigate();

  const wakeupServer = async () => {
    try {
      const response = await fetch('https://traffic-management-hvn8.onrender.com/health');
      const data = await response.json();
      return data.status === 'ok';
    } catch (err) {
      console.error('Server wake-up error:', err);
      return false;
    }
  };

  const checkServerActivity = async () => {
    const lastActivity = localStorage.getItem('lastServerActivity');
    const now = Date.now();
    const fourHours = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

    if (!lastActivity || (now - parseInt(lastActivity)) > fourHours) {
      setIsWakingServer(true);
      await wakeupServer();
      setIsWakingServer(false);
    }
    localStorage.setItem('lastServerActivity', now.toString());
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Check server activity before login
      await checkServerActivity();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch('https://traffic-management-hvn8.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok && data.user) {  
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('lastServerActivity', Date.now().toString());
        const route = data.user.role === 'admin' ? props.routes.master : props.routes.client;
        navigate(route);
      } else {
        const errorMessage = data.message || 'Invalid credentials. Please try again.';
        setError(errorMessage);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Login request timed out. The server might be starting up, please try again.');
      } else {
        setError('Login failed. Please try again.');
      }
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
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
            {isWakingServer && <div className="info-message">Waking up server, please wait...</div>}
            <input
              type="text"
              placeholder="Username"
              className="credential-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading || isWakingServer}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="credential-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || isWakingServer}
              required
            />
            <div className="button-container">
              <button type="submit" className="login-button" disabled={isLoading || isWakingServer}>
                {isWakingServer ? 'Waking Server...' : isLoading ? 'Logging in...' : 'Admin Login'}
              </button>
              <button type="button" onClick={handleClientView} className="client-button" disabled={isLoading || isWakingServer}>
                Client Viewing
              </button>
            </div>
          </form>
          <div className="social-follow">
            <span>FOLLOW</span>
            <a href="https://www.facebook.com/NagaCityGovernment" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook"></i>
            </a>
          </div>
        </div>
      </div>
      <Link to="/credits" className="footer-text">experimental - zeke</Link>
    </div>
  );
}

export default LoginForm;
