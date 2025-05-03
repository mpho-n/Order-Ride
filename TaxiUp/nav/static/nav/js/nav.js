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
	}

	const user = {
		latitude,
		longitude,
	}

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
				toggleButton("request");

				// Reset url
				window.history.pushState(null, '', "/");

				break;
			case "search":
				toggleButton("none");
				
				break;
			case "place":
			case "event":
				toggleButton("go-to");
				break;
			case "trip":
				toggleButton("trip");
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

		togglePage("trip");
	});

	// Cancel trip button
	buttons.get("trip").addEventListener("click", function () {
		if (!confirm("About to quit trip to " + destination.name + "!")) {
			return;
		}

		togglePage("main");
		destination.active = false; // Indicate trip inactive
		destDisplay.value = "Select a destination";
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
			destination.name = data.name;

		});

		destination.value = destination.name;
		destination.active = true; // Indicate trip active
		
		// Modify the destination output to user
		destDisplay.value = destination.name;
		document.getElementById('trip-destination').innerHTML = destination.name;
		document.getElementById('trip-destination-pic').style.backgroundImage = `url('static/nav/images/${destination.id}.jpg')`;

		togglePage("main");
	});

	search.addEventListener("search", requestSearch);

	togglePage("main");
});
