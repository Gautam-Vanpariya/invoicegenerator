

const router = require("express").Router();
const { isLoggedIn } = require("../middelware/validateSession");

// ========================================== [API] ==================================== //

// FORWARD "/api/v1" REQUEST TO API routes
 router.use("/api/v1", require("./api/index.routes"));

// API SERVER HEALTH CHECK
router.get('/api/check', (res) => res.status(200).json({ status: true, message: "Server health check" }));


// ========================================== [WEB] ==================================== //

// FORWARD "/" REQUEST TO USER WEB
router.use("/", isLoggedIn, require('./web/index.routes'));

// FORWARD "/" REQUEST TO  ADMIN PANEL
router.use('/admin', require('./web/admin/index.routes'));

// FORWARD "/" REQUEST TO USER WEB
router.use("/mail", require('./mail/index.routes'));

module.exports = router;
