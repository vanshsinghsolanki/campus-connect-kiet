"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const { loadConfig } = require("./config");
const Profile = require("./models/profile");

async function seed() {
  const config = loadConfig();
  const dataPath = path.resolve(__dirname, "../../assets/js/data.js");
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(dataPath, "utf8"), sandbox, {
    filename: dataPath,
    timeout: 1000
  });
  const profiles = sandbox.window.CC_DATA && sandbox.window.CC_DATA.profiles;
  if (!Array.isArray(profiles)) throw new Error("Sample profile data could not be loaded.");

  await mongoose.connect(config.mongodbUri);
  const operations = profiles.map(function (profile) {
    return {
      updateOne: {
        filter: { id: profile.id },
        update: { $set: profile },
        upsert: true
      }
    };
  });
  const result = await Profile.bulkWrite(operations, { ordered: true });
  console.log("Sample profiles synced:", result.upsertedCount + result.modifiedCount);
  await mongoose.disconnect();
}

seed().catch(async function (error) {
  console.error("Profile seed failed:", error.name || "Error");
  await mongoose.disconnect().catch(function () {});
  process.exitCode = 1;
});
