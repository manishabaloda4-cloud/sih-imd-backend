import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { attachClerk } from "./middleware/auth";
import { errorMiddleware } from "./middleware/errorMiddleware";

import courseRoutes from "./routes/courseRoutes";
import userRoutes from "./routes/userRoutes";
import moduleRoutes from "./routes/moduleRoutes";
import enrollmentRoutes from "./routes/enrollmentRoutes";
import assessmentRoutes from "./routes/assessmentRoutes";
import progressRoutes from "./routes/progressRoutes";
import competencyRoutes from "./routes/competencyRoutes";
import trainerRoutes from "./routes/trainerRoutes";
import adminRoutes from "./routes/adminRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import certificateRoutes from "./routes/certificateRoutes";
import notificationRoutes from "./routes/notificationRoutes";

const app = express();
const PORT = env.PORT;

app.use(cors({ origin: env.FRONTEND_URL }));
app.use(express.json());
app.use(attachClerk);

// health check - hit this first to confirm server is alive
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "IMD Training Portal backend running" });
});

app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api", moduleRoutes); // exposes /api/courses/:courseId/modules, /api/modules/:id
app.use("/api", enrollmentRoutes); // exposes /api/courses/:id/enroll, /api/users/me/courses, /api/enrollments/:id
app.use("/api/assessments", assessmentRoutes);
app.use("/api", progressRoutes); // exposes /api/courses/:id/progress
app.use("/api", competencyRoutes); // exposes /api/competencies, /api/users/me/competencies, /api/users/me/skill-gaps
app.use("/api/trainers", trainerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", uploadRoutes); // exposes /api/modules/:id/upload
app.use("/api/certificates", certificateRoutes);
app.use("/api/notifications", notificationRoutes);

// must be registered LAST - catches errors thrown by asyncHandler-wrapped routes
app.use(errorMiddleware);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
