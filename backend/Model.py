import os
import re
import torch
import spacy
import pytesseract
import tempfile
import urllib.request
from typing import List
from werkzeug.utils import secure_filename
from uuid import uuid4
from flask import Flask, request, jsonify
from flask_cors import CORS
from pdf2image import convert_from_path
from pdfminer.high_level import extract_text
from transformers import pipeline
from sentence_transformers import SentenceTransformer, util
from fuzzywuzzy import fuzz

# Suppress warnings and configure environment
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
import warnings
warnings.filterwarnings('ignore')

# Initialize Flask app with CORS
app = Flask(__name__)
CORS(app, resources={
    r"/match-from-url": {"origins": "http://localhost:5173"},
    r"/upload": {"origins": "http://localhost:5173"}
})

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'pdf'}
app.config['SKILL_EXTRACTION_TIMEOUT'] = 60  # seconds

# Initialize models
# print("Loading NLP models...")
nlp = spacy.load("en_core_web_sm")
skill_ner = pipeline(
    "ner",
    model="dslim/bert-base-NER",
    aggregation_strategy="simple",
    device=0 if torch.cuda.is_available() else -1
)
sim_model = SentenceTransformer('all-MiniLM-L6-v2')

# Skill context patterns for validation
SKILL_CONTEXTS = [
    "skills include", "proficient in", "experienced with",
    "technical skills", "worked with", "knowledge of",
    "familiar with", "expertise in", "technologies used",
    "programming languages", "tools and technologies", "skills"
]
context_embeddings = sim_model.encode(SKILL_CONTEXTS)

TECH_KEYWORDS = {
     'python', 'javascript', 'java', 'c++', 'c#', 'html', 'css',
        'react', 'angular', 'vue', 'node', 'express', 'django', 'flask',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins',
        'git', 'mysql', 'mongodb', 'postgresql', 'sql', 'nosql','apache hadoop',
        'prometheus','computer networks','oop','oops','data structures and algorithms',
        'dsa','data structures & algorithms','tailwind','tailwind css', 'CI/CD pipelines',
        'CI/CD', 'REST API', 'restFul api', 'microservices', 'distributed systems','jmeter'
}

# Helper Functions
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def extract_text_with_ocr(pdf_path: str) -> str:
    """Extract text from PDF with OCR fallback"""
    try:
        # First try direct text extraction
        text = extract_text(pdf_path)
        if len(text.split()) > 100:  # Minimum reasonable text length
            return text

        # Fallback to OCR
        images = convert_from_path(pdf_path, dpi=300)
        full_text = ""
        for img in images:
            img = img.convert('L')  # Grayscale
            img = img.point(lambda x: 0 if x < 140 else 255)  # Threshold
            text = pytesseract.image_to_string(img)
            full_text += text + "\n"
        return full_text

    except Exception as e:
        print(f"Extraction error: {str(e)}")
        return ""

def is_valid_skill(text: str, skill: str) -> bool:
    """Validate if skill appears in proper context"""
    try:
        doc = nlp(text)
        sentences = [sent.text for sent in doc.sents 
                    if skill.lower() in sent.text.lower() 
                    and len(sent.text.split()) < 50]
        
        if not sentences:
            return False

        sentence_embeds = sim_model.encode(sentences)
        similarities = util.pytorch_cos_sim(sentence_embeds, context_embeddings)
        max_similarity = torch.max(similarities).item()

        # Check word boundaries
        pattern = r'(?<!\w)' + re.escape(skill) + r'(?!\w)'
        is_standalone = bool(re.search(pattern, text, re.IGNORECASE))

        return max_similarity > 0.65 and is_standalone
    except Exception as e:
        print(f"Skill validation error: {str(e)}")
        return False

def extract_skills(text: str) -> List[str]:
    """Extract skills using multiple methods"""
    skills = set()

    # Method 1: Skills section extraction
    try:
        for pattern in [
            r'(?i)(?:skills|technical skills)[\s:-]*(.+?)(?:\n\n|\Z|experience|education)',
            r'(?i)(?:competencies|expertise)[\s:-]*(.+?)(?:\n\n|\Z)'
        ]:
            if match := re.search(pattern, text, re.DOTALL):
                parts = re.split(r'[\n•\-*,;]', match.group(1))
                for part in parts:
                    part = re.sub(r'\([^)]*\)', '', part).strip()
                    if 1 < len(part) < 30 and not part.isnumeric():
                        skills.add(part.lower())
    except Exception as e:
        print(f"Skills section error: {str(e)}")

    # Method 2: Keyword matching
    for tech in TECH_KEYWORDS:
        if re.search(r'\b' + re.escape(tech) + r'\b', text, re.IGNORECASE):
            skills.add(tech)

    # Method 3: NER extraction
    try:
        for entity in skill_ner(text):
            if entity['entity_group'] in ['ORG', 'MISC', 'PRODUCT'] and 2 < len(entity['word']) < 25:
                skill = entity['word'].strip().lower()
                skill = re.sub(r'^\W+|\W+$', '', skill)
                if skill and is_valid_skill(text, skill):
                    skills.add(skill)
    except Exception as e:
        print(f"NER error: {str(e)}")

    return sorted(skills)

