let sequence = Number
let textAnswer = String
let url = String

url = window.location.href
sequence = parseInt(/sequence=([0-9]{1,2})/.exec(url)[1])

chrome.storage.local.get(['listQA'], function(data) {
  console.log(data.listQA);
  textAnswer = data.listQA[sequence-1].ans;
  console.log(textAnswer);
  [...document.querySelectorAll('.middle>label')].find(el => el.textContent.includes(textAnswer)).click()
})
