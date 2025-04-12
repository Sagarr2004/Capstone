import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AdminJobsTable from "./AdminJobsTable";
import useGetAllAdminJobs from "@/utils/hooks/useGetAllAdminJobs";
import { setSearchJobByText } from "@/redux/jobSlice";

const AdminJobs = () => {
  useGetAllAdminJobs();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchJobByText(input));
  }, [input]);

  return (
    <div className="bg-gradient-to-r from-purple-600 via-blue-500 to-teal-500 min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto my-10 p-6 bg-white/40 backdrop-blur-md rounded-xl shadow-xl">
        <div className="flex items-center justify-between my-5">
          <Input
            className="w-1/3 p-2 text-black rounded-md"
            placeholder="Filter by name, role"
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            onClick={() => navigate("/admin/jobs/create")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300"
          >
            New Jobs
          </Button>
        </div>
        {/* Table Container with Side Scrollbar */}
        <div className="overflow-x-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-gray-700">
          <AdminJobsTable />
        </div>
      </div>
    </div>
  );
};

export default AdminJobs;
