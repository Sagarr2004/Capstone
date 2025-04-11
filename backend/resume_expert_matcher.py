# import os
# import re
# import torch
# import spacy
# import pytesseract
# import platform
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from pdf2image import convert_from_path
# from pdfminer.high_level import extract_text
# from transformers import pipeline
# from sentence_transformers import SentenceTransformer, util
# from thefuzz import fuzz
# from typing import List
# import requests
# import tempfile


# # Optional paths
# # Uncomment if needed
# # pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
# POPPLER_PATH = r"C:\path\to\poppler\bin" if platform.system() == "Windows" else None

# # Initialize models
# print("Loading NLP models...")
# nlp = spacy.load("en_core_web_sm")
# skill_ner = pipeline(
#     "ner",
#     model="dslim/bert-base-NER",
#     aggregation_strategy="simple",
#     device=0 if torch.cuda.is_available() else -1
# )
# sim_model = SentenceTransformer('all-MiniLM-L6-v2')

# interviewers = [
#     ["Priya_Sharma", ["JavaScript", "React", "HTML/CSS", "RESTful APIs", "MongoDB", "Jest"]],
#     ["Rahul_Mehta", ["GCP", "Azure", "CI/CD", "Kubernetes", "Google Cloud Armor", "Terraform"]],
#     ["Ananya_Patel", ["C++", "Python", "JavaScript", "React", "MongoDB", "SQL", "Docker"]],
#     ["Vikram_Joshi", ["Python", "GCP", "Microservices", "Performance Tuning", "SQL", "Apache JMeter"]],
#     ["Neha_Gupta", ["JavaScript", "React", "HTML/CSS", "Agile Methodologies", "Jenkins", "CI/CD"]],
#     ["Arjun_Reddy", ["Azure", "GCP", "Serverless", "CI/CD Pipelines", "Cloud Cost Optimization", "Istio"]],
#     ["Sanya_Malhotra", ["Python", "C++", "MongoDB", "SQL", "React", "AWS Lambda", "API Gateway"]],
#     ["Aditya_Iyer", ["CI/CD", "Docker", "Kubernetes", "Cloud Armor", "Wireshark", "Bash Scripting"]],
#     ["Kavya_Singh", ["JavaScript", "React", "JMeter", "Lighthouse", "REST APIs", "Selenium", "git", "github"]],
#     ["Rohan_Desai", ["C++", "Python", "Microservices", "SQL", "Google Cloud Functions", "Distributed Systems"]]
# ]

# skill_contexts = [
#     "skills include", "proficient in", "experienced with", "technical skills",
#     "worked with", "knowledge of", "familiar with", "expertise in", "technologies used",
#     "programming languages", "tools and technologies", "skills", "key competencies"
# ]
# context_embeddings = sim_model.encode(skill_contexts)

# # === Helper Functions ===
# def extract_text_with_ocr(pdf_path: str) -> str:
#     try:
#         text = extract_text(pdf_path)
#         if len(text.split()) > 150:
#             return text
#         images = convert_from_path(pdf_path, dpi=300, poppler_path=POPPLER_PATH)
#         full_text = ""
#         for img in images:
#             img = img.convert('L')
#             img = img.point(lambda x: 0 if x < 140 else 255)
#             text = pytesseract.image_to_string(img)
#             full_text += text + "\n"
#         return full_text
#     except Exception as e:
#         print(f"OCR/Extraction error: {e}")
#         return ""

# def safe_regex_search(pattern: str, text: str) -> bool:
#     try:
#         return bool(re.search(pattern, text, re.IGNORECASE))
#     except:
#         return False

# def is_valid_skill(text: str, skill: str) -> bool:
#     try:
#         doc = nlp(text)
#         sentences = [
#             sent.text for sent in doc.sents
#             if skill.lower() in sent.text.lower() and len(sent.text.split()) < 50
#         ]
#         if not sentences:
#             return False
#         sentence_embeds = sim_model.encode(sentences)
#         similarities = util.pytorch_cos_sim(sentence_embeds, context_embeddings)
#         max_similarity = torch.max(similarities).item()
#         is_standalone = safe_regex_search(r'\b' + re.escape(skill) + r'\b', text)
#         not_part_of_word = not safe_regex_search(r'\w' + re.escape(skill) + r'\w', text)
#         return max_similarity > 0.65 and is_standalone and not_part_of_word
#     except Exception as e:
#         print(f"Context validation error for '{skill}': {e}")
#         return False

