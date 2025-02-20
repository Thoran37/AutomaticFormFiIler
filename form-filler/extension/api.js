const API_BASE_URL = 'http://localhost:4000';

class API {
  static async login(username, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return await response.json();
  }

  static async getUserData(token) {
    console.log('Getting user data with token:', token);
    const response = await fetch(`${API_BASE_URL}/user-data`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log('User data response:', data);
    return data;
  }

  static async updateDocumentData(token, docType, data) {
    console.log(`Updating ${docType} data:`, data);
    const response = await fetch(`${API_BASE_URL}/user-data/${docType}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const responseData = await response.json();
    console.log(`${docType} update response:`, responseData);
    return responseData;
  }
} 