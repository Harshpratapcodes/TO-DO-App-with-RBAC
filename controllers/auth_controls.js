// const bcrypt = require('bcryptjs');
// const crypto = require('crypto');
// require('dotenv').config();
// const { User, Role, Permission, Task, RolePermissionMapping  } = require('../models/index_db.js');
// // const {isAdmin} = require("../middlewares/isAdmin.js");
// const { sendOTP } = require('../middlewares/email');


// // Signup Controller
// exports.signup = async (req, res) => {
//     try {
//         const { name, email, password } = req.body;

//         if (!name || !email || !password) {
//             req.flash('error', 'All fields are required');
//             return res.redirect('/signup');
//         }

//         // Check if the user already exists
//         const existingUser = await User.findOne({ where: { email } });
//         if (existingUser) {
//             return res.render("auth/signup", { name, email, error: "User already exists" });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Generate OTP
//         const otp = crypto.randomInt(100000, 999999).toString();
//         const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

//         // Create user
//         const newUser = await User.create({
//             name,
//             email,
//             password: hashedPassword,
//             otp,
//             otpExpires,
//             isVerified: false,
//             // roleId: Role.id // Assign default user role
//         });

//         await sendOTP(email, otp);
//         res.render("auth/verify-otp", { name, email, message: "OTP sent successfully" });
//     } catch (error) {
//         console.error("Signup error:", error);
//         res.render("auth/signup", { name: req.body.name, email: req.body.email, error: "Server error" });
//     }
// };

// // OTP Verification
// exports.verifyOTP = async (req, res) => {
//     try {
//         const { email, otp } = req.body;
//         const user = await User.findOne({ where: { email } });

//         if (!user || user.otp !== otp || new Date() > user.otpExpires) {
//             return res.render("auth/verify-otp", { error: "Invalid or expired OTP", email });
//         }

//         user.isVerified = true;
//         user.otp = null;
//         user.otpExpires = null;
//         await user.save();

//         res.redirect("/login");
//     } catch (error) {
//         console.error("OTP verification error:", error);
//         res.render("auth/verify-otp", { error: "Server error", email });
//     }
// };

// // Login (Session-based Authentication)
// exports.login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if ( !email || !password) {
//             req.flash('error', 'All fields are required');
//             return res.redirect('/login');
//         }


//         const user = await User.findOne({
//             where: { email },
//             include: { model: Role,
//                 attributes: ["role"]
//              }
//         });

//         if (!user || !(await bcrypt.compare(password, user.password))) {
//             return res.render("auth/login", {
//                 title: 'Login',
//                 heading: 'Welcome Back',
//                 buttonText: 'Login',
//                 error: "Invalid email or password",
//                 isAdmin:false
//             });
//         }

//         if (!user.isVerified) {
//             return res.render("auth/login", {
//                 title: 'Login',
//                 heading: 'Welcome Back',
//                 buttonText: 'Login',
//                 error: "Please verify your email first",
//                 isAdmin: false
//             });
//         }

//         // Store user session data
//         req.session.userId = user.id;
//         req.session.role = user.role ? user.role.id : null;
//         req.session.user = { id: user.id, name: user.name, email: user.email };

//         req.session.save((err) => {
//             if (err) {
//                 console.error("Session save error:", err);
//                 return res.render("auth/login", {
//                     title: 'Login',
//                     heading: 'Welcome Back',
//                     buttonText: 'Login',
//                     error: "Session error",
//                     isAdmin: false
//                 });
//             }

//             console.log("Session saved:", req.session);

//             res.send(`<script>window.location.href='/dashboard';</script>`);
//         });

//     } catch (error) {
//         console.error("Login error:", error);
//         res.render("auth/login", {
//             title: 'Login',
//             heading: 'Welcome Back',
//             buttonText: 'Login',
//             error: "Server Error",
//             isAdmin: false
//         });
//     }
// };


// exports.admin_login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Find the user along with their role and permissions
//         const user = await User.findOne({
//             where: { email },
//             include: [
//                 {
//                     model: Role,
//                     attributes: ["id", "role"],
//                     include: [
//                         {
//                             model: Permission,
//                             attributes: ["permission"], // Fetch assigned permissions
//                             through: { attributes: [] } // Exclude RolePermissionMapping table
//                         }
//                     ]
//                 }
//             ]
//         });

