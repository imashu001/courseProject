const express = require('express');
const UserModel = require("../models/UserModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");
const multer = require("multer");


exports.uploadSingle = [
	// body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
	// 	.isEmail().withMessage("Email must be a valid email address."),
	// sanitizeBody("email").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				var upload = multer({
					storage: multer.diskStorage({
						destination: function (req, file, cb) {
							cb(null, "./upload");
						},
						filename: function (req, file, cb) {
							cb(null, randomString.generate({ length: 7, charset:  'alphanumeric' }) + path.extname(file.originalname))
						}
					})
				})
			
				
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

// USer Schema
function UserData(data) {
	this._id = data._id;
	this.userName= data.userName;
	this.googleId = data.googleId;
	this.facebookId = data.facebookId;
	this.instagramId = data.instagramId;
	this.profileImage = data.profileImage;
	this.countryCode = data.countryCode;
	this.contactNo = data.contactNo;
	this.fullContact = data.fullContact;
	this.email = data.email;
	this.createdAt = data.createdAt;
  }

/**
 * User registration.
 *
 * @param {string}      firstName
 * @param {string}      lastName
 * @param {string}      userType
 * @param {string}      email
 * @param {string}      password
 * @param {string}      deviceType
 * @param {string}      deviceToken
 * @param {string}      loginType
 *
 * @returns {Object}
 */

 exports.register = [
	// Validate fields.
	body("userName").isLength({ min: 1 }).trim().withMessage("User name must be specified."),
	body("userType").isLength({ min: 1 }).trim().withMessage("User type must be specified.")
		.isAlphanumeric().withMessage("Last name has non-alphanumeric characters."),
	body("loginType", "Login type must not be empty.").isLength({ min: 1 }).trim(),
	body("deviceType", "Device type must not be empty.").isLength({ min: 1 }).trim(),
	body("deviceToken", "Device token must not be empty.").isLength({ min: 1 }).trim(),
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address.").custom((value) => {
			return UserModel.findOne({email : value}).then((user) => {
				if (user) {
					return Promise.reject("E-mail already in use");
				}
			});
		}),
		
	body("password").isLength({ min: 6 }).trim().withMessage("Password must be 6 characters or greater."),
	// Sanitize fields.
	

	sanitizeBody("userName").escape(),
	sanitizeBody("userType").escape(),
	sanitizeBody("countryCode").escape(),
	sanitizeBody("contactNo").escape(),
	sanitizeBody("loginType").escape(),
	sanitizeBody("deviceType").escape(),
	sanitizeBody("deviceToken").escape(),
	sanitizeBody("googleId").escape(),
	sanitizeBody("facebookId").escape(),
	sanitizeBody("instagramId").escape(),
	sanitizeBody("email").escape(),
	sanitizeBody("password").escape(),
	sanitizeBody("shopName").escape(),
	sanitizeBody("shopCategory").escape(),
	// Process request after validation and sanitization.
	(req, res) => {
		try {
			console.log("in the register controller")
			// Extract the validation errors from a request.
			const errors = validationResult(req);
			console.log(errors);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				console.log("validation complete")
				//hash input password
				bcrypt.hash(req.body.password,10,function(err, hash) {
					// generate OTP for confirmation
					let otp = utility.randomNumber(4);
					// Create User object with escaped and trimmed data
					// if(req.body.userType !== 'admin' || req.body.userType !== 'user'){
					// 	console.log(req.body.userType)
					// 	return apiResponse.validationErrorWithData(res, "Validation Error.","usertype can only be admin or user")
					// }

					var user = new UserModel(
						{
							userName: req.body.userName,
							userType: req.body.userType,
							login_type: req.body.loginType,
							deviceType: req.body.deviceType,
							deviceToken: req.body.deviceToken,
							email: req.body.email,
							countryCode: req.body.countryCode,
							contactNo: req.body.contactNo,
							googleId: req.body.googleId,
							facebookId: req.body.facebookId,
							instagramId: req.body.instagramId,
							password: hash,
							confirmOTP: otp,
							profileImage:''
						}
					);
					
					// Html email body
					let html = "<p>Please Confirm your Account.</p><p>OTP: "+otp+"</p>";
					// Send confirmation email
					// mailer.send(
					// 	constants.confirmEmails.from, 
					// 	req.body.email,
					// 	"Confirm Account",
					// 	html
					// ).then(function(){
						// Save user.
						user.save(function (err) {
							if (err) { return apiResponse.ErrorResponse(res, err); }
							let userData = {
								_id: user._id,
								userName: user.userName,
								email: user.email,
								userType: user.userType,
								profileImage: user.profileImage,
								countryCode: req.body.countryCode,
								contactNo: req.body.contactNo,
								//otp:otp
							};
							////////////////////////////////// Shop Start ///////////////////////
							// if(req.body.userType == 'shop' && typeof req.body.shopName !== 'undefined' && typeof req.body.shopCategory !== 'undefined')
							// {
							
							// 	var shop = new ShopModel(
							// 		{
							// 			user:user._id,
							// 			shopName: req.body.shopName,
							// 			category: req.body.shopCategory,
							// 			description:'',
							// 			address: '',
							// 			latitude: '',
							// 			longitude: '',
							// 			zipCode: '',
							// 			image: '',
										
							// 		}
							// 	);
							// 	shop.save(function (err) {
							// 		if (err) { return apiResponse.ErrorResponse(res, err); }
							// 		// let shopData = {
							// 		// 	_id: shop._id,
							// 		// 	shopName: shop.shopName,
							// 		// 	category: shop.category,
							// 		// };
							// 		userData.shopId = shop._id;
							// 		userData.shopName = shop.shopName;
							// 		userData.shopCategory = shop.category;

							// 		//Prepare JWT token for authentication
							// 		const jwtPayload = userData;
							// 		const jwtData = {
							// 			expiresIn: process.env.JWT_TIMEOUT_DURATION,
							// 		};
							// 		const secret = process.env.JWT_SECRET;
							// 		//Generated JWT token with Payload and secret.
							// 		userData.token = jwt.sign(jwtPayload, secret, jwtData);
								
							// 		return apiResponse.successResponseWithData(res,"Registration Success.", userData);
							// 	});

							// }
							// ////////////////////////// Shop End /////////////////////

							// ////////////////////////////////// Rider Start ///////////////////////
							// else if(req.body.userType == 'rider' && typeof req.body.shopName !== 'undefined' && typeof req.body.shopCategory !== 'undefined')
							// {
							
							// 	var vehical = new vehicalModel(
							// 		{
							// 			user:user._id,
							// 			vehicalName: req.body.vehicalName,
							// 			category: req.body.vehicalCategory,
							// 			image: req.file.path
							// 		}
							// 	);
							// 	vehical.save(function (err) {
							// 		if (err) { return apiResponse.ErrorResponse(res, err); }
							// 		// let shopData = {
							// 		// 	_id: shop._id,
							// 		// 	shopName: shop.shopName,
							// 		// 	category: shop.category,
							// 		// };
							// 		userData.vehicalId = vehical._id;
							// 		userData.vehicalName = vehical.vehicalName;
							// 		userData.vehicalCategory = vehical.category;
							// 		userData.image = constants.urlPath.base+vehical.image
									
							// 		//Prepare JWT token for authentication
							// 		const jwtPayload = userData;
							// 		const jwtData = {
							// 			expiresIn: process.env.JWT_TIMEOUT_DURATION,
							// 		};
							// 		const secret = process.env.JWT_SECRET;
							// 		//Generated JWT token with Payload and secret.
							// 		userData.token = jwt.sign(jwtPayload, secret, jwtData);
								
							// 		return apiResponse.successResponseWithData(res,"Registration 1Success.", userData);
							// 	});

							// }
							////////////////////////// Rider End /////////////////////
							////////////////////////// Normal End /////////////////////
							// else
							// {
								const jwtPayload = userData;
									const jwtData = {
										expiresIn: process.env.JWT_TIMEOUT_DURATION,
									};
									const secret = process.env.JWT_SECRET;
									//Generated JWT token with Payload and secret.
									userData.token = jwt.sign(jwtPayload, secret, jwtData);
									userData.fullContact = userData.countryCode+userData.contactNo;
									return apiResponse.successResponseWithData(res,"Registration Success.", userData);
							// }
							////////////////////////// Rider End /////////////////////
							
						});
					// }).catch(err => {
					// 	console.log(err);
					// 	return apiResponse.ErrorResponse(res,err);
					// }) ;
				});
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * User login.
 *
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.login = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("password").isLength({ min: 1 }).trim().withMessage("Password must be specified."),
	sanitizeBody("email").escape(),
	sanitizeBody("password").escape(),
	(req, res) => {
		try {
			
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				UserModel.findOne({email : req.body.email}).then(user => {
					if (user) {
						console.log('user----------------',user);
						//Compare given password with db's hash.
						bcrypt.compare(req.body.password,user.password,function (err,same) {
							if(same){
								//Check account confirmation.
								//if(user.isConfirmed){
									// Check User's account active or not.
									if(user.status) {
										let userData = {
											_id: user._id,
											userName: user.userName,
											email: user.email,
											userType:user.userType,
											profileImage: user.profileImage,
											countryCode: user.countryCode,
											contactNo: user.contactNo,
										};
										//Prepare JWT token for authentication
										const jwtPayload = userData;
										const jwtData = {
											expiresIn: process.env.JWT_TIMEOUT_DURATION,
										};
										const secret = process.env.JWT_SECRET;
										userData.profileImage = user.profileImage != '' ? constants.urlPath.base+user.profileImage : '';
										userData.fullContact = user.countryCode+user.contactNo;
										//Generated JWT token with Payload and secret.
										userData.token = jwt.sign(jwtPayload, secret, jwtData);
										return apiResponse.successResponseWithData(res,"Login Success.", userData);
									}else {
										return apiResponse.unauthorizedResponse(res, "Account is not active. Please contact admin.");
									}
								// }else{
								// 	return apiResponse.unauthorizedResponse(res, "Account is not confirmed. Please confirm your account.");
								// }
							}else{
								return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
							}
						});
					}else{
						return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

exports.updateProfile = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("userName").isLength({ min: 1 }).trim().withMessage("User name must be specified.")
		.isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
	// body("countryCode").isLength({ min: 0 }).trim().withMessage("Country code must be specified.")
	// 	.isNumeric().withMessage("Country code has numeric characters."),
	// body("contactNo").isLength({ min: 0 }).trim().withMessage("Contact no must be specified.")
	// 	.isNumeric().withMessage("Conctact no has numeric characters."),
	sanitizeBody("email").escape(),
	sanitizeBody("firstName").escape(),
	sanitizeBody("lastName").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var user = new UserModel(
				{
					userName: req.body.userName,
					countryCode: req.body.countryCode,
					contactNo: req.body.contactNo,
					_id:req.params.id
				}
			);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {

				UserModel.findByIdAndUpdate(req.params.id, user, {},function (err,user) {
					if (err) { 
						return apiResponse.ErrorResponse(res, err); 
					}else{
						let userData = {
							_id: user._id,
							userName: user.userName,
							email: user.email,
							userType: user.userType,
							profileImage: user.profileImage,
							countryCode: user.countryCode,
							contactNo: user.contactNo,
							//otp:otp
						};
						userData.fullContact = user.countryCode+user.contactNo;
						//userData = new UserData(user);
						return apiResponse.successResponseWithData(res,"profile updated Success.", userData);
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];
	
/**
 * Verify Confirm otp.
 *
 * @param {string}      email
 * @param {string}      otp
 *
 * @returns {Object}
 */
exports.verifyConfirm = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("otp").isLength({ min: 1 }).trim().withMessage("OTP must be specified."),
	sanitizeBody("email").escape(),
	sanitizeBody("otp").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				var query = {email : req.body.email};
				UserModel.findOne(query).then(user => {
					if (user) {
						//Check already confirm or not.
						if(!user.isConfirmed){
							//Check account confirmation.
							if(user.confirmOTP == req.body.otp){
								//Update user as confirmed
								UserModel.findOneAndUpdate(query, {
									isConfirmed: 1,
									confirmOTP: null 
								}).catch(err => {
									return apiResponse.ErrorResponse(res, err);
								});
								return apiResponse.successResponse(res,"Account confirmed success.");
							}else{
								return apiResponse.unauthorizedResponse(res, "Otp does not match");
							}
						}else{
							return apiResponse.unauthorizedResponse(res, "Account already confirmed.");
						}
					}else{
						return apiResponse.unauthorizedResponse(res, "Specified email not found.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * Resend Confirm otp.
 *
 * @param {string}      email
 *
 * @returns {Object}
 */
exports.resendConfirmOtp = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	sanitizeBody("email").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				var query = {email : req.body.email};
				UserModel.findOne(query).then(user => {
					if (user) {
						//Check already confirm or not.
						if(!user.isConfirmed){
							// Generate otp
							let otp = utility.randomNumber(4);
							// Html email body
							let html = "<p>Please Confirm your Account.</p><p>OTP: "+otp+"</p>";
							// Send confirmation email
							mailer.send(
								constants.confirmEmails.from, 
								req.body.email,
								"Confirm Account",
								html
							).then(function(){
								user.isConfirmed = 0;
								user.confirmOTP = otp;
								// Save user.
								user.save(function (err) {
									if (err) { return apiResponse.ErrorResponse(res, err); }
									return apiResponse.successResponse(res,"Confirm otp sent.");
								});
							});
						}else{
							return apiResponse.unauthorizedResponse(res, "Account already confirmed.");
						}
					}else{
						return apiResponse.unauthorizedResponse(res, "Specified email not found.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];


exports.profile = [
	auth,
	(req, res) => {
		try {
		console.log('aaaaaaaa');
		console.log(req.user._id);
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return apiResponse.validationErrorWithData(
			res,
			"Validation Error.",
			errors.array()
			);
		} else {
			UserModel.findOne({_id: req.user._id }).then((user) => {
			
			if (user) {
				let userData = {
				_id: user._id,
				userName: user.userName,
				email: user.email,
				loginType: user.loginType,
				// googleId: user.googleId,
				// facebookId: user.facebookId,
				// instagramId: user.instagramId,
				// profileImage: user.profileImage,
				userType: user.userType,
				countryCode: user.countryCode,
				contactNo: user.contactNo,
				};
				userData.fullContact = user.countryCode+user.contactNo;
				userData.profileImage = user.profileImage != '' ? constants.urlPath.base+user.profileImage : '';
				return apiResponse.successResponseWithData(
				res,
				"Profile Details Success.",
				userData
				);
			} else {
				return apiResponse.unauthorizedResponse(
				res,
				"Somthing want wrong."
				);
			}
			});
		}
		} catch (err) {
		return apiResponse.ErrorResponse(res, err);
		}
	},
	];
	   
exports.updateProfile = [
	auth,
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
	.isEmail().withMessage("Email must be a valid email address."),
	body("userName").isLength({ min: 1 }).trim().withMessage("User name must be specified."),

	body("countryCode").isLength({ min: 0 }).trim().withMessage("Country Code must be specified.")
	.isNumeric().withMessage("Country code has numeric characters."),
	body("contactNo").isLength({ min: 0 }).trim().withMessage("Contact No must be specified.")
	.isNumeric().withMessage("Contact No has numeric characters."),
	sanitizeBody("email").escape(),
	sanitizeBody("userName").escape(),
	(req, res) => {
	try {
			const errors = validationResult(req);
		console.log(req.file);
		
		if (req.file !=undefined) {
		// process image here
		var user = new UserModel(
			{
			userName: req.body.userName,
			countryCode: req.body.countryCode,
			contactNo: req.body.contactNo,
			profileImage :req.file.path,
			_id:req.params.id
			}
		);
		}
		else
		{
			var user = new UserModel(
			{
				userName: req.body.userName,
				countryCode: req.body.countryCode,
				contactNo: req.body.contactNo,
				_id:req.params.id
			}
			);
		}
			
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {

				UserModel.findByIdAndUpdate(req.params.id, user, {},function (err,userRow) {
					if (err) { 
						return apiResponse.ErrorResponse(res, err); 
					}else{
						
						let userData = {
							_id: user._id,
							userName: userRow.userName,
							email: userRow.email,
							phoneCode: userRow.phoneCode,
							//otp:otp
						};

			console.log('aaaaa',userData);

				userData = new UserData(userRow);
				userData.userName = req.body.userName;
				userData.userType= userRow.userType,
				userData.googleId = userRow.googleId;
				userData.facebookId = userRow.facebookId;
				userData.instagramId = userRow.instagramId;
				userData.countryCode = req.body.countryCode;
				userData.contactNo = req.body.contactNo;
				userData.fullContact = req.body.countryCode+req.body.contactNo;
				userData.profileImage = user.profileImage != '' ? constants.urlPath.base+user.profileImage : '';
						return apiResponse.successResponseWithData(res,"profile updated Success.", userData);
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];


// exports.addUpdateShppingAddr = [
// auth,
// // Validate fields.
// body("userName").isLength({ min: 1 }).trim().withMessage("User name must be specified."),
// body("userContact").isLength({ min: 1 }).trim().withMessage("User contact must be specified.")
// 	.isAlphanumeric().withMessage("Last name has non-alphanumeric characters."),
// body("userPincode", "User pin code must not be empty.").isLength({ min: 1 }).trim(),
// body("userAddresssLine1", "User address 1 must not be empty.").isLength({ min: 1 }).trim(),
// body("city", "City must not be empty.").isLength({ min: 1 }).trim(),
// body("state", "State not be empty.").isLength({ min: 1 }).trim(),
// body("country", "Country must not be empty.").isLength({ min: 1 }).trim(),
// body("addressType", "Address type token must not be empty.").isLength({ min: 1 }).trim(),
// // Sanitize fields.

// sanitizeBody("userName").escape(),
// sanitizeBody("userContact").escape(),
// sanitizeBody("userPincode").escape(),
// sanitizeBody("userAddresssLine1").escape(),
// sanitizeBody("city").escape(),
// sanitizeBody("state").escape(),
// sanitizeBody("country").escape(),
// sanitizeBody("addressType").escape(),
// // Process request after validation and sanitization.
// (req, res) => {
// 	try {
// 		console.log('aaaaaaaa');
// 		console.log(req.user._id);
// 		// Extract the validation errors from a request.
// 		const errors = validationResult(req);
// 		//console.log(errors.Result);
// 		if (!errors.isEmpty()) {
// 			// Display sanitized values/errors messages.
// 			return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
// 		}else {
// 			var userShipping = new UserShippingModel(
// 						{
// 							user: req.user._id,
// 							userName: req.body.userName,
// 							userContact: req.body.userContact,
// 							userPincode: req.body.userPincode,
// 							userAddresssLine1: req.body.userAddresssLine1,
// 							userAddresssLine2: req.body.userAddresssLine2,
// 							city: req.body.city,
// 							state: req.body.state,
// 							country: req.body.country,
// 							addressType: req.body.addressType,
// 							isDefaultAddress: req.body.isDefaultAddress,
// 						}
// 					);
			
// 				// Create User Shipping object with escaped and trimmed data
				
// 				UserShippingModel.find({user :req.user._id}).then((userShippingDetail)=>{
					
// 					 userShipping._id = req.params.id;
					
// 					console.log('user addresss',req.params.id);
// 					if(userShippingDetail.length > 0 && typeof req.params.id !== 'undefined'){
					
// 						UserShippingModel.findByIdAndUpdate(req.params.id, userShipping, {runValidators: false, useFindAndModify: false, new: false },function (err) {
// 							if (err) { 
// 								console.log(err)
// 								return apiResponse.ErrorResponse(res, err); 
// 							}else{
// 							//	console.log(userShipping)
// 							//	let userShipping = new ProductData(product);
// 								return apiResponse.successResponseWithData(res,"Shipping Address Update Success.",userShipping);
// 							}
// 						});

// 					}
// 					else
// 					{
// 						userShipping.save(function (err) {
// 							if (err) { return apiResponse.ErrorResponse(res, err); }
// 							let userData = {
// 								_id: req.user._id,
// 								userName: userShipping.userName,
// 								userContact: userShipping.userContact,
// 								userPincode: userShipping.userPincode,
// 								userAddresssLine1: userShipping.userAddresssLine1,
// 								userAddresssLine2: userShipping.userAddresssLine2,
// 								city: userShipping.city,
// 								state: userShipping.state,
// 								country: userShipping.country,
// 								addressType: userShipping.addressType,
// 								isDefaultAddress: userShipping.isDefaultAddress,
// 							};
// 							return apiResponse.successResponseWithData(res,"Shipping Address Stor Success.", userData);
// 						});

// 					}
// 				});
			
// 		}
// 	} catch (err) {
// 		//throw error in json response with status 500.
// 		return apiResponse.ErrorResponse(res, err);
// 	}
// }];
exports.getUserShipping = [
	auth,
	(req, res) => {
		
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				
				//let user_id = mongoose.Types.ObjectId(req.user._id);
				//let shipping_id = mongoose.Types.ObjectId(req.shipping_id);

				console.log('user----------body.shipping_id------',req.body.shipping_id);

				UserShippingModel.find({user :req.user._id}).then((userShippingDetail)=>{
					if (userShippingDetail) {
						// let userData = {
						// 	_id: req.user._id,
						// 	userName: userShipping.userName,
						// 	userContact: userShipping.userContact,
						// 	userPincode: userShipping.userPincode,
						// 	userAddresssLine1: userShipping.userAddresssLine1,
						// 	userAddresssLine2: userShipping.userAddresssLine2,
						// 	city: userShipping.city,
						// 	state: userShipping.state,
						// 	country: userShipping.country,
						// 	addressType: userShipping.addressType,
						// 	isDefaultAddress: userShipping.isDefaultAddress,
						// };
						//Generated JWT token with Payload and secret.
						return apiResponse.successResponseWithData(res,"Shipping Address Success.", userShippingDetail);
					
					}else{
						return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];
