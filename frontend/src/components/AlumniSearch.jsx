import { useState, useEffect } from "react";
import Navbar from "./shared/Navbar";
import jobImage from "../assets/alumini.jpg";

const AlumniSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("currentCompany");
  const [alumniList, setAlumniList] = useState([]);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setAlumniList([]);
      return;
    }

    const fetchAlumni = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8000/api/alumni/search?${searchType.trim()}=${encodeURIComponent(searchTerm.trim())}`
        );
        
        const data = await response.json();
        setAlumniList(data.alumni || []);
      } catch (error) {
        console.error("Error fetching alumni:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(fetchAlumni, 500);
    return () => clearTimeout(debounceFetch);
  }, [searchTerm, searchType]);

  return (
    <> 
  <div className="relative z-50">
        <Navbar />
      </div>

<div className="absolute inset-0 bg-cover bg-center mt-[25px]"
                style={{ backgroundImage: `url(${jobImage})`, backgroundSize: "100% 100%", filter: "blur(2px)" }}
            ></div>


    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-300 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white bg-opacity-90 p-6 shadow-lg rounded-2xl backdrop-blur-md">
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-6">🔍 Search Alumni</h2>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search by ${searchType.replace(/([A-Z])/g, " $1")}`}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 text-lg"
        />

        <div className="flex justify-center gap-6 my-4">
          {["currentCompany", "previousCompanies"].map((type) => (
            <label key={type} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="searchType"
                value={type}
                checked={searchType === type}
                onChange={(e) => setSearchType(e.target.value)}
                className="accent-purple-500"
              />
              <span className="text-gray-800 font-medium">{type.replace(/([A-Z])/g, " $1")}</span>
            </label>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-600 mt-4">🔄 Searching...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {alumniList.length > 0 ? (
              alumniList.map((alumni) => (
                <div
                  key={alumni._id}
                  className="p-4 border rounded-lg shadow-lg bg-white hover:bg-purple-100 transition duration-300 cursor-pointer"
                  onClick={() => setSelectedAlumni(alumni)}
                >
                  <h3 className="text-xl font-semibold text-purple-800">{alumni.name}</h3>
                  <p className="text-gray-700"><strong>🏢 Current:</strong> {alumni.currentCompany}</p>
                  <p className="text-gray-700"><strong>🔙 Previous:</strong> {alumni.previousCompanies.join(", ")}</p>
                </div>
              ))
            ) : (
              searchTerm && <p className="text-center text-gray-500">❌ No results found.</p>
            )}
          </div>
        )}
      </div>

      {selectedAlumni && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-2xl max-w-lg w-full relative">
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">{selectedAlumni.name}</h2>
            <p className="text-gray-700"><strong>Email:</strong> {selectedAlumni.email}</p>
            <p className="text-gray-700"><strong>🏢 Current Company:</strong> {selectedAlumni.currentCompany}</p>
            <p className="text-gray-700"><strong>🔙 Previous Companies:</strong> {selectedAlumni.previousCompanies.join(", ")}</p>
            
            {selectedAlumni.LinkedIn && (
              <p className="text-gray-700">
                <strong>🔗 LinkedIn:</strong> <a href={selectedAlumni.LinkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedAlumni.LinkedIn}</a>
              </p>
            )}
            {selectedAlumni.github && (
              <p className="text-gray-700">
                <strong>💻 GitHub:</strong> <a href={selectedAlumni.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:underline">{selectedAlumni.github}</a>
              </p>
            )}
            {selectedAlumni.website && (
              <p className="text-gray-700">
                <strong>🌐 Website:</strong> <a href={selectedAlumni.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">{selectedAlumni.website}</a>
              </p>
            )}

            <button
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-700 transition"
              onClick={() => setSelectedAlumni(null)}
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default AlumniSearch;