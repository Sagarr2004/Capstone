import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { COMPANY_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setSingleCompany } from "@/redux/companySlice";
import companyImage from "@/assets/company.jpeg"; // ✅ Image Import
import { motion } from "framer-motion"; // ✅ Animation Library

const CompanyCreate = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const dispatch = useDispatch();

  const registerNewCompany = async () => {
    try {
      const res = await axios.post(
        `${COMPANY_API_END_POINT}/register`,
        { companyName },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res?.data?.success) {
        dispatch(setSingleCompany(res.data.company));
        toast.success(res.data.message);
        const companyId = res?.data?.company?._id;
        navigate(`/admin/companies/${companyId}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />

      {/* Background with Dark Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center mt-[60px]"
        style={{
          backgroundImage: `url(${companyImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      {/* Main Content - Floating Glassmorphism Card */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center border border-white/20 transform hover:scale-105 transition-transform"
        >
          <h1 className="text-white font-extrabold text-3xl mb-2 drop-shadow-lg">
            Create Your Company
          </h1>
          <p className="text-white text-opacity-80 mb-6 drop-shadow-md">
          "Enter a unique and memorable name for your company. You can always update it later."
          </p>

          {/* Input Field */}
          <div className="text-left w-full">
            <Label className="text-white font-semibold text-lg">Company Name</Label>
            <motion.div
              whileFocus={{ scale: 1.02 }}
              className="mt-2 transition-all duration-300"
            >
              <Input
                type="text"
                className="w-full p-4 rounded-lg bg-white/20 text-white placeholder-white/50 border-none focus:ring-2 focus:ring-white/50 transition-all"
                placeholder="Enter company name..."
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </motion.div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/30 text-white border-white px-6 py-3 rounded-lg hover:bg-white/40 transition-all"
              onClick={() => navigate("/admin/companies")}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all text-white px-6 py-3 rounded-lg shadow-lg"
              onClick={registerNewCompany}
            >
              Continue
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CompanyCreate;
