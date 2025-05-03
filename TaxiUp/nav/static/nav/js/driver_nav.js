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
