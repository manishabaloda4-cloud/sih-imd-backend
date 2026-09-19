import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import Notification from "../models/Notification";
import User from "../models/User";
import { requireLogin } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorMiddleware";
import { success, fail } from "../utils/apiResponse";

const router = Router();

// GET /api/notifications - current user's notifications, newest first
router.get(
  "/",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId: clerkId } = getAuth(req);
    const user = await User.findOne({ clerkId });
    if (!user) return fail(res, "User not found", 404);

    const notifications = await Notification.find({ userId: user._id }).sort({ createdAt: -1 });
    return success(res, notifications);
  })
);

// PUT /api/notifications/:id/read - mark one as read
router.put(
  "/:id/read",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!notification) return fail(res, "Notification not found", 404);
    return success(res, notification, "Marked as read");
  })
);

export default router;