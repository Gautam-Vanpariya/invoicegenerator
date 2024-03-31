const { addCompanyValidation, updateCompanyValidation } = require("../../validations/company.validation");
const DATATABLEWEB = require("../../helper/dataTable");

const db = require("../../models");
const COMPANYMODEL = db.company;


exports.create = async (req, res) => {
	try {
		const payload = req.body;
		// Validate
		const validationError = addCompanyValidation(payload).error;
		if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "error: validation issue.", data: null });

		const duplicateCompany = await COMPANYMODEL.findOne({ company_name: payload.company_name }).lean();
		if (duplicateCompany) {
			return res.status(301).json({ success: false, message: "Company name already exist.", error: null, data: null });
		}
		const company = new COMPANYMODEL(payload);
		await company.save();
		return res.status(200).json({ success: true, message: "company created", data: company, error: null });
	} catch (err) {
		console.log("CATCH :: WEB ::document.controller:: fn[createdocument]:::>");
		console.error(err);
		return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
	}
};

// retrieve and return all users/ retrive and return a single user
exports.find = async (req, res) => {
	try {
		var modelObj = COMPANYMODEL;
		var searchFields = ['company_name'];
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
				const company_data = data.data;
				const document = [];
				for (var key in company_data) {
					document.push({
						_id: company_data[key]['_id'],
						company_name: company_data[key]['company_name'],
						company_gst_number: company_data[key]['company_gst_number'],
						company_email: company_data[key]['company_email'],
						company_address: company_data[key]['company_address1'],
						company_number: company_data[key]['company_number'],
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

		const validationError = updateCompanyValidation(payload).error;
		if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: null, data: null });

		const companyData = await COMPANYMODEL.findOne({ _id: payload._id }).lean();

		if (!companyData) {
			return res.status(301).json({ success: false, message: "Invalid company update request.", error: null, data: null });
		}

		if (companyData.company_name != payload.company_name) {
			const duplicateCompany = await COMPANYMODEL.findOne({ company_name: payload.company_name }).lean();
			if (duplicateCompany) {
				return res.status(301).json({ success: false, message: "Company with given name already exist.", error: null, data: null });
			}
		}
		const updateCompany = await COMPANYMODEL.findOneAndUpdate({ "_id": companyData._id }, { "$set": payload });
		return res.status(200).json({ success: true, message: "Update company successfully", data: updateCompany, error: null });

	} catch (err) {
		console.log("CATCH :: API ::fn[updateCompany]:::>");
		console.error(err);
		return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
	}
};

exports.getData = async (req, res) => {
	try {
		const id = req.params.id;

		if (id == null) {
			return res.status(300).json({ success: false, message: "company id should not be null", error: "error: logical issue.", data: null });
		}

		const companyData = await COMPANYMODEL.findOne({ "_id": id }).lean();

		if (!companyData) {
			return res.status(300).json({ success: false, message: "company not found", error: "error: logical issue.", data: null });
		}

		return res.status(200).json({ success: true, message: "Update company successfully", data: companyData, error: null });

	} catch (err) {
		console.log("CATCH :: API ::fn[getData]:::>");
		console.error(err);
		return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
	}
};

exports.deleteCompany = async (req, res) => {
	try {
		const companyId = req.params.id;
		let currentcompany = await COMPANYMODEL.findOne({ "_id": companyId }).lean();
		if (!currentcompany) return res.status(300).json({ success: false, message: "Company not found.", error: "error: not found issue.", data: null });
		const deleteReocord = await COMPANYMODEL.findByIdAndUpdate({ "_id": companyId }, { "$set": { "isDeleted": true } });
		return res.status(200).json({ success: true, message: "Company Deleted Successfully.", data: deleteReocord, error: null });
	}
	catch (err) {
		console.log("CATCH :: WEB ::company.controller:: fn[deletecompany]:::>");
		console.error(err);
		return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
	}
};

