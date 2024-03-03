
module.exports = {
    saveLogo :(req,res)=>{
      try {
        return res.status(200).json({ success: true, message: "User info." , data: req.file, error: null});
      } catch (err) {
        console.log("CATCH ::fn[saveLogo]:::>");
        console.error(err);
        return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
      }
  }
};