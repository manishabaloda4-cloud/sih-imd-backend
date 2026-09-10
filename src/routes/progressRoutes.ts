import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import User from "../models/User";
import Progress from "../models/Progress";
import { requireLogin } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorMiddleware";
import { success, fail } from "../utils/apiResponse";
import { markModuleComplete } from "../services/progressService";

const router = Router();

// GET /api/courses/:id/progress - current user's progress in a course
router.get(
  "/courses/:id/progress",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId: clerkId } = getAuth(req);
    const user = await User.findOne({ clerkId });
    if (!user) return fail(res, "User not found", 404);

    const progress = await Progress.findOne({ traineeId: user._id, courseId: req.params.id });
    return success(res, progress || { percentage: 0, status: "NOT_STARTED" });
  })
);

// PUT /api/courses/:id/progress - mark a module complete (body: { moduleId })
// Backend recalculates the real percentage - it does not accept a percentage from the client.
router.put(
  "/courses/:id/progress",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId: clerkId } = getAuth(req);
    const user = await User.findOne({ clerkId });
    if (!user) return fail(res, "User not found", 404);

    const { moduleId } = req.body;
    if (!moduleId) return fail(res, "moduleId is required", 400);

    const progress = await markModuleComplete(user._id.toString(), req.params.id, moduleId);
    return success(res, progress, "Progress updated");
  })
);

export default router;
