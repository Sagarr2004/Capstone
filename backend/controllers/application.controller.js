import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { sendEmail } from "./sendEmail.controllers.js";

export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required.",
                success: false
            })
        };
        // check if the user has already applied for the job
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this jobs",
                success: false
            });
        }

        // check if the jobs exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            })
        }
        // create a new application
        const newApplication = await Application.create({
            job:jobId,
            applicant:userId,
        });

        job.applications.push(newApplication._id);
        await job.save();
        return res.status(201).json({
            message:"Job applied successfully.",
            success:true
        })
    } catch (error) {
        console.log(error);
    }
};
export const getAppliedJobs = async (req,res) => {
    try {
        const userId = req.id;
        const application = await Application.find({applicant:userId}).sort({createdAt:-1}).populate({
            path:'job',
            options:{sort:{createdAt:-1}},
            populate:{
                path:'company',
                options:{sort:{createdAt:-1}},
            }
        });
        if(!application){
            return res.status(404).json({
                message:"No Applications",
                success:false
            })
        };
        return res.status(200).json({
            application,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}
// admin dekhega kitna user ne apply kiya hai
export const getApplicants = async (req,res) => {
    try {
        // const jobId = "67a1092f707de034ca165eeb";
        const jobId = req.params.id;
        // console.log("JobId: ",jobId);
        const job = await Job.findById(jobId).sort({createdAt:-1}).populate({
            path:'applications',
            options:{sort:{createdAt:-1}},
            populate:{
                path:'applicant'
            }
        });
        if(!job){
            return res.status(404).json({
                message:'Job not found.',
                success:false
            })
        };
        
        // console.log("Jobs:",job);

        return res.status(200).json({
            job, 
            succees:true
        });
    } catch (error) {
        console.log(error);
    }
}

// export const getApplicants = async (req, res) => {
//     try {
//         const jobId = req.params.id;

//         const job = await Job.findById(jobId)
//             .populate({
//                 path: "applications",
//                 options: { sort: { createdAt: -1 } },
//                 populate: {
//                     path: "applicant",
//                     select: "fullname profile.resume" // ✅ Select only necessary fields
//                 }
//             });

//         if (!job) {
//             return res.status(404).json({
//                 message: "Job not found.",
//                 success: false
//             });
//         }

//         console.log("Jobs:", job);

//         // Extract applicant resumes
//         const applicantsWithResumes = job.applications
//             .map(app => ({
//                 name: app.applicant?.fullname,
//                 resumeLink: app.applicant?.profile?.resume
//             }))
//             .filter(applicant => applicant.resumeLink); // ✅ Remove empty resume entries

//         console.log("Resumes Extracted:", applicantsWithResumes);

//         return res.status(200).json({
//             success: true,
//             resumes: applicantsWithResumes
//         });
//     } catch (error) {
//         console.log("Error:", error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// };

export const updateStatus = async (req, res) => {
    try {
        const { status, email, role } = req.body;
        const applicationId = req.params.id;

        if (!status) {
            return res.status(400).json({
                message: "Status is required",
                success: false,
            });
        }

        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false,
            });
        }

        application.status = status.toLowerCase();
        await application.save();

        if (status.toLowerCase() === "accepted") {
            // Schedule Interview (10 days ahead, with 2-day gap if needed)
            // const interviewDate = await scheduleInterview(email);

            // // Save interview date in DB
            // application.interviewDate = interviewDate;
            // await application.save();

            await sendEmail(
                email,
                "🎉 Interview Scheduled!",
                ` 
                <h2>Great News! 🎊</h2>
                <p>Your interview for <b>${role}</b> is scheduled on🌟</p>
                <p>Please check your email for calendar updates.</p>
                <p>Good luck! 🚀</p>
                `
            );
        } else if (status.toLowerCase() === "rejected") {
            await sendEmail(
                email,
                "⚠ Application Update",
                `
                <h2>Thank you for applying</h2>
                <p>We appreciate your interest in the <b>${role}</b> position.</p>
                <p>Unfortunately, we have decided to move forward with other candidates.</p>
                <p>We encourage you to apply again in the future. Best of luck! 🍀</p>
                `
            );
        }

        return res.status(200).json({
            message: "Status updated successfully.",
            success: true,
        });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: "Internal Server Error", success: false });
    }
};