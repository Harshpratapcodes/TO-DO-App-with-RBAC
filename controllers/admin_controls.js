const { User, Role } = require('../models/index_db');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

// Get all admins (excluding "User" role)
async function getAdmins(req, res) {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'roleId'],
            include: [{ model: Role, attributes: ['role'] }],
            where: {
                '$Role.role$': { [Op.ne]: 'user' }
            }
        });
        const roles = await Role.findAll();

        res.render('admin/admin-management', { users, roles, session: req.session });
    } catch (error) {
        console.error("Error fetching admins:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// Get paginated admins for DataTables (excluding "User" role)
async function getAdminsData(req, res) {
    try {
        let { draw, start, length, search } = req.query;

        let queryOptions = {
            offset: parseInt(start) || 0,
            limit: parseInt(length) || 10,
            include: [{ model: Role, attributes: ['id', 'role'] }],
            where: {
                '$Role.role$': { [Op.ne]: 'user' } // Exclude "User" role
            }
        };

        if (search?.value) {
            queryOptions.where[Op.or] = [
                { name: { [Op.iLike]: `%${search.value}%` } },
                { email: { [Op.iLike]: `%${search.value}%` } }
            ];
        }

        let { rows: users, count: totalUsers } = await User.findAndCountAll(queryOptions);

        res.json({
            draw: parseInt(draw),
            recordsTotal: totalUsers,
            recordsFiltered: totalUsers,
            data: users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.Role ? user.Role.role : 'No Role Assigned',
                role_id: user.Role ? user.Role.id : null
            }))
        });

    } catch (error) {
        console.error("Error fetching admins data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// Fetch all roles (excluding "User" role)
async function getRoles(req, res) {
    try {
        const roles = await Role.findAll({
            attributes: ['id', 'role'],
            where: {
                role: { [Op.ne]: 'user' } // Exclude "User" role
            }
        });

        res.json({ roles });
    } catch (error) {
        console.error("Error fetching roles:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


async function createAdmin(req, res) {
    try {
        const { name, email, password, roleId } = req.body;

        if (!name || !email || !password || !roleId) {
            req.flash('error', 'All fields are required');
            return res.redirect('/admin-management/admins');
        }

        const role = await Role.findByPk(roleId);
        if (!role || role.role === 'user') {
            req.flash('error', 'Invalid role selected');
            return res.redirect('/admin-management/admins');
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            req.flash('error', 'User with this email already exists');
            return res.redirect('/admin-management/admins');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashedPassword, roleId });

        res.redirect('/admin-management/admins');
        
    } catch (error) {
        console.error("Error creating admin:", error);
        return res.redirect('/admin-management/admins');
    }
}

async function updateAdmin(req, res) {
    try {
  
        if (!req.session.permissions.includes('update_admin') ) {
            return res.status(403).json({ error: 'Not Authorized!' }); // Send JSON instead of plain text
        }

        const { id } = req.params; 
        const { name, email, password, roleId } = req.body;

        // Fetch user once
        const user = await User.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

          // Prevent updating own role
          if (parseInt(req.session.userId) === parseInt(id)) {
            return res.status(403).json({ error: "You cannot update your own role!" });
        }

        // Prevent updating role ID 1 (super admin role)
        if (parseInt(roleId) === 1) {
            return res.status(403).json({ error: "You cannot assign or modify the super admin role!" });
        }

        // Validate role
        const role = await Role.findByPk(parseInt(roleId));
        if (!role || role.role === 'user') {
            return res.status(400).json({ error: "Invalid role selected" });
        }

        // Check for duplicate email only if it's changed
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ where: { email } });
            if (emailExists) {
                return res.status(400).json({ error: "Email is already taken" });
            }
        }

        // Prepare update data
        const updateData = { name, email, roleId: parseInt(roleId) };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10); // Hash new password
        }

        // Update user data
        await user.update(updateData);

        res.json({ success: true, message: "Admin updated successfully" });
    } catch (error) {
        console.error("Error updating admin:", error);

        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({ error: error.errors.map(e => e.message).join(", ") });
        }

        res.status(500).json({ error: "Internal Server Error" });
    }
}


// Delete an admin
async function deleteAdmin(req, res) {
    try {
   
        if (!req.session.permissions.includes('delete_admin') ) {
            return res.status(403).json({ error: 'Not Authorized!' }); // Send JSON instead of plain text
        }

        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        await user.destroy();
        res.status(200).json({ message: "Admin deleted successfully" });

    } catch (error) {
        console.error("Error deleting admin:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// Export all functions
module.exports = {
    getAdmins,
    getAdminsData,
    getRoles,
    createAdmin,
    updateAdmin,
    deleteAdmin
};
