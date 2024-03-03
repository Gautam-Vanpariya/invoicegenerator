const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId, Mixed } = Schema.Types;

const { FORMNAME, EMAIL_RESPONSE } = require("../utils/enum");
const { autoIncrementModelID } = require("./counter.model");

const userProgressSchema = new Schema({
    user_id                : { type: ObjectId, ref:"users", index: true },
    user_type              : { type: String },
    user_email             : { type: String, max: 255 },
    progress_number        : { type: String, unique: true },
    lastSavedStep          : { type: Number, default: null },
    last_filled_data       : { type: Mixed,  default: {} },
    is_Checkout            : { type: Boolean,default: false},
    pdf_path               : { type: String, default: ''},
    pdf_response           : { type: String, default: ''},
    email_response         : { type: String, enum: [...Object.values(EMAIL_RESPONSE)], default: EMAIL_RESPONSE.PENDING},
    form_name              : { type: String, required: true, enum: [...Object.values(FORMNAME)], default: FORMNAME.UTILITY},
    isDeleted			   : { type: Boolean, default: false }
}, 
{
    timestamps: true,
});

userProgressSchema.pre('save', function (next) {
    if (!this.isNew) {
        next();
        return;
    }
    autoIncrementModelID('PROGRESS_COUNTER', this, "progress_number", next);
});

module.exports = mongoose.model('userProgress', userProgressSchema, 'userProgress');