export const INCIDENT_TYPES = {
  COLLISION: {
    name: 'Collision',
    color: '#FF0000',
    description: 'Vehicle collision or accident'
  },
  CONSTRUCTION: {
    name: 'Construction',
    color: '#FFA500',
    description: 'Road construction or maintenance'
  },
  NATURAL_DISASTER: {
    name: 'Natural Disaster',
    color: '#800080',
    description: 'Natural disaster affecting traffic'
  },
  DETOUR: {
    name: 'Detour Route',
    color: '#00FF00',
    description: 'Alternative route'
  }
};

export const calculateTimeRemaining = (expiryTime) => {
  const now = new Date();
  const expiry = new Date(expiryTime);
  const diff = expiry - now;

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
};
