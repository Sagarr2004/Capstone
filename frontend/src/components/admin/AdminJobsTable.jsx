import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { JOB_API_END_POINT } from "@/utils/constant";
import { Button } from "../ui/button";

const AdminJobsTable = () => {
  const { allAdminJobs, searchJobByText } = useSelector((store) => store.job);
  const [filterJobs, setFilterJobs] = useState(allAdminJobs);
  const navigate = useNavigate();

  useEffect(() => {
    const filteredJobs = allAdminJobs.filter((job) => {
      if (!searchJobByText) return true;
      return (
        job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
        job?.company?.name.toLowerCase().includes(searchJobByText.toLowerCase())
      );
    });
    setFilterJobs(filteredJobs);
  }, [allAdminJobs, searchJobByText]);

  const deleteJob = async (jobId) => {
    try {
      const res = await axios.delete(
        `${JOB_API_END_POINT}/delete/${jobId}`,
        { withCredentials: true } // Automatically sends cookies
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setFilterJobs(filterJobs.filter((job) => job._id !== jobId));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting job");
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen p-10">
      <div className="max-w-6xl mx-auto bg-white/30 backdrop-blur-md rounded-lg shadow-xl p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Job Listings</h1>
        <Table className="text-white">
          <TableCaption className="text-gray-200">
            A list of your recent posted jobs
          </TableCaption>
          <TableHeader>
            <TableRow className="bg-white/20">
              <TableHead>Company Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filterJobs?.map((job) => (
              <TableRow key={job._id} className="hover:bg-white/10 transition">
                <TableCell>{job?.company?.name}</TableCell>
                <TableCell>{job?.title}</TableCell>
                <TableCell>{job?.createdAt.split("T")[0]}</TableCell>
                <TableCell className="text-right">
                  <Popover>
                    <PopoverTrigger>
                      <Button variant="ghost" className="text-white">
                        <MoreHorizontal />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 bg-white text-black rounded-lg shadow-md">
                      <div
                        onClick={() => navigate(`/admin/companies/${job._id}`)}
                        className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100"
                      >
                        <Edit2 className="w-4" />
                        <span>Edit</span>
                      </div>
                      <div
                        onClick={() =>
                          navigate(`/admin/jobs/${job._id}/applicants`, {
                            state: {
                              role: job.title,
                              description: job.description, 
                            },
                          })
                        }
                        className="flex items-center p-2 gap-2 cursor-pointer hover:bg-gray-100"
                      >
                        <Eye className="w-4" />
                        <span>Applicants</span>
                      </div>
                      <div
                        onClick={() => deleteJob(job._id)}
                        className="flex items-center p-2 gap-2 cursor-pointer text-red-500 hover:bg-red-100"
                      >
                        <Trash2 className="w-4" />
                        <span>Remove</span>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminJobsTable;
