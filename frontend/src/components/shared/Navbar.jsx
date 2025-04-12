import React, { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Avatar, AvatarImage } from "../ui/avatar";
import { LogOut, User2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { setUser } from "@/redux/authSlice";
import { toast } from "sonner";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/job/getNotifications",
          { withCredentials: true }
        );
        setNotificationCount(res.data.notifications.length);
      } catch (error) {
        console.error("Error fetching notifications:", error.response?.data?.message || error.message);
      }
    };
    fetchNotifications();
  }, []);

  const logoutHandler = async () => {
    try {
      const res = await axios.get(`${USER_API_END_POINT}/logout`, {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setUser(null));
        navigate("/");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="bg-white shadow-lg w-full z-50">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16 px-6">
        {/* Logo */}
        <Link to="/">
          <h1 className="text-3xl font-extrabold text-[#0F4C75]">
            Hire<span className="text-[#F96D00]">Nest</span>
          </h1>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-10">
          <ul className="flex items-center gap-6 font-medium text-gray-700">
            {user && user.role === "recruiter" ? (
              <>
                <li><Link className="hover:text-[#F96D00]" to="/admin/companies">Companies</Link></li>
                <li><Link className="hover:text-[#F96D00]" to="/admin/jobs">Jobs</Link></li>
                <li><Link className="hover:text-[#F96D00]" to="/addExpert">Add Expert</Link></li>
              </>
            ) : (
              <>
                <li className="relative">
                  <Link className="hover:text-[#F96D00]" to="/alerts">
                    Alerts
                    {notificationCount > 0 && (
                      <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                        {notificationCount}
                      </span>
                    )}
                  </Link>
                </li>
                <li><Link className="hover:text-[#F96D00]" to="/alumni/search">Alumni</Link></li>
                <li><Link className="hover:text-[#F96D00]" to="/jobs">Jobs</Link></li>
                <li><Link className="hover:text-[#F96D00]" to="/browse">Browse</Link></li>
              </>
            )}
          </ul>

          {/* Auth Buttons */}
          {!user ? (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="outline" className="hover:border-[#219C90] hover:text-[#219C90]">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-[#219C90] hover:bg-[#1f857e] text-white">Signup</Button>
              </Link>
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer hover:scale-105 transition-transform">
                  <AvatarImage src={user?.profile?.profilePhoto} alt="User" />
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 shadow-xl rounded-xl">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user?.profile?.profilePhoto} />
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-lg text-[#0F4C75]">{user?.fullname}</h4>
                    <p className="text-sm text-gray-500">{user?.profile?.bio}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-3 text-gray-600">
                  {user.role === "student" && (
                    <Link to="/profile" className="flex items-center gap-2 hover:text-[#F96D00]">
                      <User2 className="w-4 h-4" />
                      View Profile
                    </Link>
                  )}
                  <button
                    onClick={logoutHandler}
                    className="flex items-center gap-2 text-left hover:text-[#F96D00]"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
