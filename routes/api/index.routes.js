const router = require('express').Router();
const GENERAL_API = require('../../controllers/api/general.controller');
const { uploadFile } = require("../../utils/multer");

// ============== [CATEGORY REQUEST] ================= //

router.use("/auth", require("./auth"));
router.use("/users", require("./users"));
router.use("/userProgress", require( "./userProgress"));
router.use("/checkout", require( "./checkout"));


// ============== [ ROOT ] =========================== //


// GET PDF BASE64 BY ORDER-ID
router.get("/pdf/:order_id/download", GENERAL_API.downloadPDF);

// UPLOAD FILE
router.post('/upload/formLogo', uploadFile.any(), GENERAL_API.uploadFormLogo);

// Invoice TAX CALCULATE LOGIC
router.post('/invoice/calculate', GENERAL_API.invoiceCalculate);
// PREVIEW
router.post('/getPreviewHtml', GENERAL_API.getPreviewHtml);
// WITHOUT SAVE PREVIEW
router.post('/withoutSave/getPreviewHtml', GENERAL_API.getPreviewWithoutSaveHtml);

// =========================================================== //


module.exports = router;