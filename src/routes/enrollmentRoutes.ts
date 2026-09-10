import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import Enrollment from "../models/Enrollment";
import Course from "../models/Course";
import User from "../models/User";
import { requireLogin } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorMiddleware";
import { success, fail } from "../utils/apiResponse";

const router = Router();

// POST /api/courses/:id/enroll - trainee enrolls in a course
router.post(
  "/courses/:id/enroll",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const course = await Course.findById(req.params.id);
    if (!course) return fail(res, "Course not found", 404);

    const { userId: clerkId } = getAuth(req);
    const user = await User.findOne({ clerkId });
    if (!user) return fail(res, "User not found", 404);

    const existing = await Enrollment.findOne({ userId: user._id, courseId: course._id });
    if (existing) return fail(res, "Already enrolled in this course", 409);

    const enrollment = await Enrollment.create({
      userId: user._id,
      courseId: course._id,
      status: "not_started",
    });
    return success(res, enrollment, "Enrolled successfully", 201);
  })
);

// GET /api/users/me/courses - list courses the current user is enrolled in
router.get(
  "/users/me/courses",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId: clerkId } = getAuth(req);
    const user = await User.findOne({ clerkId });
    if (!user) return fail(res, "User not found", 404);

    const enrollments = await Enrollment.find({ userId: user._id }).populate("courseId");
    return success(res, enrollments);
  })
);

// GET /api/enrollments/:id
router.get(
  "/enrollments/:id",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const enrollment = await Enrollment.findById(req.params.id).populate("courseId");
    if (!enrollment) return fail(res, "Enrollment not found", 404);
    return success(res, enrollment);
  })
);

export default router;
