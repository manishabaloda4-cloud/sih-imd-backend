import UserCompetency, { CompetencyLevel } from "../models/UserCompetency";
import Competency from "../models/Competency";

// PROTOTYPE rules - NOT official iGOT/Karmayogi thresholds. Configurable here in one place.
const THRESHOLDS: { min: number; level: CompetencyLevel }[] = [
  { min: 80, level: "Advanced" },
  { min: 60, level: "Intermediate" },
  { min: 40, level: "Basic" },
  { min: 0, level: "Beginner" },
];

export function calculateCompetencyLevel(score: number): CompetencyLevel {
  for (const t of THRESHOLDS) {
    if (score >= t.min) return t.level;
  }
  return "Beginner";
}

// Call this after an assessment is scored to update the trainee's competency record.
// competencyId comes from the Question.competencyId of whichever questions they answered correctly.
export async function updateUserCompetency(userId: string, competencyId: string, score: number) {
  const level = calculateCompetencyLevel(score);
  const updated = await UserCompetency.findOneAndUpdate(
    { userId, competencyId },
    { score, level, lastAssessedAt: new Date(), source: "assessment" },
    { upsert: true, new: true }
  );
  return updated;
}

const SKILL_GAP_THRESHOLD = 60; // below this = flagged as a skill gap, configurable

export async function calculateSkillGaps(userId: string) {
  const records = await UserCompetency.find({ userId }).populate("competencyId", "name category");
  return records.map((r) => ({
    competency: (r.competencyId as any)?.name,
    score: r.score,
    level: r.level,
    isSkillGap: r.score < SKILL_GAP_THRESHOLD,
  }));
}
