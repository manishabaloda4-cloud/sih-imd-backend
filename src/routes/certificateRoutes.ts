import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import Certificate from "../models/Certificate";
import User from "../models/User";
import { requireLogin } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorMiddleware";
import { success, fail } from "../utils/apiResponse";

const router = Router();

// GET /api/certificates - trainee's own certificates
router.get(
  "/",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId: clerkId } = getAuth(req);
    const user = await User.findOne({ clerkId });
    if (!user) return fail(res, "User not found", 404);

    const certificates = await Certificate.find({ traineeId: user._id }).populate("courseId", "title");
    return success(res, certificates);
  })
);

// GET /api/certificates/:id - view/verify a single certificate (public verification use)
router.get(
  "/:id",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const certificate = await Certificate.findById(req.params.id)
      .populate("courseId", "title")
      .populate("traineeId", "name");
    if (!certificate) return fail(res, "Certificate not found", 404);
    return success(res, certificate);
  })
);

export default router;