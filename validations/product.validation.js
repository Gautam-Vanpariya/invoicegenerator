const Joi = require('@hapi/joi');

exports.addProductValidation = data => {
	const schema = Joi.object({
		product_name			: Joi.string().required(),
		product_hsn_code		: Joi.string().required(),
		product_manufacturer	: Joi.string().optional().allow(null, ""),
		purchase_from			: Joi.string().optional().allow(null, ""),
		purchase_date			: Joi.string().optional().allow(null, ""),
		product_expiry			: Joi.string().optional().allow(null, ""),
		other_detail			: Joi.string().optional().allow(null, ""),
		purchase_qty			: Joi.number().required(),
	});
	return schema.validate(data);
};

exports.updateProductValidation = data => {
	const schema = Joi.object({
		_id: Joi.string(),
		product_name			: Joi.string().required(),
		product_hsn_code		: Joi.string().required(),
		product_manufacturer	: Joi.string().optional().allow(null, ""),
		purchase_from			: Joi.string().optional().allow(null, ""),
		purchase_date			: Joi.string().optional().allow(null, ""),
		product_expiry			: Joi.string().optional().allow(null, ""),
		other_detail			: Joi.string().optional().allow(null, ""),
		purchase_qty			: Joi.number().required(),
	});
	return schema.validate(data);
};
