const { order_summary_validate } = require("../../validations/checkoutValidation");

const db = require("../../models/index");
const ORDERSUMMARYMODEL = db.orderSummary;
const USERPROGRESSMODEL = db.userProgress;

module.exports = {
    orderSummary: async (req, res) => {
        try {
            const payload = req.body;
            // Validate
            const validationError = order_summary_validate(payload).error;
            if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "error: validation issue.", data: null });

            let userProgress = await USERPROGRESSMODEL.findOne({"_id": payload.progress_id, "user_id": payload.user_id}).lean();
            if (!userProgress) return res.status(300).json({ success: false, message: "No data found with given info.", error: "error: not found issue.", data: null });

            const orderPayload = {
                "user_id"        : payload.user_id,
                "progress_id"    : payload.progress_id,
                "payment_amount" : 0,
                "bill_type"      : payload.bill_type,
            };
            const saveData = await ORDERSUMMARYMODEL.create(orderPayload);
            return res.status(200).json({ success: true, message: "Order summary successfully" , data: saveData, error: null});
        } catch (err) {
            console.log("CATCH :: API ::fn[orderSummary]:::>");
            console.error(err);
            return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
        }
    }
};
