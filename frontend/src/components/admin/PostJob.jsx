import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useSelector } from 'react-redux';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import axios from 'axios';
import { JOB_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const PostJob = () => {
    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experience: "",
        position: 0,
        companyId: ""
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { companies } = useSelector(store => store.company);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const selectChangeHandler = (value) => {
        const selectedCompany = companies.find(company => company.name.toLowerCase() === value);
        setInput({ ...input, companyId: selectedCompany._id });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(`${JOB_API_END_POINT}/post`, input, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/admin/jobs");
            }
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex flex-col items-center">
            <Navbar />
            <div className='mt-10 bg-white bg-opacity-90 shadow-2xl rounded-xl p-10 max-w-4xl w-full'>
                <h2 className='text-center text-3xl font-bold text-gray-800 mb-6'>Post a New Job</h2>
                <form onSubmit={submitHandler}>
                    <div className='grid grid-cols-2 gap-4'>
                        {['title', 'description', 'requirements', 'salary', 'location', 'jobType', 'experience'].map((field, index) => (
                            <div key={index}>
                                <Label className="text-gray-700 font-medium">{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                                <Input
                                    type="text"
                                    name={field}
                                    value={input[field]}
                                    onChange={changeEventHandler}
                                    className="mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full"
                                />
                            </div>
                        ))}
                        <div>
                            <Label className="text-gray-700 font-medium">No of Positions</Label>
                            <Input
                                type="number"
                                name="position"
                                value={input.position}
                                onChange={changeEventHandler}
                                className="mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full"
                            />
                        </div>
                        {companies.length > 0 && (
                            <div>
                                <Label className="text-gray-700 font-medium">Company</Label>
                                <Select onValueChange={selectChangeHandler}>
                                    <SelectTrigger className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                        <SelectValue placeholder="Select a Company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {companies.map((company) => (
                                                <SelectItem key={company._id} value={company.name.toLowerCase()}>{company.name}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    {loading ? (
                        <Button className="w-full mt-6 flex items-center justify-center bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-all">
                            <Loader2 className='mr-2 h-5 w-5 animate-spin' /> Please wait
                        </Button>
                    ) : (
                        <Button type="submit" className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-all">
                            Post New Job
                        </Button>
                    )}
                    {companies.length === 0 && (
                        <p className='text-sm text-red-600 font-bold text-center mt-3'>*Please register a company first before posting a job</p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default PostJob;
