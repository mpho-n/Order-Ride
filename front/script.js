let search = document.getElementById("search");

function requestSearch() {
	// Check if valid search and send to search request to server
	let input = search.value.trim();		

	if (input === "") {
		return;
	}
	
	// Send POST request to server
}

search.addEventListener("search", requestSearch);
