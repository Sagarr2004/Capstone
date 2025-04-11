import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { applyJob, getApplicants, getAppliedJobs, updateStatus } from "../controllers/application.controller.js";
import {Job} from "../models/job.model.js"
 
const router = express.Router();

router.route("/apply/:id").get(isAuthenticated, applyJob);
router.route("/get").get(isAuthenticated, getAppliedJobs);
router.route("/:id/applicants").get(isAuthenticated, getApplicants);
router.route("/status/:id/update").post(isAuthenticated, updateStatus);

router.get("/:id/applicants/resume", async (req, res) => {
    try {
        const jobId = req.params.id;

        const job = await Job.findById(jobId)
            .populate({
                path: "applications",
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: "applicant",
                    select: "fullname profile.resume" // ✅ Select only necessary fields
                }
            });

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        // console.log("Jobs:", job);

        // Extract applicant resumes
        const applicantsWithResumes = job.applications
            .map(app => ({
                name: app.applicant?.fullname,
                resumeLink: app.applicant?.profile?.resume
            }))
            .filter(applicant => applicant.resumeLink); // ✅ Remove empty resume entries

        console.log("Resumes Extracted:", applicantsWithResumes);

        return res.status(200).json({
            success: true,
            resumes: applicantsWithResumes
        });
    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
 

export default router;

