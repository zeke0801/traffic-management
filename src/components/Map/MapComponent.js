import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMapEvents, ZoomControl, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';
import { fetchIncidents, createIncident, deleteIncident } from '../../services/api';
import { INCIDENT_TYPES } from '../../constants/incidentTypes';
import ActiveIncidentsList from '../Incidents/ActiveIncidentsList';

const DURATION_UNITS = {
  HOURS: 'hours',
  DAYS: 'days'
};

const DrawingComponent = ({ onAddPoint, drawingMode, selectedIncidentType }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const mapRef = useRef(null);
  const brushSize = 0.0005;
  const lastPointRef = useRef(null);
  
  const isLineDrawing = selectedIncidentType === 'COLLISION' || selectedIncidentType === 'CONSTRUCTION' || selectedIncidentType === 'DETOUR';

  useEffect(() => {
    const preventSelection = (e) => {
      if (isDrawing || drawingMode) {
        e.preventDefault();
      }
    };

    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('dragstart', preventSelection);
    
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
        if (mapRef.current && !isDrawing) {
          mapRef.current.dragging.disable();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('dragstart', preventSelection);
    };
  }, [isSpacePressed, isDrawing, drawingMode]);

  const createSprayPoints = (centerPoint) => {
    const points = [];
    const numPoints = 5;
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const randomRadius = Math.random() * brushSize;
      const point = [
        centerPoint[0] + Math.cos(angle) * randomRadius,
        centerPoint[1] + Math.sin(angle) * randomRadius
      ];
      points.push(point);
    }
    
    return points;
  };

  const handleDrawing = (latlng) => {
    const point = [latlng.lat, latlng.lng];
    
    if (isLineDrawing) {
      // For traffic, construction, and detour, just add the point for line drawing
      onAddPoint(latlng);
      lastPointRef.current = point;
    } else {
      // For natural disaster, use spray brush
      const sprayPoints = createSprayPoints(point);
      sprayPoints.forEach(p => onAddPoint({ lat: p[0], lng: p[1] }));
    }
  };

  const map = useMapEvents({
    mousedown: (e) => {
      if (drawingMode && !isSpacePressed) {
        setIsDrawing(true);
        handleDrawing(e.latlng);
        map.dragging.disable();
      }
    },
    mouseup: () => {
      if (isDrawing) {
        setIsDrawing(false);
        lastPointRef.current = null;
        if (isSpacePressed) {
          map.dragging.enable();
        }
      }
    },
    mousemove: (e) => {
      if (drawingMode && isDrawing && !isSpacePressed) {
        handleDrawing(e.latlng);
      }
    },
    click: (e) => {
      // Add extra click handler for line drawing to make it easier to create straight lines
      if (drawingMode && isLineDrawing && !isSpacePressed) {
        handleDrawing(e.latlng);
      }
    }
  });

  mapRef.current = map;

  useEffect(() => {
    if (map && !isSpacePressed) {
      map.dragging.disable();
    }
  }, [map, isSpacePressed]);
  
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

const MapComponent = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [selectedIncidentType, setSelectedIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [duration, setDuration] = useState(1);
  const [durationUnit, setDurationUnit] = useState(DURATION_UNITS.HOURS);
  const [expiryType, setExpiryType] = useState('duration');
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
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

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddPoint = (latlng) => {
    setCurrentPath([...currentPath, [latlng.lat, latlng.lng]]);
  };

  const handleDrawingComplete = async () => {
    if (currentPath.length === 0) {
      setError('Please draw a path first');
      return;
    }

    if (!description) {
      setError('Please enter a description');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let expiryTime;
      if (expiryType === 'duration') {
        const now = new Date();
        const hours = durationUnit === DURATION_UNITS.HOURS ? duration : duration * 24;
        expiryTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
      } else {
        expiryTime = new Date(expiryDate);
      }

      await createIncident({
        type: selectedIncidentType,
        coordinates: currentPath,
        description,
        expiryTime: expiryTime.toISOString(),
        durationValue: expiryType === 'duration' ? duration : null,
        durationUnit: expiryType === 'duration' ? durationUnit : null,
      });

      resetForm();
    } catch (error) {
      console.error('Error creating incident:', error);
      setError('Failed to create incident. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIncident = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await deleteIncident(id);
      setIncidents(incidents.filter(incident => incident._id !== id));
    } catch (error) {
      console.error('Error deleting incident:', error);
      setError('Failed to delete incident. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentPath([]);
    setDescription('');
    setDrawingMode(false);
    setSelectedIncident(null);
    setDuration(1);
    setDurationUnit(DURATION_UNITS.HOURS);
    setExpiryType('duration');
    setExpiryDate('');
  };

  const renderIncidentMarkers = (coordinates, type, isDrawing = false) => {
    const color = INCIDENT_TYPES[type]?.color || '#000000';
    
    return (
      <>
        {coordinates.map((point, index) => (
          <CircleMarker
            key={`${isDrawing ? 'drawing' : 'incident'}-${index}`}
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

  const getIncidentColor = (type) => {
    return INCIDENT_TYPES[type]?.color || '#000000';
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
            {error && (
              <div className="error-message">{error}</div>
            )}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <ZoomControl position="bottomleft" />
            <DrawingComponent
              onAddPoint={handleAddPoint}
              drawingMode={drawingMode}
              selectedIncidentType={selectedIncidentType}
            />
            {currentPath.length > 0 && (
              <GeoJSON
                data={{
                  type: 'LineString',
                  coordinates: currentPath.map(([lat, lng]) => [lng, lat])
                }}
                style={{
                  color: getIncidentColor(selectedIncidentType),
                  weight: 3,
                  opacity: 0.7,
                }}
              />
            )}
            {incidents.map((incident) => (
              <GeoJSON
                key={incident._id}
                data={{
                  type: 'LineString',
                  coordinates: incident.coordinates
                }}
                style={() => ({
                  color: getIncidentColor(incident.type),
                  weight: 3,
                  opacity: 0.7,
                })}
              />
            ))}
          </MapContainer>

          <div className="map-controls">
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
                      <option value={DURATION_UNITS.HOURS}>Hours</option>
                      <option value={DURATION_UNITS.DAYS}>Days</option>
                    </select>
                  </div>
                ) : (
                  <input
                    type="datetime-local"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="expiry-date-input"
                  />
                )}
              </div>

              <button
                onClick={handleDrawingComplete}
                className="control-button complete-button"
                disabled={currentPath.length === 0 || !selectedIncidentType}
              >
                Submit Report
              </button>
            </div>
          </div>
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
            onDeleteIncident={handleDeleteIncident}
          />
        </div>
      </div>
      <div className="map-instructions">
        <span className="instruction-text">
          Hold <kbd>Space</kbd> + Mouse to drag the map
        </span>
      </div>
    </>
  );
};

export default MapComponent;
