const router = require('express').Router();

const USER_WEB = require('../../../controllers/web/users.controller');

router.get('/', (req,res)=>{
    res.locals = {
        title: "User",
        loggedInUser: req.loggedInUser
    };
    res.render('admin/pages/users', { layout: "layoutAdminDashboard" });
});

router.post('/data', USER_WEB.getAllUsers);

router.put('/:id/updateRole', USER_WEB.updateRole);

router.delete('/:id/deleteUser', USER_WEB.deleteUser);

module.exports = router;