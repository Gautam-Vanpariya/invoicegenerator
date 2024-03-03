const router = require('express').Router();

const USERPROGRESS_API = require('../../controllers/api/userProgress.controller');
const { isAuth } = require("../../middelware/validateSession");
const { USERROLE } = require('../../utils/enum');

// ============== [ REQUEST ] =========================== //

// SAVE -- USERPROGRESS
router.post('/save', USERPROGRESS_API.saveUserProgess);

// PREVIEW HTML -- USERPROGRESS
router.post('/fetchPreviousProgressNumber', USERPROGRESS_API.getAllPendingProgressNumbers);

router.post('/report', USERPROGRESS_API.userProgessReport);

router.post('/retrieve', USERPROGRESS_API.retrieveUserProgess);

router.post('/myOrder', isAuth(USERROLE.CUSTOMER), USERPROGRESS_API.myOrder);

router.post('/delete', USERPROGRESS_API.deleteAllUserProgess);
module.exports = router;