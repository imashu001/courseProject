var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CourseSchema = new Schema({
  author: {type: Schema.ObjectId, ref: "User", required: false},
  course_title: {type: String, required: false},
  course_description: {type: String, required: false},
  course_Content: {type: String, required: false},
  course_price: {type: String, required: false},
}, {timestamps: true});

module.exports = mongoose.model("Course", CourseSchema);