# def extract_skills_safely(text: str) -> List[str]:
#     skills = set()
#     try:
#         section_patterns = [
#             r'(?i)(?:SKILLS|TECHNICAL SKILLS)[\s:-]*(.+?)(?:\n\n|\Z|EDUCATION|WORK)',
#             r'(?i)(?:SKILLS|TECHNICAL SKILLS)[\s:-]*(.+?)(?:\n\n|\Z)'
#         ]
#         for pattern in section_patterns:
#             match = re.search(pattern, text, re.DOTALL)
#             if match:
#                 skills_section = match.group(1)
#                 parts = re.split(r'[\n•\-*,;]', skills_section)
#                 for part in parts:
#                     part = re.sub(r'\([^)]*\)', '', part).strip()
#                     if part and 1 < len(part) < 30:
#                         skills.add(part)
#     except Exception as e:
#         print(f"Skills section error: {e}")

#     tech_keywords = {
#         'python', 'javascript', 'java', 'c++', 'c#', 'html', 'css',
#         'react', 'angular', 'vue', 'node', 'express', 'django', 'flask',
#         'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins',
#         'git', 'mysql', 'mongodb', 'postgresql', 'sql', 'nosql', 'apache hadoop',
#         'prometheus', 'computer networks', 'oops', 'data structures and algorithms',
#         'dsa', 'tailwind', 'tailwind css', 'CI/CD pipelines', 'CI/CD',
#         'REST API', 'restFul api', 'microservices', 'distributed systems', 'jmeter'
#     }

#     for tech in tech_keywords:
#         if safe_regex_search(r'\b' + tech + r'\b', text):
#             skills.add(tech)

#     try:
#         entities = skill_ner(text)
#         for entity in entities:
#             if entity['entity_group'] in ['ORG', 'MISC', 'PRODUCT'] and 2 < len(entity['word']) < 25:
#                 skill = re.sub(r'^\W+|\W+$', '', entity['word'].strip())
#                 if skill and is_valid_skill(text, skill):
#                     skills.add(skill)
#     except Exception as e:
#         print(f"NER error: {e}")

#     return sorted(skills)

# def fuzzy_match(skills1, skills2):
#     set1 = set(str(skill).lower().strip() for skill in skills1)
#     set2 = set(str(skill).lower().strip() for skill in skills2)
#     matched = sum(
#         1 for skill1 in set1
#         if max([fuzz.ratio(skill1, skill2) for skill2 in set2], default=0) >= 70
#     )
#     return (matched / len(set1)) * 100 if set1 else 0

# def calculate_expert_scores(jd_skills, resume_skills):
#     expert_scores = []
#     for expert_name, expert_skills in interviewers:
#         profile_score = fuzzy_match(expert_skills, jd_skills)
#         matching_score = fuzzy_match(expert_skills, resume_skills)
#         relevancy_score = (profile_score + matching_score) / 2
#         expert_scores.append((expert_name, relevancy_score))
#     expert_scores.sort(key=lambda x: x[1], reverse=True)
#     return expert_scores

# # === Flask API ===
# app = Flask(__name__)
# CORS(app)  # Enable CORS for frontend requests

# @app.route("/match-from-url", methods=["POST"])
# def match_from_url():
#     data = request.get_json()
#     resume_url = data.get("resume_url")
#     jd_text = data.get("jd")

#     if not resume_url or not jd_text:
#         return jsonify({"error": "Missing resume_url or job description"}), 400

#     try:
#         # Download the PDF file from Cloudinary
#         response = requests.get(resume_url)
#         if response.status_code != 200:
#             return jsonify({"error": "Failed to download resume"}), 500

#         # Save the file temporarily
#         with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_file:
#             tmp_file.write(response.content)
#             resume_path = tmp_file.name

#         # Call existing functions
#         resume_text = extract_text_with_ocr(resume_path)
#         resume_skills = extract_skills_safely(resume_text)
#         jd_skills = extract_skills_safely(jd_text)
#         expert_ranking = calculate_expert_scores(jd_skills, resume_skills)

#         result = [{"name": name, "score": round(score, 1)} for name, score in expert_ranking]
#         return jsonify(result)

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
    

# if __name__ == "__main__":
#     app.run(port=5000)



import os
import tempfile
import requests
import PyPDF2
import pytesseract
from PIL import Image
from pdf2image import convert_from_path
from flask import Flask, request, jsonify
from fuzzywuzzy import fuzz
import spacy
from transformers import pipeline
import re
from flask_cors import CORS
import json
import platform

app = Flask(__name__)
CORS(app)

# Platform-aware poppler path setup
POPPLER_PATH = None
if platform.system() == "Windows":
    POPPLER_PATH = r"C:\poppler\Library\bin"  # Change this to your actual poppler path
    os.environ["PATH"] += os.pathsep + POPPLER_PATH  # Add to PATH just in case

