"use strict";

const assert = require("node:assert/strict");
const { after, test } = require("node:test");
const { createApp } = require("../src/app");

function makeProfileModel() {
  const profiles = [
    { id: "p001", name: "Aarav Sharma", role: "alumni", department: "CSE", batch: 2021, verification: "verified", headline: "Backend engineer", company: "Example", skills: ["Java"], email: "private@example.com" },
    { id: "p002", name: "Priya Nair", role: "senior", department: "CSE", batch: 2027, verification: "verified", headline: "ML student", company: "", skills: ["Python"] }
  ];
  return {
    countDocuments: async function (filter) {
      return profiles.filter(function (profile) {
        if (filter.department && profile.department !== filter.department) return false;
        if (filter.role && profile.role !== filter.role) return false;
        if (filter.$or && !filter.$or.some(function (clause) {
          const key = Object.keys(clause)[0];
          return clause[key].test(String(profile[key] || profile.skills.join(" ")));
        })) return false;
        return true;
      }).length;
    },
    find: function (filter) {
      const matches = profiles.filter(function (profile) {
        if (filter.department && profile.department !== filter.department) return false;
        if (filter.role && profile.role !== filter.role) return false;
        if (filter.batch && profile.batch !== filter.batch) return false;
        if (filter.skills && !profile.skills.includes(filter.skills)) return false;
        if (filter.$or && !filter.$or.some(function (clause) {
          const key = Object.keys(clause)[0];
          const value = key === "skills" ? profile.skills.join(" ") : profile[key];
          return clause[key].test(String(value || ""));
        })) return false;
        return true;
      });
      const query = {
        select: function () { return this; },
        sort: function () { return this; },
        skip: function (count) { this.offset = count; return this; },
        limit: function (count) { this.pageSize = count; return this; },
        lean: async function () { return matches.slice(this.offset || 0, (this.offset || 0) + (this.pageSize || matches.length)); }
      };
      return query;
    },
    findOne: function (filter) {
      const query = {
        select: function () { return this; },
        lean: async function () { return profiles.find(function (profile) { return profile.id === filter.id; }) || null; }
      };
      return query;
    }
  };
}

const app = createApp({
  ProfileModel: makeProfileModel(),
  allowedOrigins: ["https://campus.example"],
  isDatabaseReady: function () { return true; }
});
const server = app.listen(0);
let baseUrl;
const listening = new Promise(function (resolve) {
  server.on("listening", function () {
    baseUrl = "http://127.0.0.1:" + server.address().port;
    resolve();
  });
});
after(async function () {
  await new Promise(function (resolve, reject) {
    server.close(function (error) { if (error) reject(error); else resolve(); });
  });
});
async function get(path, options) {
  await listening;
  return fetch(baseUrl + path, options);
}

test("live health endpoint responds without exposing server details", async function () {
  const response = await get("/api/v1/health/live");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
  assert.equal(response.headers.get("x-powered-by"), null);
  assert.ok(response.headers.get("x-request-id"));
});

test("profile listing paginates and never exposes private email", async function () {
  const response = await get("/api/v1/profiles?department=CSE&page=1&limit=1");
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.pagination.total, 2);
  assert.equal(body.pagination.totalPages, 2);
  assert.equal(body.data.length, 1);
  assert.equal(body.data[0].id, "p001");
  assert.equal(Object.hasOwn(body.data[0], "email"), false);
});

test("profile search treats user text literally", async function () {
  const response = await get("/api/v1/profiles?q=%5B");
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.length, 0);
});

test("invalid query parameters return a structured 400 response", async function () {
  const response = await get("/api/v1/profiles?page=0");
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error.code, "INVALID_QUERY");
  assert.ok(body.error.requestId);
});

test("profile detail returns 404 for unknown ids", async function () {
  const response = await get("/api/v1/profiles/p999");
  assert.equal(response.status, 404);
  assert.equal((await response.json()).error.code, "PROFILE_NOT_FOUND");
});

test("cross-origin access is limited to configured origins", async function () {
  const allowed = await get("/api/v1/health/live", { headers: { Origin: "https://campus.example" } });
  assert.equal(allowed.headers.get("access-control-allow-origin"), "https://campus.example");
  const denied = await get("/api/v1/health/live", { headers: { Origin: "https://other.example" } });
  assert.equal(denied.status, 403);
});
