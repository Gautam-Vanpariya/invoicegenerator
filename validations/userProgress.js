const Joi = require('@hapi/joi');
const JoiObjectId = require('../utils/joi-objectid')(Joi);
const { AUTOCALCE, MSTATUS } = require('../utils/enum');

var autocalc = Object.values(AUTOCALCE);
var mStatus = Object.values(MSTATUS);

exports.savedraft_login_validate = data => {
  const schema = Joi.object({
    progress_number       : Joi.string().optional().allow(null, ""),
    applicationId         : Joi.string().optional().allow(null, ""),
    lastSavedStep         : Joi.any(),
    last_filled_data      : Joi.object().required().not({}),
    form_name             : Joi.string().required(),
    user_type             : Joi.string().optional().allow(null, ""),
    is_edited             : Joi.string().optional().allow(null, "")
  });
  return schema.validate(data);
};

exports.savedraft_guest_validate = data => {
  const schema = Joi.object({
    user_email            : Joi.string().required().email(),
    progress_number       : Joi.string().optional().allow(null, ""),
    applicationId         : Joi.string().optional().allow(null, ""),
    lastSavedStep         : Joi.any(),
    last_filled_data      : Joi.object().required().not({}),
    form_name             : Joi.string().required(),
    user_type             : Joi.string().optional().allow(null, ""),
    is_edited             : Joi.string().optional().allow(null, "")
  });
  return schema.validate(data);
};

exports.preview_userprogress_validate = data => {
  const schema = Joi.object({
    form_name             : Joi.string().required()
  });
  return schema.validate(data);
};

exports.userprogress_report_validate = data => {
  const schema = Joi.object({
    is_Checkout           : Joi.boolean().required(),
    form_name             : Joi.string()
  });
  return schema.validate(data);
};

exports.delete_userProgress_validate = data => {
  const schema = Joi.object({
    id                    : JoiObjectId().required(),
  });
  return schema.validate(data);
};

exports.retrieve_userprogress_validate = data => {
  const schema = Joi.object({
    progress_number    : Joi.string().required(),
    form_name          : Joi.string().required(),
  });
  return schema.validate(data);
};

exports.myorder_validate = data => {
  const schema = Joi.object({
    start_date            : Joi.date().required(),
    end_date              : Joi.date().required(),
    form_name             : Joi.string().required()
  });
  return schema.validate(data);
};

exports.calculateW2_validate = data => {
  const schema = Joi.object({
    user_type          : Joi.string().required(),
    autoCalc           : Joi.required().valid(...Object.values(autocalc)),
    mStatus            : Joi.required().valid(...Object.values(mStatus)),
    taxLastYear        : Joi.number().required(),
    exemp              : Joi.number().required(),
    state              : Joi.string().required(),
    year               : Joi.number().required()
  });
  return schema.validate(data);
};
