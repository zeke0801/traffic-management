import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MasterMapComponent from './components/Map/MasterMapComponent';
import ClientMapComponent from './components/Map/ClientMapComponent';
import LoginForm from './components/Auth/LoginForm';
import './App.css';

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
        <Route path="/" element={<LoginForm />} />
        <Route path="/master" element={<MasterMapComponent />} />
        <Route path="/client" element={<ClientMapComponent />} />
      </Routes>
    </Router>
  );
}

export default App;
