const router = require('express').Router();
const DOCUMENTS_WEB = require('../../../controllers/web/ledger.controller');
const { FORMNAME } = require('../../../utils/enum');

const db = require("../../../models");
const COMPANYMODEL = db.company;

// API
router.get('/', async (req,res)=> {
    const companyName = await COMPANYMODEL.find({isDeleted: false}).select('company_name').lean();
    res.locals = {
        title: "Ledger",
        loggedInUser: req.loggedInUser,
        documentType: FORMNAME,
        companyName : companyName
    };
    res.render('admin/pages/ledger', { layout: "layoutAdminDashboard" });
});

router.get('/:id', DOCUMENTS_WEB.getData);
router.post('/create', DOCUMENTS_WEB.create);
router.post('/find', DOCUMENTS_WEB.find);
router.post('/update', DOCUMENTS_WEB.update);
router.post('/paymentStatus', DOCUMENTS_WEB.paymentStatus);
router.delete('/delete/:id', DOCUMENTS_WEB.deletedocument);

module.exports = router;