import { useState, useEffect } from "react";

const AlumniConnect = () => {
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
          `http://localhost:8000/api/alumni/search?${searchType}=${encodeURIComponent(searchTerm)}`
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
  
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-3xl font-bold text-center mb-6">🔍 Connect with Alumni</h2>

      {/* Search Bar */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={`Search by ${searchType.replace(/([A-Z])/g, " $1")}`}
        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
      />

      {/* Radio Buttons */}
      <div className="flex justify-center gap-6 my-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="searchType"
            value="currentCompany"
            checked={searchType === "currentCompany"}
            onChange={(e) => setSearchType(e.target.value)}
            className="accent-blue-500"
          />
          <span>Current Company</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="searchType"
            value="previousCompanies"
            checked={searchType === "previousCompanies"}
            onChange={(e) => setSearchType(e.target.value)}
            className="accent-blue-500"
          />
          <span>Previous Companies</span>
        </label>
      </div>

      {/* Alumni Cards */}
      {loading ? (
        <p className="text-center text-gray-500 mt-4">🔄 Searching...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {alumniList.length > 0 ? (
            alumniList.map((alumni) => (
              <div
                key={alumni._id}
                className="p-4 border rounded-lg shadow-lg bg-gray-50 hover:shadow-xl transition duration-300 cursor-pointer"
                onClick={() => setSelectedAlumni(alumni)}
              >
                <h3 className="text-xl font-semibold">{alumni.name}</h3>
                <p className="text-gray-700">
                  <span className="font-medium">🏢 Current:</span>{" "}
                  {alumni.currentCompany}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">🔙 Previous:</span>{" "}
                  {alumni.previousCompanies.join(", ")}
                </p>
              </div>
            ))
          ) : (
            searchTerm && (
              <p className="text-center text-gray-500">❌ No results found.</p>
            )
          )}
        </div>
      )}

      {/* Alumni Details Popup */}
      {selectedAlumni && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-semibold mb-4">{selectedAlumni.name}</h2>
            <p className="text-gray-700"><strong>Email:</strong> {selectedAlumni.email}</p>
            <p className="text-gray-700"><strong>🏢 Current Company:</strong> {selectedAlumni.currentCompany}</p>
            <p className="text-gray-700"><strong>🔙 Previous Companies:</strong> {selectedAlumni.previousCompanies.join(", ")}</p>
            
            {/* LinkedIn (Clickable) */}
            {selectedAlumni.linkedin && (
              <p className="text-gray-700">
                <strong>🔗 LinkedIn:</strong>{" "}
                <a
                  href={selectedAlumni.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {selectedAlumni.linkedin}
                </a>
              </p>
            )}

            {/* GitHub (Clickable) */}
            {selectedAlumni.github && (
              <p className="text-gray-700">
                <strong>💻 GitHub:</strong>{" "}
                <a
                  href={selectedAlumni.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 hover:underline"
                >
                  {selectedAlumni.github}
                </a>
              </p>
            )}

            {/* Portfolio Website (Optional) */}
            {selectedAlumni.website && (
              <p className="text-gray-700">
                <strong>🌐 Website:</strong>{" "}
                <a
                  href={selectedAlumni.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  {selectedAlumni.website}
                </a>
              </p>
            )}

            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
              onClick={() => setSelectedAlumni(null)}
            >
              ❌ Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniConnect;
