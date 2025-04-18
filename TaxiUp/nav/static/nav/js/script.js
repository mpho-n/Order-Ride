let search = document.getElementById("search");

async function requestSearch() {
	// Check if valid search and send to search request to server
	let input = search.value.trim();		

	if (input === "") {
		return;
	}
	
	// Send POST request to server
	getLocation();
	//window.location.href = `/filter/?search=${encodeURIComponent(input)}`;
	window.location.href = `/main/filter/?search=${encodeURIComponent(input)}&lat=${encodeURIComponent(latitude)}&long=${encodeURIComponent(longitude)}`;

}

search.addEventListener("search", requestSearch);

