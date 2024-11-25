const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const fetchIncidents = async () => {
  try {
    const response = await fetch(`${API_URL}/api/incidents`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fetch incidents failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Failed to fetch incidents: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Fetch incidents error:', error);
    throw error;
  }
};

export const createIncident = async (incident) => {
  try {
    console.log('Creating incident with data:', incident);
    const response = await fetch(`${API_URL}/api/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incident),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create incident failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Failed to create incident: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    console.log('Created incident:', result);
    return result;
  } catch (error) {
    console.error('Create incident error:', error);
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
      console.error('Delete incident failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Failed to delete incident: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Delete incident error:', error);
    throw error;
  }
};
