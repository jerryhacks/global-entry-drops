// ELEMENTS
const locationIdElement = document.getElementById("locationId");
const startDateElement = document.getElementById("startDate");
const endDateElement = document.getElementById("endDate");

// Button elements
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");

// Span listeners
const runningSpan = document.getElementById("runningSpan");
const stoppedSpan = document.getElementById("stoppedSpan");

// Error message
const locationIdError = document.getElementById("locationIdError");
const startDateError = document.getElementById("startDateError");
const endDateError = document.getElementById("endDateError");

const hideElement = (elem) => {
	elem.style.display = "none";
};

const showElement = (elem) => {
	elem.style.display = "";
};

const disableElement = (elem) => {
	elem.disabled = true;
};

const enableElement = (elem) => {
	elem.disabled = false;
};

const handleOnStartState = () => {
	// Spans
	showElement(runningSpan);
	hideElement(stoppedSpan);
	// Buttons
	disableElement(startButton);
	enableElement(stopButton);
	// Inputs
	disableElement(locationIdElement);
	disableElement(startDateElement);
	disableElement(endDateElement);
};

const handleOnStopState = () => {
	// Spans
	showElement(stoppedSpan);
	hideElement(runningSpan);
	// Buttons
	disableElement(stopButton);
	enableElement(startButton);
	// Inputs
	enableElement(locationIdElement);
	enableElement(startDateElement);
	enableElement(endDateElement);
};

const showDateError = (dateErrorElem, errorMessage) => {
	dateErrorElem.innerHTML = errorMessage;
	showElement(dateErrorElem);
};

const validateStartDate = (today, startDate) => {
	const isAfterToday = !startDate.isBefore(today, "date");

	if (!startDateElement.value) {
		showDateError(startDateError, "Please enter a valid start date.");
	} else if (!isAfterToday) {
		showDateError(startDateError, "Start date must not be before today.");
	} else {
		hideElement(startDateError);
	}

	return startDateElement.value && isAfterToday;
};

const validateEndDate = (today, startDate, endDate) => {
	const isAfterStartDate = endDate.isAfter(startDate, "date");
	const isAfterToday = endDate.isAfter(today, "date");

	if (!endDateElement.value) {
		showDateError(endDateError, "Please enter a valid end date.");
	} else if (!isAfterStartDate) {
		showDateError(endDateError, "End date must be after the start date.");
	} else if (!isAfterToday) {
		showDateError(endDateError, "End date must be after today.");
	} else {
		hideElement(endDateError);
	}

	return endDateElement.value && isAfterStartDate && isAfterToday;
};

const validateDates = () => {
	// today <= start date < end date
	const today = spacetime.now().startOf("day");
	const startDate = spacetime(startDateElement.value).startOf("day");
	const endDate = spacetime(endDateElement.value).startOf("day");

	const isStartDateValid = validateStartDate(today, startDate);
	const isEndDateValid = validateEndDate(today, startDate, endDate);

	return isStartDateValid && isEndDateValid;
};

const performOnStartValidations = () => {
	const isDateValid = validateDates();

	if (!locationIdElement.value) {
		showElement(locationIdError);
	} else {
		hideElement(locationIdError);
	}

	return locationIdElement.value && isDateValid;
};

startButton.onclick = () => {
	const allFieldsValid = performOnStartValidations();

	if (allFieldsValid) {
		handleOnStartState();
		const prefs = {
			locationId: locationIdElement.value,
			startDate: startDateElement.value,
			endDate: endDateElement.value,
			tzData:
				locationIdElement.options[locationIdElement.selectedIndex].getAttribute(
					"data-tz"
				),
		};
		chrome.runtime.sendMessage({ event: "onStart", prefs });
	}
};

stopButton.onclick = () => {
	handleOnStopState();
	chrome.runtime.sendMessage({ event: "onStop" });
};

chrome.storage.local.get(
	["locationId", "startDate", "endDate", "locations", "isRunning"],
	(result) => {
		const { locationId, startDate, endDate, locations, isRunning } = result;

		setLocations(locations);

		if (locationId) {
			locationIdElement.value = locationId;
		}

		if (startDate) {
			startDateElement.value = startDate;
		}

		if (endDate) {
			endDateElement.value = endDate;
		}

		if (isRunning) {
			handleOnStartState();
		} else {
			handleOnStopState();
		}
	}
);

// {
//  "id" : 5005,
//  "name" : "El Paso Enrollment Center",
//  "shortName" : "El Paso Enrollment Center",
//  "tzData" : "America/Denver"
// }
const setLocations = (locations) => {
	locations.forEach((location) => {
		let optionElement = document.createElement("option");
		optionElement.value = location.id;
		optionElement.innerHTML = location.name;
		optionElement.setAttribute("data-tz", location.tzData);
		locationIdElement.appendChild(optionElement);
	});
};

const today = spacetime.now().startOf("day").format();
startDateElement.setAttribute("min", today);
endDateElement.setAttribute("min", today);