//         // Check if user exists and password is correct
//         if (!user || !(await bcrypt.compare(password, user.password))) {
//             return res.render("auth/login", {
//                 title: 'Admin',
//                 heading: 'Welcome Back',
//                 buttonText: 'Admin Login',
//                 error: "Invalid email or password",
//                 isAdmin: true
//             });
//         }

//         // Check if admin has verified their email
//         if (!user.isVerified) {
//             return res.render("auth/login", {
//                 title: 'Admin',
//                 heading: 'Welcome Back',
//                 buttonText: 'Admin Login',
//                 error: "Email not verified! Please verify your email.",
//                 isAdmin: true
//             });
//         }

//         // Extract permissions correctly
//         const permissions = user.Role?.Permissions?.map(p => p.permission) || [];

//         // Ensure the user is an admin before logging in
//         if (user.Role.id === 3) {
//             return res.render("auth/login", {
//                 title: 'Admin',
//                 heading: 'Welcome Back',
//                 buttonText: 'Admin Login',
//                 error: "Unauthorized access! Admins only.",
//                 isAdmin: true
//             });
//         }

//         // Store admin session data
//         req.session.userId = user.id;
//         req.session.user = { id: user.id, name: user.name, email: user.email };
//         req.session.roleId = user.Role.id;
//         req.session.role = user.Role.role;
//         req.session.permissions = permissions;

//         // Save session and redirect to admin panel
//         req.session.save((err) => {
//             if (err) {
//                 console.error("Session save error:", err);
//                 return res.render("auth/login", {
//                     title: 'Admin',
//                     heading: 'Welcome Back',
//                     buttonText: 'Admin Login',
//                     error: "Session error",
//                     isAdmin: true
//                 });
//             }

//             console.log("Admin session saved:", req.session);
//             res.redirect('/panel');
//         });

//     } catch (error) {
//         console.error("Login error:", error);
//         res.render("auth/login", {
//             title: 'Admin',
//             heading: 'Welcome Back',
//             buttonText: 'Admin Login',
//             error: "Server Error",
//             isAdmin: true
//         });
//     }
// };


// // Logout (Destroy Session & Clear Cookies)
// exports.logout = async (req, res) => {
//     try {
//         const user = await User.findOne({ where: { id: req.session.userId } });

//         if (!user) {
//             req.session.destroy(() => {
//                 res.clearCookie("sessionId");
//                 return res.redirect("/login");
//             });
//         }

//         req.session.destroy((err) => {
//             if (err) {
//                 console.error("Session destroy error:", err);
//                 return res.render("user/dashboard", { error: "Logout failed" });
//             }

//             res.clearCookie("sessionId");
//             return res.redirect(user.roleId !== 3 ? "/admin-login" : "/login");
//         });

//     } catch (error) {
//         console.error("Error logging out:", error);
//         return res.render("user/dashboard", { error: "Logout failed" });
//     }
// };


const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Joi = require('joi');
require('dotenv').config();
const { User, Role, Permission } = require('../models/index_db.js');
const { sendOTP } = require('../middlewares/email');

// Validation Schemas
const signupSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const otpSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

