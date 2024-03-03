const bcryptJs = require("bcryptjs");
const moment = require('moment');

const db = require('../../models/index');
const USERMODEL = db.user;
const USERTOKENMODEL = db.userToken;
const OTPMODEL = db.otp;
const MAILMODEL = db.mailDiscount;

const { sendForgotOTPMail } = require("../../helper/mail.helper");
const { otpGenerator } = require("../../utils/helper");
const { reg_validate, login_validate, forgot_validate, reset_validate, unsubscription_validate } = require("../../validations/userValidation");
const { USERROLE, ACTIVESTATUS } = require("../../utils/enum");


module.exports = {
    login: async (req, res) => {
        try {
            const payload = req.body;
            // Validate
            const validationError = login_validate(payload).error;
            if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "error: validation issue.", data: null });

            let user = await USERMODEL.findOne({ "isDeleted": false, "email": payload.email, "userRole": USERROLE.CUSTOMER });
            if (!user) return res.status(300).json({ success: false, message: "You don't have account with given info.", error: "error: not found issue.", data: null });

            if (!await bcryptJs.compare(payload.password, user.password)) return res.status(300).json({ success: false, message: "Invalid email and password", error: "error: invalid data issue.", data: null });
            if (user.status == ACTIVESTATUS.INACTIVE) return res.status(300).json({ success: false, message: "Your account is Inactive. Please contact customer support.", error: "error: not found issue", data: null });

            const accessToken = user.generateJwt();
            user.accessToken = accessToken;
            var userDetails = {
                _id: user._id,
                user_name: user.user_name,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone: user.phone,
                status: user.status,
                zipcode: user.zipcode,
                state: user.state,
                userRole : user.userRole
            };
            return res.status(200).json({ success: true, message: "User logged in successfully." , data: { accessToken, user: userDetails }, error: null});
        }catch (err) {
            console.log("CATCH :: API ::fn[login]:::>");
            console.error(err);
            return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
        }
    },
    register: async (req, res) => {
        try {
            const payload = req.body;
            // Validate
            const validationError = reg_validate(payload).error;
            if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "error: validation issue.", data: null });

            const userNameExist = await USERMODEL.findOne({ "isDeleted": false, "user_name": payload.user_name, "userRole": USERROLE.CUSTOMER }).select("_id").lean();
            if (userNameExist) return res.status(300).json({ success: false, message: `${payload.user_name} is already in exist.`, error: "error: conditinal issue.", data: null });

            //check if email exist
            const emailExist = await USERMODEL.findOne({ "isDeleted": false, "email": payload.email, "userRole": USERROLE.CUSTOMER }).select("_id").lean();
            if (emailExist) return res.status(300).json({ success: false, message: `${payload.email} is already in use.`, error: "error: conditinal issue.", data: null });

            const newUser = {
                "user_name": payload.user_name,
                "email": payload.email,
                "password": payload.password
            };
            const savedUser = await USERMODEL.create(newUser);
            return res.status(200).json({ success: true, message: "Register successfully." , data: savedUser, error: null});
        }
        catch (err) {
            console.log("CATCH ::fn[register]:::>");
            console.error(err);
            return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
        }
    },
    forgot: async (req, res) => {
        try {
            const payload = req.body;
            // Validate
            const validationError = forgot_validate(payload).error;
            if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "error: validation issue.", data: null });

            const emailExist = await USERMODEL.findOne({ "isDeleted": false, "email": payload.email, "userRole": USERROLE.CUSTOMER }).select("_id").lean();
            if (!emailExist) return res.status(300).json({ success: false, message: `Invalid email id.`, error: "error: not found issue.", data: null });

            const otpCode = otpGenerator();
            const expireAt = moment().add(30,"minutes");
            const otpData = {
                "otp": otpCode,
                "email": payload.email,
                "expireIn": expireAt
            };
            await OTPMODEL.create(otpData);
            // START - SENDING MAIL
            try {
                sendForgotOTPMail(otpData);
            } catch (err) {
                console.log("CATCH ::ERROR ON SENDING OTP MAIL:::>");
                console.error(err);
            }
            // END -- SENDIND MAIL
            return res.status(200).json({ success: true, message: `OTP is send to your register ${payload.email} email.` , data: null, error: null});
        } catch (err) {
            console.log("CATCH ::fn[forgot]:::>");
            console.error(err);
            return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
        }
    },
    resetPassword: async (req, res) => {
        try {
            const payload = req.body;
            const validationError = reset_validate(payload).error;
            if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "error: validation issue.", data: null });

            const otpData = await OTPMODEL.findOne({ "otp": payload.otp, "used_otp": false });
            if (!otpData) return res.status(300).json({ success: false, message: `Invalid OTP.`, error: "error: invalid data issue.", data: null });

            const currentTime = new Date().getTime();
            const expireTime = new Date(otpData.expireIn).getTime();
            if(currentTime > expireTime) return res.status(300).json({ success: false, message: "Otp is expired", error: null, data: null });

            await USERMODEL.findOneAndUpdate({ "email": otpData.email }, { "password": payload.new_password });
            otpData.used_otp = true;
            await otpData.save();
            return res.status(200).json({ success: true, message: "Successfully password updated", error: null, data: null});
        } catch (err) {
            console.log("CATCH ::fn[resetPassword]:::>");
            console.error(err);
            return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
        }
    },
    logout: async (req, res)=> {
        try {
            const user_id = req.params.id;
            const deviceId = req.headers['deviceid'];
    
            let user = await USERMODEL.findOne({"_id" : user_id}).select("_id").lean();
            if (!user) return res.status(300).json({ success: false, message: "You don't have account with given info.", error: "error: not found issue.", data: null });
    
            if(deviceId){
                await USERTOKENMODEL.findOneAndUpdate({"userId": user_id, "deviceId": deviceId},{$set:{"token": null, "isLoggedIn": false }});
            }
            return res.status(200).json({ success: true, message: 'You have been Logged Out', error: null, data: null});
        }catch (err) {
            console.log("CATCH ::fn[logout]:::>");
            console.error(err);
            return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
        }        
    },
    unsubscription: async (req, res)=> {
        try {
            const payload = req.body;
            console.log(payload);
            // Validate
            const validationError = unsubscription_validate(payload).error;
            if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "error: validation issue.", data: null });

            const emailExist = await MAILMODEL.findOne({ email: payload.email }).lean();
            if (!emailExist) return res.status(300).json({ success: false, message: `${payload.email} is not found.`, error: "error: conditinal issue.", data: null });

            const emailUnsubscribe = await MAILMODEL.findOne({ email: payload.email, subscribe : false }).lean();
            if (emailUnsubscribe) return res.status(300).json({ success: false, message: `${payload.email} already unsubscribe.`, error: "error: conditinal issue.", data: null });

            await MAILMODEL.findOneAndUpdate({ email: payload.email }, {$set : { "subscribe": false }}, {new: true});
            return res.status(200).json({ success: true, message: "Your subscription is unscribe successfully." , error: null});
        }catch (err) {
            console.log("CATCH ::fn[logout]:::>");
            console.error(err);
            return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
        }   
    }
};