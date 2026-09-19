import { Router, Request, Response } from "express";
import User from "../models/User";
import Course from "../models/Course";
import Enrollment from "../models/Enrollment";
import Submission from "../models/Submission";
import Notification from "../models/Notification";
import { requireLogin, requireRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorMiddleware";
import { success, fail } from "../utils/apiResponse";

const router = Router();

// All routes here are admin-only
router.use(requireLogin, requireRole(["admin"]));

// GET /api/admin/dashboard - aggregate platform stats
router.get(
  "/dashboard",
  asyncHandler(async (req: Request, res: Response) => {
    const [
      totalUsers,
      totalTrainees,
      totalTrainers,
      pendingTrainerApprovals,
      totalCourses,
      totalEnrollments,
      completedEnrollments,
      assessmentAttempts,
      avgScoreResult,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "trainee" }),
      User.countDocuments({ role: "trainer", status: "APPROVED" }),
      User.countDocuments({ role: "trainer", status: "PENDING" }),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ status: "completed" }),
      Submission.countDocuments(),
      Submission.aggregate([{ $group: { _id: null, avg: { $avg: "$percentage" } } }]),
    ]);

    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;
    const averageAssessmentScore = avgScoreResult[0]?.avg ? Math.round(avgScoreResult[0].avg) : 0;

    return success(res, {
      totalUsers,
      totalTrainees,
      totalTrainers,
      pendingTrainerApprovals,
      totalCourses,
      totalEnrollments,
      completionRate,
      assessmentAttempts,
      averageAssessmentScore,
    });
  })
);

// GET /api/admin/users - list all users, optionally filter by status/role via query params
router.get(
  "/users",
  asyncHandler(async (req: Request, res: Response) => {
    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).sort({ createdAt: -1 });
    return success(res, users);
  })
);

// PUT /api/admin/users/:id/approve
router.put(
  "/users/:id/approve",
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "APPROVED" },
      { new: true }
    );
    if (!user) return fail(res, "User not found", 404);
    await Notification.create({
      userId: user._id,
      message: "Your trainer account has been approved!",
      type: "trainer_approved",
    });
    return success(res, user, "Trainer approved");
  })
);

// PUT /api/admin/users/:id/reject
router.put(
  "/users/:id/reject",
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "REJECTED" },
      { new: true }
    );
    if (!user) return fail(res, "User not found", 404);
    await Notification.create({
      userId: user._id,
      message: "Your trainer application was not approved.",
      type: "trainer_rejected",
    });
    return success(res, user, "Trainer rejected");
  })
);

export default router;
