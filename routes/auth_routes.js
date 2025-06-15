const express = require('express');
const auth_Controller = require('../controllers/auth_controls');
const { isAuthenticated } = require('../middlewares/isAuthenticated');
const { User, Role, Permission, Task } = require('../models/index_db.js');
const { isAdmin } = require('../middlewares/isAdmin');

const router = express.Router();

// Render Landing Page
router.get('/', (req, res) => {
    res.render('auth/landing', { title: 'Welcome to Our App' });
});

// Regular User Login Page
router.get('/login', isAdmin, (req, res) => {
    res.render('auth/login', { 
        title: req.isAdmin ? "Admin Login" : "User Login",
        heading: req.isAdmin ? "Welcome Admin" : "Welcome User",
        buttonText: req.isAdmin ? "Admin Login" : "User Login",
        isAdmin: req.isAdmin,
        error: req.flash('error')
    });
});

// Admin Login Page
router.get('/admin-login', isAdmin, (req, res) => {
    res.render('auth/login', { 
        title: "Admin Login",
        heading: "Welcome Admin",
        buttonText: "Admin Login",
        isAdmin: true,
        error: req.flash('error')
    });
});


// Render Signup Page
router.get('/signup', (req, res) => {
    res.render('auth/signup', { 
        title: 'Sign Up', 
        error: req.flash('error'), 
        name: req.flash('name'), 
        email: req.flash('email') 
    });
});

// Render User Dashboard (Protected)
router.get('/dashboard', isAuthenticated, async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const user = req.session.user;
    const tasks = await Task.findAll({
        where: { 
            userId: req.session.userId,
        }
    });
    
    res.render('user/dashboard', { 
        title: 'Dashboard', 
        user, 
        tasks 
    });
});

// Show Admin Panel (Only for Admins)
router.get('/panel', isAuthenticated, isAdmin, async (req, res) => {
    if (req.session.roleId == 3) {
        return res.redirect('/dashboard'); // Redirect normal users to their dashboard
    }

    const { userId, user, role, permissions } = req.session;

       // Fetch only tasks created by the logged-in admin
       const tasks = await Task.findAll({
        where: { userId } 
    });


    res.render('admin/panel', { 
        title: 'Admin Dashboard', 
        user, 
        role, 
        permissions, 
        tasks 
    });
});

// Authentication Actions
router.post('/signup', auth_Controller.signup);
router.post('/verify-otp', auth_Controller.verifyOTP);
router.post('/login', auth_Controller.login);
router.post('/admin-login', auth_Controller.admin_login); // Ensuring admin check for admin login
router.post('/logout', auth_Controller.logout);

module.exports = router;
