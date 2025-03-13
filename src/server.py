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
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to specific frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load NER model
model_name = "d4data/biomedical-ner-all"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForTokenClassification.from_pretrained(model_name)
ner_pipeline = pipeline("ner", model=model, tokenizer=tokenizer)

# Load Summarization Model
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
        text = "\n".join([page.get_text("text") for page in doc if page.get_text("text")])
        print(f"📄 Extracted Text: {text[:500]}...")  # Print first 500 chars for debugging
        return text
    except Exception as e:
        print(f"❌ Error reading PDF: {e}")
        return ""

# Function to detect COVID-positive terms & medical terms in PDFs
def detect_covid_and_medical_terms(text):
    covid_keywords = {"covid", "positive", "sars-cov-2", "coronavirus", "infected"}
    medical_terms = set()
    is_covid_positive = False

    words = text.split()  
    max_chunk_length = 400
    chunks = [" ".join(words[i:i + max_chunk_length]) for i in range(0, len(words), max_chunk_length)]

    for chunk in chunks:
        ner_results = ner_pipeline(chunk)
        for entity in ner_results:
            word = entity["word"].lower()
            medical_terms.add(word)
            if any(keyword in word for keyword in covid_keywords):
                is_covid_positive = True

    print(f"🩺 Detected Medical Terms: {medical_terms}")
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

        print(f"🖼️ Image Prediction: {class_label} (Confidence: {prediction:.2f})")
        return {"status": "success", "result": class_label, "confidence": float(prediction)}

    except Exception as e:
        return {"status": "error", "message": f"Prediction failed: {str(e)}"}

# Function to generate structured summary
def structured_summary(text):
    summary = summarizer(text, max_length=200, min_length=50, do_sample=False, truncation=True)[0]["summary_text"]
    print(f"✅ Final Summary: {summary}")  # Console Log

    structured_data = {
        "Patient Information": {"Name": None, "Age": None, "Gender": None, "Ethnicity": None},
        "Medical & Psychological History": {
            "Psychiatric Conditions": [],
            "Physical Appearance": {"Hair": None, "Height": None, "Weight": None, "Grooming": None}
        },
        "Personal & Social Background": {"Marital Status": None, "Past Relationships": []}
    }

    words = summary.split()
    for i, word in enumerate(words):
        if word.lower() in ["name:", "patient:", "mr.", "ms.", "mrs."]:
            structured_data["Patient Information"]["Name"] = words[i + 1] + " " + words[i + 2]
        if word.lower() == "age:":
            structured_data["Patient Information"]["Age"] = words[i + 1]
        if word.lower() in ["male", "female"]:
            structured_data["Patient Information"]["Gender"] = word
        if "depressive" in word.lower() or "ptsd" in word.lower():
            structured_data["Medical & Psychological History"]["Psychiatric Conditions"].append(word)
        if word.lower() == "height:":
            structured_data["Medical & Psychological History"]["Physical Appearance"]["Height"] = words[i + 1]
        if word.lower() == "weight:":
            structured_data["Medical & Psychological History"]["Physical Appearance"]["Weight"] = words[i + 1]
        if word.lower() == "groomed" or word.lower() == "disheveled":
            structured_data["Medical & Psychological History"]["Physical Appearance"]["Grooming"] = word
        if word.lower() == "married" or word.lower() == "divorced":
            structured_data["Personal & Social Background"]["Marital Status"] = word
        if "abuse" in word.lower():
            structured_data["Personal & Social Background"]["Past Relationships"].append("Experienced physical abuse")

    print(f"📝 Structured Summary: {structured_data}")
    return structured_data

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
            text = extract_text_from_pdf(file_path)
            os.remove(file_path)

            if not text.strip():
                return {"status": "error", "message": "No readable text found in the document."}

            result = detect_covid_and_medical_terms(text)
            summary = summarizer(text, max_length=200, min_length=50, do_sample=False, truncation=True)[0]["summary_text"]
            structured_data = structured_summary(text)


            if result is None:
                return {"status": "error", "message": "No medical terms found.", "structured_summary": structured_data}

            return {"status": "success", "result": result, "summary": summary, "structured_summary": structured_data}


        else:
            with open(file_path, "rb") as image_file:
                image_bytes = image_file.read()
            os.remove(file_path)

            prediction_result = predict_image(image_bytes)
    
            return {
                "status": prediction_result["status"],
                "result": prediction_result["result"],
                "confidence": prediction_result.get("confidence", None)  # No summary for images
            }

    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        print(f"❌ Error processing file: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")
    
@app.post("/process-image")
async def process_image(file: UploadFile = File(...)):
    print(f"Received file: {file.filename}")  # Debugging
    return {"message": "File received"}


