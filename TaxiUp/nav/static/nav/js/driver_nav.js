document.addEventListener("DOMContentLoaded", function () {
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
			case "trip":
				toggleButton("trip");
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
			document.getElementById('drop-off').innerHTML = 'Drip Off: '+data.dropoff;
			document.getElementById('ride-code').innerHTML = data.code;
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
});
