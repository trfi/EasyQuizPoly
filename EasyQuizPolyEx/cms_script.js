function getSubject() {
  const subjectEle = document.querySelector('.course-name')
  if (subjectEle) return subjectEle.textContent
  else {
    alert(`Bắt đầu làm bài xong chuột phải chọn Giải đáp án
CMS chỉ giải được môn Chính trị và Pháp luật
Các môn khác mình có nhận làm hộ ai cần ib fb`);
    return '';
  }
}

function getQuizNumber() {
  const ele = document.querySelector('.unit-title')
  if (ele) return ele.textContent.split(' ').pop()
  else return 0
}

function getUserInfo() {
  const name = document.querySelector('.username').textContent;
  const userServer = 'CMS';
  return { name, userServer }
}

async function sendUserUsing(user, getQuizType, subjectName) {
  chrome.runtime.sendMessage({ type: "send_user_using", domain: window.location.host, data: {...user, getQuizType, subjectName, quizNumber: getQuizNumber()} });
}


(function () {
  const user = getUserInfo();
  const subjectName = getSubject();
  if (subjectName) {
    chrome.storage.local.get(['cmsData'], function(data) {
      sendUserUsing(user, "cms", subjectName);
      let ansList = data.cmsData[subjectName];
      if (!ansList) {
        alert('CMS chỉ hỗ trợ giải Chính trị, Pháp luật. Môn khác ib mình giải hộ');
        return;
      }
      [...document.querySelectorAll('.poly-body')].map(quesEl => {
        let ques = quesEl.textContent.trim();
        let ans = ansList.find(qa => qa.q === ques);
        if (ans) {
          Array.from(quesEl.parentNode.nextElementSibling.firstChild.firstElementChild.children)
            .find(el => el.textContent.includes(ans.a)).firstElementChild.click();
        }
      });
      document.querySelector('button[type="button"]').disabled = false;
      setTimeout(() => {
        alert('Đã chọn xong các đáp án đúng. Submit nào!');
      }, 500);
    });
  }
})();
