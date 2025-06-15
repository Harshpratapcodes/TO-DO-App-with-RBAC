const isAdmin = (req, res, next) => {
    // If user visits '/admin-login', show admin login page
    if (req.path === "/admin-login") {
        req.isAdmin = true;
    } else {
        req.isAdmin = false;
    }
    next();
};

module.exports = { isAdmin };


