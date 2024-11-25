import carCollisionPng from '../svg/car-collision-svgrepo-com.png';
import constructionPng from '../svg/construction-svgrepo-com.png';
import wavePng from '../svg/wave-svgrepo-com.png';
import detourboth from '../svg/detour-bothway.png';
import detouroneway from '../svg/detour-rightonly.png';
import publiceventPng from '../svg/publicevent.png';
import closedRoadPng from '../svg/closedroad.png';

export const INCIDENT_TYPES = {
  COLLISION: {
    name: 'Collision',
    symbol: carCollisionPng,
    description: 'Vehicle collision or accident',
    color: '#ff4444'
  },
  CONSTRUCTION: {
    name: 'Construction',
    symbol: constructionPng,
    description: 'Road construction or maintenance',
    color: '#fb00ff'
  },
  FLOODING: {
    name: 'Flooding',
    symbol: wavePng,
    description: 'Flooded road or area',
    color: '#00C6FF'
  },
  PUBLIC_EVENT: {
    name: 'Public Event',
    symbol: publiceventPng,
    description: 'Parades, festivals, or public gatherings',
    color: '#ffdd00'
  },
  ROAD_CLOSURE: {
    name: 'Road Closure',
    symbol: closedRoadPng,
    description: 'Complete road closure for any reason',
    color: '#e74c3c'
  },
  DETOUR_ONE_WAY: {
    name: 'Detour: One Way',
    symbol: detouroneway,
    description: 'One-way alternative route',
    color: '#34495e'
  },
  DETOUR_TWO_WAY: {
    name: 'Detour: Two Way',
    symbol: detourboth,
    description: 'Two-way alternative route',
    color: '#45e600'
  }
};

export const DURATION_UNITS = {
  HOURS: 'hours',
  DAYS: 'days'
};

export const calculateTimeRemaining = (startTime, duration, durationUnit) => {
  if (!startTime) return 'No start time set';
  
  const now = new Date();
  const start = new Date(startTime);
  
  // If the incident hasn't started yet
  if (start > now) {
    const diff = start - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `Starts in ${days} day${days > 1 ? 's' : ''}`;
    }
    
    if (hours > 0) {
      return `Starts in ${hours}h ${minutes}m`;
    }
    
    return `Starts in ${minutes}m`;
  }
  
  // If using duration-based expiry
  if (duration) {
    const hours = durationUnit === DURATION_UNITS.HOURS ? duration : duration * 24;
    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
    const diff = end - now;
    
    if (diff <= 0) return 'Expired';
    
    const remainingHours = Math.floor(diff / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (remainingHours > 24) {
      const days = Math.floor(remainingHours / 24);
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    }
    
    if (remainingHours > 0) {
      return `${remainingHours}h ${remainingMinutes}m remaining`;
    }
    
    return `${remainingMinutes}m remaining`;
  }
  
  return 'In progress';
};

export const formatRecordedDate = (dateString) => {
  if (!dateString) return 'No date recorded';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return 'Invalid date';
  }
};
