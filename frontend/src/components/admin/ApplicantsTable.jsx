import React from "react";
import { useLocation } from "react-router-dom";
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
import { MoreHorizontal } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { Link } from "react-router-dom";

const shortlistingStatus = ["Accepted", "Rejected"];

const ApplicantsTable = () => {
  const { applicants } = useSelector((store) => store.application);

  const location = useLocation();
  const role = location.state?.role;
  const description = location.state?.description;

  const statusHandler = async (status, id, email) => {
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.post(
        `${APPLICATION_API_END_POINT}/status/${id}/update`,
        { status, email, role }
      );
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-10 font-sans">
      <div className="bg-white shadow-2xl rounded-3xl p-8 max-w-full overflow-x-auto">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-6 text-center uppercase tracking-wide">
          Applicants List
        </h2>
        <Table>
          <TableCaption className="text-sm text-gray-500 italic">
            A list of recently applied users.
          </TableCaption>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-200 to-purple-300 text-gray-800 font-bold text-base tracking-wide uppercase">
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Resume</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
              <TableHead>Form Panel</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applicants?.applications?.map((item) => (
              <TableRow
                key={item._id}
                className="hover:bg-blue-50 transition-all duration-200 text-gray-700"
              >
                <TableCell className="font-medium text-sm">
                  {item?.applicant?.fullname}
                </TableCell>
                <TableCell className="text-sm">
                  {item?.applicant?.email}
                </TableCell>
                <TableCell className="text-sm">
                  {item?.applicant?.phoneNumber}
                </TableCell>
                <TableCell className="text-sm">
                  {item.applicant?.profile?.resume ? (
                    <a
                      className="text-blue-600 hover:underline font-medium"
                      href={item?.applicant?.profile?.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item?.applicant?.profile?.resumeOriginalName}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Not uploaded</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {item?.applicant?.createdAt
                    ? item.applicant.createdAt.split("T")[0]
                    : "NA"}
                </TableCell>
                <TableCell className="text-right">
                  <Popover>
                    <PopoverTrigger>
                      <MoreHorizontal className="cursor-pointer text-gray-700 hover:text-black" />
                    </PopoverTrigger>
                    <PopoverContent className="w-32 bg-white shadow-md rounded-md">
                      {shortlistingStatus.map((status, index) => (
                        <div
                          key={index}
                          onClick={() =>
                            statusHandler(
                              status,
                              item?._id,
                              item?.applicant?.email
                            )
                          }
                          className={`flex items-center px-2 py-1 rounded cursor-pointer hover:bg-gray-100 text-sm ${
                            status === "Accepted"
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {status}
                        </div>
                      ))}
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  <Link
                    to="/expertList"
                    state={{
                      resume: item?.applicant?.profile?.resume,
                      name: item?.applicant?.fullname,
                      email: item?.applicant?.email,
                      description: description,
                    }}
                  >
                    <button
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-1.5 rounded-lg shadow-md text-sm font-semibold transition duration-200"
                    >
                      Open Panel
                    </button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ApplicantsTable;
