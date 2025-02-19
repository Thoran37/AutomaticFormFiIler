class FormDetector {
  constructor() {
    this.formFields = [];
    console.log('FormDetector initialized');
    this.init();
  }

  init() {
    this.detectFormFields();
    console.log('Detected fields:', this.formFields);
  }

  detectFormFields() {
    const inputs = document.querySelectorAll('input:not([type="submit"]):not([type="button"]), select, textarea');
    inputs.forEach(input => {
      const field = this.analyzeField(input);
      if (field) {
        this.formFields.push(field);
      }
    });
  }

  analyzeField(element) {
    // Skip hidden or button fields
    if (element.type === 'hidden' || 
        element.type === 'submit' || 
        element.type === 'button' || 
        element.style.display === 'none') {
      return null;
    }

    const name = element.name?.toLowerCase() || '';
    const id = element.id?.toLowerCase() || '';
    const placeholder = element.placeholder?.toLowerCase() || '';
    const label = this.findLabel(element)?.toLowerCase() || '';
    const className = element.className?.toLowerCase() || '';
    const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';

    const combinedText = `${name} ${id} ${placeholder} ${label} ${className} ${ariaLabel}`;
    
    return {
      element: element,
      name: name,
      id: id,
      label: label,
      placeholder: placeholder,
      fieldType: this.determineFieldType(combinedText, element.type),
      combinedText: combinedText
    };
  }

  findLabel(element) {
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent.trim();
    }
    
    const parentLabel = element.closest('label');
    if (parentLabel) return parentLabel.textContent.trim();
    
    return '';
  }

  determineFieldType(text, inputType) {
    text = text.toLowerCase();
    
    const patterns = {
      name: /(?:full[ -]?name|name|first[ -]?name|last[ -]?name)/,
      email: /(?:email|e-mail)/,
      phone: /(?:phone|mobile|contact|tel)/,
      address: /(?:address|street|city|state|country|zip|postal)/,
      dob: /(?:dob|date[ -]?of[ -]?birth|birth[ -]?date)/,
      aadhar: /(?:aadhar|aadhaar|uid|unique)/,
      pan: /(?:pan|permanent[ -]?account[ -]?number)/,
      gender: /(?:gender|sex)/,
      pincode: /(?:pin|pincode|zip|postal)/,
      city: /(?:city|town)/,
      state: /(?:state|province)/
    };

    if (inputType === 'email') return 'email';
    if (inputType === 'tel') return 'phone';
    if (inputType === 'date') return 'dob';

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) return type;
    }

    return 'unknown';
  }

  fillFields(userData) {
    console.log('Starting to fill fields with:', userData);
    let filledCount = 0;
    
    this.formFields.forEach(field => {
      console.log('Analyzing field:', {
        type: field.fieldType,
        name: field.name,
        id: field.id,
        label: field.label
      });

      let valueToFill = this.getValueForField(field, userData);
      
      if (valueToFill) {
        console.log(`Filling ${field.fieldType} with:`, valueToFill);
        this.fillField(field.element, valueToFill);
        filledCount++;
      }
    });

    console.log(`Filled ${filledCount} fields out of ${this.formFields.length}`);
  }

  getValueForField(field, userData) {
    const { fieldType, combinedText } = field;

    // Aadhar data matching
    if (userData.aadhar) {
      if (fieldType === 'name' || /name/i.test(combinedText)) {
        return userData.aadhar.name;
      }
      if (fieldType === 'dob' || /birth|dob/i.test(combinedText)) {
        return userData.aadhar.dob;
      }
      if (fieldType === 'address' || /address/i.test(combinedText)) {
        return userData.aadhar.address;
      }
      if (fieldType === 'aadhar' || /aadhar|aadhaar|uid/i.test(combinedText)) {
        return userData.aadhar.number;
      }
    }

    // PAN data matching
    if (userData.pan) {
      if (fieldType === 'pan' || /pan|permanent/i.test(combinedText)) {
        return userData.pan.number;
      }
      if (fieldType === 'name' && !userData.aadhar) {
        return userData.pan.name;
      }
    }

    return null;
  }

  fillField(element, value) {
    try {
      // Set the value
      element.value = value;

      // Only trigger input and change events, not submit
      ['input', 'change'].forEach(eventType => {
        const event = new Event(eventType, { bubbles: true });
        element.dispatchEvent(event);
      });
    } catch (error) {
      console.error('Error filling field:', error);
    }
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
}

// Initialize form detector
const formDetector = new FormDetector();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  
  if (request.action === 'getDetectedFields') {
    const fields = formDetector.formFields.map(f => ({
      name: f.label || f.placeholder || f.name || f.id || 'Unnamed Field',
      type: f.fieldType
    }));
    console.log('Detected fields:', fields);
    sendResponse({ fields });
  }
  else if (request.action === 'fillFields') {
    console.log('Filling fields with data:', request.data);
    formDetector.fillFields(request.data);
    sendResponse({ message: 'Fields filled successfully' });
  }
  return true;
});