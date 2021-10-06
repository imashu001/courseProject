var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
	userName: {type: String, required: true},
	userType: {type: String, required: true}, //shop,custmer,rider
	email: {type: String, required: true},
	password: {type: String, required: true},
	contactNo: {type: String, required: false},
	countryCode: {type: String, required: false},
	loginType: {type: String, required: false},
	deviceType: {type: String, required: false},
	deviceToken: {type: String, required: false},
	googleId: {type: String, required: false},
	facebookId: {type: String, required: false},
	instagramId: {type: String, required: false},
	profileImage: {type: String, required: false},
	isConfirmed: {type: Boolean, required: true, default: 0},
	confirmOTP: {type: String, required:false},
	otpTries: {type: Number, required:false, default: 0},
	status: {type: Boolean, required: true, default: 1}
}, {timestamps: true});

//Virtual for user's full name
UserSchema
	.virtual("fullContact")
	.get(function () {
		return this.contactNo + " " + this.countryCode;
	});

module.exports = mongoose.model("User", UserSchema);