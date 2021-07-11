document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('resolveCms').addEventListener('click', getSubjects);
  // var btn = document.getElementById('btn');
  // btn.addEventListener('click', function() {
  //   chrome.tabs.executeScript({
  //         file: 'script.js'
  //   });
  //   chrome.windows.create({url: 'aqlist.html', type: 'panel', width: 600, height: screen.height}, function(window) {
  //   });
  // })
});

// chrome.storage.sync.get("color", ({ color }) => {
//   changeColor.style.backgroundColor = color;
// });

var server = 'https://cms.poly.edu.vn';
var subjectDuplicate = ['LẬP TRÌNH JAVA 6 (UDPM.JAVA)'];

function appendResult(inner) {
  let elChild = document.createElement('div');
  elChild.innerHTML = inner;
  document.getElementById('result').appendChild(elChild);
}

async function getSubjects() {
  document.getElementById('resolveCms').disabled = true;
  const url = `https://cms.poly.edu.vn/dashboard`;
  const response = await fetch(url);
  if (response.url == 'https://cms.poly.edu.vn/login?next=/dashboard') {
    document.getElementById('result').innerText = 'Bạn chưa đăng nhập CMS';
    return
  }
  const htmlData = await response.text();
  const htmlObject = parseHTML(htmlData);
  createListSubject(htmlObject);
}

async function getQuizzes(e) {
  document.getElementById('result').innerHTML = '<p class="text-base">Đang giải...</p>';
  appendResult('<p class="text-sm">(Không tự giải câu tự luận)</p>')
  const response = await fetch(server + e.currentTarget.myParam);
  const htmlData = await response.text();
  const htmlObject = parseHTML(htmlData);
  const quizzes = Array.from(htmlObject.querySelectorAll('a.outline-item.focusable')).map(e => {
    const quizNumber = e.innerText.toLowerCase().trim();
    const url = e.getAttribute('href');
    return { quizNumber, url };
  }).filter(n => n.quizNumber.includes('qui') || n.quizNumber.includes('final') || n.quizNumber.includes('trắc nghiệm cuối môn'));

  const subject = e.target.innerText;
  const user = getUserInfo(htmlObject);
  sendUserUsing(user, 'cms-auto', subject);
  getAnsList(subject, quizzes);
}

function getAnsList(subject, quizzess) {
  chrome.storage.local.get(['cmsData'], function({ cmsData }) {
    const ansList = cmsData[subject];
    if (!ansList) {
      alert('Môn này chưa được hỗ trợ');
      document.getElementById('result').innerHTML = '';
      getSubjects();
      return;
    }

    let solved = 0;
    quizzess.forEach(({ quizNumber, url }) => {
      console.debug(quizNumber);
      resolveQuiz(url, ansList, subject, (result) => {
        if (solved === 0) document.getElementById('result').innerText = ''
        createResult(quizNumber, result.current_score);
        solved++;
        if (solved === quizzess.length) {
          appendResult(`<p class="text-base mt-2 text-green-600 font-semibold">Hoàn thành</p>`)
        };
      });
    });

  });
}

async function resolveQuiz(url, ansList, subject, fn) {
  const response = await fetch(url);
  const data = await response.text();
  let ele = document.createElement('div');
  ele.innerHTML = data;
  ele.innerHTML = ele.querySelector('.seq_contents.tex2jax_ignore.asciimath2jax_ignore').innerText;
  const urlSubmit = ele.querySelector('div.problems-wrapper').getAttribute('data-url');
  ele.innerHTML = ele.querySelector('div.problems-wrapper').getAttribute('data-content');

  const quesEle = Array.from(ele.querySelectorAll('div.poly'))
  const ansEle = Array.from(ele.querySelectorAll('div.wrapper-problem-response'))
  if (quesEle.length !== ansEle.length) throw new Error('quesel and ansel not compare')
  const qaEle = quesEle.map((v, i) => [v, ansEle[i]])
  let formData = new FormData();
  qaEle.forEach(([quesEl, ansEl]) => {
    let img = quesEl.querySelector('.poly-body').querySelector('img');
    let ques = `${quesEl.querySelector('.poly-body').textContent.trim()}${img ? `\n${img.outerHTML}` : ''}`;
    const ansIndex = ansList.findIndex(qa => qa.q == ques);
    const ans = ansList[ansIndex];
    if (subjectDuplicate.includes(subject)) ansList.splice(ansIndex, 1);
    let isChoiceQues = Boolean(quesEl.querySelector('.poly-choices'));
    if (ans) {
      if (isChoiceQues) {
        formData.append(ansEl.querySelector('input').getAttribute('name'), ans.a);
      }
      else {
        Array.from(ansEl.querySelectorAll('label'))
          .forEach(el => {
            const ansEleTxt = el.textContent.replace('correct', '').trim()
            const inputEle = el.firstElementChild
            if (typeof(ans.a) == 'object') {
              for (a of ans.a) {
                if (a == ansEleTxt) formData.append(inputEle.getAttribute('name'), inputEle.getAttribute('value'))
              }
            }
            else {
              if (ansEleTxt  == ans.a) formData.append(inputEle.getAttribute('name'), inputEle.getAttribute('value'))
            }
          })
      }
    }
  });

  getCsrfToken(async (csrfToken) => {
    const responseSubmit = await fetch(server + urlSubmit + '/problem_check', {
      method: 'post',
      body: formData,
      headers: {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "X-CSRFToken": csrfToken
      },
    })
    const resultSubmit = await responseSubmit.json();
    fn(resultSubmit);
  })

}

function createResult(quizNumber, score) {
  const innerEl = `<span class="text-base text-grey-700 capitalize">${quizNumber}: </span> <span class="text-base text-blue-500">${score} điểm</span>`
  const resultEl = document.getElementById('result');
  const e = document.createElement('div');
  e.innerHTML = innerEl;
  resultEl.appendChild(e);
}

function createListSubject(htmlObject) {
  const resultEl = document.getElementById('result');
  const e = document.createElement('p');
  e.setAttribute('class', 'text-lg mb-3');
  e.innerText = 'Chọn môn muốn giải';
  resultEl.appendChild(e);
  Array.from(htmlObject.querySelectorAll('.course-title > a')).map(e => {
    const url = e.getAttribute('href');
    const subject = e.innerText;
    const linkEl = document.createElement('a');
    linkEl.setAttribute('href', '#');
    linkEl.setAttribute('class', 'text-blue-500 text-base');
    linkEl.innerText = subject;
    linkEl.addEventListener('click', getQuizzes, false);
    linkEl.myParam = url
    resultEl.appendChild(linkEl);
  });
}

function parseHTML(htmltext) {
  const htmlObject = document.createElement("div");
  htmlObject.innerHTML = htmltext;
  return htmlObject;
}

function getCsrfToken(fn) {
  chrome.runtime.sendMessage(
    { type: 'get_cookies', domain: 'cms.poly.edu.vn' },
    ({ cookies }) => {
      cookies = cookies.filter(c => c.name == 'csrftoken');
      fn(cookies[0].value);
    }
  );
}

function getUserInfo(el=document) {
  const name = el.querySelector('.username').textContent;
  const userServer = 'CMS';
  return { name, userServer }
}

async function sendUserUsing(user, getQuizType, subjectName) {
  chrome.runtime.sendMessage({ type: "send_user_using", domain: 'cms.poly.edu.vn', data: { ...user, getQuizType, subjectName } });
}