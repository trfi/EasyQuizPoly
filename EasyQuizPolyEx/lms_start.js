var server = window.location.origin;
var currentUrl = window.location.href;
var apiUrl = "https://tr-fi2.netlify.app/api/quizpoly/lms";
var version = chrome.runtime.getManifest().version;


function getSubject() {
  let subject
  try {
    subject = document
      .querySelector("ol > li:nth-child(5) > a")
      .textContent.split("-")
    if (subject.length == 1) {
      subject = document
      .querySelector("ol > li:nth-child(5) > a")
      .textContent.split("_")
    }
    if (subject.length == 1) {
      subject = document
      .querySelector("ol > li:nth-child(6) > a")
      .textContent.split("-")
    }
    if (subject.length == 1) {
      subject = document
      .querySelector("ol > li:nth-child(6) > a")
      .textContent.split("_")
    }
    if (subject.length == 1) {
      subject = document
      .querySelector("ol > li:nth-child(7) > a")
      .textContent.split("-")
    }
    if (subject.length == 1) {
      subject = document
      .querySelector("ol > li:nth-child(7) > a")
      .textContent.split("_")
    }
    return subject[1].trim();
  } catch (error) {
    console.debug(error);
    return '';
  }
}

var subjectName = getSubject();

function main() {
  chrome.runtime.sendMessage({ type: "open_quiz_popup" });
  chrome.storage.local.remove("listQA");
  chrome.storage.local.set({ subjectName, isStart: true }, function () {
    console.debug("set subject");
  });
}


(function () {
  const btnStart = document.querySelector('.navbar-form > input');
  if (btnStart) {
    btnStart.setAttribute('type', 'button');
    const btnStart2 = btnStart.cloneNode(true)
    btnStart2.setAttribute('type','submit');
    btnStart2.setAttribute('style','display:none');
    document.querySelector('.navbar-form').appendChild(btnStart2);
    btnStart.addEventListener('click', async () => {
      btnStart.setAttribute('disabled','')
      main();
      btnStart2.setAttribute('type', 'submit');
      btnStart2.dispatchEvent(new MouseEvent("click"));
    });
  }
})();
