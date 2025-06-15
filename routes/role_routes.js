const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role_controls');
const {isAuthenticated} = require("../middlewares/isAuthenticated");

router.use(isAuthenticated);

// ✅ Get all roles (for rendering the page)
router.get('/roles', roleController.getRoles);

// ✅ Get roles for DataTables (AJAX)
router.get('/roles/data', roleController.RolesData);

// ✅ Get a single role by ID (AJAX - for editing)
router.get('/role/get/:id', roleController.getRoleById);

// ✅ Create a new role (AJAX)
router.post('/role/create', roleController.createRole);

// ✅ Edit a role (AJAX)
router.post('/role/edit/:id', roleController.editRole);

// ✅ Delete a role (AJAX)
router.post('/role/delete/:id', roleController.deleteRole);

module.exports = router;