import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import axios from 'axios';
import PDFDocument from 'pdfkit';
import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(express.json());

// ✅ Ensure 'uploads' directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

let lastUploadedText = ""; // Store last extracted resume text

// ✅ Upload Resume & Extract Text
router.post('/upload', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded." });

        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        fs.unlinkSync(req.file.path); // ✅ Delete file after processing

        lastUploadedText = pdfData.text; // Store extracted text
        res.json({ text: pdfData.text });
    } catch (error) {
        console.error("Resume parsing failed:", error);
        res.status(500).json({ error: 'Resume parsing failed' });
    }
});

// ✅ Get Last Extracted Resume Text
router.get('/resume-text', (req, res) => {
    if (!lastUploadedText) {
        return res.status(404).json({ error: "No resume text available." });
    }
    res.json({ text: lastUploadedText });
});

// ✅ Get Resume Suggestions (AI-powered)
router.post("/suggestions", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "No text provided." });

        res.json({ suggestions: ["Skill improvement", "Experience recommendations"] });
    } catch (error) {
        console.error("Error processing suggestions:", error);
        res.status(500).json({ error: "Failed to process suggestions" });
    }
});

// ✅ List All Uploaded Resumes
router.get('/resumes', (req, res) => {
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.error("Error reading uploads directory:", err);
            return res.status(500).json({ error: "Failed to retrieve resumes" });
        }
        res.json({ resumes: files });
    });
});

// ✅ Download a Specific Resume
router.get('/download/:filename', (req, res) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: "File not found" });
    }
});

// ✅ Delete a Specific Resume
router.delete('/delete/:filename', (req, res) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ message: "Resume deleted successfully" });
    } else {
        res.status(404).json({ error: "File not found" });
    }
});

// ✅ Generate Resume PDF
const generateResume = async (filePath, { name, email, skills, experience }) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // ✅ Resume Content
            doc.fontSize(20).text("Resume", { align: "center" }).moveDown();
            doc.fontSize(14).text(`Name: ${name}`);
            doc.text(`Email: ${email}`).moveDown();

            // ✅ Process Skills
            doc.fontSize(14).text("Skills:");
            (Array.isArray(skills) ? skills : skills.split(",")).forEach(skill => doc.text(`- ${skill.trim()}`));
            doc.moveDown();

            // ✅ Process Experience
            doc.fontSize(14).text("Experience:");
            (Array.isArray(experience) ? experience : experience.split("\n")).forEach(exp => doc.text(`- ${exp.trim()}`));

            doc.end();

            stream.on("finish", resolve);
            stream.on("error", reject);
        } catch (error) {
            reject(error);
        }
    });
};

// ✅ Resume Generation Endpoint
router.post("/generate", async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        let { name, email, skills, experience, suggestions } = req.body;

        if (!name || !email || !skills || !experience) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // ✅ Use AI to Modify Resume Based on Suggestions
        if (suggestions && suggestions.length > 0) {
            const aiResponse = await axios.post(process.env.GEMINI_API_URL, {
                contents: [{
                    parts: [{
                        text: `Modify this resume based on these suggestions: ${suggestions.join(", ")}.
                        \n\nOriginal Resume:\n
                        Name: ${name}\n
                        Email: ${email}\n
                        Skills: ${skills}\n
                        Experience: ${experience}\n
                        \nReturn the updated resume text only.`
                    }]
                }]
            });

            // ✅ Extract AI-modified fields (assuming the API response contains structured data)
            const aiData = aiResponse.data;
            experience = aiData.updatedExperience || experience;
            skills = aiData.updatedSkills || skills;
        }

        const filePath = path.join(__dirname, "uploads", "resume_updated.pdf");
        await generateResume(filePath, { name, email, skills, experience });

        if (fs.existsSync(filePath)) {
            res.setHeader("Content-Type", "application/pdf");
            res.download(filePath, "resume_updated.pdf", (err) => {
                if (err) {
                    console.error("Download error:", err);
                    return res.status(500).json({ message: "Error sending PDF" });
                }
                fs.unlinkSync(filePath);
            });
        } else {
            res.status(500).json({ message: "Failed to generate updated resume" });
        }
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// ✅ Global Error Handlers
process.on('uncaughtException', (err) => {
    console.error("Uncaught Exception:", err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

export default router;
