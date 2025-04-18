document.addEventListener("DOMContentLoaded", function () {

	const pages = new Map([
		["main", document.getElementById("main-page")],
		["place", document.getElementById("place-page")],
		["event", document.getElementById("event-page")],
		["search", document.getElementById("search-page")],
	]);

	const buttons = new Map([
		["request", document.getElementById("request-ride")],
		["go-to", document.getElementById("go-to")],
	]);

	let search = document.getElementById("search");
	let backButton = document.getElementById("back");
	let prevPage = "";

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
		// Makes switching between pages easier
		
		togglePage.lastPage =  togglePage.lastPage || "";
		prevPage = togglePage.lastPage;

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
		}

		// Show back button only non main pages
		if (page !== "main") {
			backButton.style.display = "initial";
		} else {
			toggleButton("request");
			backButton.style.display = "none";
		}

		togglePage.lastPage = page;
	}

	function placeClicked(place) {
		// Pre condtions
		// - Valid Place containers given
		// - Valid ID attached to the place matches valid ID in database
		let placeID = place.id;

		/* TODO: Get place data to populate the page*/

		togglePage("place"); 
	}

	function requestSearch() {
		// Check if valid search and send to search request to server
		let input = search.value.trim();		

		if (input === "") {
			return;
		}
		
		/* TODO: Send request to server for places */
		
		window.location.href = `/?search=${encodeURIComponent(input)}&lat=${encodeURIComponent(Math.floor(latitude*1000000)/1000000)}&long=${encodeURIComponent(Math.floor(longitude*1000000)/1000000)}`;
		togglePage("search");
	}

	// Loads placeClicked to all place tiles
	const placeTiles = document.querySelectorAll(".place");

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

		/* TODO: Fetch place data from server */

		let destination = document.getElementById("destination");
		destination.value = "Engineering III";

		togglePage("main");
	});

	search.addEventListener("search", requestSearch);

	togglePage("main");
});
