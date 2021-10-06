var mongoose = require("mongoose");
const auth = require("../middlewares/jwt");
const courseModel = require("../models/CourseModel");
const { constants } = require("../helpers/constants");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const { body,validationResult } = require("express-validator");
// mongoose.set("useFindAndModify", false);
// Course Schema
function courseData(data) {
	this.id = data._id;
	this.author = data.user;
	this.course_price = data.course_price;
	this.course_title = data.course_title;
	this.course_Content = data.course_Content;
	this.course_description = data.course_description;
	this.courseFile = data.courseFile
}

/**
 * Course Detail.
 * 
 * @param {string} id
 * 
 * @returns {Object}
 */
exports.getAllCourseList = [
	auth,
	function (req,res){
		try {
			courseModel.find({}, function(err,courses){
			if(err){
        return apiResponse.ErrorResponse(res,"err finding the vehical")
      }
			if(courses === null ){
		    return apiResponse.successResponseWithData(res, "operation success", [])
		  }
      if(courses.length > 0){
          return apiResponse.successResponseWithData(res, "Operation success", courses);
        }else{
          return apiResponse.successResponseWithData(res, "Operation success", []);
        }
      })
		}catch(err){
			return apiResponse.ErrorResponse(res, err);
		}
	}
]



/**
 * Course add.
 * 
 * @param {string}   
 * @returns {Object}
 */
exports.courseStore = [
	auth,
	body("course_title", "Course Title must not be empty.").isLength({ min: 1 }).trim(),
	body("course_description", "Course description no must not be empty.").isLength({ min: 1 }).trim(),
	body("course_Content", "Course content expiry must not be empty.").isLength({ min: 1 }).trim(),
  body("course_price", "Course Price no must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	 (req, res) => {
		try {
      console.log("in the controller",req.file)
				var course = new courseModel(
				{
					author: req.user._id,
					course_price: req.body.course_price,
					course_title: req.body.course_title,
					course_Content: req.body.course_Content,
					course_description: req.body.course_description,
					courseFile: req.file.path
				}
				);
				course.save(function (err) {
				if (err) { return apiResponse.ErrorResponse(res, err); }
				let courseData = {
					_id: course._id,
					author: course._id,
					course_price: course.course_price,
					course_title: course.course_title,
					course_Content: course.course_Content,
					course_description: course.course_description,
					courseFile: course.courseFile
				};
				return apiResponse.successResponseWithData(res,"Course added Successfully.",courseData);
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];


exports.courseDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			courseModel.findById(req.params.id, function (err, foundCourse) {
				if(foundCourse === null){
					return apiResponse.notFoundResponse(res,"Course not exists with this id");
				}else{
					if(foundCourse.author.toString() !== req.user._id){
						return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
					}else{
						courseModel.findByIdAndRemove(req.params.id,function (err) {
							if (err) { 
								return apiResponse.ErrorResponse(res, err); 
							}else{
								return apiResponse.successResponse(res,"Course delete Success.");
							}
						});
					}
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];


/**
 * Shop update.
 * 
 * @param {string}      shopName
 * @param {string}      category
 * @param {string}      zipCode 
 * @param {string}      description
 * @param {string}      address
 * @param {string}      latitude
 * @param {string}      longitude
 
 * 
 * @returns {Object}
 */
exports.courseUpdate = [
  auth,
	body("course_title", "Course Title must not be empty.").isLength({ min: 1 }).trim(),
	body("course_description", "Course description no must not be empty.").isLength({ min: 1 }).trim(),
	body("course_Content", "Course content expiry must not be empty.").isLength({ min: 1 }).trim(),
  body("course_price", "Course Price no must not be empty.").isLength({ min: 1 }).trim(),
  // .custom((value,{req}) => {
    // 	return Shop.findOne({isbn : value,user: req.user._id, _id: { "$ne": req.params.id }}).then(shop => {
      // 		if (shop) {
        // 			return Promise.reject("Shop already exist with this ISBN no.");
        // 		}
        // 	});
        // }),
    sanitizeBody("*").escape(),
    async (req, res) => {
      try {
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
          return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
        }
				console.log(req.file)
        var newcourse = new courseModel(
          { 
            author: req.user._id,
            course_price: req.body.course_price,
            course_title: req.body.course_title,
            course_Content: req.body.course_Content,
            course_description: req.body.course_description,
						courseFile: req.file.path,
            _id:req.params.id,
            
          });
  
      courseModel.findById(req.params.id, function (err, foundCourse) {
        if(err){
          return apiResponse.ErrorResponse(res,err);
        }
        if(foundCourse === null){
          return apiResponse.notFoundResponse(res,"Course not exists with this id");
        }else{
          if(foundCourse.author.toString() !== req.user._id){
            return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
          }else{
            courseModel.findByIdAndUpdate(req.params.id, newcourse, {},function (err) {
              if (err) { 
                return apiResponse.ErrorResponse(res, err); 
              }else{
                let Couse = new courseData(newcourse);
                return apiResponse.successResponseWithData(res,"Course update Success.", Couse);
              }
            });
          }
        }
      });
		} catch (err) {
			//throw error in json response with status 500. 
      console.log(err)
			return apiResponse.ErrorResponse(res, err);
		}
	}
];