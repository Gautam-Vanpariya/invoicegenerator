let fs = require("fs");
const db = require('../../models/index');
const USERMODEL = db.user;
const PRODUCTSMODEL = db.products;
const USERPROGRESSMODEL = db.userProgress;
const { savedraft_login_validate, savedraft_guest_validate, preview_userprogress_validate,
	userprogress_report_validate, retrieve_userprogress_validate, myorder_validate } = require('../../validations/userProgress');
var JSZip = require("jszip");

module.exports = {
	saveUserProgess: async (req, res) => {
		try {
			const loggedInUser = req.loggedInUser;
			const payload = req.body;
			let user_email = loggedInUser ? loggedInUser.email : payload.user_email;
			let user_id = loggedInUser ? loggedInUser._id : null;
			let lastSavedStep = payload.lastSavedStep;
			user_email = user_email ? user_email : 'onlinebill@gmail.com';

			if (loggedInUser && loggedInUser._id) {
				// Validate
				const validationError = savedraft_login_validate(payload).error;
				if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "error: validation issue.", data: null });
			} else {
				// Validate
				payload.user_email = user_email;
				const validationError = savedraft_guest_validate(payload).error;
				if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "error: validation issue.", data: null });
			}

			if (payload.is_edited == "No") {
				const duplicateInvoiceNumber = await USERPROGRESSMODEL.findOne({'last_filled_data.from_number': payload.last_filled_data.from_number}).lean();
				if (duplicateInvoiceNumber) {
					return res.status(300).json({success: false, message: "Invoice number already exist", error: "Duplicate invoice found issue", data: null });
				}
			}

			let userProgressDetails;
			let previewData;
			if (payload.progress_number || payload.applicationId) {
				if (payload.applicationId) {
					previewData = await USERPROGRESSMODEL.findOne({ "_id": payload.applicationId }).select("_id last_filled_data").lean();
				} else if (payload.progress_number !== "") {
					previewData = await USERPROGRESSMODEL.findOne({ "progress_number": payload.progress_number }).select("_id last_filled_data").lean();
				}
			}
			if (previewData) {
				let last_filled_data = { ...previewData.last_filled_data, ...payload.last_filled_data };
				userProgressDetails = await USERPROGRESSMODEL.findOneAndUpdate({ "_id": previewData._id }, { "$set": { "lastSavedStep": lastSavedStep, "user_id": user_id, "user_email": user_email, "last_filled_data": last_filled_data } }, { new: true });

				// quantityUpdateDetails = await PRODUCTSMODEL.findOneAndUpdate({"product_name" : last_filled_data.})
			} else {
				const savePayload = {
					"user_id": user_id,
					"user_email": user_email,
					"last_filled_data": payload.last_filled_data,
					"form_name": payload.form_name,
				};

				async function updateItems(payload) {
					const items = payload.last_filled_data.items;

					for (const key of Object.keys(items)) {
						const item = items[key];
						const qtyToSubtract = parseInt(item.item_qty, 10);
						try {
							// Fetch the current value of purchase_qty from the database
							const existingData = await PRODUCTSMODEL.findOne({
								product_name: item.item_description,
								product_hsnCode: item.item_hsnCode
							});

							// Ensure existingData is not null and has a valid purchase_qty
							if (existingData && typeof existingData.purchase_qty === 'string') {
								// Convert the existing purchase_qty to a number
								const currentQty = parseInt(existingData.purchase_qty, 10);

								// Perform the subtraction and store the result back as a string
								const updatedQty = currentQty - qtyToSubtract;

								// Update the database with the new value
								const updateResult = await PRODUCTSMODEL.updateMany(
									{
										product_name: item.item_description,
										product_hsnCode: item.item_hsnCode
									},
									{
										$set: { purchase_qty: String(updatedQty) }
									}
								);

								console.log("Update successful:", updateResult);
							} else {
								console.error("Invalid or missing purchase_qty in existing data.");
							}
						} catch (error) {
							console.error("Update error:", error);
						}
					}
				}

				updateItems(payload);


				userProgressDetails = await USERPROGRESSMODEL.create(savePayload);
			}

			return res.status(200).json({ success: true, message: "Data save in draft.", data: userProgressDetails, error: null });
		} catch (err) {
			console.log("CATCH ::fn[saveUserProgess]:::>");
			console.error(err);
			return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
		}

	},

	getAllPendingProgressNumbers: async (req, res) => {
		try {
			const payload = req.body;
			const loggedInUser = req.loggedInUser;
			// Validate
			if (loggedInUser && loggedInUser._id) {
				const validationError = preview_userprogress_validate(payload).error;
				if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "error: validation issue.", data: null });

				let userProgress = await USERPROGRESSMODEL.find({ "user_id": loggedInUser._id, "form_name": payload.form_name, "is_Checkout": false }).select('progress_number -_id').lean().sort({ "createdAt": -1 });
				if (!userProgress) return res.status(300).json({ success: false, message: "You don't have preview data with given info.", error: "error: not found issue.", data: null });
				return res.status(200).json({ success: true, message: "User preview data.", data: userProgress, error: null });
			} else {
				return res.status(300).json({ success: false, message: "User not found.", data: null, error: "error: validation issue." });
			}
		}
		catch (err) {
			console.log("CATCH ::fn[previewUserProgess]:::>");
			console.error(err);
			return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
		}
	},
	userProgessReport: async (req, res) => {
		try {
			const payload = req.body;
			// Validate
			const validationError = userprogress_report_validate(payload).error;
			if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "error: validation issue.", data: null });

			if (payload.form_name) {
				const userProgressReport = await USERPROGRESSMODEL.find({ "form_name": payload.form_name, "is_Checkout": payload.is_Checkout }).sort({ "_id": -1 }).lean();
				return res.status(200).json({ success: true, message: `User Progress details ${payload.form_name}`, data: userProgressReport, error: null });
			} else {
				let userProgressReport = await USERPROGRESSMODEL.find({ "is_Checkout": payload.is_Checkout }).sort({ "_id": -1 }).lean();
				return res.status(200).json({ success: true, message: `User Progress details`, data: userProgressReport, error: null });
			}
		}
		catch (err) {
			console.log("CATCH ::fn[userProgessReport]:::>");
			console.error(err);
			return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
		}
	},
	retrieveUserProgess: async (req, res) => {
		try {
			const payload = req.body;

			// Validate
			const validationError = retrieve_userprogress_validate(payload).error;
			if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "error: validation issue.", data: null });

			let userProgress = await USERPROGRESSMODEL.findOne({ "last_filled_data.from_number": payload.progress_number, "form_name": payload.form_name }).lean();
			if (userProgress) {
				return res.status(200).json({ success: true, message: "Data retrieve successfully.", data: userProgress, error: null });
			} else {
				return res.status(300).json({ success: false, message: "Draft data not exist.", data: null, error: null });
			}
		}
		catch (err) {
			console.log("CATCH ::fn[retrieveUserProgess]:::>");
			console.error(err);
			return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
		}
	},
	myOrder: async (req, res) => {
		try {
			const loggedInUser = req.loggedInUser;
			const payload = req.body;
			const form_name = payload.form_name;
			// Validate
			const validationError = myorder_validate(payload).error;
			if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "error: validation issue.", data: null });

			const user = await USERMODEL.findOne({ "_id": loggedInUser._id });
			if (!user) return res.status(300).json({ success: false, message: "Invalid authorization token.", data: null, error: "error: not found issue" });

			const startDate = Date.parse(payload.start_date);
			const endDate = Date.parse(payload.end_date);
			if (endDate <= startDate) return res.status(300).json({ success: false, message: "End date must be greater than Start date.", data: null, error: "error: conditional issue" });

			let userProgressData;
			if (form_name == "All") {
				userProgressData = await USERPROGRESSMODEL.find({ "user_id": loggedInUser._id, "is_Checkout": true, "updatedAt": { "$gte": new Date(startDate), "$lt": new Date(endDate) } }).select('pdf_path progress_number form_name');
			} else {
				userProgressData = await USERPROGRESSMODEL.find({ "user_id": loggedInUser._id, "is_Checkout": true, "form_name": form_name, "updatedAt": { "$gte": new Date(startDate), "$lt": new Date(endDate) } }).select('pdf_path progress_number form_name');
			}

			const promises = [];
			for (const element of userProgressData) {
				var filename = element.pdf_path.substring(element.pdf_path.lastIndexOf('/') + 1);
				var checkExt = filename.substring(filename.lastIndexOf('.') + 1, filename.length) || filename;
				if (checkExt == 'zip' || checkExt == 'ZIP') {
					var buffer = fs.readFileSync(process.env.PDF_PATH + "/" + filename);
					const result = await JSZip.loadAsync(buffer);
					var innerObj = {};
					Object.keys(result.files).forEach(function (filename) {
						innerObj = {
							"_id": element._id,
							"pdf_path": "/uploads/pdf/" + filename,
							"form_name": element.form_name,
							"progress_number": element.progress_number,
						};
						promises.push(innerObj);
					});
				} else {
					promises.push(element);
				}
			}

			if (!userProgressData) return res.status(300).json({ success: false, message: "You don't have pdf with given info.", data: null, error: "error: not found issue" });
			const finalOutput = promises.filter(i => fs.existsSync(`./${i.pdf_path}`));

			return res.status(200).json({ success: true, message: "User pdf.", data: finalOutput, error: null });
		}
		catch (err) {
			console.log("CATCH ::fn[myOrder]:::>");
			console.error(err);
			return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
		}
	},

	deleteAllUserProgess: async (req, res, next) => {
		try {
			await USERPROGRESSMODEL.deleteMany({});

			return res.status(200).send({ status: 200, message: "All User Progress deatils delete successfully." });

		}
		catch (err) { next(err); }
	},
};