function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(success, error);
	} else {
		error();
	}
}

function success(position) {
	// Do something with the position
	let latitude = position.coords.latitude;
	let longitude = position.coords.longitude;
}

function error() {
	// Display error
	alert("Failed to get location. You won't be able to access the app!");
}

getLocation();
