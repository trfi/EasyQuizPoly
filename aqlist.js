chrome.runtime.onMessage.addListener(function (response, sender, sendResponse) {
	document.getElementById('mySection').innerHTML = response.html;
	document.getElementById('name').innerText = response.name;
	sendResponse({farewell: "OK"});
})