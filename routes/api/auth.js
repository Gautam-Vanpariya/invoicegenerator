const router = require('express').Router();
const AUTH_API = require('../../controllers/api/auth.controller.js');
const { verifyJwtToken } = require('../../middelware/auth');

//LOGIN
router.post("/login", AUTH_API.login);
//REGISTER users
router.post("/register", AUTH_API.register);
//FORGOT PASSWORD
router.post("/forgot/password", AUTH_API.forgot);
//RESET PASSWORD
router.post("/reset/password", AUTH_API.resetPassword);
//LOUGOUT
router.post("/logout/:id", verifyJwtToken, AUTH_API.logout);
// Unsubscription Mail
router.put("/unsubscription", AUTH_API.unsubscription);
module.exports = router;

