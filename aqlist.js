chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
	if (req.type === 'quiz_data') {
		document.getElementById('mySection').innerHTML = req.html
		document.getElementById('name').innerText = req.name
		sendResponse({farewell: "OK"})
	}
})
document.addEventListener("DOMContentLoaded", function(event) {
	var message = 'hello'
	chrome.runtime.getBackgroundPage(function(bgWindow) {
		bgWindow.funcCallFromPopupWindow(message)
		// window.close()
	});
})