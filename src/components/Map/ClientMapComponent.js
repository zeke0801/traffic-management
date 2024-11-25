import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, ZoomControl, Polyline, CircleMarker, useMapEvents, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ClientMapComponent.css';
import { fetchIncidents } from '../../services/api';
import { INCIDENT_TYPES } from '../../constants/incidentTypes';
import ActiveIncidentsList from '../Incidents/ActiveIncidentsList';
import IncidentLegend from '../Incidents/IncidentLegend';
import carCollisionPng from '../../svg/car-collision-svgrepo-com.png';
import constructionPng from '../../svg/construction-svgrepo-com.png';
import wavePng from '../../svg/wave-svgrepo-com.png';
import detourRightOnly from '../../svg/detour-rightonly.png';
import detourBothWay from '../../svg/detour-bothway.png';
import publicEventPng from '../../svg/publicevent.png';
import closedRoadPng from '../../svg/closedroad.png';

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

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatDate = (date) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    };
    return date.toLocaleDateString('en-US', options);
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

// Custom icons
const collisionIcon = () => new L.DivIcon({
  html: `<div style="transform: translate(-50%, -50%);">
    <img src="${carCollisionPng}" alt="collision" style="width: 32px; height: 32px;" />
  </div>`,
  className: 'collision-icon',
  iconSize: [32, 32],
});

const constructionIcon = () => new L.DivIcon({
  html: `<div style="transform: translate(-50%, -50%);">
    <img src="${constructionPng}" alt="construction" style="width: 32px; height: 32px;" />
  </div>`,
  className: 'construction-icon',
  iconSize: [32, 32],
});

const floodingIcon = () => new L.DivIcon({
  html: `<div style="transform: translate(-50%, -50%);">
    <img src="${wavePng}" alt="flooding" style="width: 32px; height: 32px;" />
  </div>`,
  className: 'flooding-icon',
  iconSize: [32, 32],
});

const detourOneWayIcon = () => new L.DivIcon({
  html: `<div style="transform: translate(-50%, -50%);">
    <img src="${detourRightOnly}" alt="one-way detour" style="width: 32px; height: 32px;" />
  </div>`,
  className: 'detour-oneway-icon',
  iconSize: [32, 32],
});

const detourTwoWayIcon = () => new L.DivIcon({
  html: `<div style="transform: translate(-50%, -50%);">
    <img src="${detourBothWay}" alt="two-way detour" style="width: 32px; height: 32px;" />
  </div>`,
  className: 'detour-twoway-icon',
  iconSize: [32, 32],
});

const publicEventIcon = () => new L.DivIcon({
  html: `<div style="transform: translate(-50%, -50%);">
    <img src="${publicEventPng}" alt="public event" style="width: 32px; height: 32px;" />
  </div>`,
  className: 'public-event-icon',
  iconSize: [32, 32],
});

const roadClosureIcon = () => new L.DivIcon({
  html: `<div style="transform: translate(-50%, -50%);">
    <img src="${closedRoadPng}" alt="road closure" style="width: 32px; height: 32px;" />
  </div>`,
  className: 'road-closure-icon',
  iconSize: [32, 32],
});

const ClientMapComponent = () => {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIncidents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchIncidents();
        setIncidents(data);
      } catch (err) {
        setError('Failed to load incidents');
        console.error('Error loading incidents:', err);
      } finally {
        setLoading(false);
      }
    };

    loadIncidents();
    const interval = setInterval(loadIncidents, 30000);

    return () => clearInterval(interval);
  }, []);

  const renderIncidentMarkers = (coordinates, type) => {
    const color = INCIDENT_TYPES[type]?.color || '#000000';
    
    const defaultPathOptions = {
      weight: 3,
      opacity: 0.8,
    };

    const getPathOptions = (type) => {
      switch(type) {
        case 'COLLISION':
          return { ...defaultPathOptions, color: '#F44336', dashArray: '8, 12' };
        case 'CONSTRUCTION':
          return { ...defaultPathOptions, color: '#FF9800', dashArray: '10, 10' };
        case 'FLOODING':
          return { ...defaultPathOptions, color: '#2196F3', dashArray: '5, 10' };
        case 'DETOUR_ONE_WAY':
        case 'DETOUR_TWO_WAY':
          return { ...defaultPathOptions, color: '#4CAF50', dashArray: '15, 10', lineCap: 'round' };
        case 'PUBLIC_EVENT':
          return { ...defaultPathOptions, color: '#8e44ad', dashArray: '10, 10' };
        case 'ROAD_CLOSURE':
          return { ...defaultPathOptions, color: '#e74c3c', dashArray: '15, 5' };
        default:
          return { ...defaultPathOptions, color };
      }
    };

    const getMarkerIcon = (type) => {
      switch(type) {
        case 'COLLISION': return collisionIcon;
        case 'CONSTRUCTION': return constructionIcon;
        case 'FLOODING': return floodingIcon;
        case 'DETOUR_ONE_WAY': return detourOneWayIcon;
        case 'DETOUR_TWO_WAY': return detourTwoWayIcon;
        case 'PUBLIC_EVENT': return publicEventIcon;
        case 'ROAD_CLOSURE': return roadClosureIcon;
        default: return null;
      }
    };

    if (!getMarkerIcon(type)) {
      return coordinates.map((point, index) => (
        <CircleMarker
          key={`incident-${index}`}
          center={point}
          radius={5}
          pathOptions={{
            color: color,
            fillColor: color,
            fillOpacity: 0.7
          }}
        />
      ));
    }

    return (
      <>
        {coordinates.length > 1 && (
          <Polyline
            positions={coordinates}
            pathOptions={getPathOptions(type)}
          />
        )}
        {coordinates.map((point, index) => (
          <Marker
            key={`incident-${index}`}
            position={point}
            icon={getMarkerIcon(type)()}
          />
        ))}
      </>
    );
  };

  return (
    <div className="client-container">
      <div className="map-section">
        <MapContainer
          center={[13.6288, 123.1854]}
          zoom={13}
          className="map-container"
          zoomControl={false}
        >
          {error && (
            <div className="error-message">{error}</div>
          )}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="bottomright" />
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
                  color: INCIDENT_TYPES[incident.type]?.color || '#000000',
                  weight: 3,
                  opacity: 0.7,
                })}
                onClick={() => setSelectedIncident(incident._id)}
              />
            </React.Fragment>
          ))}
          <IncidentLegend />
        </MapContainer>
        <Clock />
      </div>
      <div className="incidents-section">
        <h3>Active Incidents</h3>
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
