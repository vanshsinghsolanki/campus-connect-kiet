"use strict";

const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  org: { type: String, required: true, trim: true, maxlength: 120 },
  period: { type: String, required: true, trim: true, maxlength: 80 }
}, { _id: false, strict: "throw" });

const profileSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    immutable: true,
    trim: true,
    match: /^[A-Za-z0-9_-]{1,40}$/
  },
  photo: { type: String, default: "", maxlength: 500 },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  role: { type: String, required: true, enum: ["student", "senior", "alumni"] },
  department: { type: String, required: true, trim: true, uppercase: true, maxlength: 12 },
  batch: { type: Number, required: true, min: 1900, max: 2100 },
  verification: { type: String, required: true, enum: ["verified", "pending", "unverified"] },
  headline: { type: String, required: true, trim: true, maxlength: 180 },
  company: { type: String, default: "", trim: true, maxlength: 120 },
  location: { type: String, default: "", trim: true, maxlength: 120 },
  bio: { type: String, default: "", maxlength: 2000 },
  skills: { type: [{ type: String, trim: true, maxlength: 50 }], default: [] },
  openTo: { type: [{ type: String, trim: true, maxlength: 60 }], default: [] },
  experience: { type: [experienceSchema], default: [] },
  achievements: { type: [{ type: String, trim: true, maxlength: 160 }], default: [] },
  links: {
    linkedin: { type: String, default: "", maxlength: 500 },
    github: { type: String, default: "", maxlength: 500 }
  },
  connections: { type: Number, default: 0, min: 0 },
  callAvailable: { type: Boolean, default: false },
  email: { type: String, default: "", select: false, trim: true, lowercase: true, maxlength: 254 }
}, {
  timestamps: true,
  strict: "throw",
  versionKey: false,
  toJSON: {
    transform: function (_doc, ret) {
      delete ret._id;
      delete ret.email;
      delete ret.createdAt;
      delete ret.updatedAt;
      return ret;
    }
  }
});

profileSchema.index({ role: 1, department: 1, batch: -1 });
profileSchema.index({ verification: 1 });
profileSchema.index({ skills: 1 });

module.exports = mongoose.models.Profile || mongoose.model("Profile", profileSchema);
