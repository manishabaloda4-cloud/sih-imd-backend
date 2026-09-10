import { Router, Request, Response } from "express";
import Module from "../models/Module";
import Course from "../models/Course";
import { requireLogin, requireRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorMiddleware";
import { success, fail } from "../utils/apiResponse";

const router = Router();

// GET /api/courses/:courseId/modules - list modules for a course, in order
router.get(
  "/courses/:courseId/modules",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const modules = await Module.find({ courseId: req.params.courseId }).sort({ order: 1 });
    return success(res, modules);
  })
);

// POST /api/courses/:courseId/modules - add a module (course owner or admin only)
router.post(
  "/courses/:courseId/modules",
  requireLogin,
  requireRole(["admin", "trainer"]),
  asyncHandler(async (req: Request, res: Response) => {
    const course = await Course.findById(req.params.courseId);
    if (!course) return fail(res, "Course not found", 404);
    const dbUser = (req as any).dbUser;
    if (dbUser.role !== "admin" && course.createdBy.toString() !== dbUser._id.toString()) {
      return fail(res, "You do not own this course", 403);
    }
    const { title, description, order, videoUrl, pdfUrl, pptUrl, textContent } = req.body;
    const module = await Module.create({
      courseId: course._id,
      title,
      description,
      order,
      videoUrl,
      pdfUrl,
      pptUrl,
      textContent,
    });
    return success(res, module, "Module created", 201);
  })
);

// PUT /api/modules/:id
router.put(
  "/modules/:id",
  requireLogin,
  requireRole(["admin", "trainer"]),
  asyncHandler(async (req: Request, res: Response) => {
    const module = await Module.findById(req.params.id);
    if (!module) return fail(res, "Module not found", 404);
    const course = await Course.findById(module.courseId);
    const dbUser = (req as any).dbUser;
    if (dbUser.role !== "admin" && course?.createdBy.toString() !== dbUser._id.toString()) {
      return fail(res, "You do not own this course", 403);
    }
    Object.assign(module, req.body);
    await module.save();
    return success(res, module, "Module updated");
  })
);

// DELETE /api/modules/:id
router.delete(
  "/modules/:id",
  requireLogin,
  requireRole(["admin", "trainer"]),
  asyncHandler(async (req: Request, res: Response) => {
    const module = await Module.findById(req.params.id);
    if (!module) return fail(res, "Module not found", 404);
    const course = await Course.findById(module.courseId);
    const dbUser = (req as any).dbUser;
    if (dbUser.role !== "admin" && course?.createdBy.toString() !== dbUser._id.toString()) {
      return fail(res, "You do not own this course", 403);
    }
    await module.deleteOne();
    return success(res, null, "Module deleted");
  })
);

export default router;
