document.addEventListener('DOMContentLoaded', function() {
  // Load saved documents
  loadSavedDocuments();

  // Save documents
  document.getElementById('saveDocuments').addEventListener('click', saveDocuments);

  // Form filling buttons
  document.getElementById('fillFormBtn').addEventListener('click', fillForm);
  document.getElementById('showFieldsBtn').addEventListener('click', showDetectedFields);
});

function loadSavedDocuments() {
  chrome.storage.local.get('documents', function(result) {
    if (result.documents) {
      // Aadhar
      document.getElementById('aadharNumber').value = result.documents.aadhar?.number || '';
      document.getElementById('aadharName').value = result.documents.aadhar?.name || '';
      document.getElementById('aadharDob').value = result.documents.aadhar?.dob || '';
      document.getElementById('aadharAddress').value = result.documents.aadhar?.address || '';

      // PAN
      document.getElementById('panNumber').value = result.documents.pan?.number || '';
      document.getElementById('panName').value = result.documents.pan?.name || '';

      // 10th Certificate
      document.getElementById('schoolName').value = result.documents.tenth?.school || '';
      document.getElementById('percentage').value = result.documents.tenth?.percentage || '';
      document.getElementById('passingYear').value = result.documents.tenth?.year || '';

      // License
      document.getElementById('licenseNumber').value = result.documents.license?.number || '';
      document.getElementById('licenseName').value = result.documents.license?.name || '';
      document.getElementById('licenseValidity').value = result.documents.license?.validity || '';

      // Resume
      document.getElementById('education').value = result.documents.resume?.education || '';
      document.getElementById('experience').value = result.documents.resume?.experience || '';
      document.getElementById('skills').value = result.documents.resume?.skills || '';
    }
  });
}

function saveDocuments() {
  const documents = {
    aadhar: {
      number: document.getElementById('aadharNumber').value,
      name: document.getElementById('aadharName').value,
      dob: document.getElementById('aadharDob').value,
      address: document.getElementById('aadharAddress').value
    },
    pan: {
      number: document.getElementById('panNumber').value,
      name: document.getElementById('panName').value
    },
    tenth: {
      school: document.getElementById('schoolName').value,
      percentage: document.getElementById('percentage').value,
      year: document.getElementById('passingYear').value
    },
    license: {
      number: document.getElementById('licenseNumber').value,
      name: document.getElementById('licenseName').value,
      validity: document.getElementById('licenseValidity').value
    },
    resume: {
      education: document.getElementById('education').value,
      experience: document.getElementById('experience').value,
      skills: document.getElementById('skills').value
    }
  };

  chrome.storage.local.set({ documents }, function() {
    showMessage('Documents saved successfully!');
  });
}

function fillForm() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'fillFields'});
  });
}

function showDetectedFields() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'getDetectedFields'}, function(response) {
      const fieldsList = document.getElementById('fieldsList');
      fieldsList.innerHTML = '';
      
      if (response && response.fields) {
        response.fields.forEach(field => {
          const fieldDiv = document.createElement('div');
          fieldDiv.className = 'detected-field';
          fieldDiv.textContent = `${field.name || 'Unnamed Field'} (${field.type})`;
          fieldsList.appendChild(fieldDiv);
        });
      }
      
      document.getElementById('detectedFields').style.display = 'block';
    });
  });
}

function showMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}