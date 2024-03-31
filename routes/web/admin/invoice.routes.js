const router = require('express').Router();
const DOCUMENTS_WEB = require('../../../controllers/web/invoice.controller');
const { FORMNAME } = require('../../../utils/enum');

// API
router.get('/', (req,res)=> {
    res.locals = {
        title: "Invoice",
        loggedInUser: req.loggedInUser,
        documentType: FORMNAME,
    };
    res.render('admin/pages/invoice', { layout: "layoutAdminDashboard" });
});

router.get('/:id', DOCUMENTS_WEB.getData);
router.post('/create', DOCUMENTS_WEB.create);
router.post('/find', DOCUMENTS_WEB.find);
router.post('/update', DOCUMENTS_WEB.update);
router.post('/paymentStatus', DOCUMENTS_WEB.paymentStatus);
router.delete('/delete/:id', DOCUMENTS_WEB.deletedocument);

module.exports = router;