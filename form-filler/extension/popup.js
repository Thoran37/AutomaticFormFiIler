document.addEventListener('DOMContentLoaded', function() {
  // Load saved data if exists
  chrome.storage.local.get(['userData', 'isLoggedIn'], function(result) {
    if (!result.isLoggedIn) {
      window.location.href = 'login.html';
      return;
    }

    if (result.userData) {
      console.log('Loading saved data:', result.userData);
      loadDocumentData(result.userData);
    }

    // Check if setup is complete
    chrome.storage.local.get('setupComplete', function(result) {
      if (result.setupComplete) {
        showActionsPage();
      } else {
        showDocumentsPage();
      }
    });
  });

  // Navigation
  document.getElementById('toggleView').addEventListener('click', toggleView);
  document.getElementById('saveAndContinue').addEventListener('click', saveAndContinue);
  document.getElementById('editDocsBtn').addEventListener('click', toggleView);

  // Action buttons
  document.getElementById('fillFormBtn').addEventListener('click', fillForm);
  document.getElementById('showFieldsBtn').addEventListener('click', showDetectedFields);
  document.getElementById('logoutBtn').addEventListener('click', logout);

  // Add show saved data button listener
  document.getElementById('showSavedDataBtn').addEventListener('click', toggleSavedData);
});

function showActionsPage() {
  const documentPage = document.getElementById('documentPage');
  const actionsPage = document.getElementById('actionsPage');
  const pageTitle = document.getElementById('pageTitle');
  const toggleBtn = document.getElementById('toggleView');

  documentPage.classList.remove('active');
  actionsPage.classList.add('active');
  pageTitle.textContent = 'Form Actions';
  toggleBtn.innerHTML = '<span class="material-icons">arrow_back</span>';
}

function showDocumentsPage() {
  const documentPage = document.getElementById('documentPage');
  const actionsPage = document.getElementById('actionsPage');
  const pageTitle = document.getElementById('pageTitle');
  const toggleBtn = document.getElementById('toggleView');

  actionsPage.classList.remove('active');
  documentPage.classList.add('active');
  pageTitle.textContent = 'Document Manager';
  toggleBtn.innerHTML = '<span class="material-icons">arrow_forward</span>';
}

function toggleView() {
  const documentPage = document.getElementById('documentPage');
  if (documentPage.classList.contains('active')) {
    showActionsPage();
  } else {
    showDocumentsPage();
  }
}

function loadDocumentData(data) {
  if (data.aadhar) {
    document.getElementById('aadharNumber').value = data.aadhar.number || '';
    document.getElementById('aadharName').value = data.aadhar.name || '';
    document.getElementById('aadharDob').value = data.aadhar.dob || '';
    document.getElementById('aadharAddress').value = data.aadhar.address || '';
  }
  if (data.pan) {
    document.getElementById('panNumber').value = data.pan.number || '';
    document.getElementById('panName').value = data.pan.name || '';
  }
}

function saveAndContinue() {
  const userData = {
    aadhar: {
      number: document.getElementById('aadharNumber').value,
      name: document.getElementById('aadharName').value,
      dob: document.getElementById('aadharDob').value,
      address: document.getElementById('aadharAddress').value
    },
    pan: {
      number: document.getElementById('panNumber').value,
      name: document.getElementById('panName').value
    }
  };

  chrome.storage.local.set({ 
    userData: userData,
    setupComplete: true 
  }, function() {
    console.log('Data saved:', userData);
    showMessage('Data saved successfully!');
    showActionsPage();
  });

  // Keep the backend update attempt but don't wait for it
  try {
    chrome.storage.local.get(['token'], async function(result) {
      if (result.token) {
        await API.updateDocumentData(result.token, 'aadhar', userData.aadhar);
        await API.updateDocumentData(result.token, 'pan', userData.pan);
      }
    });
  } catch (error) {
    console.error('Backend sync failed:', error);
    // Continue anyway since we have local storage
  }
}

function logout() {
  chrome.storage.local.clear(function() {
    window.location.href = 'login.html';
  });
}

function showMessage(message, type = 'success') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);
  setTimeout(() => messageDiv.remove(), 3000);
}

function fillForm() {
  chrome.storage.local.get(['userData'], function(result) {
    console.log('Retrieved userData for filling:', result.userData);
    
    if (!result.userData) {
      showMessage('No data available to fill the form', 'error');
      return;
    }

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (!tabs[0]?.id) {
        showMessage('No active tab found', 'error');
        return;
      }

      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'fillFields',
        data: result.userData
      }, function(response) {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError);
          showMessage('Error communicating with the page', 'error');
          return;
        }
        
        if (response && response.message) {
          showMessage('Form filled successfully', 'success');
        }
      });
    });
  });
}

function showDetectedFields() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'getDetectedFields'}, function(response) {
      const detectedFields = document.getElementById('detectedFields');
      const fieldsList = document.getElementById('fieldsList');
      
      if (response && response.fields && response.fields.length > 0) {
        fieldsList.innerHTML = '';
        response.fields.forEach(field => {
          const fieldDiv = document.createElement('div');
          fieldDiv.className = 'detected-field';
          fieldDiv.textContent = `${field.name || 'Unnamed Field'} (${field.type})`;
          fieldsList.appendChild(fieldDiv);
        });
        detectedFields.style.display = 'block';
      } else {
        fieldsList.innerHTML = '<div class="no-fields">No form fields detected</div>';
        detectedFields.style.display = 'block';
      }
    });
  });
}

// Add this new function
function toggleSavedData() {
  const dataDisplay = document.getElementById('savedDataDisplay');
  const dataContent = document.getElementById('dataContent');
  
  if (dataDisplay.style.display === 'none') {
    chrome.storage.local.get(['userData'], function(result) {
      if (result.userData) {
        // Format the data nicely
        const formattedData = JSON.stringify(result.userData, null, 2);
        dataContent.textContent = formattedData;
        dataDisplay.style.display = 'block';
        document.getElementById('showSavedDataBtn').innerHTML = `
          <span class="material-icons">visibility_off</span>
          Hide Saved Data
        `;
      } else {
        showMessage('No data stored yet!', 'warning');
      }
    });
  } else {
    dataDisplay.style.display = 'none';
    document.getElementById('showSavedDataBtn').innerHTML = `
      <span class="material-icons">visibility</span>
      Show Saved Data
    `;
  }
}