import React from 'react';
import { INCIDENT_TYPES, calculateTimeRemaining } from '../../constants/incidentTypes';
import IncidentLegend from './IncidentLegend';
import './ActiveIncidentsList.css';

const ActiveIncidentsList = ({ 
  incidents, 
  loading, 
  error, 
  selectedIncident, 
  onSelectIncident,
  onDeleteIncident 
}) => {
  return (
    <div className="incidents-content">
      <div className="incidents-grid">
        {incidents.map((incident) => (
          <div 
            key={incident._id} 
            className={`incident-item ${selectedIncident === incident._id ? 'selected' : ''}`}
            onClick={() => onSelectIncident(incident._id)}
          >
            <div className="incident-header">
              <span 
                className="incident-type"
                style={{ color: INCIDENT_TYPES[incident.type].color }}
              >
                {INCIDENT_TYPES[incident.type].name}
              </span>
              <span className="incident-time">
                {calculateTimeRemaining(incident.expiryTime)}
              </span>
            </div>
            <div className="incident-description">{incident.description}</div>
            <div className="incident-footer">
              {onDeleteIncident && (
                <button 
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteIncident(incident._id);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="legend-wrapper">
        <IncidentLegend />
      </div>
    </div>
  );
};

export default ActiveIncidentsList;
