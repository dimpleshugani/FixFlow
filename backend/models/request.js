const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },

  category: {
    type: String,
    required: true,
    enum: ["Electrical", "Plumbing", "Internet", "Furniture", "Cleaning", "Other"]
  },

  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },

  description: {
    type: String,
    required: true,
    maxlength: 2000
  },

  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved"],
    default: "Pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports =
  mongoose.model("Request", requestSchema);