//  Signup Controller
exports.signup = async (req, res) => {
    try {
        const { error, value } = signupSchema.validate(req.body);
        if (error) {
            req.flash('error', error.details[0].message);
            return res.redirect('/signup');
        }

        const { name, email, password } = value;
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.render("auth/signup", { name, email, error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

        await User.create({ name, email, password: hashedPassword, otp, otpExpires, isVerified: false });
        await sendOTP(email, otp);

        res.render("auth/verify-otp", { name, email, message: "OTP sent successfully" });
    } catch (error) {
        console.error("Signup error:", error);
        res.render("auth/signup", { name: req.body.name, email: req.body.email, error: "Server error" });
    }
};

//  OTP Verification
exports.verifyOTP = async (req, res) => {
    try {
        const { error, value } = otpSchema.validate(req.body);
        if (error) {
            return res.render("auth/verify-otp", { error: error.details[0].message, email: req.body.email });
        }

        const { email, otp } = value;
        const user = await User.findOne({ where: { email } });

        if (!user || user.otp !== otp || new Date() > user.otpExpires) {
            return res.render("auth/verify-otp", { error: "Invalid or expired OTP", email });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.redirect("/login");
    } catch (error) {
        console.error("OTP verification error:", error);
        res.render("auth/verify-otp", { error: "Server error", email });
    }
};

//  Login (Session-based Authentication)
exports.login = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            req.flash('error', error.details[0].message);
            return res.redirect('/login');
        }

        const { email, password } = value;
        const user = await User.findOne({
            where: { email },
            include: { model: Role, attributes: ["role"] }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render("auth/login", {
                title: 'Login',
                heading: 'Welcome Back',
                buttonText: 'Login',
                error: "Invalid email or password",
                isAdmin: false
            });
        }

        if (!user.isVerified) {
            return res.render("auth/login", {
                title: 'Login',
                heading: 'Welcome Back',
                buttonText: 'Login',
                error: "Please verify your email first",
                isAdmin: false
            });
        }

        req.session.userId = user.id;
        req.session.role = user.role ? user.role.id : null;
        req.session.user = { id: user.id, name: user.name, email: user.email };

        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.render("auth/login", {
                    title: 'Login',
                    heading: 'Welcome Back',
                    buttonText: 'Login',
                    error: "Session error",
                    isAdmin: false
                });
            }

            console.log("Session saved:", req.session);
            res.send(`<script>window.location.href='/dashboard';</script>`);
        });

    } catch (error) {
        console.error("Login error:", error);
        res.render("auth/login", {
            title: 'Login',
            heading: 'Welcome Back',
            buttonText: 'Login',
            error: "Server Error",
            isAdmin: false
        });
    }
};

//  Admin Login
exports.admin_login = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.render("auth/login", {
                title: 'Admin',
                heading: 'Welcome Back',
                buttonText: 'Admin Login',
                error: error.details[0].message,
                isAdmin: true
            });
        }

        const { email, password } = value;
        const user = await User.findOne({
            where: { email },
            include: [
                {
                    model: Role,
                    attributes: ["id", "role"],
                    include: [
                        {
                            model: Permission,
                            attributes: ["permission"],
                            through: { attributes: [] }
                        }
                    ]
                }
            ]
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render("auth/login", {
                title: 'Admin',
                heading: 'Welcome Back',
                buttonText: 'Admin Login',
                error: "Invalid email or password",
                isAdmin: true
            });
        }

        if (!user.isVerified) {
            return res.render("auth/login", {
                title: 'Admin',
                heading: 'Welcome Back',
                buttonText: 'Admin Login',
                error: "Email not verified! Please verify your email.",
                isAdmin: true
            });
        }

        const permissions = user.Role?.Permissions?.map(p => p.permission) || [];

        if (user.Role.id === 3) {
            return res.render("auth/login", {
                title: 'Admin',
                heading: 'Welcome Back',
                buttonText: 'Admin Login',
                error: "Unauthorized access! Admins only.",
                isAdmin: true
            });
        }

        req.session.userId = user.id;
        req.session.user = { id: user.id, name: user.name, email: user.email };
        req.session.roleId = user.Role.id;
        req.session.role = user.Role.role;
        req.session.permissions = permissions;

        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.render("auth/login", {
                    title: 'Admin',
                    heading: 'Welcome Back',
                    buttonText: 'Admin Login',
                    error: "Session error",
                    isAdmin: true
                });
            }

            console.log("Admin session saved:", req.session);
            res.redirect('/panel');
        });

    } catch (error) {
        console.error("Login error:", error);
        res.render("auth/login", {
            title: 'Admin',
            heading: 'Welcome Back',
            buttonText: 'Admin Login',
            error: "Server Error",
            isAdmin: true
        });
    }
};

// Logout (Destroy Session & Clear Cookies)
exports.logout = async (req, res) => {
    try {
        const user = await User.findOne({ where: { id: req.session.userId } });

        if (!user) {
            req.session.destroy(() => {
                res.clearCookie("sessionId");
                return res.redirect("/login");
            });
        }

        req.session.destroy((err) => {
            if (err) {
                console.error("Session destroy error:", err);
                return res.render("user/dashboard", { error: "Logout failed" });
            }

            res.clearCookie("sessionId");
            return res.redirect(user.roleId !== 3 ? "/admin-login" : "/login");
        });

    } catch (error) {
        console.error("Error logging out:", error);
        return res.render("user/dashboard", { error: "Logout failed" });
    }
};
