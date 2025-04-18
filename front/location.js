let latitude = -25.750875408510314;
let longitude = 28.226933011439606;

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(success, error);
	} else {
		error();
	}
}

function success(position) {
	// Do something with the position
	latitude = position.coords.latitude;
	longitude = position.coords.longitude;
}

function error() {
	// Display error
	alert("Failed to get location. You won't be able to access the app!");
}

getLocation();
