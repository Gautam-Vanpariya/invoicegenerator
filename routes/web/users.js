const router = require('express').Router();

const USER_API = require('../../controllers/api/user.controller');
const { isAuth } = require("../../middelware/validateSession");
const { USERROLE } = require('../../utils/enum');


// FETCH -- USER INFO
router.get('/info', isAuth(USERROLE.CUSTOMER), USER_API.getUserInfo);

// UPDATE -- USER PROFILE DETAILS
router.patch('/update/:id', isAuth(USERROLE.CUSTOMER), USER_API.updateUserDetails);

// GENERATE PDF
router.post('/generatepdf', USER_API.generatePdf);

module.exports = router;

