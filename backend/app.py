
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Configure Gemini API Key (Use Environment Variable)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyDhaiXx828ZD9Z_m6BrE0b_c76egmkJOPg")
genai.configure(api_key="AIzaSyDhaiXx828ZD9Z_m6BrE0b_c76egmkJOPg")

def analyze_resume(text):
    try:
        model = genai.GenerativeModel("gemini-1.5-pro-002")
        response = model.generate_content(f"Give suggestions to improve this resume:\n{text}")
        return response.text if response else "No response from Gemini API"
    except Exception as e:
        return f"Error: {str(e)}"

@app.route("/upload", methods=["POST"])
def get_suggestions():
    try:
        data = request.json
        resume_text = data.get("text", "").strip()

        if not resume_text:
            return jsonify({"error": "No resume text provided"}), 400

        suggestions = analyze_resume(resume_text)
        return jsonify({"suggestions": suggestions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)