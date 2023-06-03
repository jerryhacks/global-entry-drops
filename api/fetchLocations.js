const LOCATION_ENDPOINT =
	"https://ttp.cbp.dhs.gov/schedulerapi/locations/?temporary=false&inviteOnly=false&operational=true&serviceName=Global Entry";

export const fetchLocations = () => {
	fetch(LOCATION_ENDPOINT)
		.then((response) => response.json())
		.then((data) => {
			const filteredLocations = data.map((loc) => ({
				id: loc.id,
				name: loc.name,
				shortName: loc.shortName,
				tzData: loc.tzData,
			}));
			filteredLocations.sort((a, b) => a.name.localeCompare(b.name));
			chrome.storage.local.set({ locations: filteredLocations });
		})
		.catch((error) => {
			console.log(error);
		});
};
