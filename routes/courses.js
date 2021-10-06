var express = require("express");
const fs = require('fs');
const CourseController = require("../controllers/CourseController");
const multer = require("multer");


var router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(req.body.course_title)
    // const title = req.body.course_title
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
  cb(null,  Date.now()+'-'+file.originalname);
  },
});


const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter 
})

router.post('/addCourse',upload.single("courseMedia"),CourseController.courseStore)
router.delete('/delete/:id', CourseController.courseDelete)
router.get('/',CourseController.getAllCourseList)
router.post('/:id',upload.single("courseMedia"),CourseController.courseUpdate)
module.exports = router;