import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMapEvents, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';
import { fetchIncidents, createIncident, deleteIncident } from '../../services/api';
import { INCIDENT_TYPES, DURATION_UNITS } from '../../constants/incidentTypes';
import ActiveIncidentsList from '../Incidents/ActiveIncidentsList';

const DrawingComponent = ({ onAddPoint, selectedIncidentType }) => {
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const mapRef = useRef(null);

  const map = useMapEvents({
    click(e) {
      if (!isSpacePressed) {
        onAddPoint(e.latlng);
      }
    },
    mousedown(e) {
      if (isSpacePressed) {
        mapRef.current = e.originalEvent;
        map.dragging.enable();
      }
    },
    mouseup() {
      if (isSpacePressed) {
        map.dragging.disable();
      }
    }
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(true);
        map.dragging.enable();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        map.dragging.disable();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    map.dragging.disable();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      map.dragging.enable();
    };
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

  const calculateExpiryTime = () => {
    if (expiryType === 'duration') {
      const now = new Date();
      const hours = durationUnit === DURATION_UNITS.HOURS ? duration : duration * 24;
      return new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
    }
    return new Date(expiryDate).toISOString();
  };

  const handleDrawingComplete = async () => {
    if (currentPath.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      const expiryTime = calculateExpiryTime();

      await createIncident({
        type: selectedIncidentType,
        coordinates: currentPath,
        description,
        expiryTime
      });

      // Reset form
      setCurrentPath([]);
      setDescription('');
      setSelectedIncidentType('');
      setDuration(1);
      setDurationUnit(DURATION_UNITS.HOURS);
      setExpiryType('duration');
      setExpiryDate('');
      
      // Refresh incidents
      const updatedIncidents = await fetchIncidents();
      setIncidents(updatedIncidents);
    } catch (err) {
      setError('Failed to create incident. Please try again.');
      console.error('Error creating incident:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIncident = async (incidentId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteIncident(incidentId);
      const updatedIncidents = await fetchIncidents();
      setIncidents(updatedIncidents);
      setSelectedIncident(null);
    } catch (err) {
      setError('Failed to delete incident. Please try again.');
      console.error('Error deleting incident:', err);
    } finally {
      setLoading(false);
    }
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
            pathOptions={{
              fillColor: color,
              fillOpacity: 0.7,
              color: color,
              weight: 1
            }}
          />
        ))}
      </>
    );
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
              selectedIncidentType={selectedIncidentType}
            />
            {currentPath.length > 0 && (
              <>
                {renderIncidentMarkers(currentPath, selectedIncidentType, true)}
                <Polyline
                  positions={currentPath}
                  color={INCIDENT_TYPES[selectedIncidentType]?.color || '#000000'}
                />
              </>
            )}
            {incidents.map((incident) => (
              <React.Fragment key={incident._id}>
                {renderIncidentMarkers(incident.coordinates, incident.type)}
                <Polyline
                  positions={incident.coordinates}
                  color={INCIDENT_TYPES[incident.type]?.color || '#000000'}
                  onClick={() => setSelectedIncident(incident)}
                />
              </React.Fragment>
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
