import React from 'react';
import './LoadingPopup.css';

const LoadingPopup = ({ isLoading, error, message }) => {
  if (!isLoading && !error) return null;

  return (
    <div className="loading-popup-overlay">
      <div className="loading-popup">
        {isLoading && !error && (
          <>
            <div className="spinner"></div>
            <p>{message || 'Loading...'}</p>
          </>
        )}
        {error && (
          <div className="error-container">
            <div className="error-icon">!</div>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingPopup;
