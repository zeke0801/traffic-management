import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, ZoomControl, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const INCIDENT_TYPES = {
  COLLISION: {
    color: '#FF0000',
    description: 'Traffic Incident'
  },
  CONSTRUCTION: {
    color: '#FF8C00',
    description: 'Road Work'
  },
  NATURAL_DISASTER: {
    color: '#800080',
    description: 'Natural Calamity'
  }
};

const ClientMapComponent = () => {
  const [incidents, setIncidents] = useState([]);

  // Load and update incidents from localStorage
  useEffect(() => {
    const loadIncidents = () => {
      const savedIncidents = localStorage.getItem('incidents');
      if (savedIncidents) {
        const parsedIncidents = JSON.parse(savedIncidents);
        // Filter out expired incidents
        const currentTime = new Date().toISOString();
        const activeIncidents = parsedIncidents.filter(
          incident => incident.expiryTime > currentTime
        );
        setIncidents(activeIncidents);
      }
    };

    // Load incidents immediately
    loadIncidents();

    // Set up polling to check for updates every 5 seconds
    const interval = setInterval(loadIncidents, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderIncidentMarkers = (path, type) => {
    if (type === 'NATURAL_DISASTER') {
      // Render spray points for natural disasters
      return path.map((point, index) => (
        <CircleMarker
          key={`${type}-${index}`}
          center={point}
          radius={2}
          pathOptions={{
            color: INCIDENT_TYPES[type].color,
            fillColor: INCIDENT_TYPES[type].color,
            fillOpacity: 0.6,
            weight: 1
          }}
        />
      ));
    } else {
      // Render polyline for traffic and construction
      return (
        <Polyline
          positions={path}
          pathOptions={{
            color: INCIDENT_TYPES[type].color,
            weight: 3
          }}
        />
      );
    }
  };

  const getTimeRemaining = (expiryTime) => {
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diff = expiry - now;

    if (diff < 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  };

  return (
    <div className="map-container">
      <MapContainer
        center={[13.6217, 123.1948]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ZoomControl position="bottomleft" />
        
        {incidents.map((incident, index) => renderIncidentMarkers(incident.path, incident.type))}
        
        <div className="map-legend">
          <h4>Incident Legend</h4>
          {Object.entries(INCIDENT_TYPES).map(([key, value]) => (
            <div key={key} className="legend-item">
              <span 
                className="legend-color" 
                style={{ backgroundColor: value.color }}
              ></span>
              <span className="legend-text">{value.description}</span>
            </div>
          ))}
        </div>
      </MapContainer>
      
      <div className="incidents-list client-incidents-list">
        <h3>Active Incidents</h3>
        {incidents.map((incident) => (
          <div key={incident.id} className="incident-item">
            <div className="incident-header">
              <span className="incident-type" style={{ color: INCIDENT_TYPES[incident.type].color }}>
                {INCIDENT_TYPES[incident.type].description}
              </span>
              <span className="incident-time">{getTimeRemaining(incident.expiryTime)}</span>
            </div>
            <p className="incident-description">{incident.description}</p>
          </div>
        ))}
        {incidents.length === 0 && (
          <p className="no-incidents">No active incidents reported.</p>
        )}
      </div>
    </div>
  );
};

export default ClientMapComponent;
