


import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import ApplicantsTable from './ApplicantsTable';
import axios from 'axios';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';

const Applicants = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const { applicants } = useSelector((store) => store.application) || { applicants: { applications: [] } };
    const [resumeLinks, setResumeLinks] = useState([]);
    const [mlResponse, setMlResponse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState("1");
    const [isOpen, setIsOpen] = useState(false);
    const [interviewers, setInterviewers] = useState([]);
    const [error, setError] = useState(null);

    const skills = [
        "cloud infrastructure", "microservices architecture", "Google Cloud Platform (GCP)", "Azure",
        "CI/CD pipelines", "cloud-native solutions", "cloud migration", "JavaScript",
        "Google Cloud Armor", "containerization technologies"
    ];

    useEffect(() => {
        const fetchAllApplicants = async () => {
            try {
                const res = await axios.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants`, { withCredentials: true });
                dispatch(setAllApplicants(res.data.job));
            } catch (error) {
                console.error('Error fetching applicants:', error);
            }
        };

        const processResumes = async () => {
            try {
                const res = await axios.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants/resume`, { withCredentials: true });
                if (res.data.success && Array.isArray(res.data.resumes)) {
                    const formData = new FormData();

                    //fetch all the job description here

                    formData.append("job_description", "We are seeking a highly skilled Full-Stack Developer...");
                    
                    const resumeUrls = [];
                    for (const applicant of res.data.resumes) {
                        if (applicant.resumeLink) {
                            try {
                                const response = await axios.get(applicant.resumeLink, { responseType: 'blob' });
                                const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
                                formData.append("files", new File([pdfBlob], `${applicant.name}.pdf`, { type: 'application/pdf' }));
                                resumeUrls.push({ name: applicant.name, url: URL.createObjectURL(pdfBlob) });
                            } catch (err) {
                                console.error(`Failed to download resume for ${applicant.name}:`, err);
                            }
                        }
                    }
                    setResumeLinks(resumeUrls);
                    
                    const mlRes = await axios.post("http://localhost:5000/upload", formData, {
                        headers: { "Content-Type": "multipart/form-data" }
                    });
                    setMlResponse(mlRes.data.ranked_resumes || []);
                }
            } catch (error) {
                console.error("Error processing resumes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllApplicants();
        processResumes();
    }, [params.id, dispatch]);

    const sendData = async (option) => {
        setLoading(true);
        setError(null);

        const payload = {
            option,
            skills,
        };

        console.log("Payload:",payload);

        try {
            const res = await axios.post("http://localhost:5001/process", payload, {
                headers: { "Content-Type": "application/json" },
            });
            setInterviewers(res.data.interviewers || []);
        } catch (error) {
            setError("Failed to connect to the backend.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="max-w-7xl mt-8 mx-auto px-6">
                <h1 className="font-bold text-2xl text-gray-800 mb-4">Shortlisted Candidates({applicants?.applications?.length || 0})</h1>
                {/* {loading && <p className="text-blue-500 text-lg animate-pulse">Processing resumes...</p>} */}
                
                {/* Downloaded Resumes Section */}
                {resumeLinks.length > 0 && (
                    <div >
                        {/* <h2 className="font-semibold text-xl text-gray-700">Downloaded Resumes:</h2> */}
                        {/* <ul>
                            {resumeLinks.map((applicant, index) => (
                                <li key={index} className="text-lg text-gray-600">
                                    {applicant.name}: {" "}
                                    <a href={applicant.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                        View Resume
                                    </a>
                                </li>
                            ))}
                        </ul> */}
                    </div>
                )}
                
                {/* ML Shortlisted Candidates Section */}
                {mlResponse && (
                    <div className="mt-6 p-6 border rounded-lg bg-gray-50">
                        <h2 className="font-semibold text-xl text-gray-700">Shortlisted Candidates:</h2>
                        <ul>
                            {mlResponse.map((applicant, index) => (
                                <li key={index} className="py-2 text-gray-600">
                                    <span className="font-semibold text-blue-600">{applicant.filename}:</span> {" "}
                                    <span className="text-green-600 font-bold">{applicant.match_score}%</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Applicants Table */}
                <ApplicantsTable />

                {/* Interviewer Selection Dropdown */}
                {/* <div className="relative inline-block text-left mt-6">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
                    >
                        {selected ? `Selected: ${selected}` : "Select number of experts in Panel"}
                    </button>
                    {isOpen && (
                        <div className="absolute left-0 mt-2 w-44 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                            {["1", "2", "3", "4", "5"].map((num) => (
                                <div
                                    key={num}
                                    onClick={() => {
                                        setSelected(num);
                                        sendData(num);
                                        setIsOpen(false);
                                    }}
                                    className="px-6 py-3 hover:bg-gray-100 cursor-pointer transition-all"
                                >
                                    {num}
                                </div>
                            ))}
                        </div>
                    )}
                </div> */}

                {/* Ranked Interviewers Section */}
                {/* <div className="mt-10 p-6 bg-white shadow-md mb-[50px] rounded-lg">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ranked Interviewers</h2>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    {interviewers.length > 0 ? (
                        <ul className="list-disc pl-6 space-y-2">
                            {interviewers.map((name, index) => (
                                <li key={index} className="text-gray-700 text-lg hover:text-blue-600 transition-colors duration-200">
                                    {index + 1}. {name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        !loading && <p className="text-gray-500 text-lg">No interviewers found.</p>
                    )}
                </div> */}
            </div>
        </div>
    );
};

export default Applicants;