import carCollisionPng from '../svg/car-collision-svgrepo-com.png';
import constructionPng from '../svg/construction-svgrepo-com.png';
import wavePng from '../svg/wave-svgrepo-com.png';
import detourboth from '../svg/detour-bothway.png';
import detouroneway from '../svg/detour-rightonly.png';

export const INCIDENT_TYPES = {
  COLLISION: {
    name: 'Collision',
    symbol: carCollisionPng,
    description: 'Vehicle collision or accident'
  },
  CONSTRUCTION: {
    name: 'Construction',
    symbol: constructionPng,
    description: 'Road construction or maintenance'
  },
  FLOODING: {
    name: 'Flooding',
    symbol: wavePng,
    description: 'Flooded road or area'
  },
  DETOUR_ONE_WAY: {
    name: 'Detour: One Way',
    symbol: detouroneway,
    description: 'One-way alternative route'
  },
  DETOUR_TWO_WAY: {
    name: 'Detour: Two Way',
    symbol: detourboth,
    description: 'Two-way alternative route'
  }
};

export const DURATION_UNITS = {
  HOURS: 'hours',
  DAYS: 'days'
};

export const calculateTimeRemaining = (expiryTime) => {
  const now = new Date();
  const expiry = new Date(expiryTime);
  const diff = expiry - now;

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} remaining`;
  }

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min remaining`;
  }

  return `${minutes} min remaining`;
};
