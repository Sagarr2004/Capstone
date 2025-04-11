import React, { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const isInitiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isInitiallyApplied);
    const params = useParams();
    const navigate = useNavigate();
    const jobId = params.id;
    const dispatch = useDispatch();

    const applyJobHandler = async () => {
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, { withCredentials: true });
            if (res.data.success) {
                setIsApplied(true);
                const updatedSingleJob = { ...singleJob, applications: [...singleJob.applications, { applicant: user?._id }] };
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    };

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application => application.applicant === user?._id));
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchSingleJob();
    }, [jobId, dispatch, user?._id]);

    return (
        <div className='max-w-7xl mx-auto my-10 p-6 bg-white rounded-lg shadow-lg border border-gray-200'>
            <div className='flex items-center justify-between mb-6'>
                <div>
                    <h1 className='font-bold text-2xl text-gray-800'>{singleJob?.title}</h1>
                    <div className='flex items-center gap-3 mt-3'>
                        <Badge className='bg-blue-600 text-white px-3 py-1'>{singleJob?.position} Positions</Badge>
                        <Badge className='bg-red-500 text-white px-3 py-1'>{singleJob?.jobType}</Badge>
                        <Badge className='bg-green-500 text-white px-3 py-1'>{singleJob?.salary} LPA</Badge>
                    </div>
                </div>
                <Button
                    onClick={isApplied ? null : applyJobHandler}
                    disabled={isApplied}
                    className={`rounded-lg px-6 py-2 ${isApplied ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#219C90] hover:bg-[#1b7a6c] text-white'}`}
                >
                    {isApplied ? 'Already Applied' : 'Apply Now'}
                </Button>
            </div>

            <h1 className='border-b-2 border-gray-300 font-semibold pb-3 text-lg text-gray-700'>Job Description</h1>
            <div className='my-5 text-gray-700 space-y-2'>
                <p><strong>Role:</strong> {singleJob?.title}</p>
                <p><strong>Location:</strong> {singleJob?.location}</p>
                <p><strong>Description:</strong> {singleJob?.description}</p>
                <p><strong>Experience:</strong> {singleJob?.experience} yrs</p>
                <p><strong>Salary:</strong> {singleJob?.salary} LPA</p>
                <p><strong>Total Applicants:</strong> {singleJob?.applications?.length}</p>
                <p><strong>Posted Date:</strong> {singleJob?.createdAt?.split("T")[0]}</p>
            </div>

            {/* Back Button */}
            <div className='mt-6'>
                <Button onClick={() => navigate('/jobs')} className='flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700'>
                    <ArrowLeft size={18} /> Back to Jobs
                </Button>
            </div>
        </div>
    );
};

export default JobDescription;
