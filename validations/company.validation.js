const Joi = require('joi');

exports.addCompanyValidation = data => {
	const schema = Joi.object({
		company_name: Joi.string().required(),
		company_gst_number: Joi.string().optional().allow(null, ""),
		company_email: Joi.string().required(),
		company_address1: Joi.string().required(),
		company_address2: Joi.string().optional().allow(null, ""),
		company_city: Joi.string().required(),
		company_zip: Joi.string().required(),
		company_number: Joi.number().required(),
	});
	return schema.validate(data);
};

exports.updateCompanyValidation = data => {
	const schema = Joi.object({
		_id					: Joi.string(),
		company_name		: Joi.string().required(),
		company_gst_number: Joi.string().required(),
		company_email		: Joi.string().required(),
		company_address1	: Joi.string().required(),
		company_address2	: Joi.string().optional().allow(null, ""),
		company_city		: Joi.string().required(),
		company_zip			: Joi.string().required(),
		company_number		: Joi.number().required(),
	});
	return schema.validate(data);
};
