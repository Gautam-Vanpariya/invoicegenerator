var Joi = require("@hapi/joi");
const { FORMNAME, DISCOUNT_TYPE, TAX_TYPE } = require('../utils/enum');

exports.upload_form_logo_validate = data => {
  const schema = Joi.object({
    form_name  : Joi.string().valid(...Object.values(FORMNAME)).required(),
    type       : Joi.string().valid('IMAGE').required()
  });
  return schema.validate(data);
};


exports.calculateInvoice_validate = data => {
  const schema = Joi.object({
    discount_type     : Joi.string().trim().lowercase().valid(...Object.values(DISCOUNT_TYPE)).required(),
    discountRate      : Joi.number().allow(null, ''),
    tax_type          : Joi.string().trim().lowercase().valid(...Object.values(TAX_TYPE)).required(),
    taxRate           : Joi.number().allow(null, ''),
    invoice_data      : Joi.object().required().not({})
  });

  return schema.validate(data);
};

exports.preview_html = data => {
  const schema = Joi.object({
    progress_number  : Joi.string().required(),
    form_name  : Joi.string().valid(...Object.values(FORMNAME)).required(),
  });

  return schema.validate(data);
};

exports.preview_html_without_save = data => {
  const schema = Joi.object({
    last_filled_data      : Joi.object().required().not({}),
    form_name             : Joi.string().required(),
  });

  return schema.validate(data);
};
