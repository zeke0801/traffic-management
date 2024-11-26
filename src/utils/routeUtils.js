// Function to generate a daily hash based on a secret and the current date
const generateDailyHash = (prefix) => {
  const date = new Date().toISOString().split('T')[0]; // Gets current date in YYYY-MM-DD format
  const secret = process.env.REACT_APP_ROUTE_SECRET || 'default-secret-replace-this';
  const input = `${prefix}-${date}-${secret}`;
  
  // Simple string hashing function that works in browser
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to hex string and take first 8 characters
  const positiveHash = Math.abs(hash);
  const hexHash = positiveHash.toString(16).padStart(8, '0');
  return hexHash.substring(0, 8);
};

// Get the routes for the current day
export const getRoutes = () => {
  const masterHash = generateDailyHash('master');
  const clientHash = generateDailyHash('client');

  return {
    master: `/${masterHash}`,
    client: `/${clientHash}`,
  };
};

// Validate if a given path matches today's valid paths
export const isValidPath = (path) => {
  const routes = getRoutes();
  const strippedPath = path.startsWith('/') ? path : `/${path}`;
  return Object.values(routes).includes(strippedPath);
};
