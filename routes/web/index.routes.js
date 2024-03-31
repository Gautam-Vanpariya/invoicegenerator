const express = require("express");
const app = express();
const router = require('express').Router();
const GENERAL_API = require('../../controllers/api/general.controller');
const path = require("path");
const ejs = require("ejs");

const { isAuthPage } = require('../../middelware/validateSession');
const { USERROLE, FORMNAME } = require('../../utils/enum');
const { uploadFile } = require("../../utils/multer");


const db = require("../../models");
const ORDERSUMMARYMODEL = db.orderSummary;
const USERPROGRESSMODEL = db.userProgress;
const USERMODEL = db.user;
const COMPANYMODEL = db.company;
const PRODUCTSMODEL = db.products;
const INVOICECOUNTERMODEL = db.invoiceCounter;

// ============== [CATEGORY REQUEST] ================= //
router.use("/auth", require("./auth"));
router.use("/users", require("./users"));
router.use("/userProgress", require( "./userProgress"));
router.use("/checkout", require( "./checkout"));

// ============== [ ROOT ] =========================== //
router.post('/upload/formLogo', uploadFile.array("file"), GENERAL_API.uploadFormLogo);

// INVOICE TAX CALCULATE LOGIC
router.post('/invoice/calculate', GENERAL_API.invoiceCalculate);

// ========================================== [SINGLE PAGE REQUEST] ================================= //
router.get('/', async(req, res) => {
    res.locals = {
        title: "Bhavy Computer | Invoicing Software",
        metaDescription: '',
        url: process.env.HOST+"/",
        loggedInUser: req.loggedInUser,
        noindex : app.get("env") !== "production"? true : false,
        env: app.get("env") === "production"? true : false,
        error: req.flash("error"),
    };
    res.render("pages/index", { layout: "layout" });
});

router.get('/invoice-generator' , async(req, res) => {

     let companyList = await COMPANYMODEL.find({isDeleted : false}).select('-_id -createdAt -updatedAt -__v').lean();

    res.locals = {
        title: "Bhavy Computer | Invoicing Software",
        metaDescription: '',
        url: process.env.HOST+'/invoice-generator/',
        loggedInUser: req.loggedInUser,
        noindex : app.get("env") !== "production"? true : false,
        env: app.get("env") === "production"? true : false,
        companyList:companyList,
    };
    res.render("pages/invoice", { layout: "layout" });
});

router.get('/faq' , (req, res) => {
    res.locals = {
        title: "FAQ - Get Answers About Our Services",
        metaDescription: "Find answers to frequently asked questions about our online Software. Discover how to generate, customize, and send bills effortlessly. Get the information you need quickly and easily.",
        url: process.env.HOST+'/faq/',
        loggedInUser: req.loggedInUser,
        noindex : app.get("env") !== "production"? true : false,
        env: app.get("env") === "production"? true : false
    };
    res.render("pages/faq", { layout: "layout" });
});

router.get('/privacy' , (req, res) => {
    res.locals = {
        title: "Privacy",
        metaDescription: "To promote safety, security and integrity with applicable laws",
        loggedInUser: req.loggedInUser,
        noindex : true,
        url:"",
        env: app.get("env") === "production"? true : false
    };
    res.render("pages/privacy", { layout: "layout" });
});

router.get('/termsCondition' , (req, res) => {
    res.locals = {
        title: "Terms And Condition",
        metaDescription: "These Terms constitute a legally binding agreement between you and Onlin",
        loggedInUser: req.loggedInUser,
        noindex : true,
        url:"",
        env: app.get("env") === "production"? true : false
    };
    res.render("pages/termsCondition", { layout: "layout" });
});

router.get('/thankYou' ,async (req, res) => {
    var order_id = req.query.order_id;
    if(!order_id){
        req.flash('error', 'Your Order not found.');
        return res.redirect("/");
    }
    var order_data = await ORDERSUMMARYMODEL.findOne({ "_id": order_id }).select("progress_id").lean();
    if(!order_data){
        req.flash('error', 'Your Order not found.');
        return res.redirect("/");
    }
    var progress_data = await USERPROGRESSMODEL.findOne({ "_id": order_data.progress_id }).lean();
    res.locals = {
        title: "Thank You",
        metaDescription: 'Thank you',
        loggedInUser: req.loggedInUser,
        progress_data: progress_data,
        order_data: order_data,
        noindex : true,
        url:"",
        env: app.get("env") === "production"? true : false
    };
    res.render("pages/thankYou", { layout: "layout" });
});

router.get('/orderSummary/:id' ,async (req, res) => {
    const orderSummaryData = await ORDERSUMMARYMODEL.findById({ _id: req.params.id }).lean();
    var progress_data = await USERPROGRESSMODEL.findOne({ "_id": orderSummaryData.progress_id }).lean();
    var checkOut = progress_data.is_Checkout;

    var form_name = progress_data.form_name;

    var url = "invoice-generator";

    if(checkOut === true){
        return res.redirect("/"+url);
    }

    if(!orderSummaryData){
        req.flash('error', 'Your Order not found.');
        return res.redirect("/");
    }
    res.locals = {
        title: "Order Summary",
        metaDescription: 'Order Summary',
        orderSummary: orderSummaryData,
        loggedInUser: req.loggedInUser,
        form_name: form_name,
        noindex : true,
        url:"",
        env: app.get("env") === "production"? true : false
    };
    // res.render("pages/orderSummary", { layout: "layout" });
    res.render("pages/applicationSuccess", { layout: "layout" });
});

router.get('/application-success' ,async (req, res) => {
    res.locals = {
        title: "Application Success",
        metaDescription: '',
        loggedInUser: req.loggedInUser,
        noindex : true,
        url:"",
        env: app.get("env") === "production"? true : false
    };
    res.render("pages/applicationSuccess", { layout: "layout" });
});

