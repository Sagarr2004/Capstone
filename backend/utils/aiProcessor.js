import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const generateAISuggestions = async (text) => {
    try {
        const response = await axios.post("https://api.openai.com/v1/completions", {
            model: "gpt-4",
            prompt: `Analyze the following resume text and provide suggestions for improvement:\n\n${text}`,
            max_tokens: 200,
        }, {
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        return response.data.choices[0].text.trim().split("\n");
    } catch (error) {
        console.error("AI Processing Error:", error);
        return ["Could not generate suggestions."];
    }
};
