document.addEventListener("DOMContentLoaded", function () {
	const pages = new Map([
		["orders", document.getElementById("orders-page")],
		["trip", document.getElementById("trip-info-page")],
	]);

	const buttons = new Map([
		["trip", document.getElementById("cancel-trip")],
	]);

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
				break;
			case "trip":
				toggleButton("trip");
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
			document.getElementById('drop-off').innerHTML = 'Drop Off: '+data.dropoff;
			document.getElementById('ride-code').innerHTML = data.code;
		});

		togglePage("trip");
	}

	buttons.get("trip").addEventListener("click", function () {
		if (!confirm("About to quit trip!")) {
			return;
		}

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
