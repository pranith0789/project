# from fastapi import FastAPI, File, UploadFile, HTTPException
# import os
# import fitz  # PyMuPDF
# import magic
# from transformers import pipeline, AutoTokenizer, AutoModelForTokenClassification

# app = FastAPI()

# # Load NER model
# model_name = "d4data/biomedical-ner-all"
# tokenizer = AutoTokenizer.from_pretrained(model_name)
# model = AutoModelForTokenClassification.from_pretrained(model_name)
# ner_pipeline = pipeline("ner", model=model, tokenizer=tokenizer)

# ALLOWED_MIME_TYPES = ["application/pdf"]

# # Function to extract text from PDF
# def extract_text_from_pdf(file_path):
#     try:
#         doc = fitz.open(file_path)
#         return "\n".join([page.get_text("text") for page in doc if page.get_text("text")])
#     except Exception as e:
#         print(f"❌ Error reading PDF: {e}")
#         return ""

# # Function to detect COVID-positive terms & medical terms
# def detect_covid_and_medical_terms(text):
#     ner_results = ner_pipeline(text)
#     covid_keywords = {"covid", "positive", "sars-cov-2", "coronavirus", "infected"}

#     medical_terms = set()  # To store any detected medical terms
#     is_covid_positive = False

#     for entity in ner_results:
#         word = entity["word"].lower()
#         medical_terms.add(word)  # Store all medical terms

#         # Check for COVID positivity
#         if any(keyword in word for keyword in covid_keywords):
#             is_covid_positive = True

#     if not medical_terms:  # If no medical terms were found
#         return None  

#     return "COVID Positive" if is_covid_positive else "COVID Negative"

# @app.post("/search-medical-terms")
# async def search_medical_terms(file: UploadFile = File(...)):
#     file_path = f"temp_{file.filename}"

#     try:
#         with open(file_path, "wb") as buffer:
#             buffer.write(await file.read())

#         mime = magic.Magic(mime=True)
#         detected_mime_type = mime.from_file(file_path)

#         if detected_mime_type not in ALLOWED_MIME_TYPES:
#             os.remove(file_path)
#             raise HTTPException(status_code=400, detail="Unsupported file type. Only PDFs allowed.")

#         text = extract_text_from_pdf(file_path)
#         os.remove(file_path)

#         if not text.strip():
#             return {"status": "error", "message": "No readable text found in the document."}

#         result = detect_covid_and_medical_terms(text)

#         if result is None:
#             return {"status": "error", "message": "Invalid file type"}  # No medical terms found

#         return {"status": "success", "result": result}  # Return COVID Positive or Negative

#     except Exception as e:
#         if os.path.exists(file_path):
#             os.remove(file_path)
#         print(f"❌ Error processing file: {e}")
#         raise HTTPException(status_code=500, detail="Internal server error.")

from fastapi import FastAPI, File, UploadFile, HTTPException
import os
import fitz  # PyMuPDF
import magic
import io
from PIL import Image
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from transformers import pipeline, AutoTokenizer, AutoModelForTokenClassification

app = FastAPI()

# Load NER model
model_name = "d4data/biomedical-ner-all"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForTokenClassification.from_pretrained(model_name)
ner_pipeline = pipeline("ner", model=model, tokenizer=tokenizer)
summarizer = pipeline("summarization", model="t5-small")
# Load CNN Model for Image Classification
try:
    cnn_model = load_model("../cnn_covid_model.h5")
    print("✅ CNN Model loaded successfully!")
except Exception as e:
    print(f"❌ CNN Model load failed: {e}")
    cnn_model = None

ALLOWED_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"]
IMG_SIZE = (224, 224)

# Function to extract text from PDF
def extract_text_from_pdf(file_path):
    try:
        doc = fitz.open(file_path)
        return "\n".join([page.get_text("text") for page in doc if page.get_text("text")])
    except Exception as e:
        print(f"❌ Error reading PDF: {e}")
        return ""

# Function to detect COVID-positive terms & medical terms in PDFs
def detect_covid_and_medical_terms(text):
    max_chunk_length = 400  # Keep chunks under 512 tokens
    covid_keywords = {"covid", "positive", "sars-cov-2", "coronavirus", "infected"}
    medical_terms = set()
    is_covid_positive = False

    # Split text into smaller chunks while keeping words intact
    words = text.split()  
    chunks = [" ".join(words[i:i + max_chunk_length]) for i in range(0, len(words), max_chunk_length)]

    for chunk in chunks:
        ner_results = ner_pipeline(chunk)  # Process chunk separately

        for entity in ner_results:
            word = entity["word"].lower()
            medical_terms.add(word)
            if any(keyword in word for keyword in covid_keywords):
                is_covid_positive = True

    return "COVID Positive" if is_covid_positive else "COVID Negative" if medical_terms else None



# Function to predict COVID status from an image
def predict_image(image_bytes):
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img = img.resize(IMG_SIZE)
        img_array = img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        if cnn_model is None:
            raise RuntimeError("CNN Model not loaded.")

        prediction = cnn_model.predict(img_array)[0][0]
        class_label = "COVID Positive" if prediction > 0.5 else "COVID Negative"

        return {"status": "success", "result": class_label, "confidence": float(prediction)}

    except Exception as e:
        return {"status": "error", "message": f"Prediction failed: {str(e)}"}
    

def summarize_pdf(text):
    max_chunk_length = 400  # Limit token count below 512
    overlap = 50  # Overlapping context

    # Tokenize the text while ensuring it doesn't exceed the limit
    tokens = tokenizer(text, return_tensors="pt", truncation=False)["input_ids"][0].tolist()
    
    chunks = [tokens[i:i + max_chunk_length] for i in range(0, len(tokens), max_chunk_length - overlap)]

    summaries = []
    for chunk in chunks:
        chunk_text = tokenizer.decode(chunk, skip_special_tokens=True)
        
        # Ensure summarizer doesn't process text beyond limit
        short_text = text[:1000]  # Process only the first 1000 characters
        summary = summarizer(short_text, max_length=200, min_length=50, do_sample=False, truncation=True)

        summaries.append(summary[0]['summary_text'])

    return " ".join(summaries)  # Combine summarized chunks

@app.post("/search-medical-terms")
async def search_medical_terms(file: UploadFile = File(...)):
    file_path = f"temp_{file.filename}"

    try:
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        mime = magic.Magic(mime=True)
        detected_mime_type = mime.from_file(file_path)

        if detected_mime_type not in ALLOWED_MIME_TYPES:
            os.remove(file_path)
            raise HTTPException(status_code=400, detail="Unsupported file type. Only PDFs and images are allowed.")

        if detected_mime_type == "application/pdf":
            # Process PDF as before
            text = extract_text_from_pdf(file_path)
            os.remove(file_path)

            if not text.strip():
                return {"status": "error", "message": "No readable text found in the document."}

            result = detect_covid_and_medical_terms(text)
            summary = summarizer(text)
            if result is None:
                return {"status": "error", "message": "No medical terms found.","summary":summary[0]["summary_text"]}

            return {"status": "success", "result": result}

        else:  # Process Image for CNN Classification
            with open(file_path, "rb") as image_file:
                image_bytes = image_file.read()
            os.remove(file_path)

            return predict_image(image_bytes)

    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        print(f"❌ Error processing file: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")
