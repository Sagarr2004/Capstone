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
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-700 text-white">
        <div className="max-w-7xl mx-auto py-12 px-6">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-10 transition-all duration-300 hover:shadow-purple-500/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
              <h1 className="text-4xl font-extrabold text-center md:text-left tracking-tight text-white drop-shadow-md">
                Company Directory
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Input
                  className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 shadow-inner focus:ring-2 focus:ring-fuchsia-400 transition-all"
                  placeholder="Search company name..."
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button
                  onClick={() => navigate("/admin/companies/create")}
                  className="bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all hover:scale-105"
                >
                  + New Company
                </Button>
              </div>
            </div>

            <div className="bg-white/20 p-4 rounded-xl shadow-inner max-h-[70vh] overflow-auto scrollbar-thin scrollbar-thumb-fuchsia-400 scrollbar-track-fuchsia-100">
              <CompaniesTable />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Companies;
