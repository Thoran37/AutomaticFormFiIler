// Initialize default storage structure
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    setupComplete: false,
    userDetails: {
      fullName: '',
      dob: '',
      email: '',
      address: ''
    },
    documents: {
      aadhar: {
        number: '',
        name: '',
        dob: '',
        address: ''
      },
      pan: {
        number: '',
        name: ''
      },
      tenth: {
        school: '',
        percentage: '',
        year: ''
      },
      license: {
        number: '',
        name: '',
        validity: ''
      },
      resume: {
        education: '',
        experience: '',
        skills: ''
      }
    }
  });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStoredData') {
    chrome.storage.local.get('documents', (result) => {
      const matchedData = matchFieldsToStoredData(request.fields, result.documents);
      sendResponse({ data: matchedData });
    });
    return true; // Required for async response
  }
});

function matchFieldsToStoredData(fields, storedData) {
  const matchedData = {};
  
  fields.forEach(field => {
    // Logic to match form fields with stored data
    // This is where you'll implement your field matching algorithm
    const value = findValueInStoredData(field, storedData);
    if (value) {
      matchedData[field] = value;
    }
  });
  
  return matchedData;
}

function findValueInStoredData(field, data) {
  // Implement logic to search through stored data
  // and find matching values for the requested field
  return null;
}

chrome.action.onClicked.addListener((tab) => {
    const loginUrl = 'http://localhost:8000/login.html';
    chrome.tabs.create({ url: loginUrl });
}); 