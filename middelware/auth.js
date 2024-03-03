const jwt = require("jsonwebtoken");
const { USERTYPE, USERROLE } = require("../utils/enum");

const db = require("../models");
const USERMODEL = db.user;

exports.verifyJwtToken = (req, res, next) => {
  var token;

  if(req.body.user_type === USERTYPE.GUEST_USER){
    req.loggedInUser = null;
    next();
  }else{
    if ("authorization" in req.headers) token = req.headers["authorization"].split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Authorization Token Required.", error: "error: token missing issue"});

    jwt.verify(token, process.env.JWT_SECRET, async (err, userDecoded) => {
        if (err) return res.status(401).json({ success: false, message: "Token authentication failed..", error: "error: Auth fail issue"});
        const userData = await USERMODEL.findOne({"_id": userDecoded._id, "userRole": USERROLE.CUSTOMER}).select("-passowrd").lean();
        if (!userData) return res.status(401).json({ success: false, message: "Token authentication failed..", error: "error: not found issue"});

        req.loggedInUser = userData;
        req.jwtExpireTime = userDecoded.exp;
        if ("refreshtoken" in req.headers) {
          var newToken = jwt.sign({ _id: req.loggedInUser._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRESIN
          });
          req.responseBody = { message: "Refresh Auth token", success: true, error: null, data: {"token": newToken}};
        } else {
          req.responseBody = {};
        }
        next();
    });
  }
};
