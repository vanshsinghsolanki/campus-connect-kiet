"use strict";

const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const { loadConfig } = require("./config");
const { createApp } = require("./app");

async function start() {
  const config = loadConfig();
  await mongoose.connect(config.mongodbUri, { autoIndex: config.environment !== "production" });
  const app = createApp({
    allowedOrigins: config.allowedOrigins,
    isDatabaseReady: function () { return mongoose.connection.readyState === 1; }
  });
  const server = app.listen(config.port, function () {
    console.log("Campus Connect API listening on port " + config.port);
  });

  let shuttingDown = false;
  async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log("Received " + signal + "; shutting down.");
    server.close(async function () {
      await mongoose.disconnect();
      process.exit(0);
    });
    setTimeout(function () { process.exit(1); }, 10000).unref();
  }
  process.on("SIGINT", function () { shutdown("SIGINT"); });
  process.on("SIGTERM", function () { shutdown("SIGTERM"); });
}

start().catch(function (error) {
  console.error("Campus Connect API could not start:", error.name || "Error");
  process.exitCode = 1;
});
