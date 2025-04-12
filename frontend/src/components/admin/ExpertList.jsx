import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/shared/Navbar";

const ExpertList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resume, name, email, description } = location.state || {};

  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchAndMatchExperts = async () => {
      if (!resume || !description) {
        setErrorMsg("Missing resume URL or job description.");
        return;
      }

      try {
        setLoading(true);
        setErrorMsg("");
        setSuccess(false);
        setExperts([]);

        // 1. Get expert profiles
        const profileRes = await axios.get("http://127.0.0.1:8000/get-expert-profiles", {
          timeout: 10000,
        });

        if (!profileRes.data || !Array.isArray(profileRes.data)) {
          throw new Error("No expert profiles received");
        }

        // 2. Prepare request data with validation
        const requestData = {
          resume_url: resume,
          jd: description,
          experts: profileRes.data.map((expert) => ({
            name: expert.name || "Unknown Expert",
            skills: Array.isArray(expert.skills) ? expert.skills : [],
          })),
        };

        console.log("Sending request to backend:", requestData); // Debug

        // 3. Send to Flask backend
        const mlRes = await axios.post("http://127.0.0.1:5000/match-from-url", requestData, {
          timeout: 45000,
          headers: {
            "Content-Type": "application/json",
          },
        });

        // 4. Validate response
        if (!mlRes.data || !Array.isArray(mlRes.data)) {
          throw new Error("Invalid response format from server");
        }

        setExperts(mlRes.data);
        setSuccess(true);
      } catch (error) {
        console.error("Matching error:", error);

        let errorMessage = "An error occurred during expert matching";

        if (error.response) {
          // Server responded with error status
          errorMessage =
            error.response.data?.error || `Server error: ${error.response.status}`;

          console.error("Server response data:", error.response.data);
        } else if (error.request) {
          // Request was made but no response
          errorMessage = "No response from server. Is the backend running?";
        } else {
          // Other errors
          errorMessage = error.message || "Request failed";
        }

        setErrorMsg(errorMessage);
        setExperts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndMatchExperts();
  }, [resume, description]);

  return (
    <>
      <div className="bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 min-h-screen py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)} // Navigates back to the previous page
          className="text-white font-semibold text-lg px-4 py-2 mb-6 ml-4 bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors"
        >
          Back
        </button>

        {/* Candidate Details */}
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8 mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">Candidate Information</h2>
          <div className="space-y-4">
            <p className="text-lg text-gray-700"><span className="font-semibold">Name:</span> {name || "N/A"}</p>
            <p className="text-lg text-gray-700"><span className="font-semibold">Email:</span> {email || "N/A"}</p>
            <p className="text-lg text-gray-700"><span className="font-semibold">Description:</span> {description || "N/A"}</p>
            <p className="text-lg text-gray-700">
              <span className="font-semibold">Resume:</span>{" "}
              {resume ? (
                <a href={resume} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  View Resume
                </a>
              ) : (
                "Not Available"
              )}
            </p>
          </div>
        </div>

        {/* Scores */}
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">Relevancy Scores</h2>
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8 space-y-6">
          {loading ? (
            <p className="text-xl text-gray-600 text-center">Loading expert matches...</p>
          ) : errorMsg ? (
            <p className="text-red-600 text-center font-medium text-lg">{errorMsg}</p>
          ) : experts.length > 0 ? (
            experts.map((expert, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 rounded-lg transition-all"
              >
                <span className="text-xl font-medium text-gray-800">{expert.name}</span>
                <span
                  className={`text-sm font-semibold px-4 py-2 rounded-full ${
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
            <p className="text-xl text-gray-600 text-center">No expert matches found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ExpertList;
