const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
// const methodOverride = require('method-override');
const session = require('express-session');
const SequelizeStore = require("connect-session-sequelize")(session.Store);
require('dotenv').config();
const flash = require('connect-flash');

const sequelize = require("./utils/db"); // Sequelize instance
const taskRoutes = require('./routes/task_routes');
const authRoutes = require('./routes/auth_routes');
const roleRoutes = require('./routes/role_routes');
const adminRoutes = require('./routes/admin_routes');
const userRoutes = require('./routes/user_routes');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON & form data
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride('_method')); 

// Initialize session store
const sessionStore = new SequelizeStore({ db: sequelize });

if (process.env.NODE_ENV !== 'production') {
    sessionStore.sync()
        .then(() => console.log("Session store initialized"))
        .catch((err) => console.error("Error syncing session store:", err));
}

// Configure session
app.use(session({
    secret: process.env.SESSION_SECRET || 'my_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' // Only secure cookies in production
    }
}));

app.use(flash());

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to make session data available in views
app.use((req, res, next) => {
    res.locals.user = req.session.user || {}; // Use an empty object instead of null
    res.locals.session = req.session || {};
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.get('*', (req, res, next) => {
    res.locals.currentUrl = req.path; // Make current URL available in EJS
    next();
});

// Define Routes
app.use('/', authRoutes);
app.use('/user', taskRoutes);
app.use('/role-management', roleRoutes);
app.use('/admin-management', adminRoutes);
app.use('/user-management', userRoutes);

// Sync Database & Start Server
(async () => {
    try {
        await sequelize.sync();
        console.log("Database & tables initialized!");
        app.listen(8000, () => console.log('Server started on port 8000'));
    } catch (error) {
        console.error("Database sync failed:", error);
        process.exit(1); // Exit if database sync fails
    }
})();
