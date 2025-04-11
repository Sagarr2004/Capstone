import React, { useState } from "react";
import axios from "axios";

const ProfileForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    skills: "",
    degree: "",
    experience: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-1/2 mx-auto mt-10">
      <input
        type="text"
        name="fullName"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="skills"
        placeholder="Skills (comma separated)"
        value={formData.skills}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="degree"
        placeholder="Degree"
        value={formData.degree}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="experience"
        placeholder="Experience in years"
        value={formData.experience}
        onChange={handleChange}
        required
      />
      <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
        Submit
      </button>
    </form>
  );
};

export default ProfileForm;
