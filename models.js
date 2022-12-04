const { text } = require("body-parser");
const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: [true, "Email Exist"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    unique: false,
  },
  avatar: {
    type: Buffer,
    required: false,
  },
});
/* users */
const User = mongoose.model("User", UserSchema);
module.exports = User;

const CommentRecordSchema = new mongoose.Schema({
  recordId: {
    type: String,
    required: true,
  },
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
  content: {
    contentId: {
      type: String,
    },
    contentText: {
      type: String,
    },
    require: false,
  },
});
const CommentRecord = mongoose.model("CommentRecord", CommentRecordSchema);
module.exports = CommentRecord;
