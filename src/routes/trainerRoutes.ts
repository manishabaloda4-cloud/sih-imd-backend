import { Router, Request, Response } from "express";
import User from "../models/User";
import TrainerCompetency from "../models/TrainerCompetency";
import { requireLogin, requireRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorMiddleware";
import { success, fail } from "../utils/apiResponse";

const router = Router();

// GET /api/trainers - list approved trainers only
router.get(
  "/",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const trainers = await User.find({ role: "trainer", status: "APPROVED" }).select(
      "-clerkId -email"
    );
    return success(res, trainers);
  })
);

// GET /api/trainers/:id
router.get(
  "/:id",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const trainer = await User.findOne({ _id: req.params.id, role: "trainer" }).select(
      "-clerkId -email"
    );
    if (!trainer) return fail(res, "Trainer not found", 404);
    return success(res, trainer);
  })
);

// GET /api/trainers/:id/expertise
router.get(
  "/:id/expertise",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const expertise = await TrainerCompetency.find({ trainerId: req.params.id }).populate(
      "competencyId",
      "name category"
    );
    return success(res, expertise);
  })
);

// POST /api/trainers/me/expertise - trainer sets/updates their own competency level
router.post(
  "/me/expertise",
  requireLogin,
  requireRole(["trainer"]),
  asyncHandler(async (req: Request, res: Response) => {
    const dbUser = (req as any).dbUser;
    const { competencyId, level, experience } = req.body;
    const record = await TrainerCompetency.findOneAndUpdate(
      { trainerId: dbUser._id, competencyId },
      { level, experience },
      { upsert: true, new: true }
    );
    return success(res, record, "Expertise updated");
  })
);

export default router;
