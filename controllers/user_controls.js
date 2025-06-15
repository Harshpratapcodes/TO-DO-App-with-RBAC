const { User, Task } = require("../models/index_db"); // Sequelize models

// Get all users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({ attributes: ["id", "name", "email"] });
        res.render('admin/user-management', { users, session: req.session });
    } catch (error) {
        console.error("Error fetching roles:", error);
        res.status(500).json({ message: "Error fetching users" });
    }
};

exports.UsersData = async (req, res) => {
    if (!req.session.permissions.includes("get_user")) {
        return res.status(403).json({ error: "Not Authorized" });
    }

    try {
        const { search, start, length, order, draw } = req.query;

        const limit = parseInt(length) || 10;
        const offset = parseInt(start) || 0;
        const orderColumn = order?.[0]?.column || "name"; // Default sorting by name
        const orderDir = order?.[0]?.dir || "ASC";

        const where = {
            roleId: 3, // Hardcoded role ID for "user"
            ...(search?.value && {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${search.value}%` } },
                    { email: { [Op.iLike]: `%${search.value}%` } },
                ],
            }),
        };

        // Count users with role ID 3
        const totalFiltered = await User.count({ where });

        // Fetch users with pagination
        const users = await User.findAll({
            where,
            limit,
            offset,
            order: [[orderColumn, orderDir]],
        });

        // Format data for DataTables
        const data = users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
        }));

        res.json({
            draw: parseInt(draw) || 1,
            recordsTotal: await User.count({ where: { roleId: 3 } }), // Total users with roleId 3
            recordsFiltered: totalFiltered, // Users matching search
            data: data,
        });
    } catch (error) {
        console.error("UsersData Error:", error);
        res.status(500).json({
            error: "Internal Server Error",
            details: error.message,
        });
    }
};

// Delete a user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await user.destroy();
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user" });
    }
};

exports.viewUserTasks = async (req, res) => {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
        return res.status(404).send("User not found");
    }

    // Fetch tasks for the specific user
    const tasks = await Task.findAll({
        where: { userId: id },
        attributes: ["description", "isCompleted", "location", "deadline"],
        order: [["deadline", "ASC"]],
    });

    // Format tasks for display
    const formattedTasks = tasks.map(task => ({
        description: task.description,
        status: task.isCompleted ? "Completed" : "Pending",
        location: task.location,
        deadline: task.deadline ? new Date(task.deadline).toLocaleDateString() : "N/A",
    }));

    res.render("admin/tasks", { userId: id, tasks: formattedTasks });
};


// // View tasks of a user
// exports.viewUserTasks = async (req, res) => {
//     const { id } = req.params;
    
//     // Check if user exists
//     const user = await User.findByPk(id);
//     if (!user) {
//         return res.status(404).send("User not found");
//     }

//     res.render("admin/tasks", { userId: id });
// };

// exports.UserTasksData = async (req, res) => {
//     if (!req.session.permissions.includes("view_tasks")) {
//         return res.status(403).json({ error: "Not Authorized" });
//     }

//     try {
//         const { search, start, length, order, draw, userId } = req.query;

//         if (!userId) {
//             return res.status(400).json({ error: "User ID is required" });
//         }

//         const limit = parseInt(length) || 10;
//         const offset = parseInt(start) || 0;
//         const orderColumn = order?.[0]?.column || "deadline";
//         const orderDir = order?.[0]?.dir || "ASC";

//         const where = {
//             userId, // Filter tasks by user ID
//             ...(search?.value
//                 ? {
//                       [Op.or]: [
//                           { description: { [Op.iLike]: `%${search.value}%` } },
//                           { location: { [Op.iLike]: `%${search.value}%` } },
//                       ],
//                   }
//                 : {}),
//         };

//         // Count total tasks for the specific user
//         const totalTasks = await Task.count({ where });

//         // Fetch tasks for the specific user
//         const { rows } = await Task.findAndCountAll({
//             where,
//             limit,
//             offset,
//             order: [[orderColumn, orderDir]],
//             attributes: ["description", "isCompleted", "location", "deadline"],
//         });

//         // Format data for DataTables
//         const data = rows.map((task) => ({
//             description: task.description,
//             status: task.isCompleted ? "Compeleted" : "Pending",
//             location: task.location,
//             deadline: task.deadline ? new Date(task.deadline).toLocaleDateString() : "N/A",
//         }));

//         res.json({
//             draw: parseInt(draw) || 1,
//             recordsTotal: totalTasks,
//             recordsFiltered: totalTasks,
//             data: data,
//         });
//     } catch (error) {
//         console.error("UserTasksData Error:", error);
//         res.status(500).json({
//             error: "Internal Server Error",
//             details: error.message,
//         });
//     }
// };
