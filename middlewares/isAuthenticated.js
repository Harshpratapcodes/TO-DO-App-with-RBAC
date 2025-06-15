const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect to login page if not authenticated
    }
    next();
};

module.exports = { isAuthenticated };
