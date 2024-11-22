import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchIncidents } from '../../services/api';

const INCIDENT_TYPES = {
  COLLISION: {
    name: 'Collision',
    color: '#FF0000',
    description: 'Traffic Accident'
  },
  CONSTRUCTION: {
    name: 'Construction',
    color: '#FF8C00',
    description: 'Road Work'
  },
  NATURAL_DISASTER: {
    name: 'Natural Disaster',
    color: '#800080',
    description: 'Natural Calamity'
  }
};

const ClientMapComponent = () => {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const data = await fetchIncidents();
        setIncidents(data);
      } catch (error) {
        console.error('Error loading incidents:', error);
      }
    };

    loadIncidents();
    const interval = setInterval(loadIncidents, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const renderIncidentMarkers = (incident) => {
    if (incident.type === 'NATURAL_DISASTER') {
      return incident.coordinates.map((point, index) => (
        <CircleMarker
          key={`${incident._id}-${index}`}
          center={point}
          radius={5}
          pathOptions={{
            color: INCIDENT_TYPES[incident.type].color,
            fillOpacity: 0.7
          }}
        />
      ));
    }

    return (
      <Polyline
        key={incident._id}
        positions={incident.coordinates}
        pathOptions={{
          color: INCIDENT_TYPES[incident.type].color,
          weight: 3
        }}
      />
    );
  };

  const calculateTimeRemaining = (expiryTime) => {
    const now = new Date().getTime();
    const expiry = new Date(expiryTime).getTime();
    const diff = expiry - now;

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} days remaining`;
    }
    
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="map-container">
      <MapContainer
        center={[13.6217, 123.1948]}
        zoom={13}
        style={{ height: '100vh', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ZoomControl position="bottomright" />
        
        {incidents.map(incident => renderIncidentMarkers(incident))}
      </MapContainer>

      <div className="client-incidents-list">
        <h3>Active Incidents</h3>
        {incidents.length === 0 ? (
          <p className="no-incidents">No active incidents</p>
        ) : (
          incidents.map(incident => (
            <div key={incident._id} className="incident-item">
              <div className="incident-header">
                <span className="incident-type" style={{ color: INCIDENT_TYPES[incident.type].color }}>
                  {INCIDENT_TYPES[incident.type].name}
                </span>
                <span className="incident-time">{calculateTimeRemaining(incident.expiryTime)}</span>
              </div>
              <p className="incident-description">{incident.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientMapComponent;
