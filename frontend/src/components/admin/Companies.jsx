import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import CompaniesTable from "./CompaniesTable";
import { useNavigate } from "react-router-dom";
import useGetAllCompanies from "@/utils/hooks/useGetAllCompanies";
import { useDispatch } from "react-redux";
import { setSearchCompanyByText } from "@/redux/companySlice";

const Companies = () => {
  useGetAllCompanies();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchCompanyByText(input));
  }, [input]);

  return (
  <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-purple-600 text-white">
      <div className="max-w-6xl mx-auto my-10 p-6 bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-lg">
        {/* <h1 className="text-3xl font-bold text-center mb-6">Company Directory</h1> */}
        <div className="flex flex-col sm:flex-row items-center justify-between my-5 gap-4">
          <Input
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-white text-gray-800 shadow-md focus:ring-2 focus:ring-purple-400"
            placeholder="Filter by name"
            onChange={(e) => setInput(e.target.value)}
          />
          <Button 
            onClick={() => navigate("/admin/companies/create")}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-md shadow-md transition-transform transform hover:scale-105"
          >
            New Company
          </Button>
        </div>
        <CompaniesTable />
      </div>
    </div>
    </>
  );
};

export default Companies;
