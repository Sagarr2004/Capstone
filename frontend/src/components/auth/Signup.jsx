import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '@/redux/authSlice';
import { Loader2 } from 'lucide-react';

const Signup = () => {
    const [input, setInput] = useState({
        fullname: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: '',
        file: null,
    });

    const { loading, user } = useSelector((store) => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        setInput((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const changeFileHandler = (e) => {
        setInput((prev) => ({
            ...prev,
            file: e.target.files?.[0] || null,
        }));
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('fullname', input.fullname);
        formData.append('email', input.email);
        formData.append('phoneNumber', input.phoneNumber);
        formData.append('password', input.password);
        formData.append('role', input.role);
        if (input.file) {
            formData.append('file', input.file);
        }

        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });

            if (res.data.success) {
                toast.success(res.data.message);
                navigate('/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Signup failed');
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen">
            <Navbar />
            <div className="flex items-center justify-center max-w-7xl mx-auto">
                <form
                    onSubmit={submitHandler}
                    className="w-full md:w-1/2 border border-gray-300 shadow-lg bg-white rounded-2xl p-8 my-10"
                >
                    <h1 className="font-bold text-3xl text-center text-purple-700 mb-6">
                        Create Your Account
                    </h1>

                    <div className="my-4">
                        <Label className="text-gray-700">Full Name</Label>
                        <Input
                            type="text"
                            name="fullname"
                            value={input.fullname}
                            onChange={changeEventHandler}
                            placeholder="Enter Your Fullname"
                            className="mt-1 focus:ring-2 focus:ring-purple-500 border-gray-300"
                        />
                    </div>

                    <div className="my-4">
                        <Label className="text-gray-700">Email</Label>
                        <Input
                            type="email"
                            name="email"
                            value={input.email}
                            onChange={changeEventHandler}
                            placeholder="abc@gmail.com"
                            className="mt-1 focus:ring-2 focus:ring-purple-500 border-gray-300"
                        />
                    </div>

                    <div className="my-4">
                        <Label className="text-gray-700">Phone Number</Label>
                        <Input
                            type="text"
                            name="phoneNumber"
                            value={input.phoneNumber}
                            onChange={changeEventHandler}
                            placeholder="123456789"
                            className="mt-1 focus:ring-2 focus:ring-purple-500 border-gray-300"
                        />
                    </div>

                    <div className="my-4">
                        <Label className="text-gray-700">Password</Label>
                        <Input
                            type="password"
                            name="password"
                            value={input.password}
                            onChange={changeEventHandler}
                            placeholder="********"
                            className="mt-1 focus:ring-2 focus:ring-purple-500 border-gray-300"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between my-6">
                        <RadioGroup className="flex items-center gap-6">
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="radio"
                                    name="role"
                                    value="student"
                                    checked={input.role === 'student'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer"
                                />
                                <Label className="text-gray-600">Student</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="radio"
                                    name="role"
                                    value="recruiter"
                                    checked={input.role === 'recruiter'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer"
                                />
                                <Label className="text-gray-600">Recruiter</Label>
                            </div>
                        </RadioGroup>

                        <div className="flex items-center gap-3 mt-4 md:mt-0">
                            <Label className="text-gray-700">Profile</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={changeFileHandler}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <Button className="w-full my-4 bg-purple-600 hover:bg-purple-700">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Please wait
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            className="w-full my-4 bg-purple-600 hover:bg-purple-700"
                        >
                            Signup
                        </Button>
                    )}

                    <p className="text-sm text-center mt-2 text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-purple-600 hover:underline">
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;