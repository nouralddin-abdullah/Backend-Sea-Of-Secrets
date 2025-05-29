const mongoose = require("mongoose");
const secretSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "A secret must have a content"],
    },
    isDeleted: {
        type:Boolean,
        required:false
    },
    key: {
        type:String,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Secret = mongoose.model("Secret", secretSchema );
module.exports = Secret;