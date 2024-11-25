const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const fetchIncidents = async () => {
  try {
    const response = await fetch(`${API_URL}/api/incidents`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch incidents: ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const createIncident = async (incident) => {
  try {
    const response = await fetch(`${API_URL}/api/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incident),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create incident: ${errorText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const deleteIncident = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/incidents/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete incident: ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
