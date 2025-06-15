const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin_controls');

router.get('/admins', adminController.getAdmins);
router.get('/admins/data', adminController.getAdminsData);
router.get('/roles/data', adminController.getRoles);
router.post('/admin/create', adminController.createAdmin);
router.post('/admin/update/:id', adminController.updateAdmin);
router.post('/admin/delete/:id', adminController.deleteAdmin);

module.exports = router;
