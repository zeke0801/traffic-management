import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MasterMapComponent from './components/Map/MasterMapComponent';
import ClientView from './pages/ClientView';
import './App.css';
import nagaImage from './svg/naga.jpg';

function App() {
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
                  <div className="credentials-container">
                    <input type="text" placeholder="Username" className="credential-input" />
                    <input type="password" placeholder="Password" className="credential-input" />
                    <button className="login-button" path="/master">Login</button>
                  </div>
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
        <Route path="/client" element={<ClientView />} />
      </Routes>
    </Router>
  );
}

export default App;
