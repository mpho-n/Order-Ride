document.addEventListener("DOMContentLoaded", function () {
	getLocation();

	const destination = {
		active: false,
		name: "",
		latitude: 0,
		longitude: 0,
		cost: 0,
		displacement: 0,
		id: 0,
		code: "",
		tripID:0,
	}
	const driver = {
		id: 0,
		name:"",
		eta:1000
	}
	//let trip=0;
	getLocation();
	const user = {
		latitude,
		longitude,
	}
	let intervalId = null;//initialised for intervals on the page

	const pages = new Map([
		["main", document.getElementById("main-page")],
		["place", document.getElementById("place-page")],
		["event", document.getElementById("event-page")],
		["search", document.getElementById("search-page")],
		["trip", document.getElementById("trip-page")],
	]);

	const buttons = new Map([
		["request", document.getElementById("request-ride")],
		["go-to", document.getElementById("go-to")],
		["trip", document.getElementById("cancel-trip")],
	]);

	let search = document.getElementById("search");
	let backButton = document.getElementById("user-back-button");
	let prevPage = "";
	let destDisplay = document.getElementById("destination").value;

	function toggleSearch(show) {
		// Handles showing and hiding of search bar
		if (show === true) {
			search.style.display = "initial";
		} else {
			search.style.display = "none";
		}
	}

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
		getLocation();
		// Makes switching between pages easier
		
		togglePage.lastPage =  togglePage.lastPage || "";

		// Prevent infinite looping with back button
		if (page != togglePage.lastPage && page !== prevPage) {
			prevPage = togglePage.lastPage;
		} else {
			prevPage = "main";
		}

		if (togglePage.lastPage !== "") {
			pages.get(togglePage.lastPage).style.display = "none"; 
		}

		pages.get(page).style.display = "initial";

		// Button management
		switch (page) {
			case "main":
				// Clear search bar
				search.value = "";
				console.log("here 1");
				toggleButton("request");
				console.log("here 1");
				// Reset url
				window.history.pushState(null, '', "/");
				window.location.hash = "";

				break;
			case "search":
				toggleButton("none");
				window.location.hash = "";
				break;
			case "place":
			case "event":
				toggleButton("go-to");
				window.location.hash = "";
				break;
			case "trip":
				toggleButton("trip");
				window.location.hash = "#/trip";
				break;
		}

		// Show back button only non main pages
			backButton.style.display = "initial";
		if (page == "main" || page == "trip") {
			backButton.style.display = "none";
		} else {
			backButton.style.display = "initial";
		}

		// Dont show search in trip page
		if (page == "trip") {
			toggleSearch(false);
		} else {
			toggleSearch(true);
		}

		togglePage.lastPage = page;
	}

	function placeClicked(place) {
		// Pre condtions
		// - Valid Place containers given
		// - Valid ID attached to the place matches valid ID in database
		let placeID = place.id;
		
		fetch(`/place/${placeID}/?lat=${latitude}&long=${longitude}`)
		.then(res => res.json())
		.then(data => {
			if (data.locationError==1){
				alert("Please switch on and allow device location to proceed or try again");
				togglePage("main");
				return;
			}
			destination.name=data.name;
			destLat=data.lat;
			destLong=data.long;
			currLat = latitude;
			currLong = longitude;
			cost= data.cost;
			disp = data.displacement;

			document.getElementById('headPlace').textContent = destination.name;
			document.getElementById('placeContainer1').style.backgroundImage = `url('static/nav/images/${placeID}.jpg')`;
			document.getElementById('description').innerHTML = `Distance: ${disp}km<br>Trip fare: R${cost}`;
			document.getElementById('destination').value = destination.name;
			document.getElementById('destination').innerHTML = placeID;
			destination.id = placeID;

		});

		togglePage("place"); 
	}

	function requestSearch() {
		// Check if valid search and send to search request to server
		let input = search.value.trim();		

		if (input === "") {
			return;
		}
		
		/* TODO: Send request to server for places */
		
		//let arg = "/?search=" + encodeURIComponent(input);
		//window.history.pushState(null, '', arg);
		fetch(`/?search=${input}`)
		.then(res => res.text())
		.then(data => {
			let result = data;
			//prepare the page
			let container = document.getElementById('results-container');
			container.innerHTML = data;
		});

		togglePage("search");
	}

	// Loads placeClicked to all place tiles
	// Skip the place tile in the place page
	const placeTiles = document.querySelectorAll(".place:not(.noninteractive)");

	for (const element of placeTiles) {
		element.addEventListener("click", function () {
			placeClicked(this)
		});
	}

	// Request ride button 
	buttons.get("request").addEventListener("click", function (){
		if (!destination.active) {
			alert("No destination was selected!");
			return;
		}

		fetch(`/confirm/?id=${destination.tripID}`)
			.then(res => res.json())
			.then(data => {

			})

		togglePage("trip");
	});

	// Cancel trip button
	buttons.get("trip").addEventListener("click", function () {
		if (!confirm("About to quit trip to " + destination.name + "!")) {
			console.log("cancelation aborted");
			return;
		} else {
			console.log("canceling");
			fetch(`/cancel/?id=${destination.tripID}`)
			.then(res => res.json())
			.then(data => {
				clearInterval(intervalId);
				intervalId = null;
				destination.tripID = 0;
				togglePage("main");
				destination.active = false; // Indicate trip inactive
				destDisplay.value = "Select a destination";
			})
			
		}
	});

	// Back button
	backButton.addEventListener("click", function () {
		togglePage(prevPage);
	});

	// Go to button pressed
	buttons.get("go-to").addEventListener("click", function (){
		// Set place as destination

		/* TODO: Fetch place data from server 
		
			got place data from server stored in global variables above
		*/
		fetch(`/book/?lat=${latitude}&long=${longitude}&dest=${destination.id}`)
		.then(res => res.json())
		.then(data => {
			destination.active = true;
			destination.dropoff = data.dropoff;
			destination.code = data.code;
			destination.displacement = data.displacement;
			destination.cost = data.cost;
			driver.id = data.driver;
			destination.tripID = data.tripID

			destination.value = destination.name;
			destination.active = true; // Indicate trip active
			
			// Modify the destination output to user
			destDisplay.value = destination.name;
			document.getElementById('trip-destination').innerHTML = destination.dropoff;
			document.getElementById('trip-destination-pic').style.backgroundImage = `url('static/nav/images/${destination.id}.jpg')`;
			document.getElementById('trip-heading').innerHTML = "Ride pending";
			document.getElementById('fare').innerHTML = "Trip Fare: R"+String(destination.cost);
			document.getElementById('distance').innerHTML = "Distance: "+String(destination.displacement)+"km";
			document.getElementById('ride-code').innerHTML = "CODE: "+String(destination.code);
			document.querySelector("#trip-eta span").textContent = "...";
			document.getElementById('trip-eta-card').innerHTML = "... minutes away";
			//document.getElementById('driver-profile').style.backgroundImage = `url('static/nav/images/e${destination}.jpg')`;
			document.getElementById('driver-info-text').innerHTML = "Loading Driver";
			document.getElementById('trip-price').children[0].innerHTML = "R"+String(destination.cost);
			console.log(destination.code);
			console.log(data.displacement);
			togglePage("main");
		});


	});

	function duringTrip() {
	if (destination.status == 0){
		clearInterval(intervalId);
		intervalId = null;
		console.log("Cleared interval");
		return;
	}
	fetch(`/status/?id=${destination.tripID}`)
		.then(res => {
			if (!res.ok) throw new Error("Failed to fetch trip status");
			return res.json();
		})
		.then(data => {
			if (data.status==0 || data.status==10){
				clearInterval(intervalId);
				intervalId = null;
				console.log("Stopped interval (not on #/trip)");
				togglePage("main");
				return;
			}
			document.getElementById('driver-info-text').innerHTML = data.name;
			document.getElementById('driver-profile').style.backgroundImage = `url('static/nav/images/e${data.driverID}.jpg')`;
			document.getElementById('trip-eta-card').innerHTML = `${data.eta} minutes away`;
			if (data.status==2){
				document.getElementById('eta-top').innerHTML = data.eta;
				document.getElementById('trip-eta').innerHTML = `Driver <span id="eta-top">${data.eta}</span> minutes away`
			} else {
				document.getElementById('eta-top').innerHTML = data.eta;
				document.getElementById('trip-eta').innerHTML = `Driver <span id="eta-top">${data.eta}</span> minutes away`
			}
			
		})
		.catch(err => {
			console.error("Error updating trip status:", err);
		});
}

	function duringTripInterval() {
    const currentHash = window.location.hash;

		// Clear previous interval before setting a new one
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
			console.log("Cleared previous interval");
		}
		if (currentHash === "#/trip" && pages.get("trip")) {
			if (!intervalId) {
				intervalId = setInterval(duringTrip, 5000);
				console.log("Started interval for #/trip");
			}
		} else {
			if (intervalId) {
				clearInterval(intervalId);
				intervalId = null;
				console.log("Stopped interval (not on #/trip)");
			}
		} 
  	}

	search.addEventListener("search", requestSearch);
	duringTripInterval();

	togglePage("main");
	// Run when the hash changes
  	window.addEventListener("hashchange", duringTripInterval);
	});
