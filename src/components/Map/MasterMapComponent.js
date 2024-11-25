import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMapEvents, ZoomControl, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MasterMapComponent.css';
import { fetchIncidents, createIncident, deleteIncident } from '../../services/api';
import { INCIDENT_TYPES, DURATION_UNITS } from '../../constants/incidentTypes';
import ActiveIncidentsList from '../Incidents/ActiveIncidentsList';
import carCollisionPng from '../../svg/car-collision-svgrepo-com.png';
import constructionPng from '../../svg/construction-svgrepo-com.png';
import floodingPng from '../../svg/wave-svgrepo-com.png';
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
      map.dragging.disable();
    }
  });

  useEffect(() => {
    if (!mapRef.current) return;

    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !isSpacePressed) {
        e.preventDefault();
        setIsSpacePressed(true);
        mapRef.current.dragging.enable();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(false);
        mapRef.current.dragging.disable();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (mapRef.current) {
        mapRef.current.dragging.disable();
      }
    };
  }, [isSpacePressed]);

  return null;
};

const DrawingComponent = ({ onAddPoint, selectedIncidentType }) => {
  const map = useMapEvents({
    click(e) {
      if (selectedIncidentType) {
        onAddPoint(e.latlng);
      }
    }
  });

  useEffect(() => {
    // Update cursor style based on whether an incident type is selected
    const container = map.getContainer();
    container.style.cursor = selectedIncidentType ? 'crosshair' : 'default';
    
    return () => {
      container.style.cursor = 'default';
    };
  }, [map, selectedIncidentType]);

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

// Custom collision icon
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
    <img src="${floodingPng}" alt="flooding" style="width: 32px; height: 32px;" />
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

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if there's a saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="theme-toggle">
      <button onClick={toggleTheme} aria-label="Toggle theme">
        {isDark ? (
          <i className="fas fa-sun" aria-hidden="true"></i>
        ) : (
          <i className="fas fa-moon" aria-hidden="true"></i>
        )}
      </button>
    </div>
  );
};

const MapComponent = () => {
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [selectedIncidentType, setSelectedIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [duration, setDuration] = useState(1);
  const [durationUnit, setDurationUnit] = useState(DURATION_UNITS.HOURS);
  const [expiryType, setExpiryType] = useState('duration');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
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
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddPoint = (latlng) => {
    setCurrentPath([...currentPath, [latlng.lat, latlng.lng]]);
  };

  const calculateExpiryTime = () => {
    if (expiryType === 'duration') {
      const now = new Date();
      const hours = durationUnit === DURATION_UNITS.HOURS ? duration : duration * 24;
      return new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
    }
    if (expiryType === 'specific') {
      return endDate ? new Date(endDate).toISOString() : null;
    }
    return null;
  };

  const handleDrawingComplete = async () => {
    if (currentPath.length === 0) return;

    try {
      setError(null);

      const expiryTime = calculateExpiryTime();
      const startTime = startDate ? new Date(startDate).toISOString() : null;

      await createIncident({
        type: selectedIncidentType,
        coordinates: currentPath,
        description,
        expiryTime,
        startTime
      });

      // Reset form
      setCurrentPath([]);
      setDescription('');
      setSelectedIncidentType('');
      setDuration(1);
      setDurationUnit(DURATION_UNITS.HOURS);
      setExpiryType('duration');
      setStartDate('');
      setEndDate('');
    } catch (err) {
      setError('Failed to create incident. Please try again.');
      console.error('Error creating incident:', err);
    }
  };

  const handleCancelDrawing = () => {
    setCurrentPath([]);
    setSelectedIncidentType('');
    setDescription('');
    setDuration(1);
    setDurationUnit(DURATION_UNITS.HOURS);
    setExpiryType('duration');
    setStartDate('');
    setEndDate('');
  };

  const handleDeleteIncident = async (incidentId) => {
    try {
      setError(null);
      await deleteIncident(incidentId);
      const updatedIncidents = await fetchIncidents();
      setIncidents(updatedIncidents);
      setSelectedIncident(null);
    } catch (err) {
      setError('Failed to delete incident. Please try again.');
      console.error('Error deleting incident:', err);
    }
  };

  const renderIncidentMarkers = (coordinates, type, isDrawing = false) => {
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
          key={`${isDrawing ? 'drawing' : 'incident'}-${index}`}
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
          center={[13.6373, 123.1854]}
          zoom={14}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <ZoomControl position="bottomleft" />
          <ThemeToggle />
          {error && (
            <div className="error-message">{error}</div>
          )}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <DrawingComponent
            onAddPoint={handleAddPoint}
            selectedIncidentType={selectedIncidentType}
          />
          <MapControls />
          {currentPath.length > 0 && (
            <>
              {renderIncidentMarkers(currentPath, selectedIncidentType, true)}
            </>
          )}
          {incidents.map((incident) => (
            <React.Fragment key={incident._id}>
              {renderIncidentMarkers(incident.coordinates, incident.type)}
            </React.Fragment>
          ))}
        </MapContainer>

        <div className="incident-reporting">
          <div className="control-group">
            <select
              value={selectedIncidentType}
              onChange={(e) => setSelectedIncidentType(e.target.value)}
              className="incident-type-select"
            >
              <option value="" disabled>Type of Incident</option>
              {Object.entries(INCIDENT_TYPES).map(([type, { name }]) => (
                <option key={type} value={type}>
                  {name}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="description-input"
            />

            <div className="expiry-controls">
              <select 
                value={expiryType} 
                onChange={(e) => setExpiryType(e.target.value)}
                className="expiry-type-select"
              >
                <option value="duration">Duration</option>
                <option value="specific">Specific Time</option>
                <option value="no_expiry">No Specific Time</option>
              </select>

              {expiryType === 'duration' ? (
                <div className="duration-inputs">
                  <input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="duration-input"
                  />
                  <select
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value)}
                    className="duration-unit-select"
                  >
                    <option value={DURATION_UNITS.HOURS}>Hour(s)</option>
                    <option value={DURATION_UNITS.DAYS}>Days</option>
                  </select>
                </div>
              ) : expiryType === 'specific' ? (
                <div className="specific-time-inputs">
                  <div className="time-input-group">
                    <label>Start Time:</label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="time-input"
                    />
                  </div>
                  <div className="time-input-group">
                    <label>End Time:</label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="time-input"
                    />
                  </div>
                </div>
              ) : (
                <div className="no-expiry-note">
                  This incident will not expire automatically
                </div>
              )}
            </div>

            <button
              onClick={handleDrawingComplete}
              className="control-button complete-button"
              disabled={currentPath.length === 0 || !selectedIncidentType}
            >
              Submit Report
            </button>

            {currentPath.length > 0 && (
              <button 
                className="cancel-button" 
                onClick={handleCancelDrawing}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel Drawing
              </button>
            )}

            
          </div>
        </div>
      </div>
      <div className="incidents-section">
        <h3>Active Incidents</h3>
        <Clock />
        <ActiveIncidentsList
          incidents={incidents}
          selectedIncident={selectedIncident}
          onSelectIncident={setSelectedIncident}
          onDeleteIncident={handleDeleteIncident}
        />
      </div>
    </div>

  );
};

export default MapComponent;