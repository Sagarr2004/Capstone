import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const ExpertList = () => {
  const location = useLocation();
  const { resume, name, email, description } = location.state || {};

  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchAndMatchExperts = async () => {
      if (!resume || !description) {
        setErrorMsg("Missing resume URL or job description.");
        setLoading(false);
        return;
      }

      try {
        // 1. Get expert profiles from Express.js
        const profileRes = await axios.get("http://127.0.0.1:8000/get-expert-profiles");
        const expertProfiles = profileRes.data || [];

        // 2. Clean and format expert profiles
        const cleanedExperts = expertProfiles.map((expert) => ({
          name: expert.name,
          skills: expert.skills || [],
        }));

        // 3. Send to Flask backend for scoring
        const mlRes = await axios.post("http://127.0.0.1:5000/match-from-url", {
          resume_url: resume,
          jd: description,
          experts: cleanedExperts,
        });

        // 4. Process results
        const result = mlRes.data;
        if (Array.isArray(result)) {
          setExperts(result);
        } else {
          setErrorMsg("Unexpected response from ML model.");
        }
      } catch (error) {
        console.error("Matching error:", error);
        if (error.response) {
          console.error("Flask backend response:", error.response.data);
          setErrorMsg(error.response.data.error || "Server error during matching.");
        } else {
          setErrorMsg("Unable to connect to server.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAndMatchExperts();
  }, [resume, description]);

  return (
    <div className="max-w-4xl mx-auto mt-12 px-4">
      {/* Candidate Details */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Candidate Info</h2>
        <p><span className="font-medium">Name:</span> {name || "N/A"}</p>
        <p><span className="font-medium">Email:</span> {email || "N/A"}</p>
        <p><span className="font-medium">Description:</span> {description || "N/A"}</p>
        <p>
          <span className="font-medium">Resume:</span>{" "}
          {resume ? (
            <a href={resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              View Resume
            </a>
          ) : (
            "Not Available"
          )}
        </p>
      </div>

      {/* Scores */}
      <h2 className="text-2xl font-bold mb-6 text-center">Relevancy Scores</h2>
      <div className="bg-white shadow-lg rounded-lg p-6 space-y-4">
        {loading ? (
          <p>Loading expert matches...</p>
        ) : errorMsg ? (
          <p className="text-red-600 font-medium">{errorMsg}</p>
        ) : experts.length > 0 ? (
          experts.map((expert, index) => (
            <div key={index} className="flex justify-between items-center border-b pb-2 last:border-b-0">
              <span className="text-lg font-medium text-gray-800">{expert.name}</span>
              <span
                className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  expert.score >= 85
                    ? "bg-green-100 text-green-700"
                    : expert.score >= 70
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {expert.score}%
              </span>
            </div>
          ))
        ) : (
          <p>No expert matches found.</p>
        )}
      </div>
    </div>
  );
};

export default ExpertList;
