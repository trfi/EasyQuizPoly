let sequence = Number
let textAnswer = String
let url = String

url = window.location.href
try {
  sequence = parseInt(/sequence=([0-9]{1,2})/.exec(url)[1])

  chrome.storage.local.get(['listQA'], function(data) {
    textAnswer = data.listQA[sequence-1].ans;
    console.log(textAnswer);
    if (sequence < 10) {
      document.querySelector('#nextbutton').style.display = 'none';
      document.querySelector('#bottomnextbutton').style.display = 'none';
    }
    setTimeout(() => {
      [...document.querySelectorAll('.middle>label')].find(el => el.textContent.trim() == textAnswer).dispatchEvent(new MouseEvent('click'));
    }, 500);
    if (sequence < 10) {
      setTimeout(() => {
        document.querySelector('#nextbutton').style.display = '';
        document.querySelector('#bottomnextbutton').style.display = '';
      }, 1000);
    }
  })
} catch (error) {
  alert(`Đã xảy ra lỗi khi tự điền đáp án. Liên hệ Admin báo lỗi: ${error}}`)
}
