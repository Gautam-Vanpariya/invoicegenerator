const fs = require("fs");
const path = require("path");
const moment = require('moment');
const multer = require("multer");

const { uploadPath } = require("../configs");

// Multer Upload Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.body.form_name && req.body.type == "IMAGE") {
      const formName = req.body.form_name.toLowerCase().trim().split(' ').join('_');
      let dir = `${uploadPath.image}/${formName}`;
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      cb(null, dir);
    } else{
      cb("File extension not allowed.", false);
    }
  },
  filename: (req, file, cb) => {
    if (req.body.form_name && req.body.type == "IMAGE") {
       let ext = path.extname(file.originalname);
       const formName = req.body.form_name.toLowerCase().trim().split(' ').join('_');
       let fileName =`${moment().format("YYYYMMDD-HHMMSSS")}-${formName}${ext}`;
       cb(null, fileName);
    } else{      
      cb("File extension not allowed.", false);
    }
  }
});


//Filter the image type
const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|heic)$/i)) { //If the file uploaded is not any of this file type
    // If error in file type, then attacch this error to the request header
    req.fileValidationError = "Your image not supported try anothor";
    return cb(null, false, req.fileValidationError);
  }
  cb(null, true);
};

const maxSize = 10 * 1024 * 1024; // for 10MB
//Here we configure what our storage and filefilter will be, which is the storage and imageFileFilter we created above
exports.uploadFile = multer({ storage: storage,  fileFilter: imageFileFilter, limits: { fileSize: maxSize } });
