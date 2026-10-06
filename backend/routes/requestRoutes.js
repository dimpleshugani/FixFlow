const express = require("express");
const Request = require("../models/request");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();
const categories = ["Electrical", "Plumbing", "Internet", "Furniture", "Cleaning", "Other"];
const priorities = ["Low", "Medium", "High"];
const statuses = ["Pending", "In Progress", "Resolved"];

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const requests = await Request.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const { title, category, priority, description } = req.body;
  if (!title?.trim() || !categories.includes(category) || !priorities.includes(priority) || !description?.trim()) {
    return res.status(400).json({ message: "Provide a title, category, priority, and description." });
  }

  try {
    const request = await Request.create({
      user: req.user.id,
      title: title.trim(),
      category,
      priority,
      description: description.trim(),
    });
    res.status(201).json({ request });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  if (!statuses.includes(req.body.status)) {
    return res.status(400).json({ message: "Choose a valid request status." });
  }

  try {
    const request = await Request.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!request) return res.status(404).json({ message: "Request not found." });
    res.json({ request });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const request = await Request.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!request) return res.status(404).json({ message: "Request not found." });
    res.json({ message: "Request deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;