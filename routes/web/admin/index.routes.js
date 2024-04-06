
const router = require('express').Router();
const { isAdmin } = require('../../../middelware/validateSession');
const { USERROLE } = require('../../../utils/enum');

const db = require("../../../models");
const INVOICEMODEL = db.userProgress;

router.get('/', async (req, res) => res.redirect('/admin/dashboard'));

router.get('/dashboard', isAdmin([USERROLE.ADMIN]), (req, res) => {
	res.locals = {
		title: "Admin Dashoard",
		loggedInUser: req.loggedInUser
	};
	res.render("admin/pages/dashboard", { layout: "layoutAdminDashboard" });
});

router.get('/login', (req, res) => {
	res.locals = {
		title: "Admin Login",
		loggedInUser: req.loggedInUser
	};
	res.render("admin/pages/login", { layout: "layoutAdmin" });
});


// [ROOT]
router.use("/auth", require("./login"));
router.use('/users', isAdmin([USERROLE.ADMIN]), require('./users'));
router.use('/transaction', isAdmin([USERROLE.ADMIN]), require('./transaction'));
router.use("/preview", require("./preview"));
router.use("/thankyou", require("./thankyou"));
router.use("/company", isAdmin([USERROLE.ADMIN]), require('./company.routes'));
router.use("/products", isAdmin([USERROLE.ADMIN]), require('./products.routes'));
router.use("/invoice", isAdmin([USERROLE.ADMIN]), require('./invoice.routes'));
router.use("/ledger", isAdmin([USERROLE.ADMIN]), require('./ledger.routes'));

router.get('/adminInvoiceTotal', async (req, res) => {
    try {
        const pipeline = [
            { $match: { "isDeleted": false } },
            { $unwind: "$last_filled_data" },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: {
                            $toDouble: {
                                $replaceAll: {
                                    input: "$last_filled_data.total",
                                    find: ",",
                                    replacement: ""
                                }
                            }
                        }
                    },
                    total_tax: {
                        $sum: {
                            $toDouble: {
                                $replaceAll: {
                                    input: "$last_filled_data.total_tax",
                                    find: ",",
                                    replacement: ""
                                }
                            }
                        }
                    }
                }
            }
        ];

        const result = await INVOICEMODEL.aggregate(pipeline).exec();

        if (!result || result.length === 0) {
            return res.status(404).json({ success: false, message: "No invoices found", error: "Logical issue", data: null });
        }

        const totalSum = result[0].total;
        const totalTax = result[0].total_tax;

        return res.status(200).json({
            success: true,
            message: "Total sum and total tax retrieved successfully",
            data: { totalSum, totalTax },
            error: null
        });

    } catch (err) {
        console.error("Error in getAdminInvoiceTotal:", err);
        return res.status(500).json({ success: false, message: "Something went wrong", error: err.message, data: null });
    }
});

module.exports = router;