const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    room: { type: String, trim: true, maxlength: 40, default: "" },
    passwordHash: { type: String, required: true },
    sessions: { type: [sessionSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);