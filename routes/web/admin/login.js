const router = require('express').Router();

const AUTH_WEB = require("../../../controllers/web/auth.controller");

router.post('/login', AUTH_WEB.adminLogin);

// LOGOUT
router.get("/logout", async (req, res) => {
    delete req.loggedInUser;
    req.session.destroy();
    return res.redirect("/");
});


module.exports = router;