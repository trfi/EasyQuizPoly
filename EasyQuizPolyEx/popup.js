document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('resolveCmsBtn').addEventListener('click', getSubjects);
  document.getElementById('resolveLmsBtn').addEventListener('click', () => {
    alert('Bắt đầu làm bài như bình thường tool sẽ tự giải đáp án')
  });
  // var btn = document.getElementById('btn');
  // btn.addEventListener('click', function() {
  //   chrome.tabs.executeScript({
  //         file: 'script.js'
  //   });
  //   chrome.windows.create({url: 'aqlist.html', type: 'panel', width: 600, height: screen.height}, function(window) {
  //   });
  // })
});

var server = 'https://cms.poly.edu.vn';
var subjectDuplicate = ['LẬP TRÌNH JAVA 6 (UDPM.JAVA)'];
var subjectSupport = ['DỰ ÁN MẪU (UDPM.JAVA)', 'LẬP TRÌNH JAVA 6 (UDPM.JAVA)', 'CHÍNH TRỊ', 'PHÁP LUẬT', 'TIN HỌC']

function appendResult(inner) {
  let elChild = document.createElement('div');
  elChild.innerHTML = inner;
  document.getElementById('result').appendChild(elChild);
}

function appendListResult(inner) {
  let elChild = document.createElement('div');
  elChild.innerHTML = inner;
  document.getElementById('listResult').appendChild(elChild);
}

async function getSubjects() {
  document.getElementById('resolveCmsBtn').disabled = true;
  document.getElementById('result').classList.remove('hidden');
  document.getElementById('menu').classList.add('mb-8');
  document.getElementById('result').innerHTML = `
  <div class="sk-circle">
  <div class="sk-circle1 sk-child"></div>
  <div class="sk-circle2 sk-child"></div>
  <div class="sk-circle3 sk-child"></div>
  <div class="sk-circle4 sk-child"></div>
  <div class="sk-circle5 sk-child"></div>
  <div class="sk-circle6 sk-child"></div>
  <div class="sk-circle7 sk-child"></div>
  <div class="sk-circle8 sk-child"></div>
  <div class="sk-circle9 sk-child"></div>
  <div class="sk-circle10 sk-child"></div>
  <div class="sk-circle11 sk-child"></div>
  <div class="sk-circle12 sk-child"></div>
  </div>`

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

function createListSubject(htmlObject) {
  const resultEl = document.getElementById('result');

  const ulEl = document.createElement('ul');
  ulEl.setAttribute('class', 'divide-y divide-gray-300 w-full');

  const titleEl = document.createElement('li');
  titleEl.setAttribute('class', 'pb-3 font-light text-lg');
  titleEl.innerText = 'Chọn môn muốn giải';
  ulEl.appendChild(titleEl);

  Array.from(htmlObject.querySelectorAll('.course-title > a')).forEach(e => {
    const subject = e.innerText;
    if (!subjectSupport.includes(subject)) return;
    const url = e.getAttribute('href');
    const liEl = document.createElement('li');
    liEl.setAttribute('class', 'py-1.5 hover:bg-gray-50');
    const linkEl = document.createElement('a');
    linkEl.setAttribute('href', '#');
    linkEl.setAttribute('class', 'text-pink-500 text-sm');
    linkEl.innerText = subject;
    linkEl.addEventListener('click', getQuizzes, false);
    linkEl.myParam = url;
    liEl.appendChild(linkEl);
    ulEl.appendChild(liEl);
  });

  resultEl.innerHTML = '';
  resultEl.appendChild(ulEl);

}

async function getQuizzes(e) {

  document.getElementById('result').innerHTML = `<div id="myProgress"><div id="myBar"></div></div>`;
  // document.getElementById('result').innerHTML = '<p class="text-base">Đang giải...</p>';
  // appendResult('<p class="text-sm">(Không tự giải câu tự luận)</p>')
  
  const response = await fetch(server + e.currentTarget.myParam);
  const htmlData = await response.text();
  const htmlObject = parseHTML(htmlData);
  document.getElementById("myBar").style.width = 13 + "%";
  const quizzes = Array.from(htmlObject.querySelectorAll('a.outline-item.focusable')).map(e => {
    const quizNumber = e.innerText.toLowerCase().trim();
    const url = e.getAttribute('href');
    return { quizNumber, url };
  }).filter(n => n.quizNumber.includes('qui') || n.quizNumber.includes('final') || n.quizNumber.includes('trắc nghiệm cuối môn'));

  const subject = e.target.innerText;
  const user = getUserInfo(htmlObject);
  document.getElementById("myBar").style.width = 17 + "%";
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

    document.getElementById("myBar").style.width = 19 + "%";
  
    const ulEl = document.createElement('ul');
    ulEl.setAttribute('id', 'listResult')
    ulEl.setAttribute('class', 'flex flex-col')
    document.getElementById('result').appendChild(ulEl);

    let solved = 0;
    let width = 19;
    const quizzesLength = quizzess.length;

    quizzess.forEach(({ quizNumber, url }) => {
      console.debug(quizNumber);
      resolveQuiz(url, ansList, subject, (result) => {
        if (solved === 0) document.getElementById('listResult').classList.add('mt-3');
        createResult(quizNumber, result.current_score);
        solved++;
        width += 81 / quizzesLength;
        document.getElementById("myBar").style.width = width + "%";
        if (solved === quizzesLength) {
          document.getElementById("myBar").style.width = 100 + "%";
          appendListResult(`<p class="text-base mt-2 text-green-600 font-semibold">Hoàn thành</p>`);
          document.getElementById('resolveCmsBtn').disabled = false;
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
  const innerEl = `<span class="text-base text-grey-700 capitalize">${quizNumber}: </span> <span class="text-base text-blue-500">${score} điểm</span>`;
  const e = document.createElement('div');
  e.innerHTML = innerEl;
  document.getElementById('listResult').appendChild(e);
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