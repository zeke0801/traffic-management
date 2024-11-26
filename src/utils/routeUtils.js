import crypto from 'crypto';

// Function to generate a daily hash based on a secret and the current date
const generateDailyHash = (prefix) => {
  const date = new Date().toISOString().split('T')[0]; // Gets current date in YYYY-MM-DD format
  const secret = process.env.REACT_APP_ROUTE_SECRET || 'default-secret-replace-this';
  const hash = crypto
    .createHash('sha256')
    .update(`${prefix}-${date}-${secret}`)
    .digest('hex')
    .substring(0, 8); // Take first 8 characters for shorter URLs

  return hash;
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
