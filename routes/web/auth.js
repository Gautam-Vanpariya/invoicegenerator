const router = require("express").Router();
const AUTH_WEB = require("../../controllers/web/auth.controller");
const AUTH_API = require("../../controllers/api/auth.controller");

// ========================================== [WEB PAGE] ==================================== //
// LOGOUT
router.get("/logout", async (req, res) => {
    delete req.loggedInUser;
    req.session.destroy();
    return res.redirect("/");
});

// ========================================== [API LIST] ==================================== //

// LOGIN
router.post("/login", AUTH_WEB.login);
// REGSITER
router.post("/register", AUTH_API.register);
// FORGOT
router.post("/forgot", AUTH_API.forgot);
// RESET-LINK
router.post("/reset", AUTH_API.resetPassword);
// Unsubscription Mail
router.put("/unsubscription", AUTH_API.unsubscription);
module.exports = router;