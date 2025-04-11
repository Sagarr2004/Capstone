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
    const { applicants } = useSelector((store) => store.application);
    const [resumeLinks, setResumeLinks] = useState([]);
    const [pdfFiles, setPdfFiles] = useState([]);
    const [jobDescription, setJobDescription] = useState("");
    const [results, setResults] = useState([]);

    useEffect(() => {
        const fetchAllApplicants = async () => {
            try {
                const res = await axios.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants`, { withCredentials: true });
                dispatch(setAllApplicants(res.data.job));
            } catch (error) {
                console.error('Error fetching applicants:', error);
            }
        };
        fetchAllApplicants();
    }, [params.id, dispatch]);

    const handleCollectResumes = async () => {
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants/resume`, { withCredentials: true });
            
            if (res.data.success && Array.isArray(res.data.resumes)) {
                const downloadedFiles = [];
                const resumeUrls = [];

                for (const applicant of res.data.resumes) {
                    if (applicant.resumeLink) {
                        try {
                            const response = await axios.get(applicant.resumeLink, { responseType: 'blob' });
                            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
                            const objectUrl = URL.createObjectURL(pdfBlob);

                            downloadedFiles.push({ name: applicant.name, file: pdfBlob });
                            resumeUrls.push({ name: applicant.name, url: objectUrl });
                        } catch (err) {
                            console.error(`Failed to download resume for ${applicant.name}:`, err);
                        }
                    }
                }

                setPdfFiles(downloadedFiles);
                setResumeLinks(resumeUrls);
            } else {
                console.warn("No resumes found in response.");
            }
        } catch (error) {
            console.error("Error collecting resumes:", error);
        }
    };

    const handleUploadResumes = async (event) => {
        event.preventDefault();
        if (pdfFiles.length === 0 || !jobDescription) {
            alert("Please collect resumes and enter a job description.");
            return;
        }

        const formData = new FormData();
        formData.append("job_description", jobDescription);
        pdfFiles.forEach((pdf) => {
            formData.append("files", pdf.file, `${pdf.name}.pdf`);
        });

        try {
            const response = await axios.post("http://localhost:5000/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setResults(response.data.ranked_resumes);
        } catch (error) {
            console.error("Error uploading resumes:", error);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="max-w-7xl mt-[10px] mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="font-bold text-xl">
                        Applicants {applicants?.applications?.length || 0}
                    </h1>
                    <div>
                        <button 
                            onClick={handleCollectResumes} 
                            className="bg-blue-500 text-white py-2 px-4 rounded mr-2"
                        >
                            Collect Resumes
                        </button>
                    </div>
                </div>

                {resumeLinks.length > 0 && (
                    <div className="mt-4 p-4 border rounded-lg">
                        <h2 className="font-bold">Downloaded Resumes:</h2>
                        <ul>
                            {resumeLinks.map((applicant, index) => (
                                <li key={index}>
                                    {applicant.name}: {" "}
                                    <a href={applicant.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                        View Resume
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mt-4 p-4 border rounded-lg">
                    <h2 className="font-bold">Upload Resumes for Matching</h2>
                    <form onSubmit={handleUploadResumes}>
                        <textarea
                            placeholder="Enter job description..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            required
                            className="w-full p-2 border rounded mt-2"
                        />
                        <button type="submit" className="mt-2 bg-green-500 text-white py-2 px-4 rounded">
                            Upload & Match
                        </button>
                    </form>
                </div>

                {results.length > 0 && (
                    <div className="mt-4 p-4 border rounded-lg">
                        <h3 className="font-bold">Ranked Resumes</h3>
                        <ul>
                            {results.map((res, index) => (
                                <li key={index}>
                                    {index + 1}. {res.filename} - Match Score: {res.match_score}%
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <ApplicantsTable />
            </div>
        </div>
    );
};

export default Applicants;
