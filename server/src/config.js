"use strict";

function loadConfig(env) {
  const source = env || process.env;
  const port = Number(source.PORT || 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  const mongodbUri = String(source.MONGODB_URI || "").trim();
  if (!mongodbUri) {
    throw new Error("MONGODB_URI is required.");
  }

  return Object.freeze({
    environment: source.NODE_ENV || "development",
    port,
    mongodbUri,
    allowedOrigins: String(source.ALLOWED_ORIGINS || "")
      .split(",")
      .map(function (origin) { return origin.trim(); })
      .filter(Boolean)
  });
}

module.exports = { loadConfig };
