const axios = require('axios');

const BASE_URL = 'https://traffic-management-hvn8.onrender.com';

async function testEndpoints() {
  try {
    console.log('Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('Health check response:', healthResponse.data);

    console.log('\nTesting incidents endpoint...');
    const incidentsResponse = await axios.get(`${BASE_URL}/api/incidents`);
    console.log('Incidents response:', incidentsResponse.data);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testEndpoints();
