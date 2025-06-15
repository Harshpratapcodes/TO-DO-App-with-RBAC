const express = require("express");
const router = express.Router();
const userController = require("../controllers/user_controls");

// Get all users
router.get("/users", userController.getUsers);

// Get User's data
router.get("/users/data", userController.UsersData);

// // Get user tasks
// router.get("/tasks/data", userController.UserTasksData);

// Delete a user
router.post("/users/:id", userController.deleteUser);

router.get("/:id/tasks", userController.viewUserTasks);

module.exports = router;
