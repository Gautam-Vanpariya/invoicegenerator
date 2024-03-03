const mongoose = require("mongoose");

const invoiceCounterSchema = new mongoose.Schema({
    counter: {
        type: Number,
        default: 1,
    },
},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('invoiceCounter', invoiceCounterSchema, 'invoiceCounter');