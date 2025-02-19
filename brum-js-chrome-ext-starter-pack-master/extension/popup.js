document.addEventListener('DOMContentLoaded', function() {
  // Check if initial setup is completed
  chrome.storage.local.get(['userDetails', 'setupComplete'], function(result) {
    if (!result.setupComplete) {
      showInitialSetup();
    } else {
      showDocumentManagement();
    }
  });

  // Handle initial setup form submission
  document.getElementById('setupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userDetails = {
      fullName: document.getElementById('fullName').value,
      dob: document.getElementById('dob').value,
      email: document.getElementById('email').value,
      address: document.getElementById('address').value
    };

    // Save user details and mark setup as complete
    chrome.storage.local.set({
      userDetails: userDetails,
      setupComplete: true
    }, function() {
      showDocumentManagement();
    });
  });

  // Document management button handlers
  document.getElementById('editAadhar')?.addEventListener('click', function() {
    chrome.storage.local.get('documents', function(result) {
      console.log('Current Aadhar data:', result.documents.aadhar);
    });
  });

  document.getElementById('editPan')?.addEventListener('click', function() {
    chrome.storage.local.get('documents', function(result) {
      console.log('Current PAN data:', result.documents.pan);
    });
  });

  // Document form configurations
  const documentForms = {
    aadhar: {
      title: 'Aadhar Details',
      fields: [
        { name: 'number', label: 'Aadhar Number', type: 'text', required: true },
        { name: 'name', label: 'Name (as on Aadhar)', type: 'text', required: true },
        { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
        { name: 'address', label: 'Address', type: 'textarea', required: true }
      ]
    },
    pan: {
      title: 'PAN Card Details',
      fields: [
        { name: 'number', label: 'PAN Number', type: 'text', required: true },
        { name: 'name', label: 'Name (as on PAN)', type: 'text', required: true }
      ]
    },
    tenth: {
      title: '10th Certificate Details',
      fields: [
        { name: 'school', label: 'School Name', type: 'text', required: true },
        { name: 'percentage', label: 'Percentage/CGPA', type: 'text', required: true },
        { name: 'year', label: 'Year of Passing', type: 'number', required: true }
      ]
    },
    license: {
      title: 'License Details',
      fields: [
        { name: 'number', label: 'License Number', type: 'text', required: true },
        { name: 'name', label: 'Name (as on License)', type: 'text', required: true },
        { name: 'validity', label: 'Valid Until', type: 'date', required: true }
      ]
    },
    resume: {
      title: 'Resume Details',
      fields: [
        { name: 'education', label: 'Education', type: 'textarea', required: true },
        { name: 'experience', label: 'Experience', type: 'textarea', required: false },
        { name: 'skills', label: 'Skills', type: 'textarea', required: true }
      ]
    }
  };

  // Handle document edit buttons
  const documentButtons = ['Aadhar', 'Pan', '10th', 'License', 'Resume'];
  documentButtons.forEach(doc => {
    document.getElementById(`edit${doc}`)?.addEventListener('click', () => {
      openDocumentModal(doc.toLowerCase());
    });
  });

  // Modal handling
  const modal = document.getElementById('documentModal');
  const closeBtn = document.getElementsByClassName('close')[0];
  
  closeBtn.onclick = () => {
    modal.style.display = 'none';
  };

  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };

  function openDocumentModal(docType) {
    const config = documentForms[docType];
    document.getElementById('modalTitle').textContent = config.title;
    
    // Create form fields
    const form = document.getElementById('documentForm');
    form.innerHTML = ''; // Clear existing fields
    
    config.fields.forEach(field => {
      const fieldDiv = createFormField(field);
      form.appendChild(fieldDiv);
    });

    // Add submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'primary-btn';
    submitBtn.textContent = 'Save';
    form.appendChild(submitBtn);

    // Load existing data
    chrome.storage.local.get('documents', (result) => {
      const docData = result.documents?.[docType] || {};
      config.fields.forEach(field => {
        const input = document.getElementById(field.name);
        if (input && docData[field.name]) {
          input.value = docData[field.name];
        }
      });
    });

    // Handle form submission
    form.onsubmit = (e) => {
      e.preventDefault();
      const formData = {};
      config.fields.forEach(field => {
        formData[field.name] = document.getElementById(field.name).value;
      });

      // Save to storage
      chrome.storage.local.get('documents', (result) => {
        const documents = result.documents || {};
        documents[docType] = formData;
        chrome.storage.local.set({ documents }, () => {
          modal.style.display = 'none';
        });
      });
    };

    modal.style.display = 'block';
  }

  function createFormField(field) {
    const div = document.createElement('div');
    div.className = 'form-group';

    const label = document.createElement('label');
    label.textContent = field.label;
    if (field.required) label.textContent += ' *';
    div.appendChild(label);

    let input;
    if (field.type === 'textarea') {
      input = document.createElement('textarea');
    } else {
      input = document.createElement('input');
      input.type = field.type;
    }
    input.id = field.name;
    input.required = field.required;
    div.appendChild(input);

    return div;
  }
});

function showInitialSetup() {
  document.getElementById('initialSetup').style.display = 'block';
  document.getElementById('documentManagement').style.display = 'none';
}

function showDocumentManagement() {
  document.getElementById('initialSetup').style.display = 'none';
  document.getElementById('documentManagement').style.display = 'block';
} 