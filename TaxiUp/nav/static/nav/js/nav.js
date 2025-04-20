document.addEventListener("DOMContentLoaded", function () {
	getLocation();
	let name;
	let destLat;
	let destLong;
	let currLat;
	let currLong;
	let cost;
	let disp;


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
	let backButton = document.getElementById("back");
	let prevPage = "";

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
		if (page !== "main" && page !== "trip") {
			backButton.style.display = "initial";
		} else {
			backButton.style.display = "none";
		}

		// Dont show search in trip page
		if (page !== "trip") {
			toggleSearch(true);
		} else {
			toggleSearch(false);
		}

		togglePage.lastPage = page;
	}

	function placeClicked(place) {
		// Pre condtions
		// - Valid Place containers given
		// - Valid ID attached to the place matches valid ID in database
		let placeID = place.id;
		

		/* TODO: Get place data to populate the page*/
		fetch(`/place/${placeID}/?lat=${latitude}&long=${longitude}`)
		.then(res => res.json())
		.then(data => {
			name=data.name;
			destLat=data.lat;
			destLong=data.long;
			currLat = latitude;
			currLong = longitude;
			cost= data.cost;
			disp = data.displacement;

			document.getElementById('headPlace').textContent = name;
			document.getElementById('placeContainer1').style.backgroundImage = `url('static/nav/images/${placeID}.jpg')`;
			document.getElementById('description').innerHTML = `Distance: ${disp}km<br>Trip fare: R${cost}`;
			document.getElementById('destination').value = name;
			document.getElementById('destination').innerHTML = placeID;

		});

		console.log("hello world");
		togglePage("place"); 
	}

	function requestSearch() {
		// Check if valid search and send to search request to server
		let input = search.value.trim();		

		if (input === "") {
			return;
		}
		
		/* TODO: Send request to server for places */
		

		// Commented out because it took user to log in page instead
		// Can we fetch all places that match search from search query to database?
		
		window.location.href = `/?search=${encodeURIComponent(input)}`;
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

		let destination = document.getElementById("destination");
		destination.value = name;

		togglePage("main");
	});

	search.addEventListener("search", requestSearch);

	togglePage("trip");
});
