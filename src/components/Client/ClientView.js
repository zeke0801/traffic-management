import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './ClientView.css';
import { fetchIncidents } from '../../services/api';
import { INCIDENT_TYPES } from '../../constants/incidentTypes';
import ActiveIncidentsList from '../Incidents/ActiveIncidentsList';

const ClientView = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchIncidents();
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setError(
        <div>
          <span>Failed to load incidents</span>
          <span className="error-retry">Please try again later.</span>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  const getIncidentColor = (type) => {
    return INCIDENT_TYPES[type]?.color || '#999';
  };

  return (
    <>
      <div className="client-container">
        <div className="map-section">
          <MapContainer
            center={[13.6217, 123.1948]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
            <ZoomControl position="bottomleft" />
            {incidents.map((incident) => (
              <Polyline
                key={incident._id}
                positions={incident.coordinates}
                pathOptions={{
                  color: getIncidentColor(incident.type),
                  weight: 3,
                  opacity: 0.7,
                }}
              />
            ))}
          </MapContainer>
        </div>
        <div className="incidents-section">
          <ActiveIncidentsList
            incidents={incidents}
            loading={loading}
            error={error}
            selectedIncident={selectedIncident}
            onSelectIncident={setSelectedIncident} />
        </div>
      </div>
      {error && (
        <div className="error-message">{error}</div>
      )}
      <div className="map-instructions">
        <span className="instruction-text">
          Hold <kbd>Space</kbd> + Mouse to drag the map
        </span>
      </div>
    </>
  );
};

export default ClientView;
