// Fetch the list of open interviews at a location in a given date period
export const fetchOpenSlots = (result) => {
	return new Promise((resolve, reject) => {
		// https://ttp.cbp.dhs.gov/schedulerapi/locations/9240/slots?startTimestamp=2023-02-11T00:00:00&endTimestamp=2023-03-22T00:00:00
		const { locationId, startDate, endDate } = result;
		const appointmentUrl = `https://ttp.cbp.dhs.gov/schedulerapi/locations/${locationId}/slots?startTimestamp=${startDate}T00:00:00&endTimestamp=${endDate}T00:00:00`;
		fetch(appointmentUrl)
			.then((response) => response.json())
			.then((data) => data.filter((slot) => slot.active > 0))
			.then((data) => resolve(data))
			.catch((error) => {
				console.log(error);
				reject();
			});
	});
};
