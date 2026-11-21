"use strict";

const crypto = require("node:crypto");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const Profile = require("./models/profile");
const { createProfilesRouter } = require("./routes/profiles");

function createApp(options) {
  const settings = options || {};
  const ProfileModel = settings.ProfileModel || Profile;
  const isDatabaseReady = settings.isDatabaseReady || function () { return false; };
  const allowedOrigins = settings.allowedOrigins || [];

  const app = express();
  app.disable("x-powered-by");
  app.use(function (_req, res, next) {
    res.setHeader("X-Request-ID", crypto.randomUUID());
    next();
  });
  app.use(helmet());
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin not allowed."));
    },
    methods: ["GET", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
  }));
  app.use(express.json({ limit: "16kb", strict: true }));
  app.use("/api", rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false
  }));

  app.get("/api/v1/health/live", function (_req, res) {
    res.json({ status: "ok" });
  });

  app.get("/api/v1/health/ready", function (_req, res) {
    if (!isDatabaseReady()) {
      return res.status(503).json({ error: { code: "NOT_READY", message: "Database is unavailable." } });
    }
    return res.json({ status: "ready" });
  });

  app.use("/api/v1/profiles", createProfilesRouter(ProfileModel));

  app.use(function (_req, res) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found." } });
  });

  app.use(function (error, _req, res, _next) {
    if (res.headersSent) return;
    const status = Number.isInteger(error.status) ? error.status : (error.message === "Origin not allowed." ? 403 : 500);
    const code = error.code || (status === 403 ? "ORIGIN_NOT_ALLOWED" : status === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR");
    const message = status === 500 ? "An unexpected server error occurred." : error.message;
    if (status === 500) console.error("API request failed:", error.name || "Error");
    return res.status(status).json({
      error: {
        code: code,
        message: message,
        requestId: res.getHeader("X-Request-ID")
      }
    });
  });

  return app;
}

module.exports = { createApp };
