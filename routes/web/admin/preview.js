const router = require('express').Router();
const fetch = require("node-fetch");

router.get("/:progress_number",(req,res)=>{
    var body = {
        "progress_number": req.params.progress_number
    };
    fetch(process.env.HOST+'/api/v1/userProgress/retrieveUserProgess',{
        method: 'post',
        body: JSON.stringify(body),
        headers: {'Content-Type': 'application/json'}
    }).then(res => res.json()).then(function(response) {
        console.log(response);
    if(!response.error){
        var result = response.data.last_filled_data;
        var data = response.data;
        res.render("admin/preview/index",{ result, data, layout: false });
    }
    });
});

module.exports = router;