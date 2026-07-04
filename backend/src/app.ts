import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.config";
import authRoutes from "./modules/auth/routes/auth.routes";
import resumeRoutes from "./modules/resume/routes/resume.routes";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/auth", authRoutes);
app.use("/resume", resumeRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

export default app;
