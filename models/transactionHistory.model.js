const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const transactionHistory = new Schema({
    progress_id         : { type: ObjectId, ref: 'userProgress', default: null, index: true  },
    order_id            : { type: ObjectId, ref: 'orderSummary', default: null, index: true  },
    payment_id          : { type: String, required: true},
    getway              : { type: String},
    data                : { type: Object, required: true}
}, 
{
    timestamps: true,
});

module.exports = mongoose.model('transactionHistory', transactionHistory, 'transactionHistory');