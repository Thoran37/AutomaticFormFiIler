from pdf2image import convert_from_path
import pytesseract
import os

# Set up the path to your Tesseract executable
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Path to Poppler bin directory
POPPLER_PATH = r'C:\Users\91984\Downloads\Release-24.08.0-0\poppler-24.08.0\Library\bin'

def extract_text_from_pdf(pdf_path):
    try:
        # Convert PDF to a list of images
        images = convert_from_path(pdf_path, poppler_path=POPPLER_PATH)
        extracted_text = []

        # Iterate through images and extract text
        for i, image in enumerate(images):
            try:
                text = pytesseract.image_to_string(image)
                extracted_text.append(text)
            except Exception as e:
                print(f"Error extracting text from page {i + 1}: {e}")

        return extracted_text
    
    except FileNotFoundError:
        print(f"Error: PDF file not found at path: {pdf_path}")
        return []
    except Exception as e:
        print(f"Error converting PDF to images: {e}")
        return []

def save_text_to_file(text_list, output_file):
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            for page_num, page_text in enumerate(text_list):
                f.write(f"Page {page_num + 1}\n")
                f.write(page_text)
                f.write('\n' + '-' * 50 + '\n')
        print(f"Text extracted and saved to {output_file}")
    except Exception as e:
        print(f"Error saving text to file: {e}")

if __name__ == '__main__':
    pdf_path = r"C:\Users\91984\Downloads\SAHITH CV.pdf"  # Specify your PDF file path here
    output_file = 'extracted_text.txt'

    # Extract text from the PDF
    text_list = extract_text_from_pdf(pdf_path)

    # Save the extracted text to a file
    if text_list:
        save_text_to_file(text_list, output_file)
