import React from 'react';
import { INCIDENT_TYPES, calculateTimeRemaining } from '../../constants/incidentTypes';
import IncidentLegend from './IncidentLegend';
import styles from './ActiveIncidentsList.module.css';

const ActiveIncidentsList = ({ 
  incidents, 
  selectedIncident, 
  onSelectIncident,
  onDeleteIncident 
}) => {
  return (
    <div className={styles['incidents-content']}>
      <div className={styles['incidents-grid']}>
        {incidents.map((incident) => (
          <div 
            key={incident._id} 
            className={`${styles['incident-item']} ${selectedIncident === incident._id ? styles.selected : ''}`}
            onClick={() => onSelectIncident(incident._id)}
          >
            <div className={styles['incident-header']}>
              <span 
                className={styles['incident-type']}
                style={{ color: INCIDENT_TYPES[incident.type].color }}
              >
                {INCIDENT_TYPES[incident.type].name}
              </span>
              <span className={styles['incident-time']}>
                {calculateTimeRemaining(incident.expiryTime)}
              </span>
            </div>
            <div className={styles['incident-description']}>{incident.description}</div>
            <div className={styles['incident-footer']}>
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
      <div className={styles['legend-wrapper']}>
        <IncidentLegend />
      </div>
    </div>
  );
};

export default ActiveIncidentsList;
