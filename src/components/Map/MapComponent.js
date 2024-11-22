import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMapEvents, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';
import { fetchIncidents, createIncident, deleteIncident } from '../../services/api';

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

const DURATION_UNITS = {
  HOURS: 'hours',
  DAYS: 'days',
  WEEKS: 'weeks'
};

const DrawingComponent = ({ onAddPoint, drawingMode, selectedIncidentType }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const mapRef = useRef(null);
  const brushSize = 0.0005;
  const lastPointRef = useRef(null);
  
  const isLineDrawing = selectedIncidentType === 'COLLISION' || selectedIncidentType === 'CONSTRUCTION';

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
      // For traffic and construction, just add the point for line drawing
      onAddPoint(point);
      lastPointRef.current = point;
    } else {
      // For natural disaster, use spray brush
      const sprayPoints = createSprayPoints(point);
      sprayPoints.forEach(p => onAddPoint(p));
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

const MapComponent = () => {
  const [incidents, setIncidents] = useState([]);
  const [drawingMode, setDrawingMode] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [selectedIncidentType, setSelectedIncidentType] = useState('COLLISION');
  const [description, setDescription] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [expiryType, setExpiryType] = useState('DURATION');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState('HOURS');
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const calculateExpiryTime = () => {
    if (expiryType === 'date') {
      return new Date(expiryDate).toISOString();
    }

    const now = new Date();
    const value = parseInt(duration);
    
    switch(durationUnit) {
      case DURATION_UNITS.HOURS:
        now.setHours(now.getHours() + value);
        break;
      case DURATION_UNITS.DAYS:
        now.setDate(now.getDate() + value);
        break;
      case DURATION_UNITS.WEEKS:
        now.setDate(now.getDate() + (value * 7));
        break;
      default:
        break;
    }
    
    return now.toISOString();
  };

  const handleAddPoint = (point) => {
    setCurrentPath(prevPath => [...prevPath, point]);
  };

  const handleDrawingComplete = async () => {
    if (currentPath.length > 0) {
      try {
        setLoading(true);
        setError(null);
        const newIncident = {
          type: selectedIncidentType,
          coordinates: currentPath,
          description: INCIDENT_TYPES[selectedIncidentType].description,
          expiryTime: calculateExpiryTime()
        };

        const savedIncident = await createIncident(newIncident);
        setIncidents(prev => [...prev, savedIncident]);
        resetForm();
      } catch (error) {
        console.error('Error saving incident:', error);
        setError('Failed to save incident. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setCurrentPath([]);
    setDrawingMode(false);
    setDescription('');
    setDuration('1');
    setDurationUnit(DURATION_UNITS.HOURS);
    setExpiryDate('');
    setSelectedIncident(null);
  };

  const handleDeleteIncident = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await deleteIncident(id);
      setIncidents(incidents.filter(incident => incident._id !== id));
      setSelectedIncident(null);
    } catch (error) {
      console.error('Error deleting incident:', error);
      setError('Failed to delete incident. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIncident = async (id) => {
    const updatedIncidents = incidents.map(incident => {
      if (incident.id === id) {
        return {
          ...incident,
          description,
          expiryTime: calculateExpiryTime(),
          durationValue: expiryType === 'duration' ? duration : null,
          durationUnit: expiryType === 'duration' ? durationUnit : null
        };
      }
      return incident;
    });
    
    try {
      await Promise.all(updatedIncidents.map(incident => createIncident(incident)));
      setIncidents(updatedIncidents);
      resetForm();
    } catch (error) {
      console.error('Error updating incidents:', error);
    }
  };

  const renderIncidentMarkers = (path, type, isSelected = false) => {
    if (type === 'NATURAL_DISASTER') {
      // Render spray points for natural disasters
      return path.map((point, index) => (
        <CircleMarker
          key={`${isSelected ? 'current' : type}-${index}`}
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

  return (
    <div className="map-container">
      <div className="map-instructions">
        <span className="instruction-text">
          Hold <kbd>Space</kbd> + Mouse to move map
        </span>
      </div>
      <div className="map-controls">
        <select 
          value={selectedIncidentType}
          onChange={(e) => setSelectedIncidentType(e.target.value)}
          className="incident-type-select"
          disabled={!!selectedIncident}
        >
          {Object.entries(INCIDENT_TYPES).map(([key, value]) => (
            <option key={key} value={key}>{value.name}</option>
          ))}
        </select>

        {!selectedIncident && (
          <>
            <button 
              onClick={() => setDrawingMode(!drawingMode)}
              className={`control-button ${drawingMode ? 'active' : ''}`}
            >
              {drawingMode ? 'Drawing Mode (Active)' : 'Start Drawing'}
            </button>
          </>
        )}

        {(drawingMode || selectedIncident) && (
          <>
            <input
              type="text"
              placeholder="Enter incident description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="incident-description"
            />

            <div className="expiry-controls">
              <select 
                value={expiryType}
                onChange={(e) => setExpiryType(e.target.value)}
                className="expiry-type-select"
              >
                <option value="duration">Duration-based expiry</option>
                <option value="date">Date-based expiry</option>
              </select>

              {expiryType === 'duration' ? (
                <div className="duration-inputs">
                  <input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="duration-value"
                  />
                  <select
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value)}
                    className="duration-unit"
                  >
                    {Object.values(DURATION_UNITS).map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <input
                  type="datetime-local"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="expiry-date"
                  min={new Date().toISOString().slice(0, 16)}
                />
              )}
            </div>

            {selectedIncident ? (
              <div className="edit-controls">
                <button 
                  onClick={() => handleUpdateIncident(selectedIncident.id)}
                  className="control-button update"
                >
                  Update Incident
                </button>
                <button 
                  onClick={resetForm}
                  className="control-button cancel"
                >
                  Cancel Edit
                </button>
              </div>
            ) : (
              <div className="drawing-controls">
                <button 
                  onClick={handleDrawingComplete}
                  className="control-button complete"
                >
                  Complete Drawing
                </button>
                <button 
                  onClick={resetForm}
                  className="control-button cancel"
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        )}
      </div>

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
        <DrawingComponent 
          onAddPoint={handleAddPoint} 
          drawingMode={drawingMode}
          selectedIncidentType={selectedIncidentType}
        />
        <ZoomControl position="bottomleft" />
        
        {currentPath.length > 0 && renderIncidentMarkers(currentPath, selectedIncidentType, true)}

        {incidents.map((incident, index) => renderIncidentMarkers(incident.coordinates, incident.type))}
        
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
      
      <div className="incidents-list">
        <h3>Active Incidents</h3>
        {incidents.map((incident) => {
          const expiryTime = new Date(incident.expiryTime);
          const now = new Date();
          const isExpiringSoon = (expiryTime - now) < (1000 * 60 * 60); // Less than 1 hour

          return (
            <div key={incident.id} className={`incident-item ${isExpiringSoon ? 'expiring-soon' : ''}`}>
              <div className="incident-type" style={{ color: INCIDENT_TYPES[incident.type].color }}>
                {INCIDENT_TYPES[incident.type].name}
              </div>
              <div className="incident-description">{incident.description}</div>
              <div className="incident-time">
                Created: {new Date(incident.timestamp).toLocaleString()}
              </div>
              <div className="incident-expiry">
                Expires: {new Date(incident.expiryTime).toLocaleString()}
              </div>
              <div className="incident-actions">
                <button
                  onClick={() => {
                    setSelectedIncident(incident);
                    setDescription(incident.description);
                    if (incident.durationValue && incident.durationUnit) {
                      setExpiryType('duration');
                      setDuration(incident.durationValue);
                      setDurationUnit(incident.durationUnit);
                    } else {
                      setExpiryType('date');
                      setExpiryDate(new Date(incident.expiryTime).toISOString().slice(0, 16));
                    }
                  }}
                  className="edit-button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteIncident(incident.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MapComponent;
