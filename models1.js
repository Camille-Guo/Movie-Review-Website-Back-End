const { text } = require("body-parser");
const mongoose = require("mongoose");
const CommentRecordSchema = new mongoose.Schema({
  movieId: {
    type: String,
    required: true,
    unique: false,
  },
  userId: {
    type: String,
    required: true,
    unique: false,
  },
  username: {
    type: String,
    required: true,
  },
  updateDate: {
    type: Date,
    default: Date.now,
  },
  rate: {
    type: Number,
    default: 0,
    required: false,
  },
  // content: [
  //   {
  //     contentId: {
  //       type: String,
  //     },
  //     contentText: {
  //       type: String,
  //     },
  //   },
  // ],
  content: {
    type: String,
    required: false,
  },
});
const CommentRecord = mongoose.model("CommentRecord", CommentRecordSchema);
module.exports = CommentRecord;
