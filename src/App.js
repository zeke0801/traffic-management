import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MapComponent from './components/Map/MapComponent';
import ClientView from './pages/ClientView';
import './styles/Map.css';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div>
            <nav className="nav-links">
              <Link to="/master">Master View</Link>
              <Link to="/client">Client View</Link>
            </nav>
            <div className="welcome-screen">
              <h1>Traffic Alert System - Naga City</h1>
              <p>Choose your view:</p>
              <div className="view-buttons">
                <Link to="/master" className="view-button master">Master View</Link>
                <Link to="/client" className="view-button client">Client View</Link>
              </div>
            </div>
          </div>
        } />
        <Route path="/master" element={<MapComponent />} />
        <Route path="/client" element={<ClientView />} />
      </Routes>
    </Router>
  );
}

export default App;
