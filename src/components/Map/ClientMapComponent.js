import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './ClientMapComponent.css';
import { fetchIncidents } from '../../services/api';

const INCIDENT_TYPES = {
  COLLISION: {
    name: 'Collision',
    color: '#FF0000',
    description: 'Vehicle collision or accident'
  },
  CONSTRUCTION: {
    name: 'Construction',
    color: '#FFA500',
    description: 'Road construction or maintenance'
  },
  NATURAL_DISASTER: {
    name: 'Natural Disaster',
    color: '#800080',
    description: 'Natural disaster affecting traffic'
  }
};

const ClientMapComponent = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchIncidents();
        setIncidents(data);
      } catch (error) {
        console.error('Error fetching incidents:', error);
        setError('Failed to load incidents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const calculateTimeRemaining = (expiryTime) => {
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diff = expiry - now;

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  const renderIncidentMarkers = (coordinates, type) => {
    const color = INCIDENT_TYPES[type]?.color || '#000000';
    
    return (
      <>
        {coordinates.map((point, index) => (
          <CircleMarker
            key={index}
            center={point}
            radius={5}
            pathOptions={{ color }}
          />
        ))}
        {coordinates.length > 1 && (
          <Polyline
            positions={coordinates}
            pathOptions={{ color }}
          />
        )}
      </>
    );
  };

  return (
    <div className="client-container">
      <div className="map-section">
        <MapContainer
          center={[13.6217, 123.1948]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          {loading && (
            <div className="loading-spinner">
              Loading...
            </div>
          )}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <ZoomControl position="bottomleft" />
          
          {incidents.map((incident) => renderIncidentMarkers(incident.coordinates, incident.type))}
        </MapContainer>
      </div>

      <div className="incidents-list">
        <h2>Active Incidents</h2>
        {loading && <div className="list-loading">Loading incidents...</div>}
        {error && <div className="list-error">{error}</div>}
        {!loading && !error && incidents.length === 0 && (
          <div className="no-incidents">No active incidents</div>
        )}
        <div className="incidents-grid">
          {incidents.map((incident) => (
            <div 
              key={incident._id} 
              className={`incident-card ${selectedIncident === incident._id ? 'selected' : ''}`}
              onClick={() => setSelectedIncident(incident._id)}
            >
              <div className="incident-type" style={{ backgroundColor: INCIDENT_TYPES[incident.type].color }}>
                {INCIDENT_TYPES[incident.type].name}
              </div>
              <div className="incident-details">
                <p className="incident-description">{incident.description}</p>
                <p className="incident-expiry">{calculateTimeRemaining(incident.expiryTime)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientMapComponent;
