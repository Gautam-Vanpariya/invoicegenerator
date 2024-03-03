const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
	company_name		: { type: String, default: "" },
	company_gst_number	: { type: String, default: "" },
	company_email		: { type: String, default: "" },
	company_address1	: { type: String, default: "" },
	company_address2	: { type: String, default: "" },
	company_city		: { type: String, default: "" },
	company_zip			: { type: String, default: "" },
	company_number		: { type: String, default: "" },
	isDeleted			: { type: Boolean, default: false }
},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('company', companySchema, 'company');