import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import Competency from "../models/Competency";
import UserCompetency from "../models/UserCompetency";
import User from "../models/User";
import { requireLogin, requireRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorMiddleware";
import { success, fail } from "../utils/apiResponse";
import { calculateSkillGaps } from "../services/competencyService";

const router = Router();

// GET /api/competencies - list all (any logged-in user)
router.get(
  "/competencies",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const competencies = await Competency.find();
    return success(res, competencies);
  })
);

// POST /api/competencies - admin only
router.post(
  "/competencies",
  requireLogin,
  requireRole(["admin"]),
  asyncHandler(async (req: Request, res: Response) => {
    const competency = await Competency.create(req.body);
    return success(res, competency, "Competency created", 201);
  })
);

// PUT /api/competencies/:id
router.put(
  "/competencies/:id",
  requireLogin,
  requireRole(["admin"]),
  asyncHandler(async (req: Request, res: Response) => {
    const competency = await Competency.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!competency) return fail(res, "Competency not found", 404);
    return success(res, competency, "Competency updated");
  })
);

// DELETE /api/competencies/:id
router.delete(
  "/competencies/:id",
  requireLogin,
  requireRole(["admin"]),
  asyncHandler(async (req: Request, res: Response) => {
    await Competency.findByIdAndDelete(req.params.id);
    return success(res, null, "Competency deleted");
  })
);

// GET /api/users/me/competencies
router.get(
  "/users/me/competencies",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId: clerkId } = getAuth(req);
    const user = await User.findOne({ clerkId });
    if (!user) return fail(res, "User not found", 404);
    const records = await UserCompetency.find({ userId: user._id }).populate("competencyId", "name category");
    return success(res, records);
  })
);

// GET /api/users/me/skill-gaps
router.get(
  "/users/me/skill-gaps",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId: clerkId } = getAuth(req);
    const user = await User.findOne({ clerkId });
    if (!user) return fail(res, "User not found", 404);
    const gaps = await calculateSkillGaps(user._id.toString());
    return success(res, gaps);
  })
);

// GET /api/users/:id/competencies - view someone else's (trainer/admin use)
router.get(
  "/users/:id/competencies",
  requireLogin,
  requireRole(["admin", "trainer"]),
  asyncHandler(async (req: Request, res: Response) => {
    const records = await UserCompetency.find({ userId: req.params.id }).populate(
      "competencyId",
      "name category"
    );
    return success(res, records);
  })
);

export default router;
