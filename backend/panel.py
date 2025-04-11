from flask import Flask, request, jsonify
from flask_cors import CORS
from fuzzywuzzy import fuzz

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

def fuzzy_match(resume_skills, jd_skills):
    resume_set = set(str(skill).lower().strip() for skill in resume_skills)
    jd_set = set(str(skill).lower().strip() for skill in jd_skills)
    matched = sum(
        max(fuzz.ratio(jd_skill, rs) for rs in resume_set) >= 70 for jd_skill in jd_set
    )
    return (matched / len(jd_set)) * 100 if jd_set else 0

interviewers = [
    ["Priya_Sharma", ["JavaScript", "React", "HTML/CSS", "RESTful APIs", "MongoDB", "Jest"]],
    ["Rahul_Mehta", ["GCP", "Azure", "CI/CD", "Kubernetes", "Google Cloud Armor", "Terraform"]],
    ["Ananya_Patel", ["C++", "Python", "JavaScript", "React", "MongoDB", "SQL", "Docker"]],
    ["Vikram_Joshi", ["Python", "GCP", "Microservices", "Performance Tuning", "SQL", "Apache JMeter"]],
    ["Neha_Gupta", ["JavaScript", "React", "HTML/CSS", "Agile Methodologies", "Jenkins", "CI/CD"]],
    ["Arjun_Reddy", ["Azure", "GCP", "Serverless", "CI/CD Pipelines", "Cloud Cost Optimization", "Istio"]],
    ["Sanya_Malhotra", ["Python", "C++", "MongoDB", "SQL", "React", "AWS Lambda", "API Gateway"]],
    ["Aditya_Iyer", ["CI/CD", "Docker", "Kubernetes", "Cloud Armor", "Wireshark", "Bash Scripting"]],
    ["Kavya_Singh", ["JavaScript", "React", "JMeter", "Lighthouse", "REST APIs", "Selenium"]],
    ["Rohan_Desai", ["C++", "Python", "Microservices", "SQL", "Google Cloud Functions", "Distributed Systems"]]
]

job_description = [
    "C++", "Python", "JavaScript", "React", "HTML", "CSS", "MongoDB", "SQL",
    "scalable front-end", "scalable back-end", "dynamic web applications",
    "data management", "problem-solving"
]

@app.route('/process', methods=['POST'])
def process_data():
    data = request.json
    selected_option = int(data.get('option', 5))  # Convert to integer
    skills = data.get('skills', [])

    # Perform skill matching
    match_scores = [
        (name, fuzzy_match(interviewer_skills, skills))
        for name, interviewer_skills in interviewers
    ]

    # Sort and get top `n` interviewers
    match_scores.sort(key=lambda x: x[1], reverse=True)
    ranked_interviewers = [name for name, _ in match_scores[:selected_option]]

    return jsonify({"message": "Received", "option": selected_option, "interviewers": ranked_interviewers})

if __name__ == '__main__':
    port = 5001  # Change if needed
    print(f"Server is running on http://localhost:{port}")
    app.run(debug=True, host="0.0.0.0", port=port)