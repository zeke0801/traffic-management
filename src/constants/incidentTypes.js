import carCollisionPng from '../svg/car-collision-svgrepo-com.png';
import constructionPng from '../svg/construction-svgrepo-com.png';
import wavePng from '../svg/wave-svgrepo-com.png';
import detourboth from '../svg/detour-bothway.png';
import detouroneway from '../svg/detour-rightonly.png';
import publiceventPng from '../svg/publicevent.png';
import closedRoadPng from '../svg/closedroad.png';
import { format } from 'date-fns';

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

export const formatRecordedDate = (dateString) => {
  if (!dateString) return 'No date recorded';
  try {
    const date = new Date(dateString);
    // Add 8 hours for PHT
    date.setHours(date.getHours() + 8);
    return format(date, 'MMM d, yyyy, hh:mm a');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};
