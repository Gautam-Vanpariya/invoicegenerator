const mongoose = require("mongoose");

const productsSchema = new mongoose.Schema({
	product_name: 			{ type: String, default: "" },
	product_hsn_code: 		{ type: String, default: "" },
	product_manufacturer: 	{ type: String, default: "" },
	purchase_from: 			{ type: String, default: "" },
	purchase_date: 			{ type: String, default: "" },
	product_expiry: 		{ type: String, default: "" },
	other_detail: 			{ type: String, default: "" },
	purchase_qty:			{ type: String, default: "" },
	isDeleted: 				{ type: Boolean, default: false }
},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('product', productsSchema, 'product');