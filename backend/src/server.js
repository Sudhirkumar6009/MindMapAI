import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import connectDB from "./config/database.js";
import {
  connectRedis,
  closeRedis,
  isRedisConnected,
  pingRedis,
} from "./config/redis.js";
import { apiRateLimiter } from "./middleware/rateLimit.js";
import { cacheTracker } from "./utils/cacheStatsTracker.js";
import extractRoutes from "./routes/extract.js";
import uploadRoutes from "./routes/upload.js";
import refineRoutes from "./routes/refine.js";
import authRoutes from "./routes/auth.js";
import historyRoutes from "./routes/history.js";
import githubRoutes from "./routes/github.js";
import dashboardRoutes from "./routes/dashboard.js";
import settingsRoutes from "./routes/settings.js";
import profileRoutes from "./routes/profile.js";
import graphsRoutes from "./routes/graphs.js";
import notificationsRoutes from "./routes/notifications.js";

// Load .env from backend directory regardless of where the script is run from
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

const app = express();
// Render uses PORT env variable (default 10000), Cloud Run uses 8080
const PORT = parseInt(process.env.PORT, 10) || 10000;

console.log(`Starting server on port ${PORT}...`);
console.log(`Environment: ${process.env.NODE_ENV || "development"}`);

// CORS Configuration - Dynamic origins from environment
const allowedOrigins = [
  // Production frontends
  process.env.FRONTEND_URL,
  // Vercel preview deployments (pattern matching handled below)
  "https://mind-map-ai-navy.vercel.app",
  "https://mindmap-ai.vercel.app",
  // Development
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
].filter(Boolean); // Remove undefined values

console.log("Allowed CORS origins:", allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Vercel preview deployments (*.vercel.app)
    if (origin.endsWith(".vercel.app")) {
      console.log("Allowing Vercel preview deployment:", origin);
      return callback(null, true);
    }

    // Allow Render preview deployments (*.onrender.com)
    if (origin.endsWith(".onrender.com")) {
      console.log("Allowing Render deployment:", origin);
      return callback(null, true);
    }

    // Log unknown origins but allow in development
    console.log("CORS request from origin:", origin);
    if (process.env.NODE_ENV === "production") {
      // In production, be more permissive to avoid issues
      // You can make this stricter once everything works
      return callback(null, true);
    }
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400, // 24 hours - cache preflight requests
};

// Enable pre-flight requests for all routes
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));

// Apply rate limiting to all API routes
app.use("/api", apiRateLimiter);

// Auth & User Management
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationsRoutes);

// Core Features
app.use("/api/history", historyRoutes);
app.use("/api/graphs", graphsRoutes);
app.use("/api/extract", extractRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/refine", refineRoutes);
app.use("/api/github", githubRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    name: "MindMap AI Backend",
    version: "1.0.0",
    status: "running",
    documentation: "/api",
    health: "/api/health",
  });
});

// API info route
app.get("/api", (req, res) => {
  res.json({
    name: "MindMap AI API",
    version: "1.0.0",
    endpoints: {
      auth: {
        "POST /api/auth/register": "Create new account",
        "POST /api/auth/login": "User login",
        "GET /api/auth/me": "Get current user (requires auth)",
        "PUT /api/auth/password": "Update password (requires auth)",
      },
      profile: {
        "GET /api/profile": "Get user profile",
        "PUT /api/profile": "Update profile",
        "PUT /api/profile/avatar": "Update avatar",
        "DELETE /api/profile/avatar": "Remove avatar",
      },
      core: {
        "POST /api/extract": "Extract concepts from text",
        "POST /api/upload": "Process PDF files",
        "POST /api/refine": "Refine and optimize graph",
        "POST /api/github/readme": "Import from GitHub",
      },
      data: {
        "GET /api/history": "Get user mind maps",
        "GET /api/graphs": "Get saved graphs",
        "GET /api/dashboard": "Get dashboard stats",
        "GET /api/notifications": "Get notifications",
      },
      health: {
        "GET /api/health": "Server health check",
      },
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    frontend: process.env.FRONTEND_URL || "http://localhost:5173",
    environment: process.env.NODE_ENV || "development",
    redis: isRedisConnected() ? "connected" : "disconnected",
  });
});

// Redis health + latency check
app.get("/api/redis/health", async (req, res) => {
  const result = await pingRedis();

  if (!result.ok) {
    return res.status(503).json({
      status: "unhealthy",
      redis: "disconnected",
      error: result.error || "Redis not reachable",
    });
  }

  res.json({
    status: "healthy",
    redis: "connected",
    reply: result.reply,
    latencyMs: result.latencyMs,
    timestamp: new Date().toISOString(),
  });
});

// Cache stats monitoring endpoint
app.get("/api/cache/stats", (req, res) => {
  res.json({
    status: "ok",
    cacheStats: cacheTracker.getStats(),
    timestamp: new Date().toISOString(),
  });
});

// Reset cache stats (for testing)
app.post("/api/cache/stats/reset", (req, res) => {
  cacheTracker.reset();
  cacheTracker.printReport();
  res.json({
    status: "ok",
    message: "Cache stats reset",
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.path}`,
    message: "Route not found. Check the API documentation at /api",
    availableRoutes: {
      auth: "/api/auth/register (POST), /api/auth/login (POST), /api/auth/me (GET)",
      extract: "/api/extract (POST)",
      upload: "/api/upload (POST)",
      github: "/api/github/readme (POST)",
      health: "/api/health (GET)",
    },
  });
});

// Start server FIRST, then connect to database and Redis
// This ensures Cloud Run health checks pass while services connect
const server = app.listen(PORT, "0.0.0.0", async () => {
  console.log(`\n🚀 MindMap AI Server running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://0.0.0.0:${PORT}/api`);
  console.log(
    `🔗 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`,
  );
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);

  // Connect to Redis
  try {
    await connectRedis();
  } catch (err) {
    console.error("❌ Redis connection failed:", err.message);
    console.log("Server will continue without Redis caching.");
  }

  // Connect to database after server is listening
  connectDB()
    .then(() => {
      console.log("✅ Database connected successfully");
    })
    .catch((err) => {
      console.error("❌ Database connection failed:", err.message);
      console.log("Server will continue running. Some features may not work.");
    });
});

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  await closeRedis();
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT received. Shutting down gracefully...");
  await closeRedis();
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});
