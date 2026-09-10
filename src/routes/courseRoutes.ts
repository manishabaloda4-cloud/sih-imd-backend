import { Router, Request, Response } from "express";
import Course from "../models/Course";
import { requireLogin, requireRole, requireApproved } from "../middleware/auth";

const router = Router();

// GET /api/courses - list all courses (any logged-in user)
router.get("/", requireLogin, async (req: Request, res: Response) => {
  try {
    const courses = await Course.find().populate("createdBy", "name email");
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// GET /api/courses/:id - single course detail
router.get("/:id", requireLogin, async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch course" });
  }
});

// POST /api/courses - create a course (APPROVED trainer or admin only)
router.post(
  "/",
  requireLogin,
  requireRole(["admin", "trainer"]),
  requireApproved,
  async (req: Request, res: Response) => {
    try {
      const { title, description, requiredCompetencies, content, region, category, level, duration, status } =
        req.body;
      const dbUser = (req as any).dbUser;

      const course = await Course.create({
        title,
        description,
        createdBy: dbUser._id,
        requiredCompetencies,
        content,
        region,
        category,
        level,
        duration,
        status: status || "DRAFT",
      });
      res.status(201).json(course);
    } catch (error) {
      res.status(500).json({ error: "Failed to create course" });
    }
  }
);

// PUT /api/courses/:id - update a course (owner trainer or admin only - a trainer cannot edit another trainer's course)
router.put(
  "/:id",
  requireLogin,
  requireRole(["admin", "trainer"]),
  async (req: Request, res: Response) => {
    try {
      const dbUser = (req as any).dbUser;
      const existing = await Course.findById(req.params.id);
      if (!existing) return res.status(404).json({ error: "Course not found" });
      if (dbUser.role !== "admin" && existing.createdBy.toString() !== dbUser._id.toString()) {
        return res.status(403).json({ error: "You do not own this course" });
      }
      const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.json(course);
    } catch (error) {
      res.status(500).json({ error: "Failed to update course" });
    }
  }
);

// DELETE /api/courses/:id - delete a course (admin only)
router.delete(
  "/:id",
  requireLogin,
  requireRole(["admin"]),
  async (req: Request, res: Response) => {
    try {
      await Course.findByIdAndDelete(req.params.id);
      res.json({ message: "Course deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete course" });
    }
  }
);

export default router;
