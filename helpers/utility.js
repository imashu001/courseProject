const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();


exports.randomNumber = function (length) {
	var text = "";
	var possible = "123456789";
	for (var i = 0; i < length; i++) {
		var sup = Math.floor(Math.random() * possible.length);
		text += i > 0 && sup == i ? "0" : possible.charAt(sup);
	}
	return Number(text);
};
if(typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function () {
      return this * Math.PI / 180;
  }
}
exports.getDistance = function(start, end, start1, end1,decimals) {
  decimals = decimals || 2;
  var earthRadius = 6371; // km
  lat1 = parseFloat(start);
  lat2 = parseFloat(start1);
  lon1 = parseFloat(end);
  lon2 = parseFloat(end1);

  var dLat = (lat2 - lat1).toRad();
  var dLon = (lon2 - lon1).toRad();
  var lat1 = lat1.toRad();
  var lat2 = lat2.toRad();

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = earthRadius * c;
  return Math.round(d * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

exports.distance = function(lat1, lon1, lat2, lon2, uni) {
  var radlat1 = Math.PI * lat1/180
  var radlat2 = Math.PI * lat2/180
  var theta = lon1-lon2
  var radtheta = Math.PI * theta/180
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist)
  dist = dist * 180/Math.PI
  dist = dist * 60 * 1.1515
  if (unit=="K") { dist = dist * 1.609344 }
  if (unit=="N") { dist = dist * 0.8684 }
  return dist
};

exports.checkContactNoNew = function(contactNo,res) {
	
  const number = phoneUtil.parseAndKeepRawInput(contactNo);
  return phoneUtil.isValidNumber(number);
  //console.log(phoneUtil.isValidNumber(number));

};