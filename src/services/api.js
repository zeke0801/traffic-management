const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const fetchIncidents = async () => {
  try {
    console.log('Making GET request to:', `${API_URL}/api/incidents`);
    const response = await fetch(`${API_URL}/api/incidents`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    console.log('GET response status:', response.status);
    console.log('GET response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fetch incidents failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Failed to fetch incidents: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('GET response data:', data);
    return data || []; // Ensure we always return an array
  } catch (error) {
    console.error('Fetch incidents error:', error);
    throw error;
  }
};

export const createIncident = async (incident) => {
  try {
    console.log('Creating incident with data:', incident);
    console.log('Making POST request to:', `${API_URL}/api/incidents`);
    const response = await fetch(`${API_URL}/api/incidents`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incident),
    });
    console.log('POST response status:', response.status);
    console.log('POST response headers:', Object.fromEntries(response.headers.entries()));
    
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

    // Immediately try to fetch the incident we just created
    try {
      const getResponse = await fetch(`${API_URL}/api/incidents/${result._id}`);
      const getResult = await getResponse.json();
      console.log('Verification GET for new incident:', getResult);
    } catch (verifyError) {
      console.error('Failed to verify new incident:', verifyError);
    }

    return result;
  } catch (error) {
    console.error('Create incident error:', error);
    throw error;
  }
};

export const deleteIncident = async (id) => {
  try {
    console.log('Making DELETE request to:', `${API_URL}/api/incidents/${id}`);
    const response = await fetch(`${API_URL}/api/incidents/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    console.log('DELETE response status:', response.status);
    console.log('DELETE response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete incident failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Failed to delete incident: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('DELETE response data:', data);
    return data;
  } catch (error) {
    console.error('Delete incident error:', error);
    throw error;
  }
};
