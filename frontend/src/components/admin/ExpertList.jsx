import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/shared/Navbar"

const ExpertList = () => {
  const location = useLocation();
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
      timeout: 10000
    });
    
    if (!profileRes.data || !Array.isArray(profileRes.data)) {
      throw new Error("No expert profiles received");
    }

    // 2. Prepare request data with validation
    const requestData = {
      resume_url: resume,
      jd: description,
      experts: profileRes.data.map(expert => ({
        name: expert.name || 'Unknown Expert',
        skills: Array.isArray(expert.skills) ? expert.skills : []
      }))
    };

    console.log("Sending request to backend:", requestData); // Debug

    // 3. Send to Flask backend
    const mlRes = await axios.post("http://127.0.0.1:5000/match-from-url", 
      requestData, 
      {
        timeout: 45000,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

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
      errorMessage = error.response.data?.error || 
                    `Server error: ${error.response.status}`;
      
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
    <Navbar/>
    <div className="max-w-4xl mx-auto mt-8 px-4 pb-12">
      {/* Candidate Details Card */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
          Candidate Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600"><span className="font-medium">Name:</span></p>
            <p className="text-gray-800">{name || "Not provided"}</p>
          </div>
          <div>
            <p className="text-gray-600"><span className="font-medium">Email:</span></p>
            <p className="text-gray-800">{email || "Not provided"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-600"><span className="font-medium">Resume:</span></p>
            {resume ? (
              <a 
                href={resume} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Resume
              </a>
            ) : (
              <p className="text-gray-800">Not available</p>
            )}
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-600"><span className="font-medium">Job Description:</span></p>
            <div className="bg-gray-50 p-3 rounded-md mt-1 max-h-40 overflow-y-auto">
              <p className="text-gray-800 whitespace-pre-line">{description || "Not provided"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">
          Expert Matching Results
        </h2>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Analyzing resume and matching experts...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
          </div>
        ) : errorMsg ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error processing request</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errorMsg}</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : experts.length > 0 ? (
          <div className="space-y-6">
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Successfully matched {experts.length} expert{experts.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {experts.map((expert, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">
                        {index + 1}. {expert.name}
                      </h3>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      expert.score >= 75 ? "bg-green-100 text-green-800" :
                      expert.score >= 60 ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {expert.score}% Match
                    </span>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Relevance</span>
                      <span>{expert.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          expert.score >= 75 ? "bg-green-500" :
                          expert.score >= 60 ? "bg-yellow-500" :
                          "bg-red-500"
                        }`} 
                        style={{ width: `${expert.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">No matches found</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>We couldn't find any experts matching your requirements. Try adjusting your job description.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ExpertList;