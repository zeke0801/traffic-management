import React from 'react';
import { INCIDENT_TYPES } from '../../constants/incidentTypes';
import './IncidentLegend.css';

const IncidentLegend = () => {
  return (
    <div className="legend-container">
      <div className="legend-title">Incident Types</div>
      <div className="legend-items">
        {Object.entries(INCIDENT_TYPES).map(([key, value]) => (
          <div key={key} className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: value.color }}
            />
            <span className="legend-text">{value.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncidentLegend;
