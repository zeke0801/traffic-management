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
  console.log('IncidentPanel received incidents:', incidents);
  return (
    <div className={styles.panel}>
      

      {/* Active Reports Section */}
      <div className={styles.reportsSection}>
        <h3>Active Reports</h3>
        <div className={styles.reportsGrid}>
          {incidents && incidents.length > 0 ? (
            incidents.map((incident) => {
              console.log('Rendering incident:', incident);
              return (
                <div 
                  key={incident._id} 
                  className={`${styles.reportItem} ${selectedIncident === incident._id ? styles.selected : ''}`}
                  onClick={() => onSelectIncident(incident._id)}
                >
                  <div className={styles.reportHeader}>
                    <span className={styles.reportType}>
                      <img 
                        src={INCIDENT_TYPES[incident.type].symbol} 
                        alt={incident.type} 
                        className={styles.reportIcon} 
                      />
                      {INCIDENT_TYPES[incident.type].name}
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
                </div>
              );
            })
          ) : (
            <div>No active reports</div>
          )}
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
