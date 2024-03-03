const router = require('express').Router();

const ORDERSUMMARY_API = require('../../controllers/api/orderSummary.controller');

router.post('/orderSummary', ORDERSUMMARY_API.orderSummary);

module.exports = router;