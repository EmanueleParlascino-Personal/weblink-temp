export default function get(settings) {
	let responseObj = {};

	fetch('https://surveyplatform.crowdtech-dev.com/api/0916c6c8-1c2c-4da4-bb67-fc3000baa4b0/get-results', {
		method: settings.method ?? "POST",
		headers: {
			"Content-Type": settings.contentType ?? "application/json"
		},
		body: JSON.stringify(settings.data),
	})
	.then(response => {
		responseObj = response;
		
		if (response.statusText === 'No Content') return {}

		return response.json();
	})
	.then(data => {
		if (responseObj.status === 200 && settings.successCallback) settings.successCallback(data);
		else if (responseObj.status >= 400) {
			if (settings.failureCallback !== undefined ) settings.failureCallback(data);

			if (data.message){
				this.notification = {
					notificationType: "failure",
					message: data.message,
					show: true
				}
			}
		}
	});
}