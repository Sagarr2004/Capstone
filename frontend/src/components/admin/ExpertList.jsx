import React from "react";
import { useLocation } from "react-router-dom";

const ExpertList = () => {
  const location = useLocation();
  const { resume, name, email,description } = location.state || {};

  const experts = [
    { name: "Amit Sharma", score: 92 },
    { name: "Sneha Patel", score: 88 },
    { name: "Rahul Verma", score: 76 },
    { name: "Anjali Mehra", score: 69 },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-12 px-4">
      {/* Candidate Info Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Candidate Info</h2>
        <p><span className="font-medium">Name:</span> {name || "N/A"}</p>
        <p><span className="font-medium">Email:</span> {email || "N/A"}</p>
        <p><span className="font-medium">Description:</span> {description || "N/A"}</p>
        <p>
          <span className="font-medium">Resume:</span>{" "}
          {resume ? (
            <a
              href={resume}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Resume
            </a>
          ) : (
            "Not Available"
          )}
        </p>
      </div>

      {/* Relevancy Scores Section */}
      <h2 className="text-2xl font-bold mb-6 text-center">Relevancy Scores</h2>
      <div className="bg-white shadow-lg rounded-lg p-6 space-y-4">
        {experts.map((expert, index) => (
          <div
            key={index}
            className="flex justify-between items-center border-b pb-2 last:border-b-0"
          >
            <span className="text-lg font-medium text-gray-800">
              {expert.name}
            </span>
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
        ))}
      </div>
    </div>
  );
};

export default ExpertList;
