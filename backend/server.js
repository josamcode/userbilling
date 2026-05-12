require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const billRoutes = require("./routes/billRoutes");
const statsRoutes = require("./routes/statsRoutes");

const app = express();

// ======== CORS ========
const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://mary-project.vercel.app",
];
const envOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = envOrigins.length ? envOrigins : defaultOrigins;

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS not allowed: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

// ======== MongoDB ========
const DB_URL = process.env.DB_URL || process.env.MONGODB_URI;
if (DB_URL) {
  mongoose
    .connect(DB_URL)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection failed:", err.message));
} else {
  console.warn("DB_URL is not set — database is not connected");
}

// ======== Health ========
app.get("/api/health", (req, res) => res.json({ ok: true }));

// ======== Routes ========
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/stats", statsRoutes);

// Legacy: serve any old user images that may still exist on disk.
app.use(
  "/images/users",
  express.static(path.join(__dirname, "public/images/users"))
);

// ======== Error handler ========
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && err.message && /Only images are allowed/.test(err.message)) {
    return res.status(400).json({ message: "يُسمح برفع الصور فقط" });
  }
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "حجم الصورة كبير جداً" });
  }
  console.error(err);
  res.status(500).json({ message: "خطأ في الخادم" });
});

// ======== Start ========
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
