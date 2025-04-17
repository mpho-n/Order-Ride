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


function togglePage(page) {
	// Makes switching between pages easier
	
	togglePage.lastPage =  togglePage.lastPage || "";

	if (togglePage.lastPage !== "") {
		pages.get(togglePage.initialPage).style.display = "none"; 
	}

	pages.get(page).style.display = "initial";

	togglePage.lastPage = page;
}

function toggleButton(button) {
	// Makes showing and hiding the Request, and Go To button more manageable
	
	toggleButton.lastButton = (toggleButton || "");
		
	if (toggleButton.lastButton !== "") {
		buttons.get(toggleButton.lastButton).parentElement.style.visibility = "hidden";
	}

	buttons.get(button).parentElement.style.visibility = "visibile";

	toggleButton.lastButton = button;
}

function placeClicked(place) {
	// Pre condtions
	// - Valid Place containers given
	// - Valid ID attached to the place matches valid ID in database
	let placeID = place.id;

	/* TODO: Get place data to populate the page*/

	togglePage("place"); 
	toggleButton("go-to");
}

togglePage("main");
