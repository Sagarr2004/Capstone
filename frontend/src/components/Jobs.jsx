import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import FilterCard from './FilterCard';
import Job from './Job';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const Jobs = () => {
    const { allJobs, searchedQuery, searchJoBySalary } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allJobs);

    useEffect(() => {
        let filteredJobs = allJobs;
    
        if (searchedQuery) {
            filteredJobs = filteredJobs.filter(job =>
                job.title.toLowerCase().includes(searchedQuery.toLowerCase()) ||
                job.description.toLowerCase().includes(searchedQuery.toLowerCase()) ||
                job.location.toLowerCase().includes(searchedQuery.toLowerCase())
            );
        }
    
        if (searchJoBySalary) {
            let [minSalary, maxSalary] = searchJoBySalary.split("-").map(Number);
            filteredJobs = filteredJobs.filter(job => 
                maxSalary ? (job.salary >= minSalary && job.salary <= maxSalary) : (job.salary >= minSalary)
            );
        }
    
        setFilterJobs(filteredJobs);
    }, [allJobs, searchedQuery, searchJoBySalary]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <div className='max-w-7xl mx-auto mt-5'>
                <div className='flex gap-5'>
                    <div className='w-1/5'>
                        <FilterCard />
                    </div>
                    {
                        filterJobs.length <= 0 ? <span className='text-red-500 text-xl'>Job not found</span> : (
                            <div className='flex-1 h-[88vh] overflow-y-auto pb-5'>
                                <div className='grid grid-cols-3 gap-6'>
                                    {
                                        filterJobs.map((job) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 50 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -50 }}
                                                transition={{ duration: 0.3 }}
                                                key={job?._id}
                                                className="bg-white shadow-lg rounded-lg p-5 transform transition-all hover:scale-105 hover:shadow-2xl relative"
                                            >
                                                <Job job={job} />
                                                <div className='absolute bottom-0 left-0 w-full h-2 rounded-b-lg bg-gradient-to-r from-blue-500 to-green-400'></div>
                                            </motion.div>
                                        ))
                                    }
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default Jobs;
