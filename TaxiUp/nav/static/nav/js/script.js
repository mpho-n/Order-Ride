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
	window.location.href = `/?search=${encodeURIComponent(input)}&lat=${encodeURIComponent(Math.floor(latitude*1000000)/1000000)}&long=${encodeURIComponent(Math.floor(longitude*1000000)/1000000)}`;

}


search.addEventListener("search", requestSearch);
