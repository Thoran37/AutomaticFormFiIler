from selenium import webdriver
from selenium.webdriver.common.by import By

# Set up the WebDriver (Example: Chrome)
driver = webdriver.Chrome()  # Ensure you have chromedriver installed

# Open the webpage
driver.get("https://blogapp-frontend-u8oa.onrender.com/")

# Find all input fields
input_fields = driver.find_elements(By.TAG_NAME, "input")
for field in input_fields:
    field_name = field.get_attribute("name") or field.get_attribute("id")
    field_type = field.get_attribute("type")
    print(f"Field: {field_name}, Type: {field_type}")

# Find dropdowns
dropdowns = driver.find_elements(By.TAG_NAME, "select")
for dropdown in dropdowns:
    print(f"Dropdown: {dropdown.get_attribute('name')}")

# Find text areas
text_areas = driver.find_elements(By.TAG_NAME, "textarea")
for area in text_areas:
    print(f"Text Area: {area.get_attribute('name')}")

driver.quit()