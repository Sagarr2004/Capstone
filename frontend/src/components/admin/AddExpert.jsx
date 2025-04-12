import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // import navigation hook

const ProfileForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    skills: "",
    degree: "",
    experience: "",
  });

  const navigate = useNavigate(); // initialize navigation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/submit-profile", formData);
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("Error submitting form");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-fuchsia-100 to-rose-200 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100">
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-fuchsia-600 to-indigo-600 bg-clip-text text-transparent mb-6">
          Create Your Profile
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Skills</label>
            <input
              type="text"
              name="skills"
              placeholder="e.g., HTML, CSS, React"
              value={formData.skills}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Degree</label>
            <input
              type="text"
              name="degree"
              placeholder="B.Tech in Computer Science"
              value={formData.degree}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Experience (in years)</label>
            <input
              type="number"
              name="experience"
              placeholder="e.g., 2"
              value={formData.experience}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white font-semibold py-2 rounded-xl hover:opacity-90 transition duration-300"
          >
            Submit Profile
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)} // go back to previous page
            className="w-full bg-white text-indigo-600 border border-indigo-400 font-semibold py-2 rounded-xl hover:bg-indigo-50 transition duration-300"
          >
            ⬅ Back
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
