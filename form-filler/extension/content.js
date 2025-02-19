class FormDetector {
  constructor() {
    this.formFields = [];
    console.log('FormDetector initialized'); // Debug log
    this.init();
  }

  init() {
    // Get current page URL
    const currentUrl = window.location.href;
    
    // Send URL to Python server for scraping
    fetch('http://localhost:5000/scrape-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: currentUrl })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        this.formFields = data.fields;
        console.log('Detected fields:', this.formFields);
        this.showStatus('Fields detected successfully!');
      } else {
        console.error('Error detecting fields:', data.error);
        this.showStatus('Error detecting fields');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      this.showStatus('Error connecting to server');
    });
  }

  showStatus(message) {
    const statusDiv = document.getElementById('formFillerStatus') || 
                     document.createElement('div');
    statusDiv.id = 'formFillerStatus';
    statusDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #007bff;
      color: white;
      padding: 10px;
      border-radius: 5px;
      z-index: 10000;
    `;
    statusDiv.textContent = message;
    if (!document.getElementById('formFillerStatus')) {
      document.body.appendChild(statusDiv);
    }
    setTimeout(() => {
      statusDiv.remove();
    }, 3000);
  }

  fillFields() {
    chrome.storage.local.get(['userDetails', 'documents'], (result) => {
      this.formFields.forEach(field => {
        const element = this.findElementByField(field);
        if (element) {
          const value = this.findMatchingValue(field, result.userDetails, result.documents);
          if (value) {
            element.value = value;
            element.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      });
    });
  }

  findElementByField(field) {
    let selector = '';
    if (field.name) {
      selector = `${field.tag}[name="${field.name}"]`;
    } else {
      selector = `${field.tag}[type="${field.type}"]`;
    }
    return document.querySelector(selector);
  }

  findMatchingValue(field, userDetails, documents) {
    // Match field names with stored data
    const fieldName = field.name?.toLowerCase() || '';
    
    // Basic matching logic
    if (fieldName.includes('name')) return userDetails.fullName;
    if (fieldName.includes('email')) return userDetails.email;
    if (fieldName.includes('address')) return userDetails.address;
    if (fieldName.includes('aadhar')) return documents.aadhar.number;
    if (fieldName.includes('pan')) return documents.pan.number;
    // Add more matching logic as needed
    
    return null;
  }
}

// Initialize form detector
const formDetector = new FormDetector();

// Add a visual indicator for the extension
const statusDiv = document.createElement('div');
statusDiv.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #007bff;
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 10000;
  display: none;
`;
document.body.appendChild(statusDiv);

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request); // Debug log
  
  if (request.action === 'getDetectedFields') {
    const fields = formDetector.formFields.map(f => ({
      name: f.name,
      type: f.type,
      label: f.label
    }));
    console.log('Sending detected fields:', fields); // Debug log
    sendResponse({ fields });
  }
  else if (request.action === 'fillFields') {
    formDetector.fillFields();
    statusDiv.textContent = 'Form fields filled!';
    statusDiv.style.display = 'block';
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
  return true;
}); 