import mongoose from "mongoose";
import Module from "../models/Module";
import Progress from "../models/Progress";

// Recalculates and saves progress percentage based on real module counts.
// Never trust a percentage sent from the frontend - always derive it here.
export async function recalculateProgress(traineeId: string, courseId: string) {
  const totalModules = await Module.countDocuments({ courseId });
  let progress = await Progress.findOne({ traineeId, courseId });

  if (!progress) {
    progress = await Progress.create({ traineeId, courseId, completedModules: [], percentage: 0 });
  }

  const completedCount = progress.completedModules.length;
  const percentage = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

  progress.percentage = percentage;
  progress.status = percentage === 0 ? "NOT_STARTED" : percentage === 100 ? "COMPLETED" : "IN_PROGRESS";
  progress.lastAccessedAt = new Date();
  if (percentage === 100 && !progress.completedAt) progress.completedAt = new Date();

  await progress.save();
  return progress;
}

export async function markModuleComplete(traineeId: string, courseId: string, moduleId: string) {
  let progress = await Progress.findOne({ traineeId, courseId });
  if (!progress) {
    progress = await Progress.create({ traineeId, courseId, completedModules: [] });
  }
  const already = progress.completedModules.some((m) => m.toString() === moduleId);
  if (!already) {
    progress.completedModules.push(new mongoose.Types.ObjectId(moduleId));
    await progress.save();
  }
  return recalculateProgress(traineeId, courseId);
}
