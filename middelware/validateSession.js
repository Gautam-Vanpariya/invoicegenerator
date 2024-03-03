
const db = require("../models");
const USERMODEL = db.user;

const { USERROLE } = require("../utils/enum");

exports.isLoggedIn = async(req, res, next) => {
  try {
    let user = null;
    if(req.session && req.session.user && req.session.user.userRole == USERROLE.CUSTOMER ) {
      user = await USERMODEL.findOne({"_id": req.session.user._id, "userRole": USERROLE.CUSTOMER}).select("-password").lean();
    }
    req.loggedInUser = user;
    next();
  }catch (err) {
    console.log("CATCH ERROR:: middleware ::fn[isLoggedIn]:::",err);
    res.locals.title = "Login";
    res.locals.error = "something went wrong.";
    return res.render("pages/index", { layout: "layout" });
  }
};

exports.isAuth = (roles) => async(req, res, next) => {
  try {
    if(req.session && req.session.user && req.session.user.userRole == USERROLE.CUSTOMER) {
      const user = await USERMODEL.findOne({"_id": req.session.user._id, "userRole": USERROLE.CUSTOMER}).select("userRole").lean();
      if (user.userRole === null || (user.userRole && !roles.includes(user.userRole))) {
        return res.status(401).json({ success: false, message: "Unauthorized: Please login bill generator first.", error: "error: Unauthorized issue"});
      }
      next();
    }else {
      return res.status(401).json({ success: false, message: "Unauthorized: Please login bill generator first.", error: "error: Unauthorized issue"});
    }
  }catch (err) {
    console.log("CATCH ERROR:: middleware ::fn[isAuth]:::",err);
    return res.status(401).json({ success: false, message: "Unauthorized: Please login bill generator first.", error: "error: Unauthorized issue"});
   }
};


exports.isAdmin = (roles) => async(req, res, next) => {
  try {
    let user = null;
    if(req.session && req.session.user) {
      user = await USERMODEL.findOne({"_id": req.session.user._id, "userRole": USERROLE.ADMIN}).select("-passowrd").lean();
      if (user.role === null || (user.role && !roles.includes(user.role))) {
        req.session.destroy();
        res.locals.title = "Login";
        res.locals.error = "You don't have sufficient access permission!";
        return res.render("admin/pages/login", { layout: "layout" });
      }
      req.loggedInUser = user;
      next();
    }else {
      req.session.destroy();
      return res.redirect('/admin/login');
    }
  }catch (err) {
    console.log("CATCH ERROR:: middleware ::fn[isAdmin]:::",err);
    res.locals.title = "Admin Login";
    res.locals.error = "something went wrong.";
    return res.render("admin/pages/login", { layout: "layout" });
   }
};

exports.isAuthPage = (roles) => async(req, res, next) => {
  try {
    if(req.session && req.session.user && req.session.user.userRole == USERROLE.CUSTOMER) {
      const user = await USERMODEL.findOne({"_id": req.session.user._id, "userRole": USERROLE.CUSTOMER}).select("userRole").lean();
      if (user.userRole === null || (user.userRole && !roles.includes(user.userRole))) {
        req.flash('error', 'Unauthorized: Please login first');
        return res.redirect("/");
      }
      next();
    }else {
      req.flash('error', 'Unauthorized: Please login first');
      return res.redirect("/");
    }
  }catch (err) {
    console.log("CATCH ERROR:: middleware ::fn[isAuthPage]:::",err);
    req.flash('error', 'Unauthorized: Please login first');
    return res.redirect("/");
   }
};