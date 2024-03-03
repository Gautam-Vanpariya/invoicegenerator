
const DATATABLEWEB = require("../../helper/dataTable");

const db = require("../../models/index");
const USERMODEL = db.user;

exports.getAllUsers = async(req,res)=>{
    try {
        var modelObj = USERMODEL;
        var searchFields = ['user_name', 'email'];
        var conditionQuery = { };
        var projectionQuery = '-createdAt -updatedAt -__v -isDeleted -password ';
        var sortingQuery = { createdAt: -1 };
        var populateQuery = [];

        DATATABLEWEB.fetchDatatableRecords(req.body, modelObj, searchFields, conditionQuery, projectionQuery, sortingQuery, populateQuery, function (err, data) {
            if(err) {
                res.status(200).send({
                    "draw": 1,
                    "recordsFiltered": 0,
                    "recordsTotal": 0,
                    "data": []
                });
            }else{
                var jsonString = JSON.stringify(data);
                res.send(jsonString);
            }
        });
    }
    catch (err) {
        console.log("CATCH :: WEB ::user.controller:: fn[getAllUsers]:::>");
        console.error(err);
        res.status(200).send({
            "draw": 1,
            "recordsFiltered": 0,
            "recordsTotal": 0,
            "data": []
        });
    }
},

exports.updateRole = async(req,res)=>{
    try {
        const userId = req.params.id;
        const userRole = req.body.userRole;
        let currentUser = await USERMODEL.findOne({ _id: userId }).lean();
        if (!currentUser) return res.status(300).json({ success: false, message: "User not found.", error: "error: not found issue.", data: null });

        const updateReocord = await USERMODEL.findOneAndUpdate({ "_id": currentUser._id }, { "$set": { "userRole": userRole } });
        return res.status(200).json({ success: true, message: "Your User role has been changed" , data: updateReocord, error: null});
    }
    catch (err) {
       console.log("CATCH :: WEB ::user.controller:: fn[updateRole]:::>");
       console.error(err);
       return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
     }
},

exports.deleteUser = async(req,res)=>{
    try {
       const userId = req.params.id;
       let currentUser = await USERMODEL.findOne({ "_id": userId }).lean();
       if (!currentUser) return res.status(300).json({ success: false, message: "User not found.", error: "error: not found issue.", data: null });
       const deleteReocord = await USERMODEL.findByIdAndDelete({ "_id": userId });
       return res.status(200).json({ success: true, message: "User Deleted Successfully." , data: deleteReocord, error: null});
    }
    catch (err) {
       console.log("CATCH :: WEB ::user.controller:: fn[deleteUser]:::>");
       console.error(err);
       return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
     }
};
