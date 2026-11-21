"use strict";

const express = require("express");

const PAGE_DEFAULT = 1;
const LIMIT_DEFAULT = 20;
const LIMIT_MAX = 50;
const ALLOWED_QUERY_KEYS = new Set(["q", "department", "role", "verification", "batch", "skill", "page", "limit"]);
const PUBLIC_FIELDS = [
  "id", "photo", "name", "role", "department", "batch", "verification",
  "headline", "company", "location", "bio", "skills", "openTo",
  "experience", "achievements", "links", "connections", "callAvailable"
].join(" ");

function apiError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function oneString(query, key) {
  const value = query[key];
  if (value === undefined) return "";
  if (typeof value !== "string") throw apiError(400, "INVALID_QUERY", key + " must appear once.");
  return value.trim();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseListQuery(query) {
  Object.keys(query).forEach(function (key) {
    if (!ALLOWED_QUERY_KEYS.has(key)) throw apiError(400, "INVALID_QUERY", "Unknown query parameter: " + key + ".");
  });

  const q = oneString(query, "q");
  const department = oneString(query, "department").toUpperCase();
  const role = oneString(query, "role");
  const verification = oneString(query, "verification");
  const batchText = oneString(query, "batch");
  const skill = oneString(query, "skill");
  const pageText = oneString(query, "page");
  const limitText = oneString(query, "limit");

  if (q.length > 120) throw apiError(400, "INVALID_QUERY", "q must be 120 characters or fewer.");
  if (department && !/^[A-Z0-9_-]{2,12}$/.test(department)) throw apiError(400, "INVALID_QUERY", "department has an invalid format.");
  if (role && !["student", "senior", "alumni"].includes(role)) throw apiError(400, "INVALID_QUERY", "role is invalid.");
  if (verification && !["verified", "pending", "unverified"].includes(verification)) throw apiError(400, "INVALID_QUERY", "verification is invalid.");
  if (skill.length > 50) throw apiError(400, "INVALID_QUERY", "skill must be 50 characters or fewer.");

  let batch;
  if (batchText) {
    if (!/^\d{4}$/.test(batchText) || Number(batchText) < 1900 || Number(batchText) > 2100) {
      throw apiError(400, "INVALID_QUERY", "batch must be a year between 1900 and 2100.");
    }
    batch = Number(batchText);
  }

  function parsePositiveInt(value, fallback, maximum, name) {
    if (!value) return fallback;
    if (!/^\d+$/.test(value)) throw apiError(400, "INVALID_QUERY", name + " must be a positive integer.");
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number < 1 || number > maximum) {
      throw apiError(400, "INVALID_QUERY", name + " is outside the allowed range.");
    }
    return number;
  }

  const page = parsePositiveInt(pageText, PAGE_DEFAULT, 100000, "page");
  const limit = parsePositiveInt(limitText, LIMIT_DEFAULT, LIMIT_MAX, "limit");
  const filter = {};
  if (department) filter.department = department;
  if (role) filter.role = role;
  if (verification) filter.verification = verification;
  if (batch !== undefined) filter.batch = batch;
  if (skill) filter.skills = skill;
  if (q) {
    const pattern = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { name: pattern },
      { headline: pattern },
      { company: pattern },
      { department: pattern },
      { bio: pattern },
      { skills: pattern }
    ];
  }

  return { filter: filter, page: page, limit: limit };
}

function toPublicProfile(profile) {
  if (!profile) return null;
  const value = typeof profile.toObject === "function" ? profile.toObject() : profile;
  const output = {};
  PUBLIC_FIELDS.split(" ").forEach(function (key) {
    if (value[key] !== undefined) output[key] = value[key];
  });
  return output;
}

function createProfilesRouter(ProfileModel) {
  const router = express.Router();

  router.get("/", async function (req, res) {
    const parsed = parseListQuery(req.query);
    const offset = (parsed.page - 1) * parsed.limit;
    const result = await Promise.all([
      ProfileModel.countDocuments(parsed.filter),
      ProfileModel.find(parsed.filter)
        .select(PUBLIC_FIELDS)
        .sort({ name: 1, id: 1 })
        .skip(offset)
        .limit(parsed.limit)
        .lean()
    ]);

    res.json({
      data: result[1].map(toPublicProfile),
      pagination: {
        page: parsed.page,
        limit: parsed.limit,
        total: result[0],
        totalPages: Math.ceil(result[0] / parsed.limit)
      }
    });
  });

  router.get("/:id", async function (req, res) {
    if (!/^[A-Za-z0-9_-]{1,40}$/.test(req.params.id)) {
      throw apiError(400, "INVALID_ID", "Profile id has an invalid format.");
    }

    const profile = await ProfileModel.findOne({ id: req.params.id })
      .select(PUBLIC_FIELDS)
      .lean();
    if (!profile) throw apiError(404, "PROFILE_NOT_FOUND", "Profile not found.");
    res.json({ data: toPublicProfile(profile) });
  });

  return router;
}

module.exports = { createProfilesRouter, parseListQuery, toPublicProfile };
