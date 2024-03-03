const bcryptJs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const { USERROLE,ACTIVESTATUS } = require('../utils/enum');
const saltHash = 10;

const userSchema = new mongoose.Schema({
  user_name       : { type: String, max: 255 },
  first_name      : { type: String, max: 255, default: "" },
  last_name       : { type: String, max: 255, default: "" },
  email           : { type: String, required: true, max: 255 },
  password        : { type: String, required: true, max: 1024 },
  phone           : { type: String, default: "" },
  date            : { type: Date, default: Date.now() },
  userRole        : { type: String, enum: [...Object.values(USERROLE)], default: USERROLE.CUSTOMER },
  status          : { type: String, enum: [...Object.values(ACTIVESTATUS)], default: ACTIVESTATUS.ACTIVE },
  street_address1 : { type: String, default: ""},
  street_address2 : { type: String, default: ""},
  city            : { type: String, default: "" },
  zipcode         : { type: String, default: "" },
  country         : { type: String, default: "" },
  state           : { type: String, default: "" }
},
{
  timestamps: true,
});


userSchema.methods.generateJwt = function () {
  return jwt.sign({ "_id": this._id }, process.env.JWT_SECRET, {
    "expiresIn": process.env.JWT_EXPIRESIN
  });
};


// Encrypt password
userSchema.pre(/^save|findOneAndUpdate$/, true, async function (next, done) {
  try {
    const self = this;
    let hash;
    let password;
    if (self.op && self.op === "findOneAndUpdate") {
      let update = { ...self.getUpdate() };
      // Only run self function if password was modified
      if (update.password) {
        // Hash the password
        hash = await bcryptJs.hash(self.getUpdate().password, parseInt(saltHash));
        update.password = hash;
        this.setUpdate(update);
      }
      done();
    }
    else {
      if (!self.isModified("password")) return done();
      password = self.password;
      hash = await bcryptJs.hash(password, parseInt(saltHash));
      self.password = hash;
      done();
    }
    next();
  }
  catch (err) { done(err); next(); }
});

module.exports = mongoose.model('users', userSchema, 'users');