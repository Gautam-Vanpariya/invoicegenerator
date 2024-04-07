const { addProductValidation, updateProductValidation } = require("../../validations/product.validation");
const DATATABLEWEB = require("../../helper/dataTable");

const db = require("../../models");
const INVOICEMODEL = db.userProgress;


exports.create = async (req, res) => {
	try {
		const payload = req.body;
		// Validate
		const validationError = addProductValidation(payload).error;
		if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "error: validation issue.", data: null });

		const products = new INVOICEMODEL(payload);
		await products.save();
		return res.status(200).json({ success: true, message: "products created", data: products, error: null });
	} catch (err) {
		console.log("CATCH :: WEB ::document.controller:: fn[createdocument]:::>");
		console.error(err);
		return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
	}
};

// retrieve and return all users/ retrive and return a single user
exports.find = async (req, res) => {
	try {
		var modelObj = INVOICEMODEL;
		var searchFields = ['last_filled_data.from_number', 'last_filled_data.to_name'];
		var conditionQuery = { isDeleted: false };
		var projectionQuery = '-updatedAt -__v';
		var sortingQuery = { createdAt: -1 };
		var populateQuery = [];

		var today = new Date();
		if (req.body.data_range === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Start of the day
            conditionQuery.createdAt = { $gte: today }; // Documents created today
        } else if (req.body.data_range === 'this_month') {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            conditionQuery.createdAt = { $gte: startOfMonth }; // Documents created this month
        } else if (req.body.data_range === 'this_year') {
            const startOfYear = new Date(today.getFullYear(), 3, 1); // Assuming fiscal year starts from April (index 3)
            const endOfYear = new Date(today.getFullYear() + 1, 2, 31); // Fiscal year end
            conditionQuery.createdAt = { $gte: startOfYear, $lte: endOfYear }; // Documents created this fiscal year
        }

		DATATABLEWEB.fetchDatatableRecords(req.body, modelObj, searchFields, conditionQuery, projectionQuery, sortingQuery, populateQuery, function (err, data) {
			if (err) {
				res.status(200).send({
					"draw": 1,
					"recordsFiltered": 0,
					"recordsTotal": 0,
					"data": []
				});
			} else {
				const document_data = data.data;
				const document = [];
				for (var key in document_data) {
					document.push({
						_id: document_data[key]['_id'],
						from_number: document_data[key]['last_filled_data']['from_number'],
						invoice_total: document_data[key]['last_filled_data']['total'],
						total_tax: document_data[key]['last_filled_data']['total_tax'],
						createdAt: new Date(document_data[key]['createdAt']).toLocaleString(),
						payment_status: document_data[key]['payment_status'],
						company_name: document_data[key]['last_filled_data']['to_name'],
					});
				}

				var documentObj = {
					draw: data.draw,
					recordsFiltered: data.recordsFiltered,
					recordsTotal: data.recordsTotal,
					data: document
				};

				var jsonString = JSON.stringify(documentObj);
				res.send(jsonString);
			}
		});
	}
	catch (err) {
		console.log("CATCH :: WEB ::document.controller:: fn[find]:::>");
		console.error(err);
		res.status(200).send({
			"draw": 1,
			"recordsFiltered": 0,
			"recordsTotal": 0,
			"data": []
		});
	}
};


exports.update = async (req, res) => {
	try {

		const payload = req.body;

		const validationError = updateProductValidation(payload).error;
		if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: null, data: null });

		const documentData = await INVOICEMODEL.findOne({ _id: payload._id }).lean();

		if (!documentData) {
			return res.status(301).json({ success: false, message: "Invalid document update request.", error: null, data: null });
		}

		const updatedata = await INVOICEMODEL.findOneAndUpdate({ "_id": documentData._id }, { "$set": payload });
		return res.status(200).json({ success: true, message: "Update document successfully", data: updatedata, error: null });

	} catch (err) {
		console.log("CATCH :: API ::fn[uploadFormLogo]:::>");
		console.error(err);
		return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
	}
};

exports.getData = async (req, res) => {
	try {
		const id = req.params.id;

		if (id == null) {
			return res.status(300).json({ success: false, message: "document id should not be null", error: "error: logical issue.", data: null });
		}

		const documentData = await INVOICEMODEL.findOne({ "_id": id }).lean();

		if (!documentData) {
			return res.status(300).json({ success: false, message: "document not found", error: "error: logical issue.", data: null });
		}

		return res.status(200).json({ success: true, message: "Update document successfully", data: documentData, error: null });

	} catch (err) {
		console.log("CATCH :: API ::fn[uploadFormLogo]:::>");
		console.error(err);
		return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
	}
};


exports.deletedocument = async (req, res) => {
	try {
		const documentId = req.params.id;
		let currentdocument = await INVOICEMODEL.findOne({ "_id": documentId }).lean();
		if (!currentdocument) return res.status(300).json({ success: false, message: "document not found.", error: "error: not found issue.", data: null });
		const deleteReocord = await INVOICEMODEL.findByIdAndUpdate({ "_id": documentId }, { "$set": { "isDeleted": true } });
		return res.status(200).json({ success: true, message: "Document Deleted Successfully.", data: deleteReocord, error: null });
	}
	catch (err) {
		console.log("CATCH :: WEB ::document.controller:: fn[deletedocument]:::>");
		console.error(err);
		return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
	}
};
exports.paymentStatus = async (req, res) => {
	try {
		const payload = req.body;

		const invoiceDetail = await INVOICEMODEL.findOne({"_id": payload.id}).lean();

		if (!invoiceDetail) {
			return res.status(301).json({ success: false, message: "Invoice Not Found", error: "error: not found issue.", data: null });
		} else {
			const updatePaymentStatus = await INVOICEMODEL.findByIdAndUpdate({ "_id": payload.id }, { "$set": { "payment_status": payload.paymentStatus } });
			return res.status(200).json({ success: true, message: "Payment status updated succesfully", data: updatePaymentStatus, error: null });
		}
	}
	catch (err) {
		console.log("CATCH :: WEB ::company.controller:: fn[deletecompany]:::>");
		console.error(err);
		return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
	}
};