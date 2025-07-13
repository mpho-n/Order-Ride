document.addEventListener("DOMContentLoaded", function () {


	const createDestination = () => ({
		active: false,
		name: "",
		latitude: 0,
		longitude: 0,
		tripId: 0,
		code: ""
	});

	const destination = {
		active: false,
		name: "",
		latitude: 0,
		longitude: 0,
		tripId: 0,
	}
	const pickup = {
		fetched: false,
		name: "",
		latitude: 0,
		longitude: 0,
		tripId: 0,
	}

	let tripCount = 0;
	let trips = [];
	let RideID = "";

	const pages = new Map([
		["orders", document.getElementById("orders-page")],
		["trip", document.getElementById("trip-info-page")],
		["cancel", document.getElementById("cancel-page")],
	]);

	const buttons = new Map([
		["trip", document.getElementById("cancel-trip")],
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
			document.getElementById('date').innerHTML = 'Date: '+data.date;
			document.getElementById('time').innerHTML = 'Requested: '+data.time;
			document.getElementById('pick-up').innerHTML = 'Pick Up: '+data.pickup;
			document.getElementById('drop-off').innerHTML = 'Drop Off: '+data.dropoff;
			passengers = data.passengers;


			tripCount = data.passengers || 1;
			RideID = data.rideID || "";
			for (let i = 0; i < tripCount; i++) {
				const suffix = i === 0 ? '' : i.toString(); // "" for first, "1", "2" after

				const trip = {
					pickup: data[`pickup${suffix}`],
					dropoff: data[`dropoff${suffix}`],
					code: data[`code${suffix}`],
					passenger: data[`passenger${suffix}`],
					date: data[`date${suffix}`],
					time: data[`time${suffix}`],
					destLat: data[`destLat${suffix}`],
					destLong: data[`destLong${suffix}`],
					pickLat: data[`pickLat${suffix}`],
					pickLong: data[`pickLong${suffix}`],
					ID: data[`ID${suffix}`]
				};

				trips.push(trip);
			}
			console.log(trips);
			const allPassengers = trips.map(trip => trip.passenger).join(", ");
			const allCodes = trips.map(trip => trip.code).join(", ");

			document.getElementById('passenger').innerHTML = allPassengers;
			document.getElementById('ride-code').innerHTML = allCodes;


			const container = document.querySelector(".cancel-containers");

			// Build the combined HTML string from the trips array
			let html = "";

			trips.forEach(trip => {
				html += `
					<div class="button-container"><div class="passenger-details-container"><div class="passenger-details-name">${trip.passenger}</div>
					<div class="passenger-details-code">${trip.code}</div></div>
					<button class="ride-complete-button" onclick="completeRide(${trip.ID},${RideID})">Complete Ride</button>
					<button class="ride-cancel-button" onclick="cancelRide(${trip.ID},${RideID})">Cancel Ride</button></div>
				`
			});
			container.innerHTML = html;


			/*destination.latitude = data.destLat;
			destination.longitude = data.destLong;
			pickup.latitude = data.pickLat;
			pickup.longitude = data.pickLong;

			destination.tripId = data.ID;
			pickup.fetched = false;*/
		});

		togglePage("trip");
	}

	buttons.get("trip").addEventListener("click", function () {
		togglePage("cancel");
	});

	backButton.addEventListener("click", function () {
		togglePage("trip");
	});
	
	
	window.completeRide = function(id, tripID) {
		if (!confirm("About to COMPLETE trip")) {
			return;
		}
		console.log(id);
		
		fetch(`/completed/?id=${id}&tripID=${tripID}`)
			.then(res => res.json())
			.then(data => {
				if (data.finished){
					alert("Trip " + id + ", has been completed");
					togglePage("orders");
				} else{
					return;
				}
			});
		location.reload()

		//alert("Trip " + id + ", has been completed");
		//togglePage("orders");
	}
	
	window.cancelRide = function(id, tripID){
		if (!confirm("About to QUIT trip")) {
			return;
		}
		fetch(`/cancel/?id=${id}&tripID=${tripID}`)
			.then(res => res.json())
			.then(data => {
				if (data.finished){
					alert("Trip " + id + ", has been cancelled");
					togglePage("orders");
				} else{
					return;
				}
		});

		//alert("Trip " + id + ", has been cancelled");
		//togglePage("orders");
	}

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
				trips.forEach(trip => {
					fetch(`/completed/?id=${trip.ID}&lat=${latitude}&long=${longitude}`)
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
				})
				location.reload()
				togglePage("orders");
			}
		} else 
			if (displacementP()<0.1){
				//person fetched
				fetch(`/fetched/?id=${RideID}&lat=${latitude}&long=${longitude}`)
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
			fetch(`/trip-update/?id=${RideID}&lat=${latitude}&long=${longitude}`)
				.then(res => res.json())
				.then(data => {
					if (data.status==0 || data.status==10){
						clearInterval(intervalId);
						intervalId = null;
						console.log("Stopped interval (not on #/trip)");
						togglePage("orders");
						return;
					} else {
						document.getElementById('passenger').innerHTML = data.names;
						document.getElementById('ride-code').innerHTML = data.codes;
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



