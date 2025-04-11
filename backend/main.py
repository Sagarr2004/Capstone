import os
import fitz
import google.generativeai as genai
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List

# Initialize FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adjust this to match your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API
API_KEY = "AIzaSyB82XqWeacZ3WSvx8xTcHqKXbi-uZT6kIQ"
genai.configure(api_key=API_KEY)

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extracts text from a PDF file using pymupdf (fitz)."""
    text = ""
    try:
        doc = fitz.open(pdf_path)
        for page in doc:
            text += page.get_text("text") + "\n"
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}")
    return text.strip()

def get_gemini_response(text: str, jd: str) -> str:
    """Generate a job matching percentage using Gemini API."""
    input_prompt = f'''
    Evaluate the provided resume against the job description to determine the percentage of required skills and experience that are demonstrably present in the resume.
    Identify the core industry keywords and essential expertise outlined in the job description. For each key requirement in the job description, assess whether there is clear and direct evidence of that skill or experience in the resume.
    Calculate the percentage match based on the proportion of essential job requirements that are explicitly supported by the content of the resume. If a significant number of core requirements are absent, the percentage match should reflect this lack of alignment accurately and should not default to a moderate or high score.
    Output strictly as a single numerical percentage (e.g., 32%) with no additional text or explanation.
    Resume Text: {text}
    Job Description: {jd}
    '''

    model = genai.GenerativeModel('models/gemini-1.5-pro-latest')
    response = model.generate_content(input_prompt)
    return response.text.strip()

@app.post("/upload")
async def upload_resumes(job_description: str = Form(...), files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        file_path = f"temp_{file.filename}"
        try:
            with open(file_path, "wb") as f:
                f.write(await file.read())

            resume_text = extract_text_from_pdf(file_path)
            match_score = get_gemini_response(resume_text, job_description) if resume_text else "0%"
            try:
                match_score = float(match_score.replace('%', ''))
            except ValueError:
                match_score = 0
            results.append({"filename": file.filename, "match_score": match_score})
        except Exception as e:
            print(f"Error processing {file.filename}: {e}")
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)
    
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return {"ranked_resumes": results}

import uvicorn

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)