def calculate_match(skills1: List[str], skills2: List[str]) -> float:
    """Calculate fuzzy match percentage between skill sets"""
    if not skills1 or not skills2:
        return 0.0

    set1 = {s.lower().strip() for s in skills1}
    set2 = {s.lower().strip() for s in skills2}
    
    matched = sum(
        1 for s1 in set1 
        if max([fuzz.ratio(s1, s2) for s2 in set2] + [0]) >= 50
    )
    return (matched / len(set1)) * 100

# API Endpoints
@app.route('/match-from-url', methods=['POST'])
def match_from_url():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
            
        # print("Received data:", data)  # Debug logging
        
        if 'resume_url' not in data:
            return jsonify({"error": "Missing resume_url"}), 400
        if 'jd' not in data:
            return jsonify({"error": "Missing job description"}), 400
        if 'experts' not in data:
            return jsonify({"error": "Missing experts data"}), 400

        # Download resume
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
                print(f"Downloading resume from {data['resume_url']}")  # Debug
                urllib.request.urlretrieve(data['resume_url'], tmp.name)
                resume_path = tmp.name
        except Exception as e:
            return jsonify({"error": f"Failed to download resume: {str(e)}"}), 400

        # Process resume
        try:
            # print("Extracting text from resume...")  # Debug
            resume_text = extract_text_with_ocr(resume_path)
            if not resume_text:
                return jsonify({"error": "Failed to extract text from resume"}), 400
                
            # print("Extracting skills from resume...")  # Debug
            resume_skills = extract_skills(resume_text)
        except Exception as e:
            return jsonify({"error": f"Resume processing failed: {str(e)}"}), 500
        finally:
            if os.path.exists(resume_path):
                os.remove(resume_path)

        # Process job description
        try:
            #print("Extracting skills from JD...")  # Debug
            jd_skills = extract_skills(data['jd'])
            print(jd_skills)
        except Exception as e:
            return jsonify({"error": f"JD processing failed: {str(e)}"}), 400

        # Calculate matches
        try:
            print("Calculating matches...")  # Debug
            results = []
            for expert in data['experts']:
                if not expert.get('skills'):
                    continue
                    
                profile_score = calculate_match(expert['skills'], jd_skills)
                # print("Profile Score:")
                # print(profile_score)
                print(f"Profile score for {expert.get('name', 'Unknown')}: {profile_score}%")
                resume_score = calculate_match(expert['skills'], resume_skills)
                print("resume Score:")
                print(resume_score)
                print("ResumeSkills: ")
                print(resume_skills)
                avg_score = (profile_score + resume_score) / 2
                
                results.append({
                    "name": expert.get('name', 'Unknown'),
                    "score": round(avg_score, 1),
                    "profile_match": round(profile_score, 1),
                    "resume_match": round(resume_score, 1)
                })

            return jsonify(sorted(results, key=lambda x: x['score'], reverse=True))

        except Exception as e:
            return jsonify({"error": f"Matching calculation failed: {str(e)}"}), 500

    except Exception as e:
        return jsonify({"error": f"Unexpected server error: {str(e)}"}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    """Endpoint for file upload processing"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "Empty filename"}), 400

        if file and allowed_file(file.filename):
            # Save file with unique name
            filename = f"{uuid4().hex}_{secure_filename(file.filename)}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            file.save(filepath)

            # Process file
            text = extract_text_with_ocr(filepath)
            skills = extract_skills(text) if text else []
            os.remove(filepath)

            return jsonify({
                "success": True,
                "skills": skills,
                "text": text[:5000]  # Return first 5000 chars
            })

        return jsonify({"error": "Invalid file type"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "models_loaded": True,
        "ready": True
    })

if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(host='0.0.0.0', port=5000, threaded=True)