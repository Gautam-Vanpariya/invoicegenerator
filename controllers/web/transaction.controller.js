const DATATABLEWEB = require("../../helper/dataTable");

const db = require("../../models");
const USERPROGRESSMODEL = db.userProgress;

exports.getALLTransaction = async (req, res, next) => {
  try {
    var modelObj = USERPROGRESSMODEL;
    var searchFields = ['user_email', 'transaction_history.getway', 'order_summary.payment_status'];
    var payment_status = req.body.payment_status;
    var match = {};
    if(payment_status){
        match = {"order_summary.payment_status" : payment_status};
    }
    let aggregateQuery = [
      { $lookup: { from: "orderSummary", localField: "_id", foreignField: "progress_id", as: "order_summary" } },
      { $match: match },
      { $lookup: { from: "transactionHistory", localField: "_id", foreignField: "progress_id", as: "transaction_history" } },
      { $unwind: { path: "$transaction_history", preserveNullAndEmptyArrays: true } },
      { $match: { "is_Checkout": true } },
      { $sort: { 'updatedAt': -1 } }
  ];
  

    let sortingQuery = { "updatedAt": -1 };
    DATATABLEWEB.fetchAggregateDatatableRecords(req.body, modelObj, searchFields, aggregateQuery, sortingQuery, function (err, data) {
      if (err) {
        res.status(200).send({
          "draw": 1,
          "recordsFiltered": 0,
          "recordsTotal": 0,
          "data": []
        });
      } else {
        var jsonString = JSON.stringify(data);
        res.send(jsonString);
      }
    });
  } catch (err) {
    console.log("CATCH :: WEB ::transaction.controller:: fn[pricingOfferList]:::>");
    res.status(200).send({
      "draw": 1,
      "recordsFiltered": 0,
      "recordsTotal": 0,
      "data": []
    });
  }
};


exports.getAllDraftTransaction = async (req, res, next) => {
  try {
    var modelObj = USERPROGRESSMODEL;
    var searchFields = ['user_email', 'transaction_history.getway'];
    let aggregateQuery = [
      { $lookup: { from: "orderSummary", localField: "_id", foreignField: "progress_id", as: "order_summary" } },
      { $lookup: { from: "transactionHistory", localField: "_id", foreignField: "progress_id", as: "transaction_history" } },
      { $unwind: { path: "$transaction_history", preserveNullAndEmptyArrays: true } },
      { $match: { "is_Checkout": false} },
    ];

    var sortingQuery = { 'createdAt': -1 };
    DATATABLEWEB.fetchAggregateDatatableRecords(req.body, modelObj, searchFields, aggregateQuery, sortingQuery, function (err, data) {
      if (err) {
        res.status(200).send({
          "draw": 1,
          "recordsFiltered": 0,
          "recordsTotal": 0,
          "data": []
        });
      } else {
        var jsonString = JSON.stringify(data);
        res.send(jsonString);
      }
    });
  } catch (err) {
    console.log("CATCH :: WEB ::transaction.controller:: fn[pricingOfferList]:::>");
    res.status(200).send({
      "draw": 1,
      "recordsFiltered": 0,
      "recordsTotal": 0,
      "data": []
    });
  }
};

exports.deleteTransaction = async(req,res)=>{
  try {
     const transactionId = req.params.id;
     console.log(transactionId)
     let currentTransaction = await USERPROGRESSMODEL.findOne({ "_id": transactionId }).lean();
     if (!currentTransaction) return res.status(300).json({ success: false, message: "Transaction not found.", error: "error: not found issue.", data: null });
     const deleteRecord = await USERPROGRESSMODEL.findByIdAndDelete({ "_id": transactionId });
     return res.status(200).json({ success: true, message: "Transaction Deleted Successfully." , data: deleteRecord, error: null});
  }
  catch (err) {
     console.log("CATCH :: WEB ::transaction.controller:: fn[deleteTransaction]:::>");
     console.error(err);
     return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
   }
};