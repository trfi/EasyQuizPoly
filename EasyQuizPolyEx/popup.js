document.addEventListener('DOMContentLoaded', () => {
  var btn = document.getElementById('btn');
  btn.addEventListener('click', function() {
    chrome.tabs.executeScript({
          file: 'script.js'
    });
    chrome.windows.create({url: 'aqlist.html', type: 'panel', width: 600, height: screen.height}, function(window) {
    });
  })
});