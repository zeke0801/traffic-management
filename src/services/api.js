const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const fetchIncidents = async () => {
  const response = await fetch(`${API_URL}/api/incidents`);
  if (!response.ok) {
    throw new Error('Failed to fetch incidents');
  }
  return response.json();
};

export const createIncident = async (incident) => {
  const response = await fetch(`${API_URL}/api/incidents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(incident),
  });
  if (!response.ok) {
    throw new Error('Failed to create incident');
  }
  return response.json();
};

export const deleteIncident = async (id) => {
  const response = await fetch(`${API_URL}/api/incidents/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete incident');
  }
  return response.json();
};
