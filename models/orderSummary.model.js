const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const orderSummary = new Schema({
    user_id                : { type: ObjectId  },
    progress_id            : { type: ObjectId, ref: 'userProgress', default: null, index: true  },
    payment_amount         : { type: Number, required: true },
    payment_status         : { type: String },
    bill_type              : { type: String },
    apply_coupon_code      : { type: String, default: ''},
    used_coupon            : { type: Boolean, default: false, required: true},
},
{
   timestamps: true,
});

module.exports = mongoose.model('orderSummary', orderSummary, 'orderSummary');