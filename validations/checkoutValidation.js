const Joi = require('joi');
const JoiObjectId = require('../utils/joi-objectid')(Joi);

exports.order_summary_validate = data => {
  const schema = Joi.object({
    // user_id                : JoiObjectId().required().allow(null, ''),
    user_id                : JoiObjectId().required().allow(null, ''),
    progress_id            : JoiObjectId().required().allow(null, ''),
    //user_type              : Joi.string().required(),
    bill_type              : Joi.string().required(),
    totalItem              :Joi.number().optional().default(1),
   // apply_coupon           : Joi.string(),
  });
  return schema.validate(data);
};

exports.transcation_validate = data => {
  const schema = Joi.object({
    progress_id            : JoiObjectId().required(),
    order_id               : JoiObjectId().required(),
    amount                 : Joi.number().required(),
    coupon                 : Joi.string().required().allow(null, ''),
  });
  return schema.validate(data);
};