document.addEventListener('DOMContentLoaded', async function() {
  // Check login status
  chrome.storage.local.get(['isLoggedIn', 'token', 'username'], async function(result) {
    if (!result.isLoggedIn) {
      window.location.href = 'login.html';
      return;
    }

    console.log('Logged in user:', result.username);

    // Load user data from backend
    try {
      const response = await fetch(`http://localhost:4000/user-data`, {
        headers: {
          'Authorization': `Bearer ${result.token}`,
          'Content-Type': 'application/json'
        }
      });

      const userData = await response.json();
      console.log('Retrieved user data:', userData);

      if (userData.data && userData.data.basic) {
        // Store in chrome.storage.local
        chrome.storage.local.set({ 
          userData: userData.data,
          basicInfo: userData.data.basic // Store basic info separately for easy access
        }, function() {
          console.log('User data stored in local storage');
          loadDocumentData(userData.data);
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      showMessage('Error loading user data', 'error');
    }
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
  console.log('Loading document data:', data);

  // Load basic info if available
  if (data.basic) {
    const basicInfo = data.basic;
    document.getElementById('firstName').textContent = basicInfo.firstName || '';
    document.getElementById('middleName').textContent = basicInfo.middleName || '';
    document.getElementById('lastName').textContent = basicInfo.lastName || '';
    document.getElementById('dob').textContent = basicInfo.dob || '';
    document.getElementById('email').textContent = basicInfo.email || '';
  }

  // Load Aadhar info if available
  if (data.aadhar) {
    const aadharInfo = data.aadhar;
    document.getElementById('aadharNumber').value = aadharInfo.number || '';
    document.getElementById('aadharName').value = aadharInfo.name || '';
    document.getElementById('aadharDob').value = aadharInfo.dob || '';
    document.getElementById('aadharAddress').value = aadharInfo.address || '';
  }
}

async function saveAndContinue() {
  console.log('Saving documents...');
  
  const aadharData = {
    number: document.getElementById('aadharNumber').value,
    name: document.getElementById('aadharName').value,
    dob: document.getElementById('aadharDob').value,
    address: document.getElementById('aadharAddress').value
  };

  // Get token and current userData from storage
  chrome.storage.local.get(['token', 'userData'], async function(result) {
    try {
      // Prepare the updated data structure
      const updatedData = {
        personalData: {
          ...result.userData, // Keep existing data
          aadhar: aadharData // Add/Update Aadhar data
        }
      };

      // Send to backend
      const response = await fetch('http://localhost:4000/user-data', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${result.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        // Update local storage with new data
        chrome.storage.local.set({
          userData: updatedData.personalData,
          setupComplete: true
        }, function() {
          console.log('Data saved successfully:', updatedData);
          showMessage('Documents saved successfully', 'success');
          showActionsPage();
        });
      } else {
        throw new Error('Failed to update data');
      }
    } catch (error) {
      console.error('Error saving document data:', error);
      // Still save to local storage even if backend fails
      chrome.storage.local.set({
        userData: {
          ...result.userData,
          aadhar: aadharData
        },
        setupComplete: true
      }, function() {
        showMessage('Saved locally (offline mode)', 'warning');
        showActionsPage();
      });
    }
  });
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

    // Get the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (!tabs[0]?.id) {
        showMessage('No active tab found', 'error');
        return;
      }

      // Send message directly first
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'fillFields',
        data: result.userData
      }, function(response) {
        // If there's an error (content script not injected), then inject and retry
        if (chrome.runtime.lastError) {
          console.log('Content script not found, injecting...');
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['content.js']
          }, function() {
            if (chrome.runtime.lastError) {
              console.error('Script injection error:', chrome.runtime.lastError);
              showMessage('Error: Cannot access this page', 'error');
              return;
            }

            // Retry sending message after injection
            setTimeout(() => {
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
            }, 100); // Small delay to ensure script is loaded
          });
        } else if (response && response.message) {
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

// Update showSavedData to display the new data structure
function toggleSavedData() {
  const dataDisplay = document.getElementById('savedDataDisplay');
  const dataContent = document.getElementById('dataContent');
  
  if (dataDisplay.style.display === 'none') {
    chrome.storage.local.get(['userData'], function(result) {
      if (result.userData) {
        // Create a more readable format
        const formattedData = {
          "Basic Information": result.userData.basic || "Not available",
          "Aadhar Details": result.userData.aadhar || "Not available",
          "Other Documents": {
            "PAN": result.userData.pan || "Not available",
            // Add other documents as needed
          }
        };
        
        dataContent.textContent = JSON.stringify(formattedData, null, 2);
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