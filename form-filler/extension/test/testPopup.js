document.addEventListener('DOMContentLoaded', function() {
  // Load saved data if exists
  chrome.storage.local.get(['userData'], function(result) {
    if (result.userData) {
      console.log('Loading saved data:', result.userData);
      loadSavedData(result.userData);
    }
  });

  // Add event listeners
  document.getElementById('saveBtn').addEventListener('click', saveData);
  document.getElementById('showDataBtn').addEventListener('click', showStoredData);
});

function saveData() {
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

  chrome.storage.local.set({ userData }, function() {
    console.log('Data saved:', userData);
    showMessage('Data saved successfully!');
  });
}

function loadSavedData(data) {
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

function showStoredData() {
  chrome.storage.local.get(['userData'], function(result) {
    if (result.userData) {
      const dataDisplay = document.getElementById('dataDisplay');
      dataDisplay.innerHTML = `
        <h3>Stored Data:</h3>
        <pre>${JSON.stringify(result.userData, null, 2)}</pre>
      `;
      dataDisplay.style.display = 'block';
    } else {
      showMessage('No data stored yet!');
    }
  });
}

function showMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);
  setTimeout(() => messageDiv.remove(), 3000);
} 