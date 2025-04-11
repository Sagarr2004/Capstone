import { Job } from "../models/job.model.js";
import sendBulkEmails from "./sendBulkEmails.controllers.js";
import { User } from "../models/user.model.js";
import {Notification} from "../models/notifications.models.js"



export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyId,
    } = req.body;
    const userId = req.id;

    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !location ||
      !jobType ||
      !experience ||
      !position ||
      !companyId
    ) {
      return res.status(400).json({
        message: "Something is missing.",
        success: false,
      });
    }

    const job = await Job.create({
      title,
      description,
      requirements: requirements.split(","),
      salary: Number(salary),
      location,
      jobType,
      experienceLevel: experience,
      position,
      company: companyId,
      created_by: userId,
    });

    try {
        const students = await User.find({ role: "student" }, { fullname: 1, email: 1, _id: 0 });

        if (students.length === 0) {
            console.log("No students found.");
            return;
        }

        const emails = students.map(student => student.email);

        const subject = "Exciting Job Opportunity for Students!";
        const htmlContent = "<p>Dear Students,</p><p>A new job opportunity has just been posted! This could be a great chance for you to take the next step in your career.</p><p>Don't miss out—check the details and apply now!</p>";

        await sendBulkEmails(emails, subject, htmlContent);
        console.log("Bulk emails sent successfully!");
    } catch (error) {
        console.error("Error sending bulk emails:", error);
    }


    // Store notification in DB
    const notification = await Notification.create({
      message: `New Job: ${title} at ${location}!`,
      jobId: job._id,
    });
  

    
    return res.status(201).json({
      message: "New job created successfully.",
      job,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};


// export const postJob = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       requirements,
//       salary,
//       location,
//       jobType,
//       experience,
//       position,
//       companyId,
//     } = req.body;
//     const userId = req.id;

//     if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
//       return res.status(400).json({ message: "Something is missing.", success: false });
//     }

//     const job = await Job.create({
//       title,
//       description,
//       requirements: requirements.split(","),
//       salary: Number(salary),
//       location,
//       jobType,
//       experienceLevel: experience,
//       position,
//       company: companyId,
//       created_by: userId,
//     });

//     // Store notification in DB
//     const notification = await Notification.create({
//       message: `New Job: ${title} at ${location}!`,
//       jobId: job._id,
//     });

//     // Emit real-time event
//     if (req.io) {
//       req.io.emit("newJobPosted", {
//         message: notification.message,
//         job,
//       });
//     }

//     return res.status(201).json({
//       message: "New job created successfully.",
//       job,
//       success: true,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Internal Server Error", success: false });
//   }
// };


export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    return res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



export const deleteJob = async (req, res) => {
  console.log("Delete Job Function Called");
  console.log("Job ID Received:", req.params.id);

  try {
    const id = req.params.id; // ✅ Corrected extraction
    if (!id) {
      return res
        .status(400)
        .json({ message: "Job ID is required.", success: false });
    }

    const job = await Job.findByIdAndDelete(id);
    if (!job) {
      return res
        .status(404)
        .json({ message: "Job not found.", success: false });
    }

    console.log("Job Deleted Successfully:", job);
    return res
      .status(200)
      .json({ message: "Job deleted successfully.", success: true });
  } catch (error) {
    console.error("Error deleting job:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", success: false });
  }
};

// student k liye
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const minSalary = Number(req.query.minSalary) || 0;
    const maxSalary = Number(req.query.maxSalary) || Infinity;

    const query = {
      $and: [
        {
          $or: [
            { title: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
          ],
        },
        {
          salary: { $gte: minSalary, $lte: maxSalary },
        },
      ],
    };

    const jobs = await Job.find(query)
      .populate({
        path: "company",
      })
      .sort({ createdAt: -1 });

    if (!jobs.length) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }

    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error.",
      success: false,
    });
  }
};

// student
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
      path: "applications",
    });
    if (!job) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }
    return res.status(200).json({ job, success: true });
  } catch (error) {
    console.log(error);
  }
};
// admin kitne job create kra hai abhi tk
export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;
    const jobs = await Job.find({ created_by: adminId }).populate({
      path: "company",
      createdAt: -1,
    });
    if (!jobs) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }
    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
