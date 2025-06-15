const express = require("express");
const taskController = require("../controllers/task_controls");
const { isAuthenticated } = require("../middlewares/isAuthenticated"); 
const User = require("../models/user_db");
const Task = require("../models/task_db");
const Role = require("../models/role_db");


const router = express.Router();

// Protect routes using authentication middleware
router.get("/", isAuthenticated, taskController.getTasks);
router.post("/create", isAuthenticated, taskController.createTasks);
router.post("/update/:id", isAuthenticated, taskController.updateTasks);
router.post("/delete/:id", isAuthenticated, taskController.deleteTasks);

module.exports = router;

