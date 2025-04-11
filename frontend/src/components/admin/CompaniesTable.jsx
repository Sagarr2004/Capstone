import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { COMPANY_API_END_POINT } from "@/utils/constant";
import { setCompanies } from "@/redux/companySlice";

const CompaniesTable = () => {
  const { companies, searchCompanyByText } = useSelector(
    (store) => store.company
  );
  const [filterCompany, setFilterCompany] = useState(companies);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const filteredCompany =
      companies.length >= 0 &&
      companies.filter((company) =>
        searchCompanyByText
          ? company?.name
              ?.toLowerCase()
              .includes(searchCompanyByText.toLowerCase())
          : true
      );
    setFilterCompany(filteredCompany);
  }, [companies, searchCompanyByText]);

  const deleteCompany = async (companyId) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/v1/company/${companyId}`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success(response.data.message);
        setFilterCompany((prev) =>
          prev.filter((company) => company._id !== companyId)
        );
      }
    } catch (error) {
      toast.error("Error deleting company:", error);
    }
  };

  return (
    <div>
      <Table>
        <TableCaption>A list of your recent registered companies</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Logo</TableHead>
            <TableHead>Expert</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filterCompany?.map((company) => (
            <TableRow key={company._id}>
              <TableCell>
                <Avatar>
                  <AvatarImage src={company.logo} />
                </Avatar>
              </TableCell>
              <TableCell>
                <Avatar>
                  <AvatarImage src={company.expertImage || "/default-avatar.png"} alt="Expert" />
                </Avatar>
              </TableCell>
              <TableCell>{company.createdAt.split("T")[0]}</TableCell>
              <TableCell className="text-right cursor-pointer">
                <Popover>
                  <PopoverTrigger>
                    <MoreHorizontal />
                  </PopoverTrigger>
                  <PopoverContent className="w-32">
                    <div
                      onClick={() =>
                        navigate(`/admin/companies/${company._id}`)
                      }
                      className="flex items-center gap-2 w-fit cursor-pointer"
                    >
                      <Edit2 className="w-4 hover:scale-110 " />
                      <span className="hover:scale-110 ">Edit</span>
                    </div>
                    <div
                      onClick={() => deleteCompany(company._id)}
                      className="flex items-center gap-2 w-fit cursor-pointer"
                    >
                      <Trash2 className="w-4 text-red-600 hover:scale-110 " />
                      <span className="text-red-600 hover:scale-110 ">
                        Remove
                      </span>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompaniesTable;
