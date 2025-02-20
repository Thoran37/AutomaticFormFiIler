from flask import Flask, jsonify, request
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def find_label_for_element(driver, element):
    visible_name = None
    
    # Method 1: Check for label with 'for' attribute
    element_id = element.get_attribute('id')
    if element_id:
        labels = driver.find_elements(By.CSS_SELECTOR, f'label[for="{element_id}"]')
        if labels:
            visible_name = labels[0].text.strip()
            if visible_name:
                return visible_name

    # Method 2: Check for parent label
    try:
        parent_label = element.find_element(By.XPATH, "ancestor::label")
        visible_name = parent_label.text.strip()
        if visible_name:
            return visible_name
    except:
        pass

    # Method 3: Check for preceding label or span
    try:
        # Look for immediately preceding label
        prev_label = element.find_element(By.XPATH, "./preceding::label[1]")
        if prev_label.is_displayed():
            visible_name = prev_label.text.strip()
            if visible_name:
                return visible_name
    except:
        pass

    # Method 4: Check for preceding span that might contain label text
    try:
        prev_span = element.find_element(By.XPATH, "./preceding::span[1]")
        if prev_span.is_displayed():
            visible_name = prev_span.text.strip()
            if visible_name:
                return visible_name
    except:
        pass

    # Method 5: Check for div with label-like text before the input
    try:
        prev_div = element.find_element(By.XPATH, "./preceding::div[1]")
        if prev_div.is_displayed():
            visible_name = prev_div.text.strip()
            if visible_name:
                return visible_name
    except:
        pass

    # Method 6: Check aria-label
    aria_label = element.get_attribute('aria-label')
    if aria_label:
        return aria_label

    # Method 7: Check placeholder
    placeholder = element.get_attribute('placeholder')
    if placeholder:
        return placeholder

    # Method 8: Try to make sense of the field name itself
    field_name = element.get_attribute('name')
    if field_name:
        # Convert camelCase or snake_case to readable text
        import re
        # Handle camelCase
        field_name = re.sub('([a-z0-9])([A-Z])', r'\1 \2', field_name)
        # Handle snake_case
        field_name = field_name.replace('_', ' ')
        # Remove common prefixes like 'rv' or 'txt'
        field_name = re.sub(r'^(rv|txt)', '', field_name, flags=re.IGNORECASE)
        return field_name.strip().title()

    return None

@app.route('/scrape-form', methods=['POST'])
def scrape_form():
    url = request.json.get('url')
    
    try:
        driver = webdriver.Chrome()
        driver.get(url)
        
        # Wait for form elements to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "input"))
        )
        
        form_fields = []
        
        # Find all input fields
        input_fields = driver.find_elements(By.TAG_NAME, "input")
        for field in input_fields:
            visible_label = find_label_for_element(driver, field)
            field_info = {
                'name': field.get_attribute("name"),
                'type': field.get_attribute("type"),
                'tag': 'input',
                'visible_label': visible_label,
                'placeholder': field.get_attribute("placeholder")
            }
            form_fields.append(field_info)

        # Find dropdowns
        dropdowns = driver.find_elements(By.TAG_NAME, "select")
        for dropdown in dropdowns:
            visible_label = find_label_for_element(driver, dropdown)
            field_info = {
                'name': dropdown.get_attribute("name"),
                'type': 'select',
                'tag': 'select',
                'visible_label': visible_label,
                'placeholder': dropdown.get_attribute("placeholder")
            }
            form_fields.append(field_info)

        # Find text areas
        text_areas = driver.find_elements(By.TAG_NAME, "textarea")
        for area in text_areas:
            visible_label = find_label_for_element(driver, area)
            field_info = {
                'name': area.get_attribute("name"),
                'type': 'textarea',
                'tag': 'textarea',
                'visible_label': visible_label,
                'placeholder': area.get_attribute("placeholder")
            }
            form_fields.append(field_info)

        driver.quit()
        return jsonify({'success': True, 'fields': form_fields})
    
    except Exception as e:
        if 'driver' in locals():
            driver.quit()
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    app.run(port=5000) 