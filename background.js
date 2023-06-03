import { fetchLocations } from "./api/fetchLocations.js";
import { fetchOpenSlots } from "./api/fetchOpenSlots.js";
import { createNotification } from "./lib/createNotification.js";

const ALARM_JOB_NAME = "DROP_ALARM";

let cachedPrefs = {};
let firstApptTimestamp = null;

chrome.runtime.onInstalled.addListener((details) => {
	handleOnStop();
	fetchLocations();
});

chrome.runtime.onMessage.addListener((data) => {
	const { event, prefs } = data;
	switch (event) {
		case "onStop":
			handleOnStop();
			break;
		case "onStart":
			handleOnStart(prefs);
			break;
		default:
			break;
	}
});

chrome.notifications.onClicked.addListener(() => {
	chrome.tabs.create({
		url: "https://ttp.cbp.dhs.gov/schedulerui/schedule-interview/location?lang=en&vo=true&returnUrl=ttp-external&service=up",
	});
});

chrome.alarms.onAlarm.addListener(() => {
	openSlotsJob();
});

const handleOnStop = () => {
	setRunningStatus(false);
	stopAlarm();
	cachedPrefs = {};
	firstApptTimestamp = null;
};

const handleOnStart = (prefs) => {
	cachedPrefs = prefs;
	chrome.storage.local.set(prefs);
	setRunningStatus(true);
	createAlarm();
};

const setRunningStatus = (isRunning) => {
	chrome.storage.local.set({ isRunning });
};

const createAlarm = () => {
	chrome.alarms.get(ALARM_JOB_NAME, (existingAlarm) => {
		if (!existingAlarm) {
			// immediately run the job
			openSlotsJob();
			chrome.alarms.create(ALARM_JOB_NAME, { periodInMinutes: 1.0 });
		}
	});
};

const stopAlarm = () => {
	chrome.alarms.clearAll();
};

const openSlotsJob = () => {
	fetchOpenSlots(cachedPrefs).then((data) => handleOpenSlots(data));
};

const handleOpenSlots = (openSlots) => {
	if (
		openSlots &&
		openSlots.length > 0 &&
		openSlots[0].timestamp != firstApptTimestamp
	) {
		firstApptTimestamp = openSlots[0].timestamp;
		createNotification(openSlots[0], openSlots.length, cachedPrefs);
	}
};
