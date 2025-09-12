import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import companyRoutes from "./routes/compnies.routes";
import clientRoutes from "./routes/clients.routes";
import embeddingRoutes from "./routes/embedding.routes";
import { db } from "./db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_, res) => res.send("Server is running"));
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/embeddings", embeddingRoutes);

app.listen(PORT, async () => {
  try {
    // Test database connection
    await db.execute("SELECT 1");
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
  console.log(`Server running on port ${PORT}`);
});
