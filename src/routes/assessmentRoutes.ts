import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import Assessment from "../models/Assessment";
import Question from "../models/Question";
import Submission from "../models/Submission";
import Enrollment from "../models/Enrollment";
import User from "../models/User";
import { requireLogin, requireRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorMiddleware";
import { success, fail } from "../utils/apiResponse";
import { scoreSubmission } from "../services/scoringService";
import { updateUserCompetency } from "../services/competencyService";

const router = Router();

// POST /api/assessments - create assessment + its questions (trainer/admin)
router.post(
  "/",
  requireLogin,
  requireRole(["admin", "trainer"]),
  asyncHandler(async (req: Request, res: Response) => {
    const dbUser = (req as any).dbUser;
    const { courseId, title, description, duration, deadline, passingScore, questions } = req.body;

    const assessment = await Assessment.create({
      courseId,
      title,
      description,
      duration,
      deadline,
      passingScore: passingScore || 60,
      createdBy: dbUser._id,
    });

    // questions: array of { question, options, correctAnswer, marks, competencyId, difficulty }
    if (Array.isArray(questions) && questions.length > 0) {
      const docs = questions.map((q: any) => ({ ...q, assessmentId: assessment._id }));
      await Question.insertMany(docs);
    }

    return success(res, assessment, "Assessment created", 201);
  })
);

// GET /api/assessments/:id - assessment + its questions (options shown, correctAnswer hidden for trainees)
router.get(
  "/:id",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return fail(res, "Assessment not found", 404);
    const dbUser = (req as any).dbUser;

    const questions = await Question.find({ assessmentId: assessment._id });
    const isTrainee = !dbUser || dbUser.role === "trainee";
    const safeQuestions = isTrainee
      ? questions.map((q) => ({ _id: q._id, question: q.question, options: q.options, marks: q.marks }))
      : questions;

    return success(res, { assessment, questions: safeQuestions });
  })
);

// PUT /api/assessments/:id
router.put(
  "/:id",
  requireLogin,
  requireRole(["admin", "trainer"]),
  asyncHandler(async (req: Request, res: Response) => {
    const assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!assessment) return fail(res, "Assessment not found", 404);
    return success(res, assessment, "Assessment updated");
  })
);

// DELETE /api/assessments/:id
router.delete(
  "/:id",
  requireLogin,
  requireRole(["admin", "trainer"]),
  asyncHandler(async (req: Request, res: Response) => {
    await Assessment.findByIdAndDelete(req.params.id);
    await Question.deleteMany({ assessmentId: req.params.id });
    return success(res, null, "Assessment deleted");
  })
);

// POST /api/assessments/:id/submit - trainee submits answers, backend scores them
router.post(
  "/:id/submit",
  requireLogin,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId: clerkId } = getAuth(req);
    const user = await User.findOne({ clerkId });
    if (!user) return fail(res, "User not found", 404);

    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return fail(res, "Assessment not found", 404);

    const questions = await Question.find({ assessmentId: assessment._id });
    if (questions.length === 0) return fail(res, "This assessment has no questions", 400);

    // { answers: [{ questionId, selectedOption }] } - frontend sends this, NOT a score
    const { answers } = req.body;
    if (!Array.isArray(answers)) return fail(res, "answers array is required", 400);

    const result = scoreSubmission(questions, answers, assessment.passingScore);

    const submission = await Submission.create({
      traineeId: user._id,
      assessmentId: assessment._id,
      answers,
      ...result,
    });

    // update UserCompetency per competency tag found on the questions
    const byCompetency: Record<string, { earned: number; total: number }> = {};
    for (const q of questions) {
      if (!q.competencyId) continue;
      const key = q.competencyId.toString();
      if (!byCompetency[key]) byCompetency[key] = { earned: 0, total: 0 };
      byCompetency[key].total += q.marks;
      const given = answers.find((a: any) => a.questionId === (q._id as any).toString());
      if (given && given.selectedOption === q.correctAnswer) byCompetency[key].earned += q.marks;
    }
    for (const [competencyId, tally] of Object.entries(byCompetency)) {
      const competencyScore = tally.total > 0 ? Math.round((tally.earned / tally.total) * 100) : 0;
      await updateUserCompetency(user._id.toString(), competencyId, competencyScore);
    }

    // update enrollment with the latest score for this course
    await Enrollment.findOneAndUpdate(
      { userId: user._id, courseId: assessment.courseId },
      {
        assessmentScore: result.percentage,
        status: result.passed ? "completed" : "in_progress",
        ...(result.passed ? { completedAt: new Date() } : {}),
      }
    );

    return success(res, submission, "Assessment submitted and scored", 201);
  })
);

// GET /api/assessments/:id/results - trainer/admin view all submissions for an assessment
router.get(
  "/:id/results",
  requireLogin,
  requireRole(["admin", "trainer"]),
  asyncHandler(async (req: Request, res: Response) => {
    const submissions = await Submission.find({ assessmentId: req.params.id }).populate(
      "traineeId",
      "name email"
    );
    return success(res, submissions);
  })
);

export default router;
