import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MasterMapComponent.css';
import { fetchIncidents } from '../../services/api';

function ClientMapComponent() {
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const data = await fetchIncidents();
        setIncidents(data);
      } catch (error) {
        console.error('Error fetching incidents:', error);
        setError('Failed to load incidents. Please try again later.');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderIncidentMarkers = (coordinates, type) => {
    const color = '#3388ff';
    const getPathOptions = (type) => {
      const baseOptions = {
        color: color,
        weight: 5,
        opacity: 1
      };

      switch(type) {
        case 'COLLISION':
          return {
            ...baseOptions,
            opacity: 0,
            dashArray: '10, 10',
            weight: 4
          };
        case 'CONSTRUCTION':
          return {
            ...baseOptions,
            dashArray: '15, 10',
            weight: 4
          };
        default:
          return baseOptions;
      }
    };

    return (
      <>
        {coordinates.map((coord, index) => (
          <CircleMarker
            key={`marker-${index}`}
            center={coord}
            pathOptions={{ color }}
            radius={5}
          />
        ))}
        <Polyline
          positions={coordinates}
          pathOptions={getPathOptions(type)}
        />
      </>
    );
  };

  return (
    <div className="map-container">
      <MapContainer
        center={[13.6217, 123.1948]}
        zoom={15}
        className="map-view"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {incidents.map((incident) => (
          <div key={incident._id}>
            {renderIncidentMarkers(incident.coordinates, incident.type)}
          </div>
        ))}
      </MapContainer>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default ClientMapComponent;