import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MasterMapComponent from './components/Map/MasterMapComponent';
import ClientMapComponent from './components/Map/ClientMapComponent';
import LoginForm from './components/Auth/LoginForm';
import Credit from './components/Auth/Credit.js';
import { getRoutes } from './utils/routeUtils';
import './App.css';

function App() {
  const [routes, setRoutes] = useState(getRoutes());

  // Update routes at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = tomorrow - now;

    const updateRoutes = () => {
      setRoutes(getRoutes());
    };

    // Set timeout for next midnight
    const timer = setTimeout(updateRoutes, timeUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

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
        <Route path="/" element={<LoginForm routes={routes} />} />
        <Route path="/credits" element={<Credit />} />
        <Route path={routes.master} element={<MasterMapComponent />} />
        <Route path={routes.client} element={<ClientMapComponent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
