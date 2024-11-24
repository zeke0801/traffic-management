import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, ZoomControl, GeoJSON, CircleMarker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './ClientMapComponent.css';
import { fetchIncidents } from '../../services/api';
import { INCIDENT_TYPES } from '../../constants/incidentTypes';
import ActiveIncidentsList from '../Incidents/ActiveIncidentsList';
import IncidentLegend from '../Incidents/IncidentLegend';

const MapControls = () => {
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const mapRef = useRef(null);

  const map = useMapEvents({
    load: () => {
      mapRef.current = map;
    }
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !isSpacePressed) {
        setIsSpacePressed(true);
        if (mapRef.current) {
          mapRef.current.dragging.enable();
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        if (mapRef.current) {
          mapRef.current.dragging.disable();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    if (mapRef.current) {
      mapRef.current.dragging.disable();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed]);

  return null;
};

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <div className="datetime-display">
      <div className="clock">
        Time: {time.toLocaleTimeString('en-US', { hour12: false })}
      </div>
      <div className="date">
        Date: {formatDate(time)}
      </div>
    </div>
  );
};

const ClientMapComponent = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
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

  const renderIncidentMarkers = (coordinates, type) => {
    const color = getIncidentColor(type);
    return coordinates.map((point, index) => (
      <CircleMarker
        key={`marker-${index}`}
        center={point}
        radius={5}
        pathOptions={{
          fillColor: color,
          fillOpacity: 0.7,
          color: color,
          weight: 1
        }}
      />
    ));
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
            <div className="error-message">{error}</div>
          )}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <ZoomControl position="bottomleft" />
          <MapControls />
          {incidents.map((incident) => (
            <React.Fragment key={incident._id}>
              {renderIncidentMarkers(incident.coordinates, incident.type)}
              <GeoJSON
                data={{
                  type: 'LineString',
                  coordinates: incident.coordinates.map(coord => [coord[1], coord[0]])
                }}
                style={() => ({
                  color: getIncidentColor(incident.type),
                  weight: 3,
                  opacity: 0.7,
                })}
                onClick={() => setSelectedIncident(incident._id)}
              />
            </React.Fragment>
          ))}
          
          <IncidentLegend />
        </MapContainer>
      </div>

      <div className="incidents-section">
        <h3>Active Incidents</h3>
        <Clock />
        <ActiveIncidentsList 
          incidents={incidents}
          loading={loading}
          error={error}
          selectedIncident={selectedIncident}
          onSelectIncident={setSelectedIncident}
        />
      </div>
      <div className="map-instructions">
        <span className="instruction-text">
          Hold <kbd>Space</kbd> + Mouse to drag the map
        </span>
      </div>
    </div>
  );
};

export default ClientMapComponent;
