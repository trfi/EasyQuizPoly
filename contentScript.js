chrome.runtime.onMessage.addListener(function (response, sender, sendResponse) {
  chrome.tabs.getSelected(null, function(tab) {
    var myURL = tab.url;
    alert(myURL)
  });
  // alert(JSON.stringify(response))
  
	sendResponse({farewell: "OK"});
})