from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import pytesseract
from PIL import Image
import numpy as np
import os
import tempfile
import openai

app = Flask(__name__)
CORS(app)

# Set your OpenAI API key
OPENAI_API_KEY = "abcd"
openai.api_key = OPENAI_API_KEY

# Set Tesseract path (Windows) - adjust this path based on your installation
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def process_image(image_file):
    # Read image file into numpy array
    img_array = np.frombuffer(image_file.read(), np.uint8)
    image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply thresholding
    processed_img = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    
    # Save processed image temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_file:
        cv2.imwrite(temp_file.name, processed_img)
        
        # Extract text using Tesseract
        extracted_text = pytesseract.image_to_string(Image.open(temp_file.name))
    
    # Clean up temporary file
    os.unlink(temp_file.name)
    
    return extracted_text.strip()

def send_to_chatgpt(extracted_text):
    prompt = f"""Extract the relevant details from the following text and structure them in the given JSON format:
    
    Text:
    {extracted_text}
    
    Format:
    username
"Thoran"

personalData
Object

aadhar
Object
number
""
name
""
dob
""
address
""

basic
Object
dob
"13/11/2004"
email
"thoranmuvvala@gmail.com"
firstName
"Thoran"
fullName
"Thoran Chandra Muvvala"
lastName
"Muvvala"
middleName
"Chandra"
mobileNumber
"9888888888"

pan
Object
name
""
number
""
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that extracts structured data from text."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return response["choices"][0]["message"]["content"]

@app.route('/api/process-image', methods=['POST'])
def handle_ocr():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        # Process the image
        extracted_text = process_image(image_file)
        
        # Send extracted text to ChatGPT API
        structured_data = send_to_chatgpt(extracted_text)
        
        return jsonify({
            'text': extracted_text,
            'structured_data': structured_data,
            'success': True
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
