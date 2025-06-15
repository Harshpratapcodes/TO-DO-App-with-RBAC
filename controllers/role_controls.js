const { Role, Permission, RolePermissionMapping, User } = require('../models/index_db');
const { Op } = require('sequelize');

//  Get all roles and render the roles page
exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.findAll();
        const permissions = await Permission.findAll();
        res.render('admin/role-management', { roles, permissions, session: req.session });
    } catch (error) {
        console.error("Error fetching roles:", error);
        res.status(500).send('Internal Server Error');
    }
};


exports.createRole = async (req, res, next) => {
  try {
      // Ensure user has permission
      if (!req.session.permissions.includes('create_role')) {
          return res.status(403).json({ success: false, message: "Not Authorized!" });
      }

      //  Extract role name and permissions
      const roleName = req.body.roleName;
      let permissionIds = req.body.permissions;

      console.log("Received Permissions:", permissionIds);

      //  Ensure permissionIds is an array of numbers
      if (!permissionIds) {
          permissionIds = [];
      } else if (!Array.isArray(permissionIds)) {
          permissionIds = [permissionIds];
      }
      permissionIds = permissionIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

      console.log("Processed Permission IDs:", permissionIds);

      //  Create Role (WITHOUT manually setting 'id')
      const newRole = await Role.create({ role: roleName });

      if (!newRole) {
          return res.status(500).json({ success: false, message: "Error! Role not created." });
      }

      //  Fetch Permissions
      const permissions = await Permission.findAll({ where: { id: permissionIds } });

      if (!permissions.length) {
          console.warn("No valid permissions found for the given IDs.");
      }

      //  Associate Role with Permissions
      await newRole.addPermissions(permissions);

      console.log(`Role '${roleName}' created with permissions:`, permissionIds);

      res.redirect('/role-management/roles');
  } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

//  Get a single role by ID (API)
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id, {
      include: {
        model: Permission,
        through: { attributes: [] },
        attributes: ['id']
      }
    })

      res.status(200).json({ role });
  } catch (error) {
      console.error("Error fetching role:", error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.editRole = async (req, res) => {
  try {
      if (!req.session.permissions.includes('update_role') ) {
          return res.status(403).json({ error: 'Not Authorized!' }); // Send JSON instead of plain text
      }

      const { roleName, permissions } = req.body;
      const role = await Role.findByPk(req.params.id, { include: Permission });

      if (!role) {
          return res.status(404).json({ error: 'Role not found!' });
      }

       // Prevent editing the role with id 1
       if (role.id === 1 || role.id === 3) {
        return res.status(403).json({ error: 'Not Allowed to edit this role!' });
    }

      // Prevent a user from modifying their own role
      if (req.session.roleId === role.id) {
        return res.status(403).json({ error: 'You cannot edit your own role!' });
    }

      await role.update({ role: roleName });

      if (permissions && Array.isArray(permissions)) {
          const permissionRecords = await Permission.findAll({ where: { id: permissions } });
          await role.setPermissions(permissionRecords);
      } else {
          await role.setPermissions([]); // Remove all permissions if none are selected
      }

      res.json({ success: true, message: 'Role updated successfully!' }); //  Send JSON response
  } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteRole = async (req, res) => {
  try {

    if (!req.session.permissions.includes('delete_role') ) {
      return res.status(403).json({ error: 'Not Authorized!' }); // Send JSON instead of plain text
  }
      const roleId = parseInt(req.params.id);

      if (isNaN(roleId)) {
          return res.status(400).json({ error: "Invalid role ID" });
      }


      const role = await Role.findByPk(roleId);
      if (!role) {
          return res.status(404).json({ error: "Role not found" });
      }

      if (parseInt(role.id) === 1 || parseInt(role.id) === 3 || parseInt(role.id) === parseInt(req.session.roleId)) {
        return res.status(403).json({ error: "Not allowed to delete this role!" });
    }    

      // Check if the role is assigned to users
      const userCount = await User.count({ where: { roleId } });
      if (userCount > 0) {
          return res.status(403).json({ error: "Cannot delete role assigned to users! Reassign users first." });
      }

      await role.destroy();
      res.status(200).json({ message: "Role deleted successfully" });

  } catch (error) {
      console.error("Error deleting role:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};



exports.RolesData = async (req, res) => {
  if (!req.session.permissions.includes('get_role')) {
    return res.status(403).json({ error: "Not Authorized" });
  }

  try {
    const { search, start, length, order, draw } = req.query;
    
    const limit = parseInt(length) || 10;
    const offset = parseInt(start) || 0;
    const orderColumn = order?.[0]?.column || 0;
    const orderDir = order?.[0]?.dir || 'ASC';

    const where = search.value 
      ? { role: { [Op.iLike]: `%${search.value}%` } }
      : {};

    //  Count only unique role names
    const totalCount = await Role.count({
      distinct: true,
      col: 'role'
    });

    const { rows } = await Role.findAndCountAll({
      where,
      limit,
      offset,
      order: [['role', orderDir]], // Fix ordering syntax
      include: [{
        model: Permission,
        through: { attributes: [] },
        attributes: ['permission']
      }]
    });

    //  Proper data serialization
    const data = rows.map(role => ({
      ...role.get({ plain: true }),
      Permissions: role.Permissions.map(p => p.get({ plain: true }))
    }));

    res.json({
      draw: parseInt(draw),
      recordsTotal: totalCount, // Use unique count
      recordsFiltered: totalCount, // Use unique count
      data: data
    });
  } catch (error) {
    console.error("RolesData Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message
    });
  }
};



