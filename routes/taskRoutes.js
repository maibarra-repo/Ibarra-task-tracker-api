const express = require("express");

const Task = require("../models/task");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.json({
      message: "Tasks retrieved successfully.",
      tasks
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while retrieving tasks.",
      error: error.message
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Please provide a task title."
      });
    }

    const task = await Task.create({
      title,
      description,
      completed,
      user: req.user.id
    });

    res.status(201).json({
      message: "Task created successfully.",
      task
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while creating task.",
      error: error.message
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found."
      });
    }

    res.json({
      message: "Task retrieved successfully.",
      task
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while retrieving task.",
      error: error.message
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updates = {};
    const allowedFields = ["title", "description", "completed"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { returnDocument: "after", runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found."
      });
    }

    res.json({
      message: "Task updated successfully.",
      task
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while updating task.",
      error: error.message
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found."
      });
    }

    res.json({
      message: "Task deleted successfully."
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while deleting task.",
      error: error.message
    });
  }
});

module.exports = router;
