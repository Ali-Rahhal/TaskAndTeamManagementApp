import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import oraganizationRoutes from "./routes/organizationRoutes.js";
import invitePublicRoutes from "./routes/invitePublicRoutes.js";
import notifictionRoutes from "./routes/notificationRoutes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Length"],
    maxAge: 86400, // Cache preflight requests for 24 hours
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);

app.use("/users", userRoutes);

app.use("/organizations", oraganizationRoutes);

app.use("/api/invites", invitePublicRoutes);

app.use("/notifications", notifictionRoutes);

export default app;
