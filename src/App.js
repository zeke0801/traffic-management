import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MasterMapComponent from './components/Map/MasterMapComponent';
import './App.css';
import LoginForm from './components/Auth/LoginForm';

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
      </Routes>
    </Router>
  );
}

export default App;
