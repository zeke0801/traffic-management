import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMapEvents, ZoomControl, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MasterMapComponent.css';
import { fetchIncidents, createIncident, deleteIncident } from '../../services/api';
import { INCIDENT_TYPES } from '../../constants/incidentTypes';
import IncidentPanel from '../Incidents/IncidentPanel';
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
  iconAnchor: [0, 0]
});

const constructionIcon = () => new L.DivIcon({
  html: `<div style="transform: translate(-50%, -50%);">
    <img src="${constructionPng}" alt="construction" style="width: 32px; height: 32px;" />
  </div>`,
  className: 'construction-icon',
  iconSize: [32, 32],
  iconAnchor: [0, 0]
});

const floodingIcon = () => new L.DivIcon({
  html: `<div style="transform: translate(-50%, -50%);">
    <img src="${floodingPng}" alt="flooding" style="width: 32px; height: 32px;" />
  </div>`,
  className: 'flooding-icon',
  iconSize: [32, 32],
  iconAnchor: [0, 0]
});

const detourOneWayIcon = () => new L.DivIcon({
  html: `<div style="transform: translate(-50%, -50%); background">
    <img src="${detourRightOnly}" alt="one-way detour" style="width: 32px; height: 32px;" />
  </div>`,
  className: 'detour-oneway-icon',
  iconSize: [32, 32],
  iconAnchor: [0, 0]
});

const detourTwoWayIcon = () => new L.DivIcon({
  html: `<div style="transform: translate(-50%, -50%);">
    <img src="${detourBothWay}" alt="two-way detour" style="width: 32px; height: 32px;" />
  </div>`,
  className: 'detour-twoway-icon',
  iconSize: [32, 32],
  iconAnchor: [0, 0]
});

const publicEventIcon = () => new L.DivIcon({
  html: `<div style="transform: translate(-50%, -50%);">
    <img src="${publicEventPng}" alt="public event" style="width: 32px; height: 32px;" />
  </div>`,
  className: 'public-event-icon',
  iconSize: [32, 32],
  iconAnchor: [0, 0]
});

const roadClosureIcon = () => new L.DivIcon({
  html: `<div style="transform: translate(-50%, -50%);">
    <img src="${closedRoadPng}" alt="road closure" style="width: 32px; height: 32px;" />
  </div>`,
  className: 'road-closure-icon',
  iconSize: [32, 32],
  iconAnchor: [0, 0]
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
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [hiddenIncidentTypes, setHiddenIncidentTypes] = useState(new Set());

  const toggleIncidentType = (type) => {
    setHiddenIncidentTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

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

  const handleDrawingComplete = async () => {
    if (currentPath.length === 0) {
      setError('Please draw the incident path first');
      return;
    }

    if (!selectedIncidentType || !INCIDENT_TYPES[selectedIncidentType]) {
      setError('Please select a valid incident type');
      return;
    }

    try {
      setError(null);

      const incidentData = {
        type: selectedIncidentType,
        coordinates: currentPath,
        description: description || 'No description provided',
        status: 'ACTIVE',
        name: INCIDENT_TYPES[selectedIncidentType].name,
        color: INCIDENT_TYPES[selectedIncidentType].color
      };

      await createIncident(incidentData);

      // Reset form
      setCurrentPath([]);
      setDescription('');
      setSelectedIncidentType('');
      setError(null);

      // Refresh incidents
      const updatedIncidents = await fetchIncidents();
      setIncidents(updatedIncidents);
    } catch (err) {
      console.error('Error creating incident:', err);
      setError('Failed to create incident. Please try again.');
    }
  };

  const handleCancelDrawing = () => {
    setCurrentPath([]);
    setSelectedIncidentType('');
    setDescription('');
  };

  const handleDeleteIncident = async (incidentId) => {
    try {
      setError(null);
      await deleteIncident(incidentId);
      const updatedIncidents = await fetchIncidents();
      setIncidents(updatedIncidents);
      setSelectedIncidentId(null);
    } catch (err) {
      setError('Failed to delete incident. Please try again.');
      console.error('Error deleting incident:', err);
    }
  };

  const handleIncidentSelect = (incidentId) => {
    setSelectedIncidentId(incidentId);
    
    // Find the selected incident
    const selectedIncident = incidents.find(incident => incident._id === incidentId);
    if (selectedIncident && selectedIncident.coordinates.length > 0) {
      // Create bounds from the incident coordinates
      const bounds = L.latLngBounds(selectedIncident.coordinates);
      
      // Fit the map to these bounds with some padding
      mapRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 18,
        animate: true,
        duration: 1
      });
    }
  };

  const renderIncidentMarkers = (coordinates, type, isDrawing = false) => {
    if (hiddenIncidentTypes.has(type)) return null;
    const color = isDrawing ? '#3388ff' : INCIDENT_TYPES[type]?.color || '#3388ff';
    const getPathOptions = (type) => {
      const baseOptions = {
        color: INCIDENT_TYPES[type]?.color || color,
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
            opacity: 0,
            dashArray: '15, 10',
            weight: 4
          };
        case 'FLOODING':
          return {
            ...baseOptions,
            opacity: 0,
            dashArray: '5, 10',
            weight: 4
          };
        default:
          return baseOptions;
      }
    };

    if (!getMarkerIcon(type)) {
      return coordinates.map((point, index) => (
        <CircleMarker
          key={`${isDrawing ? 'drawing' : 'incident'}-${index}`}
          center={point}
          radius={1}
          pathOptions={{
            color: color,
            fillColor: color,
            fillOpacity: 0.1
          }}
        />
      ));
    }

    return (
      <>
        {coordinates.length > 1 && (
          <>
            <Polyline
              positions={coordinates}
              pathOptions={getPathOptions(type)}
            />
            {coordinates.map((point, index) => (
              <CircleMarker
                key={`connection-${index}`}
                center={point}
                radius={0.5}
                pathOptions={{
                  color: INCIDENT_TYPES[type]?.color || color,
                  fillColor: INCIDENT_TYPES[type]?.color || color,
                  fillOpacity: 0.5,
                  weight: 0
                }}
              />
            ))}
          </>
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

  return (
    <div className="master-container">
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
              maxLength={100}
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add Key and Concise Information"
              className="description-input"
            />

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
        <Clock />
        <IncidentPanel
          incidents={incidents.filter(inc => !hiddenIncidentTypes.has(inc.type))}
          selectedIncidentId={selectedIncidentId}
          onSelectIncident={handleIncidentSelect}
          onDeleteIncident={handleDeleteIncident}
          hiddenIncidentTypes={hiddenIncidentTypes}
          onToggleIncidentType={toggleIncidentType}
        />
      </div>
    </div>

  );
};

export default MapComponent;