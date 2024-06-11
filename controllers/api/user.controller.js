const ejs = require("ejs");
const path = require("path");
const puppeteer = require('puppeteer');

const db = require("../../models/index");
const USERMODEL = db.user;
const USERPROGRESSMODEL = db.userProgress;
const ORDERSUMMARYMODEL = db.orderSummary;

const { updateProfile_validate } = require("../../validations/userValidation");
const { PAYMENT_STATUS, EMAIL_RESPONSE } = require("../../utils/enum");
const { sendPDFMailOnCheckout } = require("../../helper/mail.helper");


module.exports = {
	getUserInfo: async (req, res) => {
		try {
			const loggedInUser = req.loggedInUser;
			const user = await USERMODEL.findOne({ "_id": loggedInUser._id }).select("-password").lean();
			return res.status(200).json({ success: true, message: "User info.", data: user, error: null });
		} catch (err) {
			console.log("CATCH ::fn[getUserInfo]:::>");
			console.error(err);
			return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
		}
	},
	updateUserDetails: async (req, res) => {
		try {
			const payload = req.body;
			const id = req.params.id;
			// Validate
			const validationError = updateProfile_validate(payload).error;
			if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "error: validation issue.", data: null });

			const emailExist = await USERMODEL.findOne({ "_id": { "$ne": id }, "email": payload.email });
			if (emailExist) return res.status(300).json({ success: false, message: `${payload.user_name} is already in exist.`, error: "error: conditinal issue.", data: null });

			let user = await USERMODEL.findOneAndUpdate({ "_id": id }, { "$set": payload }, { new: true });
			return res.status(200).json({ success: true, message: "User profile updated successfully.", data: user, error: null });
		} catch (err) {
			console.log("CATCH ::fn[updateUserDetails]:::>");
			console.error(err);
			return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
		}
	},
	generatePdf: async (req, res) => {
		try {
			const payload = req.body;
			const orderId = payload.order_id;

			const orderData = await ORDERSUMMARYMODEL.findOne({ "_id": orderId });
			if (!orderData) return res.status(300).json({ success: false, message: "Invalid order!", error: "error: not found issue.", data: null });

			var updateOrderData = null;

			updateOrderData = await ORDERSUMMARYMODEL.findOneAndUpdate({ "_id": orderId }, { "payment_status": PAYMENT_STATUS.PAID }, { new: true });

			const progressData = await USERPROGRESSMODEL.findOne({ "_id": orderData.progress_id }).lean();

			const user_data = await USERMODEL.findOne({ "_id": progressData.user_id }).select("email").lean();

			// // SEND E-MAIL ON SUCCESSFULL PDF GENERATE

			var mailResponse;
			var isGenerated = false;
			var last_filled_data = progressData.last_filled_data;
			var result = last_filled_data;
			var generatePDFFileResponse;
			var app_type = 'pdf';
			var data = {
				"from_number": progressData.last_filled_data.from_number
			};

			const bill_type = progressData.form_name;
			const ejsFileName = bill_type.toLowerCase().split(' ').join('_') + "_index";
			var type = "pdf";
			var templatePath = path.join(__dirname, `../../template/${ejsFileName}.ejs`);
			var html = "";

			html = await ejs.renderFile(templatePath, { type, result, data, layout: false }, { async: true });

			const outputPath = path.join(__dirname, `../../uploads/pdf/${data.from_number}_pdf.pdf`);

			const renderedHtml = html;

			let userData;
			try {

				// Convert HTML to PDF
				// await convertHtmlToPdf(outputPath, renderedHtml);

				await generatePDF(html, outputPath)
				.then(() => console.log('PDF generated successfully'))
				.catch(error => console.error('Error generating PDF:', error));
				//return res.status(301).json({ success: false, message: "Something went wrong", error: null, data: null });

				// pdf.create is calling async way and we assume it alwasys generate PDF
				generatePDFFileResponse = {
					data: {
						success: true,
					}
				};
				if (generatePDFFileResponse.data.success) {
					userData = await USERPROGRESSMODEL.findOneAndUpdate({ "_id": orderData.progress_id }, { "$set": { "pdf_path": `/uploads/pdf/${data.from_number}_pdf.pdf`, "pdf_response": "Generated", "is_Checkout": true } }, { new: true });
					isGenerated = true;
				} else {
					await USERPROGRESSMODEL.findOneAndUpdate({ "_id": orderData.progress_id }, { "$set": { "pdf_response": generatePDFFileResponse.data } });
				}
			} catch (err) {
				console.log("CATCH ::fn[generatePDFFile]:::>");
				console.error(err);
				await USERPROGRESSMODEL.findOneAndUpdate({ "_id": orderData.progress_id }, { "$set": { "pdf_response": err } });
			}
			sendMail(user_data, isGenerated, progressData, orderData, updateOrderData, mailResponse, app_type, userData.pdf_path, res);

		} catch (err) {
			console.log("CATCH ::fn[generatePdf]:::>");
			console.error(err);
			return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
		}
	}
};


async function setData(user_data, mailResponse, orderData, updateOrderData, progressData, res) {
	if (mailResponse.success) {
		await USERPROGRESSMODEL.findOneAndUpdate({ "_id": orderData.progress_id }, { "$set": { "email_response": EMAIL_RESPONSE.SUCCESS } });
	} else {
		await USERPROGRESSMODEL.findOneAndUpdate({ "_id": orderData.progress_id }, { "$set": { "email_response": EMAIL_RESPONSE.FAIL } });
	}
	return res.status(200).send({ success: true, message: "Pdf Created Successfully.", data: { orderData: updateOrderData, progressData: progressData, user_data: user_data } });
}

function sendMail(user_data, isGenerated, progressData, orderData, updateOrderData, mailResponse, app_type, pdfPath, res) {
	if (isGenerated) {
		try {
			const mailData = {
				"email": progressData.last_filled_data.to_email,
				"customerName": progressData.last_filled_data.to_name,
				"bill_type": updateOrderData.bill_type + '.pdf',
				"pdf_path": pdfPath,
				"app_type": app_type
			};
			sendPDFMailOnCheckout(mailData, async function (err, results) {
				if (err == 'error') {
					console.log("Got ERROR ON SENDING PDF MAIL ON CHECKOUT:::>");
					mailResponse = results;
				} else {
					mailResponse = results;
				}
				await setData(user_data, mailResponse, orderData, updateOrderData, progressData, res);
			});
		} catch (err) {
			console.log("CATCH ::ERROR ON SENDING PDF MAIL ON CHECKOUT:::>");
			console.error(err);
		}
	}
}

function convertHtmlToPdf(outputPath, renderedHtml) {
	return new Promise((resolve, reject) => {
		try {

			// PDF options
			const pdfOptions = {
				format: 'A4',
				height: '297mm',
				width: '210mm',
			};

			// Convert HTML to PDF
			pdf.create(renderedHtml, pdfOptions).toFile(outputPath, (err, result) => {
				if (err) {
					console.error('Error creating PDF:', err);
					reject(err);
				} else {
					console.log('PDF created successfully at:', result.filename);
					resolve(result.filename);
				}
			});
		} catch (error) {
			console.error('Error creating PDF:', error);
			reject(error);
		}
	});
}
function generatePDF(html, outputPath) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setContent(html);
            await page.pdf({ path: outputPath, format: 'A4' ,margin: { top: 0, bottom: 0, right: 0, left: 0 },
			printBackground: true,});
            await browser.close();
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}