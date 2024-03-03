exports.PAYMENT_STATUS = Object.freeze({
  PAID         : "Paid",
  PENDING      : "Pending",
  FREE         : "Free",
  CANCEL       : "Cancel",
});

exports.EMAIL_RESPONSE = Object.freeze({
  SUCCESS   : "Success",
  PENDING   : "Pending",
  FAIL      : "Fail",
});

exports.USERROLE = Object.freeze({
  CUSTOMER     : "Customer",
  ADMIN        : "Admin"
});

exports.ACTIVESTATUS = Object.freeze({
  ACTIVE   : "Active",
  INACTIVE : "Inactive"
});

exports.USERTYPE = Object.freeze({
  LOGGEDIN_USER : "LoggedinUser",
  GUEST_USER    : "GuestUser"
});

exports.AUTOCALCE = Object.freeze({
  ON   : "on",
  OFF  : "off"
});

exports.MSTATUS = Object.freeze({
  MARRIED  : "married",
  SINGLE   : "single"
});

exports.FORMNAME = Object.freeze({
  INVOICE  : "Invoice",
});

exports.DISCOUNT_TYPE = Object.freeze({
  NONE         : "none",
  PERCENT      : "percent",
  FLOAT_AMOUNT : "float amount"
});

exports.TAX_TYPE = Object.freeze({
  NONE      : "none",
  ONTOTAL   : "on total",
  DEDUCTED  : "deducted",
  PER_ITEM  : "per item"
});