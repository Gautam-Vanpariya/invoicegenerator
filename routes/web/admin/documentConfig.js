const router = require('express').Router();
const DOCCONFIG_WEB = require('../../../controllers/web/documentConfig.controller');
const { FORMNAME } = require('../../../utils/enum');

// API
router.get('/', (req,res)=> {
    res.locals = {
        title: "Document Config",
        loggedInUser: req.loggedInUser,
        documentType: FORMNAME
    };
    res.render('admin/pages/documentSetting', { layout: "layoutAdminDashboard" });
});

router.post('/create', DOCCONFIG_WEB.create);
router.post('/update/:id', DOCCONFIG_WEB.update);
router.post('/all', DOCCONFIG_WEB.all);

module.exports = router;