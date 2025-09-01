import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
// import authRoutes from "./routes/auth.routes";
// import { pool } from "./db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_, res) => res.send("Server is running"));
// app.use("/api/auth", authRoutes);

app.listen(PORT, async () => {
//   await pool.connect();
  console.log(`Server running on port ${PORT}`);
});
