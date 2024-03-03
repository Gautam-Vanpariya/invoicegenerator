const { addProductValidation, updateProductValidation } = require("../../validations/product.validation");
const DATATABLEWEB = require("../../helper/dataTable");

const db = require("../../models");
const PRODUCTSMODEL = db.products;


exports.create = async (req, res) => {
	try {
		const payload = req.body;
		// Validate
		const validationError = addProductValidation(payload).error;
		if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "error: validation issue.", data: null });

		const products = new PRODUCTSMODEL(payload);
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
		var modelObj = PRODUCTSMODEL;
		var searchFields = ['title', 'content'];
		var conditionQuery = { isDeleted: false };
		var projectionQuery = '-createdAt -updatedAt -__v';
		var sortingQuery = { createdAt: -1 };
		var populateQuery = [];

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
						product_name: document_data[key]['product_name'],
						product_hsn_code: document_data[key]['product_hsn_code'],
						purchase_from: document_data[key]['purchase_from'],
						purchase_qty: document_data[key]['purchase_qty'],
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

		const documentData = await PRODUCTSMODEL.findOne({ _id: payload._id }).lean();

		if (!documentData) {
			return res.status(301).json({ success: false, message: "Invalid document update request.", error: null, data: null });
		}

		const updatedata = await PRODUCTSMODEL.findOneAndUpdate({ "_id": documentData._id }, { "$set": payload });
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

		const documentData = await PRODUCTSMODEL.findOne({ "_id": id }).lean();

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
		let currentdocument = await PRODUCTSMODEL.findOne({ "_id": documentId }).lean();
		if (!currentdocument) return res.status(300).json({ success: false, message: "document not found.", error: "error: not found issue.", data: null });
		const deleteReocord = await PRODUCTSMODEL.findByIdAndUpdate({ "_id": documentId }, { "$set": { "isDeleted": true } });
		return res.status(200).json({ success: true, message: "Document Deleted Successfully.", data: deleteReocord, error: null });
	}
	catch (err) {
		console.log("CATCH :: WEB ::document.controller:: fn[deletedocument]:::>");
		console.error(err);
		return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
	}
};