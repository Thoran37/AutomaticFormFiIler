import cv2
import pytesseract
from PIL import Image

# Set Tesseract path (Windows only)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text(image_path):
    # Read the image
    image = cv2.imread(image_path)
    
    # Convert to grayscale (improves OCR accuracy)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply thresholding to clean the image
    processed_img = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

    # Save temporarily for OCR processing
    temp_filename = "temp.png"
    cv2.imwrite(temp_filename, processed_img)

    # Extract text using Tesseract
    extracted_text = pytesseract.image_to_string(Image.open(temp_filename))

    return extracted_text

# Example Usage
image_path = "image.png"  # Replace with your image path
text = extract_text(image_path)
print("Extracted Text:\n", text)
