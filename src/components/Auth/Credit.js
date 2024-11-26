import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Credit.css';

function Credit() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="credit-screen">
      <div className="credit-container">
        <div className="credit-content">
          <div className="credits-info">
            <img src="/icon.jpg" alt="Logo" className="logo" />
            <h2>City Management System</h2>
            <h4>City of Naga, Bicol</h4>
          </div>
          <div className="credits-info2">
            <h3>Joseph Raphael L. Betito</h3>
            <br />
            <p>Frontend: React.js, Leaflet Maps, Vanilla CSS</p>
            <p>Backend: Node.js, Express</p>
            <p>Database: MongoDB</p>
            <p>Hosting: Render, Netlify</p>
          </div>
          <div className="social-links">
            <a
              href="https://www.facebook.com/josephraphael.betito/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-facebook"></i>
            </a>
            <a
              href="https://github.com/zeke0801"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-github"></i>
            </a>
            <a
              href="https://zeke-betito-portfolio.webflow.io/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fas fa-globe"></i>
            </a>
          </div>
        </div>
      </div>
      <Link to="/" className="footer-text">Return to Login</Link>
    </div>
  );
}

export default Credit;
