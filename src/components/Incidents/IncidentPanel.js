import React from 'react';
import { INCIDENT_TYPES } from '../../constants/incidentTypes';
import styles from './IncidentPanel.module.css';

const IncidentPanel = ({ 
  incidents, 
  selectedIncident, 
  onSelectIncident,
  onDeleteIncident,
  hiddenIncidentTypes,
  onToggleIncidentType
}) => {
  return (
    <div className={styles.panel}>
      {/* Active Reports Section */}
      <div className={styles.reportsSection}>
        <h3>Active Reports</h3>
        <div className={styles.reportsGrid}>
          {incidents.map((incident) => {
            const incidentType = INCIDENT_TYPES[incident.type] || {
              name: incident.name || incident.type,
              symbol: null,
              color: incident.color || '#3388ff'
            };

            return (
              <div 
                key={incident._id} 
                className={`${styles.reportItem} ${selectedIncident === incident._id ? styles.selected : ''}`}
                onClick={() => onSelectIncident(incident._id)}
              >
                <div className={styles.reportHeader}>
                  <span className={styles.reportType}>
                    {incidentType.symbol && (
                      <img 
                        src={incidentType.symbol} 
                        alt={incidentType.name} 
                        className={styles.reportIcon} 
                      />
                    )}
                    {incidentType.name}
                  </span>
                  {onDeleteIncident && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteIncident(incident._id);
                      }}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className={styles.reportDetails}>
                  {incident.description || 'No description provided'}
                </div>
                <div className={styles.reportTime}>
                  {new Date(incident.createdAt).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Legend Section */}
      <div className={styles.legendSection}>
        <h3>Legend</h3>
        <div className={styles.legendGrid}>
          {Object.entries(INCIDENT_TYPES).map(([type, details]) => (
            <div 
              key={type} 
              className={`${styles.legendItem} ${hiddenIncidentTypes.has(type) ? styles.hidden : ''}`}
              onClick={() => onToggleIncidentType(type)}
              title={`Click to ${hiddenIncidentTypes.has(type) ? 'show' : 'hide'} ${details.name}`}
            >
              <img 
                src={details.symbol} 
                alt={details.name} 
                className={styles.legendIcon} 
              />
              <span className={styles.legendText}>{details.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IncidentPanel;
