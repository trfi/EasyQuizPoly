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

// Initialize button with user's preferred color
let changeColor = document.getElementById("changeColor");

chrome.storage.sync.get("color", ({ color }) => {
  changeColor.style.backgroundColor = color;
});