# Load SpaCy and BERT models
spacy_model = spacy.load("en_core_web_sm")
ner_pipeline = pipeline("ner", model="dslim/bert-base-NER", grouped_entities=True)

interviewers = []

# Extract text using OCR
def extract_text_with_ocr(pdf_path):
    try:
        if POPPLER_PATH:
            images = convert_from_path(pdf_path, poppler_path=POPPLER_PATH)
        else:
            images = convert_from_path(pdf_path)
    except Exception as e:
        print("OCR conversion failed:", e)
        return ""

    text = ""
    for img in images:
        text += pytesseract.image_to_string(img)
    return text

# Extract text from PDFs using PyPDF2
def extract_text_from_pdf(pdf_path):
    with open(pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        return "".join([page.extract_text() or "" for page in reader.pages])

# Extract skills using regex, SpaCy, and BERT
def extract_skills_safely(text):
    skills = set()

    # Regex-based tech skills
    tech_skills = re.findall(
        r"\b(Python|Java|C\+\+|JavaScript|React|Node|Flask|Django|SQL|MongoDB|AWS|Azure|Kubernetes|Docker)\b",
        text, re.IGNORECASE
    )
    skills.update([skill.lower() for skill in tech_skills])

    # SpaCy NER
    doc = spacy_model(text)
    for ent in doc.ents:
        if ent.label_ in ["ORG", "PRODUCT", "SKILL"]:
            skills.add(ent.text.lower())

    # BERT NER
    bert_ents = ner_pipeline(text)
    for ent in bert_ents:
        if ent["entity_group"] in ["ORG", "MISC", "PER"]:
            skills.add(ent["word"].lower())

    return list(skills)

# Fuzzy match between two skill lists
def fuzzy_match(list1, list2):
    matches = []
    for item1 in list1:
        for item2 in list2:
            score = fuzz.ratio(item1.lower(), item2.lower())
            if score > 80:
                matches.append((item1, item2, score))
    return len(matches) / max(len(list1), 1) * 100

# Scoring logic for matching experts
def calculate_expert_scores(jd_skills, resume_skills):
    expert_scores = []
    for expert_name, expert_skills in interviewers:
        profile_score = fuzzy_match(expert_skills, jd_skills)
        matching_score = fuzzy_match(expert_skills, resume_skills)
        relevancy_score = round((0.4 * profile_score) + (0.6 * matching_score), 2)

        expert_scores.append({
            "name": expert_name,
            "score": relevancy_score
        })
    return sorted(expert_scores, key=lambda x: x["score"], reverse=True)

# Optional route for testing upload
@app.route("/upload", methods=["POST"])
def upload_resume():
    file = request.files.get("resume")
    if not file:
        return jsonify({"error": "No file provided"}), 400
    return jsonify({"message": "Upload successful"}), 200

# Main matching endpoint (React → Flask)
@app.route("/match", methods=["POST"])
def match():
    try:
        file = request.files["resume"]
        jd_text = request.form["jd"]
        experts_from_express = request.form.get("experts", "[]")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            file.save(tmp_file.name)
            tmp_path = tmp_file.name

        resume_text = extract_text_with_ocr(tmp_path)
        resume_skills = extract_skills_safely(resume_text)
        jd_skills = extract_skills_safely(jd_text)

        global interviewers
        experts = json.loads(experts_from_express)
        interviewers = [(expert["name"], expert["skills"]) for expert in experts]

        scores = calculate_expert_scores(jd_skills, resume_skills)
        return jsonify(scores)

    except Exception as e:
        print("Error in /match:", e)
        return jsonify({"error": str(e)}), 500

# Match from resume URL
@app.route("/match-from-url", methods=["POST"])
def match_from_url():
    try:
        data = request.json
        resume_url = data.get("resume_url")
        jd_text = data.get("jd")
        experts_from_express = data.get("experts", [])

        if not resume_url or not jd_text:
            return jsonify({"error": "Missing resume URL or JD"}), 400

        # Download resume
        response = requests.get(resume_url)
        if response.status_code != 200:
            print("Failed to download resume:", response.status_code)
            return jsonify({"error": "Resume download failed"}), 400

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(response.content)
            tmp_path = tmp_file.name

        resume_text = extract_text_with_ocr(tmp_path)
        resume_skills = extract_skills_safely(resume_text)
        jd_skills = extract_skills_safely(jd_text)

        global interviewers
        interviewers = [(expert["name"], expert["skills"]) for expert in experts_from_express]

        scores = calculate_expert_scores(jd_skills, resume_skills)
        return jsonify(scores)

    except Exception as e:
        print("Error in /match-from-url:", str(e))
        return jsonify({"error": str(e)}), 500

# Run the app
if __name__ == "__main__":
    app.run(debug=True)
