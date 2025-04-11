import React from 'react';
import { Button } from './ui/button';
import { Bookmark } from 'lucide-react';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';

const Job = ({ job }) => {
    const navigate = useNavigate();

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
    };

    return (
        <div
            onClick={() => navigate(`/description/${job?._id}`)}
            className="p-6 rounded-xl shadow-lg bg-gradient-to-r from-blue-50 to-purple-100 border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-200"
        >
            {/* Company Info */}
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">
                    {daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}
                </p>
                <Button variant="outline" className="rounded-full" size="icon">
                    <Bookmark />
                </Button>
            </div>

            <div className="mb-3">
                <h1 className="font-semibold text-lg text-gray-900">{job?.company?.name}</h1>
                <p className="text-sm text-gray-600">📍 India</p>
            </div>

            {/* Job Title & Description */}
            <div className="mb-4">
                <h1 className="font-bold text-xl text-gray-800">{job?.title}</h1>
                <p className="text-sm text-gray-700 line-clamp-2">{job?.description}</p>
            </div>

            {/* Job Details Badges */}
            <div className="flex flex-wrap gap-2 mt-2">
                <Badge className="bg-blue-600 text-white font-semibold px-3 py-1 rounded-lg shadow-md">
                    🧑‍💻 {job?.position} Positions
                </Badge>
                <Badge className="bg-red-500 text-white font-semibold px-3 py-1 rounded-lg shadow-md">
                    🏢 {job?.jobType}
                </Badge>
                <Badge className="bg-green-500 text-white font-semibold px-3 py-1 rounded-lg shadow-md">
                    💰 {job?.salary} LPA
                </Badge>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4 mt-4">
                <Button onClick={(e) => { e.stopPropagation(); navigate(`/description/${job?._id}`); }} variant="outline">Details</Button>
                <Button className="bg-[#219C90]">Save For Later</Button>
            </div>
        </div>
    );
};

export default Job;
