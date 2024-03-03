const router = require('express').Router();
const TRANSACTION_WEB = require('../../../controllers/web/transaction.controller');

// API
router.get('/', (req,res)=>{
    res.locals = {
        title: "Transaction",
        loggedInUser: req.loggedInUser
    };
    res.render('admin/pages/transaction', { layout: "layoutAdminDashboard" });
});
router.post('/getALLTransaction', TRANSACTION_WEB.getALLTransaction);

router.get('/draftTransaction', (req,res)=>{
    res.locals = {
        title: "Draft Transaction",
        loggedInUser: req.loggedInUser
    };
    res.render('admin/pages/draftTransaction', { layout: "layoutAdminDashboard" });
});

router.post('/getAllDraftTransaction', TRANSACTION_WEB.getAllDraftTransaction);

// router.post('/getFilteredTransactions', TRANSACTION_WEB.getFilteredTransactions);

router.delete('/:id/deleteTransaction', TRANSACTION_WEB.deleteTransaction);

module.exports = router;