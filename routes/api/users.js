const router = require('express').Router();
const USER_API = require('../../controllers/api/user.controller');

const { verifyJwtToken } = require('../../middelware/auth');


// FETCH -- USER INFO
router.get('/info', verifyJwtToken, USER_API.getUserInfo);

// UPDATE -- USER PROFILE DETAILS
router.patch('/me/:id', verifyJwtToken, USER_API.updateUserDetails);

// GENERATE PDF
router.post('/generatepdf', USER_API.generatePdf);

module.exports = router;

