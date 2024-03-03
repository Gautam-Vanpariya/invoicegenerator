const mongoose = require("mongoose");
const generateUniqueId = require('generate-unique-id');

const counterSchema = new mongoose.Schema({
    uniqueName : { type: String, trim: true, required: true },
    sequence   : { type: Number, default: 1000 }
});

counterSchema.index({ uniqueName: 1, sequence: 1 }, { unique: true })

const counterModel = mongoose.model('counter', counterSchema);

const autoIncrementModelID = function (nodeName, doc, fieldName, next) {
  counterModel.findOneAndUpdate({"uniqueName": nodeName},{ $inc: { sequence: 1 } },{ new: true, upsert: true },function(error, counter) {
      if(error) return next(error);
      const id = generateUniqueId({
        length: 8,
        useLetters: true
      });
      doc[fieldName] = id;
      next();
    }
  );
}

module.exports = { counterModel, autoIncrementModelID };
