// Express Server - Main application entry point
require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const quizRoutes = require("./routes/quizRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const Quiz = require("./models/Quiz");

const app = express();
const PORT = process.env.PORT || 3000;
const HEROKU_APP_URL =
  process.env.HEROKU_APP_URL || "https://your-heroku-app.herokuapp.com";
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://user:password@cluster.mongodb.net/db";

// Global quiz instance
let quizInstance = null;

// Connect to MongoDB and load quiz data
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected successfully");

    // Initialize and load quiz data
    quizInstance = new Quiz();
    await quizInstance.loadQuestions();

    // Make quiz instance available to controllers via app.locals
    app.locals.quiz = quizInstance;
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

// Set view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path} ${req.originalUrl}`
  );
  if (Object.keys(req.body).length > 0) {
    console.log("Body:", req.body);
  }
  next();
});

// Session Schema for validation
const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true, required: true },
  userId: mongoose.Schema.Types.ObjectId,
  email: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
});

const Session = mongoose.model("Session", sessionSchema);

// Authentication middleware - validate session with MongoDB or gateway headers
const authMiddleware = async (req, res, next) => {
  // Allow public routes and static files without authentication
  const publicRoutes = ["/login", "/css", "/js"];
  const isPublic = publicRoutes.some((route) => req.path.startsWith(route));

  if (isPublic) {
    return next();
  }

  // CHECK 1: Check for gateway headers (x-session-user-id)
  // These are sent by CleanBlogApp gateway via attachSessionInfo
  const gatewayUserId = req.headers["x-session-user-id"];
  const gatewayUserEmail = req.headers["x-session-user-email"];

  if (gatewayUserId) {
    console.log(
      "[GATEWAY AUTH] User authenticated via gateway headers:",
      gatewayUserId
    );
    req.user = { userId: gatewayUserId, email: gatewayUserEmail || null };
    return next();
  }

  // CHECK 2: Fall back to local sessionId validation (original approach)
  let sessionId = req.query.sessionId || req.cookies?.sessionId;

  if (sessionId) {
    try {
      // Validate session against MongoDB
      const session = await Session.findOne({
        sessionId,
        expiresAt: { $gt: new Date() }, // Check if not expired
      });

      if (session) {
        req.user = { userId: session.userId, email: session.email };
        // Store sessionId in cookie for future requests
        res.cookie("sessionId", sessionId, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return next();
      }
    } catch (err) {
      console.error("Session validation failed:", err);
    }
  }

  // No valid session - redirect to Heroku app login
  res.redirect(
    `${HEROKU_APP_URL}/login?redirect=${encodeURIComponent(
      `${process.env.APP_URL || `http://localhost:${PORT}`}${req.originalUrl}`
    )}`
  );
};

// Apply auth middleware to all routes except login
app.use(authMiddleware);

// Login callback route - receives session ID from Heroku app
app.get("/login", (req, res) => {
  const sessionId = req.query.sessionId;
  const redirect = req.query.redirect || "/";

  if (sessionId) {
    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(redirect);
  } else {
    res.redirect(
      `${HEROKU_APP_URL}/login?redirect=${encodeURIComponent(req.originalUrl)}`
    );
  }
});

// Routes
// Routes are only at / since CleanBlog gateway strips /app prefix
app.use("/", quizRoutes);
app.use("/pdfs", pdfRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).render("404", {
    url: req.originalUrl,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // If headers already sent, delegate to default error handler
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : "",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Quiz Application running on http://localhost:${PORT}`);
});
