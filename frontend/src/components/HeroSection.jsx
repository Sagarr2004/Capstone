import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { useNavigate } from "react-router-dom";
import jobImage from "../assets/front.png";
import CategoryCarousel from "./CategoryCarousel";

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        if (query.trim() !== "") {
            dispatch(setSearchedQuery(query));
            navigate("/browse");
        }
    };

    return (
        <div className="relative w-full h-screen flex flex-col items-center justify-center text-center text-white overflow-hidden">
            {/* Background with Gradient Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${jobImage})`, backgroundSize: "cover", filter: "blur(2px)" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"></div>

            {/* Content */}
            <motion.div className="relative z-10 flex flex-col gap-5 max-w-3xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
                <motion.span className="mx-auto px-4 py-2 rounded-full bg-[#F83002] text-white font-medium shadow-lg" whileHover={{ scale: 1.1 }}>
                    🚀 No. 1 Job Hunting Platform
                </motion.span>

                <motion.h1 className="text-6xl font-extrabold leading-tight text-white" style={{ textShadow: "4px 4px 10px rgba(0, 0, 0, 0.8)" }} whileHover={{ scale: 1.05 }}>
                    Swipe Right <br /> on Your <span className="text-[#00E676]">Dream Job!</span>
                </motion.h1>
                
                <motion.p className="text-lg font-bold text-white bg-black bg-opacity-60 px-4 py-2 rounded-lg" whileHover={{ scale: 1.05 }}>
                    Connecting <span className="font-extrabold text-[#FFD700]">Talent</span> with <span className="font-extrabold text-[#FFD700]">Opportunity</span>, Effortlessly!
                </motion.p>

                {/* Search Bar with Glassmorphism Effect */}
                <div className="flex w-[70%] bg-black/20 backdrop-blur-lg text-white rounded-full items-center mx-auto shadow-lg overflow-hidden border border-black/30">
                    <input
                        type="text"
                        placeholder="Find your dream job..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full px-4 py-3 text-lg bg-transparent outline-none border-none text-black placeholder-gray-300"
                    />
                    <Button onClick={searchJobHandler} className="rounded-r-full bg-[#FDFAF6] hover:bg-[#d2e7e7] px-5 py-3">
                        <Search className="h-6 w-6 text-black" />
                    </Button>
                </div>
<br/>
                {/* CTA Section */}
                <motion.span className="mx-auto px-4 py-2 rounded-full bg-[#F83002] text-white font-medium shadow-lg" whileHover={{ scale: 1.1 }}>
                    Start Your Job Search 🚀
                </motion.span>

                {/* <CategoryCarousel /> */}
            </motion.div>
        </div>
    );
};

export default HeroSection;
