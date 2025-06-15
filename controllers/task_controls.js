const { User, Role, Permission, Task } = require('../models/index_db.js');
const { isAuthenticated } = require('../middlewares/isAuthenticated');
const { where } = require('sequelize');

module.exports = {

    getTasks: async (req, res) => {
        try {
            if (!req.session.userId) {
                return res.redirect("/login"); // Redirect if not logged in
            }
    
            // Fetch only pending tasks (isCompleted: false)
            const tasks = await Task.findAll({
                where: { 
                    userId: req.session.userId, 
                }
            });
    
            const user = await User.findOne({ where: { id: req.session.userId } });
    
            // Redirect based on user role
            if (user.roleId !== 3) {
                return res.render("admin/panel", { tasks, user: req.session.user }); // Admins go to panel
            } 
    
            res.render("user/dashboard", { tasks, user: req.session.user }); // Render dashboard.ejs
    
        } catch (error) {
            res.status(500).send("Error fetching tasks");
        }
    },

    createTasks: async (req, res) => {
        try {
            if (!req.session.userId) {
                return res.redirect("/login");
            }
    
            const { task, location, deadline } = req.body;
    
            await Task.create({
                description: task.trim(),
                location: location.trim() || null,
                deadline: deadline ? new Date(deadline) : null,
                // isCompleted: false, // New tasks are always pending
                userId: req.session.userId
            });
    
            const user = await User.findOne({ where: { id: req.session.userId } });
    
            if (user.roleId !== 3) {
                return res.redirect("/panel"); // Admins go to panel
            } 
    
            res.redirect("/dashboard"); 
    
        } catch (error) {
            res.status(500).send("Error creating task");
        }
    },
    

    updateTasks: async (req, res) => {
        try {
            if (!req.session.userId) {
                return res.redirect("/login");
            }
    
            const { id } = req.params;
            const { description, isCompleted } = req.body;
    
            const task = await Task.findOne({ where: { id, userId: req.session.userId } });
    
            if (!task) {
                return res.redirect("/dashboard"); // Redirect if task not found
            }
    
            await task.update({ 
                description, 
                isCompleted: isCompleted === "true" || isCompleted === true 
            });
    
            const user = await User.findOne({ where: { id: req.session.userId } });
    
            if (user.roleId !== 3) {
                return res.redirect("/panel"); // Admins go to panel
            }
    
            res.redirect("/dashboard"); 
        } catch (error) {
            res.status(500).send("Error updating task");
        }
    },
    

    // Delete a task and redirect
    deleteTasks: async (req, res) => {
        try {
            if (!req.session.userId) {
                return res.redirect("/login");
            }

            const { id } = req.params;
            const task = await Task.findOne({ where: { id, userId: req.session.userId } });

            if (!task) {
                return res.redirect("/dashboard");
            }

            await task.destroy();
            const user = await User.findOne({ where: { id: req.session.userId } });

            // Redirect based on user role
            if (user.roleId !== 3) {
                return res.redirect("/panel"); // Admins go to panel
            } 
            res.redirect("/dashboard");  // Redirect after deletion
        } catch (error) {
            res.status(500).send("Error deleting task");
        }
    }
};


