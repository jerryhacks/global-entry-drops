export const createNotification = (openSlot, numberOfSlots, prefs) => {
	const { tzData } = prefs;

	let message = `Found an open interview at ${openSlot.timestamp} (${tzData} timezone)`;
	if (numberOfSlots > 1) {
		message = `${message} and ${numberOfSlots - 1} additional open interviews.`;
	}

	chrome.notifications.create({
		title: "Global Entry Drops",
		message,
		iconUrl: "../images/icon-48.png",
		type: "basic",
	});
};
