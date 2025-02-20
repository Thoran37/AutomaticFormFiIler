// Check if FormDetector is already defined
if (typeof FormDetector === 'undefined') {
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
      // Get all input, select, and textarea elements
      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        const field = this.analyzeField(input);
        if (field) {
          this.formFields.push(field);
        }
      });
    }

    analyzeField(element) {
      // Skip hidden or submit/button type inputs
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
      
      return {
        element: element,
        name: name,
        id: id,
        label: label,
        placeholder: placeholder,
        fieldType: this.determineFieldType(name, id, placeholder, label, element.type)
      };
    }

    findLabel(element) {
      // Try to find label by for attribute
      if (element.id) {
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (label) return label.textContent;
      }
      
      // Try to find parent label
      const parentLabel = element.closest('label');
      if (parentLabel) return parentLabel.textContent;
      
      return '';
    }

    determineFieldType(name, id, placeholder, label, inputType) {
      const text = `${name} ${id} ${placeholder} ${label}`.toLowerCase();
      
      // Check for specific field types
      if (/first.*name|fname|given.*name/i.test(text)) return 'firstName';
      if (/middle.*name|mname/i.test(text)) return 'middleName';
      if (/last.*name|lname|surname|family.*name/i.test(text)) return 'lastName';
      if (/full.*name|name/i.test(text)) return 'fullName';
      if (/email/i.test(text) || inputType === 'email') return 'email';
      if (/birth|dob/i.test(text) || inputType === 'date') return 'dob';
      if (/phone|mobile|contact/i.test(text) || inputType === 'tel') return 'phone';
      if (/address/i.test(text)) return 'address';
      if (/aadhar.*num/i.test(text)) return 'aadharNumber';
      
      return 'unknown';
    }

    fillFields(userData) {
      console.log('Starting to fill fields with:', userData);
      let filledCount = 0;

      this.formFields.forEach(field => {
        console.log('Processing field:', field);
        const value = this.getValueForField(field, userData);
        
        if (value) {
          console.log(`Filling ${field.fieldType} with:`, value);
          this.fillField(field.element, value);
          filledCount++;
        }
      });

      console.log(`Filled ${filledCount} fields`);
      return filledCount;
    }

    getValueForField(field, userData) {
      const basic = userData.basic || {};
      const aadhar = userData.aadhar || {};

      switch(field.fieldType) {
        case 'firstName':
          return basic.firstName;
        case 'middleName':
          return basic.middleName;
        case 'lastName':
          return basic.lastName;
        case 'fullName':
          return `${basic.firstName || ''} ${basic.middleName || ''} ${basic.lastName || ''}`.trim();
        case 'email':
          return basic.email;
        case 'dob':
          return basic.dob;
        case 'aadharNumber':
          return aadhar.number;
        case 'address':
          return aadhar.address;
        default:
          return null;
      }
    }

    fillField(element, value) {
      try {
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('Successfully filled field:', element, 'with value:', value);
      } catch (error) {
        console.error('Error filling field:', error);
      }
    }
  }

  // Initialize form detector only if not already initialized
  if (typeof window.formDetector === 'undefined') {
    window.formDetector = new FormDetector();
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  
  if (request.action === 'getDetectedFields') {
    const fields = window.formDetector.formFields.map(f => ({
      name: f.label || f.placeholder || f.name || f.id || 'Unnamed Field',
      type: f.fieldType
    }));
    console.log('Detected fields:', fields);
    sendResponse({ fields });
  }
  else if (request.action === 'fillFields') {
    console.log('Filling fields with data:', request.data);
    const filledCount = window.formDetector.fillFields(request.data);
    sendResponse({ message: `Successfully filled ${filledCount} fields` });
  }
  return true;
});