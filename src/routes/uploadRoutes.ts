import { Router, Request, Response } from "express";
import multer from "multer";
import Module from "../models/Module";
import Course from "../models/Course";
import { requireLogin, requireRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorMiddleware";
import { success, fail } from "../utils/apiResponse";
import { uploadFile, deleteFile, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "../services/storageService";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error(`File type ${file.mimetype} not allowed. Use mp4, pdf, ppt, or pptx.`));
    }
    cb(null, true);
  },
});

const router = Router();

// POST /api/modules/:id/upload - upload a video/pdf/ppt and attach it to a module
// multipart/form-data with a single field named "file"
router.post(
  "/modules/:id/upload",
  requireLogin,
  requireRole(["admin", "trainer"]),
  upload.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) return fail(res, "No file provided (field name must be 'file')", 400);

    const module = await Module.findById(req.params.id);
    if (!module) return fail(res, "Module not found", 404);

    const course = await Course.findById(module.courseId);
    const dbUser = (req as any).dbUser;
    if (dbUser.role !== "admin" && course?.createdBy.toString() !== dbUser._id.toString()) {
      return fail(res, "You do not own this course", 403);
    }

    const result = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);

    // attach to the right field based on file type
    if (req.file.mimetype === "video/mp4") module.videoUrl = result.url;
    else if (req.file.mimetype === "application/pdf") module.pdfUrl = result.url;
    else module.pptUrl = result.url;

    await module.save();

    return success(res, { module, upload: result }, "File uploaded and attached to module", 201);
  })
);

export default router;
