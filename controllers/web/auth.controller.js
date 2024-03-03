const bcryptJs = require('bcryptjs');

const db = require("../../models");
const USERMODEL = db.user;

const { USERROLE, ACTIVESTATUS } = require('../../utils/enum');
const { login_validate} = require("../../validations/userValidation");

module.exports = {
    adminLogin: async (req, res) => {
      try {
        const payload = req.body;
        const validationError = login_validate(payload).error;
        if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "error: validation issue.", data: null });

        const userData = await USERMODEL.findOne({"email" : payload.email, "userRole": USERROLE.ADMIN }).select("email password userRole status").lean();
        if (!userData) return res.status(300).json({ success: false, message: "You don't have account with given info.", error: "error: not found issue.", data: null });

        if (!await bcryptJs.compare(payload.password, userData.password)) return res.status(300).json({ success: false, message: "Invalid email and password", error: "error: invalid data issue.", data: null });

        const sessionUser = {
          "_id"  : userData._id,
          "email": userData.email,
          "userRole" : userData.role
        };
        req.session.user = sessionUser;
        return res.status(200).json({ success: true, message: "login successfully.", error: null, data: userData});
      } catch (err) {
        console.log("CATCH ::fn[adminLogin]:::>");
        console.error(err);
        return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
      }
    },
    login: async (req, res) => {
        try {
          const payload = req.body;
          const validationError = login_validate(payload).error;
          if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "error: validation issue.", data: null });

          let user = await USERMODEL.findOne({ "isDeleted": false, "email": payload.email, "userRole": USERROLE.CUSTOMER }).select("email password userRole status").lean();
          if (!user) return res.status(300).json({ success: false, message: "You don't have account with given info.", error: "error: not found issue.", data: null });

          if (!await bcryptJs.compare(payload.password, user.password)) return res.status(300).json({ success: false, message: "Invalid email and password", error: "error: invalid data issue.", data: null });
          if (user.status == ACTIVESTATUS.INACTIVE) return res.status(300).json({ success: false, message: "Your account is Inactive. Please contact customer support.", error: "error: not found issue", data: null });

          const sessionUser = {
            "_id"  : user._id,
            "userRole" : user.userRole,
            "email": user.email
          };
          req.session.user = sessionUser;
          return res.status(200).json({ success: true, message: "login successfully.", error: null, data: user});
        } catch (err) {
          console.log("CATCH ::fn[login]:::>");
          console.error(err);
          return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
        }
    }
};