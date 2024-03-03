const router = require('express').Router();

const USERPROGRESS_API = require('../../controllers/api/userProgress.controller');
const { verifyJwtToken } = require('../../middelware/auth');


// ============== [ REQUEST ] =========================== //

// SAVE -- USERPROGRESS
router.post('/save', verifyJwtToken, USERPROGRESS_API.saveUserProgess);

// PREVIEW HTML -- USERPROGRESS
router.post('/fetchPreviousProgressNumber', verifyJwtToken, USERPROGRESS_API.getAllPendingProgressNumbers);

router.post('/report', verifyJwtToken, USERPROGRESS_API.userProgessReport);

router.post('/retrieve', USERPROGRESS_API.retrieveUserProgess);

router.post('/myOrder', verifyJwtToken, USERPROGRESS_API.myOrder);

module.exports = router;