router.get('/profile' , isAuthPage(USERROLE.CUSTOMER), async(req, res) => {
    if(req.loggedInUser){
        const profileData = await USERMODEL.findOne({ "_id": req.loggedInUser._id}).select("-password").lean();
        res.locals = {
            title: "Profile",
            metaDescription: 'Profile',
            loggedInUser: req.loggedInUser,
            profile: profileData,
            noindex : true,
            url:"",
            env: app.get("env") === "production"? true : false
        };
        res.render("pages/profile", { layout: "layout" });
    }else{
        req.flash('error', 'Please login first.');
        return res.redirect("/");
    }
});

router.get('/myOrder' , isAuthPage(USERROLE.CUSTOMER) , (req, res) => {
    if(req.loggedInUser){
        res.locals = {
            title: "My Order",
            metaDescription: 'My Order Summary.',
            loggedInUser: req.loggedInUser,
            documentType: FORMNAME,
            noindex : true,
            url:"",
            env: app.get("env") === "production"? true : false
        };
        res.render("pages/myOrder", { layout: "layout" });
    }else{
        req.flash('error', 'Please login first.');
        return res.redirect("/");
    }
});

router.get('/preview/:id' , async(req, res) => {
    var id = req.params.id;
    const progressData = await USERPROGRESSMODEL.findOne({ "_id": id }).lean();
    if(!progressData) return res.status(300).json({ success: false, message: "No data found with given info.", error: "error: not found issue.", data: null });

    const bill_type = progressData.form_name;
    const ejsFileName = bill_type.toLowerCase().split(' ').join('_') + "_index";
    var type = "preview";
    var result = progressData.last_filled_data;
    var data = {
        "progress_number": progressData.progress_number,
        "is_preview" : true
    };

    var user_id = null;

    if(progressData.user_id != ''){
        user_id = progressData.user_id;
    }

    var progress_data = {
        "user_id": user_id,
        "progress_id": progressData._id,
        "bill_type": bill_type
    };

    var templatePath = path.join(__dirname, `../../template/${ejsFileName}.ejs`);
    const html = await ejs.renderFile(templatePath, { type, result, data, layout: false}, {async: true});

    res.locals = {
        title: bill_type + " preview",
        metaDescription: 'Preview Document',
        loggedInUser: req.loggedInUser,
        html: html,
        result: result,
        progress_data: progress_data,
        noindex : true,
        url:"",
        env: app.get("env") === "production"? true : false
    };
    res.render("pages/preview", { layout: "layout" });
});

router.post('/findCompanyData', async (req, res) => {
	try {
		const payload = req.body;

		const companyDocument = await COMPANYMODEL.findOne({ company_name: payload.company_name }).lean();

		if (!companyDocument) {
			return res.status(301).json({ success: false, message: "Something went wrong", error: null, data: null });
		}
		return res.status(200).json({ success: true, message: "data Fetched successfully", data: companyDocument, error: null });
	} catch (err) {
		console.log("CATCH :: WEB ::document.controller:: fn[createdocument]:::>");
		console.error(err);
		return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
	}
});

router.post('/getProductList', async (req, res) => {
	try {

		let productList = await PRODUCTSMODEL.find({isDeleted : false}).select('-_id -createdAt -updatedAt -__v').lean();

		if (!productList) {
			return res.status(301).json({ success: false, message: "Something went wrong", error: null, data: null });
		}
		return res.status(200).json({ success: true, message: "data Fetched successfully", data: productList, error: null });
	} catch (err) {
		console.log("CATCH :: WEB ::document.controller:: fn[createdocument]:::>");
		console.error(err);
		return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
	}
});

router.get('/getInvoiceCounter', async (req, res) => {
    try {
        // Try to find the counter in the database
        let counter = await INVOICECOUNTERMODEL.findOne({}).lean();

        // If the counter is not found, initialize it to a default value
        if (!counter) {
            counter = await INVOICECOUNTERMODEL.create({ counter: 1 });
        }

        return res.status(200).json({ success: true, message: "Data fetched successfully", data: counter, error: null });
    } catch (err) {
        console.error("Error in /getInvoiceCounter:", err);
        return res.status(500).json({ success: false, message: "Something went wrong", error: err.message, data: null });
    }
});

router.post('/updateInvoiceCounter', async (req, res) => {
    try {
        const payload = req.body;

        // Find and update the counter document
        const updatedCounter = await INVOICECOUNTERMODEL.findOneAndUpdate(
            {},
            { $set: { counter: payload.counter } },
            { new: true }
        );

        if (!updatedCounter) {
            return res.status(404).json({ success: false, message: "Counter not found", error: null, data: null });
        }

        return res.status(200).json({ success: true, message: "Invoice counter updated successfully", data: updatedCounter.counter, error: null });
    } catch (err) {
        console.error("Error in /updateInvoiceCounter:", err);
        return res.status(500).json({ success: false, message: "Something went wrong", error: err.message, data: null });
    }
});

router.post('/getHsnCode', async (req, res) => {
	try {

        let payload = req.body;

		let hsnCode = await PRODUCTSMODEL.findOne({product_name : payload.product}).select('product_hsn_code').lean();

		if (!hsnCode) {
			return res.status(301).json({ success: false, message: "Something went wrong...", error: null, data: null });
		}
		return res.status(200).json({ success: true, message: "data Fetched successfully gautam...", data: hsnCode, error: null });
	} catch (err) {
		console.log("CATCH :: WEB ::document.controller:: fn[createdocument]:::>");
		console.error(err);
		return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
	}
});

module.exports = router;