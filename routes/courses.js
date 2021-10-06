var express = require("express");
const CourseController = require("../controllers/CourseController");
const multer = require("multer");


var router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    //cb(null, new Date().toISOString() + file.originalname);
  cb(null, Date.now()+'-'+file.originalname);
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
  limit: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

router.post('/addCourse', CourseController.courseStore)
router.delete('/delete/:id', CourseController.courseDelete)
router.get('/',CourseController.getAllCourseList)
router.post('/:id',CourseController.courseUpdate)


// router.post("/register",upload.single("vehicalImage"),AuthController.register);
// router.post("/login", AuthController.login);
// router.put("/:id", AuthController.updateProfile);
// router.post("/verify-otp", AuthController.verifyConfirm);
// router.post("/resend-verify-otp", AuthController.resendConfirmOtp);
// router.post("/getProfile", AuthController.profile);
// router.post("/updateProfile/:id",upload.single("profileImage"),AuthController.updateProfile);
// router.post("/getShippingAddress/",AuthController.getUserShipping);
// router.post("/addUpdateShippingAddress/",AuthController.addUpdateShppingAddr);
// router.post("/addUpdateShippingAddress/:id",AuthController.addUpdateShppingAddr);

//router.post("/updateProfile/:id",upload.single("profileImage"),AuthController.updateProfile);

module.exports = router;