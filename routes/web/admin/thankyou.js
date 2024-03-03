const router = require('express').Router();
// API


router.get("/thankYou", (req, res) => {
  res.render("admin/thankYou/index",{ layout: false});
});
module.exports = router;