document.addEventListener("DOMContentLoaded", function () {

	const destination = {
		active: false,
		name: "",
		latitude: 0,
		longitude: 0,
		//cost: 0,
		//displacement: 0,
		tripId: 0,
		//code: "",
	}
	const pickup = {
		fetched: false,
		name: "",
		latitude: 0,
		longitude: 0,
		//cost: 0,
		//displacement: 0,
		tripId: 0,
		//code: "",
	}

	const pages = new Map([
		["orders", document.getElementById("orders-page")],
		["trip", document.getElementById("trip-info-page")],
		["cancel", document.getElementById("cancel-page")],
	]);

	const buttons = new Map([
		["trip", document.getElementById("cancel-trip")],
		["complete", document.getElementById("complete-ride")],
		["quit", document.getElementById("quit-ride")],
	]);

	let backButton = document.getElementById("driver-back-button");

	function toggleButton(button) {
		// Makes showing and hiding the Request, and Go To button more manageable
		toggleButton.lastButton = toggleButton.lastButton || "";
			
		if (toggleButton.lastButton !== "") {
			buttons.get(toggleButton.lastButton).parentElement.style.visibility = "hidden";
		}

		if (button == "none") {
			toggleButton.lastButton = "";
			return;
		}

		buttons.get(button).parentElement.style.visibility = "visible";

		toggleButton.lastButton = button;
	}

	function togglePage(page) {
		togglePage.lastPage =  togglePage.lastPage || "";

		if (togglePage.lastPage !== "") {
			pages.get(togglePage.lastPage).style.display = "none"; 
		}

		pages.get(page).style.display = "initial";

		switch (page) {
			case "orders":
				toggleButton("none");
				window.location.hash = "#/orders";
				break;
			case "trip":
				toggleButton("trip");
				window.location.hash = "#/trip_driver";
				break;
			default:
				toggleButton("none");
				break;
		}

		togglePage.lastPage = page;
	}

	function orderClicked(order) {
		// Similar to placeClicked in ./nav.js, just expecting valid order id passed in
		let orderID = order.id;

		/* TODO: Load order details here */

		fetch(`/trip/?lat=${latitude}&long=${longitude}&id=${orderID}`)
		.then(res => res.json())
		.then(data => {
			document.getElementById('passenger').innerHTML = data.passenger;
			document.getElementById('date').innerHTML = 'Date: '+data.date;
			document.getElementById('time').innerHTML = 'Requested: '+data.time;
			document.getElementById('pick-up').innerHTML = 'Pick Up: '+data.pickup;
			document.getElementById('drop-off').innerHTML = 'Drop Off: '+data.dropoff;
			document.getElementById('ride-code').innerHTML = data.code;
			destination.latitude = data.destLat;
			destination.longitude = data.destLong;
			pickup.latitude = data.pickLat;
			pickup.longitude = data.pickLong;
			destination.tripId = data.ID;
			pickup.fetched = false;
		});

		togglePage("trip");
	}

	buttons.get("trip").addEventListener("click", function () {
		togglePage("cancel");
	});

	backButton.addEventListener("click", function () {
		togglePage("trip");
	});
	
	buttons.get("complete").addEventListener("click", function () {
		// Button to indicate trip completed
		if (!confirm("About to COMPLETE trip")) {
			return;
		}

		/* TODO: Process the completed trip */
		fetch(`/completed/?id=${destination.tripId}`)
				.then(res => res.json())
				.then(data => {
					
				});
		location.reload()
		togglePage("orders");
	});

	buttons.get("quit").addEventListener("click", function () {
		// Button to indicate trip quitted
		if (!confirm("About to QUIT trip")) {
			return;
		}

		/* TODO: Process the quitted trip */

		togglePage("orders");
	});


	const orderTiles = document.querySelectorAll(".order");

	for (const element of orderTiles) {
		element.addEventListener("click", function () {
			orderClicked(this);
		});
	}

	togglePage("orders");



	//checking current location
	let intervalId = null;

	function displacementP(){
		const y = (pickup.latitude-latitude)
		const x= (pickup.longitude-longitude)
		return Math.sqrt(y*y+x*x)*100
	}

	function displacementD(){
		const y = (destination.latitude-latitude)
		const x= (destination.longitude-longitude)
		return Math.sqrt(y*y+x*x)*100
	}


	function checkTrip() {
		getLocation();
		console.log("Interval is running on #trip page...");

		if (pickup.fetched==true){
			if (displacementD()<0.1){
				//trip completed
				fetch(`/completed/?id=${destination.tripId}&lat=${latitude}&long=${longitude}`)
				.then(res => res.json())
				.then(data => {
					if (data.status==0 || data.status==10){
						clearInterval(intervalId);
						intervalId = null;
						console.log("Stopped interval (not on #/trip)");
						togglePage("orders");
						return;
					}
				});
				location.reload()
				togglePage("orders");
			}
		} else 
			if (displacementP()<0.1){
				//person fetched
				fetch(`/fetched/?id=${destination.tripId}&lat=${latitude}&long=${longitude}`)
				.then(res => res.json())
				.then(data => {
					if (data.status==0 || data.status==10){
						clearInterval(intervalId);
						intervalId = null;
						console.log("Stopped interval (not on #/trip)");
						togglePage("orders");
						return;
					}
				});
				pickup.fetched = true;
				//togglePage("orders");
		} else {
			fetch(`/trip-update/?id=${destination.tripId}&lat=${latitude}&long=${longitude}`)
				.then(res => res.json())
				.then(data => {
					if (data.status==0 || data.status==10){
						clearInterval(intervalId);
						intervalId = null;
						console.log("Stopped interval (not on #/trip)");
						togglePage("orders");
						return;
					}
				});
		}
	}
	
	function checkOrders() {
		getLocation();
		console.log("Interval is running on #order page...");
		location.reload();
	}
	function manageTripInterval() {
    const currentHash = window.location.hash;

		// Clear previous interval before setting a new one
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
			console.log("Cleared previous interval");
		}

		if (currentHash === "#/trip_driver" && pages.get("trip")) {
		if (!intervalId) {
			intervalId = setInterval(checkTrip, 5000);
			console.log("Started interval for #/trip");
		}
		} else if (currentHash === "#/orders" && pages.get("orders")) {
		if (!intervalId) {
			intervalId = setInterval(checkOrders, 10000);
			console.log("Started interval for #/orders");
		}
		} else{
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
			console.log("Stopped interval (not on #/trip/orders)");
		}
		}
  	}

  // Run on initial load
  manageTripInterval();

  // Run when the hash changes
  window.addEventListener("hashchange", manageTripInterval);
});



