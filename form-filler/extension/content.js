class FormFiller {
  constructor() {
    this.formFields = {};
    this.init();
  }

  init() {
    // Listen for form detection
    document.addEventListener('DOMContentLoaded', () => {
      this.detectForms();
    });
  }

  detectForms() {
    // Get all input fields
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      // Analyze input attributes and labels to determine field type
      const fieldInfo = this.analyzeField(input);
      if (fieldInfo) {
        this.formFields[fieldInfo.type] = input;
      }
    });

    // Request data from background script
    chrome.runtime.sendMessage({
      action: 'getStoredData',
      fields: Object.keys(this.formFields)
    }, response => {
      this.fillFormFields(response.data);
    });
  }

  analyzeField(input) {
    // Basic field analysis logic
    const attributes = {
      id: input.id.toLowerCase(),
      name: input.name.toLowerCase(),
      type: input.type,
      label: this.findLabel(input)
    };

    // Match common patterns for different fields
    if (attributes.id.includes('aadhar') || attributes.name.includes('aadhar')) {
      return { type: 'aadhar', element: input };
    }
    // Add more field type detection logic here
    
    return null;
  }

  fillFormFields(data) {
    for (const [fieldType, value] of Object.entries(data)) {
      if (this.formFields[fieldType]) {
        this.formFields[fieldType].value = value;
      }
    }
  }

  findLabel(input) {
    // Logic to find associated label text
    const label = input.labels?.[0]?.textContent || '';
    return label.toLowerCase();
  }
}

// Initialize form filler
new FormFiller(); 