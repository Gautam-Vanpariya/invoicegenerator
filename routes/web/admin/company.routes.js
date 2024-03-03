const router = require('express').Router();
const DOCUMENTS_WEB = require('../../../controllers/web/company.controller');
const { FORMNAME } = require('../../../utils/enum');

// API
router.get('/', (req,res)=> {
    res.locals = {
        title: "Documents",
        loggedInUser: req.loggedInUser,
        documentType: FORMNAME,
    };
    res.render('admin/pages/company', { layout: "layoutAdminDashboard" });
});

router.post('/create', DOCUMENTS_WEB.create);
router.post('/find', DOCUMENTS_WEB.find);
router.get('/:id', DOCUMENTS_WEB.getData);
router.post('/update', DOCUMENTS_WEB.update);
router.delete('/delete/:id', DOCUMENTS_WEB.deleteCompany);

module.exports = router;