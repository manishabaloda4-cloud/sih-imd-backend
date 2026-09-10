import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import User from "../models/User";
import { requireLogin, requireRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorMiddleware";
import { success, fail } from "../utils/apiResponse";

const router = Router();

// POST /api/users/sync - call this right after a user logs in via Clerk on the frontend
// Creates the user in our DB the first time they log in.
// role is optional in body - a user picking "trainer" here goes to PENDING automatically
// (see User model pre-save hook). Anyone else defaults to "trainee".
router.post("/sync", requireLogin, async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    const { name, email, role } = req.body;

    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      const requestedRole = role === "trainer" ? "trainer" : "trainee";
      user = await User.create({ clerkId: userId, name, email, role: requestedRole });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to sync user" });
  }
});

// GET /api/users/me - get current logged-in user's profile + role
router.get("/me", requireLogin, async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    const user = await User.findOne({ clerkId: userId });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// PUT /api/users/me - update own profile fields (not role/status - those are admin-controlled)
router.put(
  "/me",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const { name, department, designation, qualifications, experience, skills, interests, region } =
      req.body;
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { name, department, designation, qualifications, experience, skills, interests, region },
      { new: true, runValidators: true }
    );
    if (!user) return fail(res, "User not found", 404);
    return success(res, user, "Profile updated");
  })
);

// GET /api/users/:id - view another user's public profile (any logged-in user)
router.get(
  "/:id",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id).select("-clerkId -email");
    if (!user) return fail(res, "User not found", 404);
    return success(res, user);
  })
);

export default router;
