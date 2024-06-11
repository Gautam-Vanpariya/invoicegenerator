var Joi = require("joi");

//Validate Login User
exports.login_validate = data => {
  const schema = Joi.object({
    email      : Joi.string().trim().email().lowercase().required(),
    password   : Joi.string().min(6).required(),
    device     : Joi.object(),
    deviceToken: Joi.string().allow(null, ''),
    loginType  : Joi.string().allow(null, ''),
  });

  return schema.validate(data);
};

//Validate forgot User
exports.forgot_validate = data => {
  const schema = Joi.object({
    email   : Joi.string().trim().email().lowercase().required(),
  });

  return schema.validate(data);
};

//Validate reset User
exports.reset_validate = data => {
  const schema = Joi.object({
    otp              : Joi.string().required(),
    new_password     : Joi.string().min(6).required(),
    confirm_password : Joi.string().valid(Joi.ref("new_password")).required(),
  });

  return schema.validate(data);
};

exports.admin_login_validate = data => {
  const schema = Joi.object({
    email     : Joi.string().trim().email().lowercase().optional().default(null),
    password  : Joi.string().required().max(128).trim(),
  });

  return schema.validate(data);
};

//VALIDATE USER Register V2
exports.reg_validate = data => {
  const schema = Joi.object({
    user_name         : Joi.string().required(),
    email             : Joi.string().trim().email().lowercase().required(),
    password          : Joi.string().min(6).required(),
    confirm_password  : Joi.string().valid(Joi.ref("password")).required(),
    userRole          : Joi.string(),
    device            : Joi.object(),
    deviceToken       : Joi.string().allow(null, ''),
  });

  return schema.validate(data);
};

//Update User profile
exports.updateProfile_validate = data => {
  const schema = Joi.object({
    user_name       : Joi.string().required(),
    first_name      : Joi.string().allow(null, ''),
    last_name       : Joi.string().allow(null, ''),
    phone           : Joi.string().optional().min(10).max(10).allow(null, ''),
    userRole        : Joi.string().allow(null, ''),
    street_address1 : Joi.string().allow(null, ''),
    street_address2 : Joi.string().allow(null, ''),
    city            : Joi.string().allow(null, ''),
    zipcode         : Joi.string().min(5).max(5).optional().allow(null, ''),
    country         : Joi.string().allow(null, ''),
    state           : Joi.string().allow(null, ''),
  });

  return schema.validate(data);
};

//VALIDATE USER Register V2
exports.unsubscription_validate = data => {
  const schema = Joi.object({
    email             : Joi.string().trim().email().lowercase().required(),
  });
  return schema.validate(data);
};