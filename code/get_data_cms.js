let ques, ans
ques = [...document.querySelectorAll('.poly-body')].map(x => x.innerText.trim())
ans = [...document.querySelectorAll('.choicegroup_correct')].map(x => x.innerText.replace('\ncorrect', '').trim())
JSON.stringify(ques.map((q, i) => ({
  [q]: ans[i]
})))

// Get QA
ques = [...document.querySelectorAll('.poly-body')].map(x => {
  let img = x.querySelector('img');
  return `${x.textContent.trim()}${img ? `\n${img.outerHTML}` : ''}`
});
ans = [...document.querySelectorAll('.choicegroup_correct')].map(x => x.textContent.replace('correct', '').trim())
copy(JSON.stringify(ques.map((q, i) => ({
  q: q,
  a: ans[i]
}))).replace('[', '').replace(']', ''))

// JSON remove duplicate object
data = [{}]
data1 = data.filter((thing, index) => {
  return index === data.findIndex(obj => {
    return JSON.stringify(obj) === JSON.stringify(thing);
  });
});
console.log(data1)
copy(JSON.stringify(data1))

////

function findAnswer({
  ques,
  ans
}) {
  let quesEl
  quesEl = Array.from(document.querySelectorAll('pre.poly-body'))
    .find(el => el.textContent.trim() === ques)
  Array.from(quesEl.parentNode.nextElementSibling.firstChild.firstElementChild.children)
    .find(el => el.textContent.includes(ans)).firstElementChild.click()
}

qa.map(x => findAnswer(x))


[...document.querySelectorAll('.poly-body')].map(quesEl => {
  ques = quesEl.textContent.trim()
  ans = QAs.find(qa => qa.q === ques).a
  Array.from(quesEl.parentNode.nextElementSibling.firstChild.firstElementChild.children)
    .find(el => el.textContent.includes(ans)).firstElementChild.click()
})



findElementByText(findElementByText(document.querySelectorAll('pre.poly-body'), 'Bản chất của Nhà nước CHXHCN Việt Nam là:'), 'Của dân, do dân và vì dân')


// Get listqa of subject
urls = Array.from(document.querySelectorAll('a.outline-item.focusable')).map(e => {
  const quizNumber = e.innerText.toLowerCase().trim();
  const url = e.getAttribute('href');
  return { quizNumber, url }
}).filter(n => n.quizNumber.includes('qui') || n.quizNumber.includes('final') || n.quizNumber.includes('trắc nghiệm cuối môn'));

let quizzes = []

urls.map(async ({ quizNumber, url }) => {
  const response = await fetch(url);
  const data = await response.text();
  let ele = document.createElement('div');
  ele.innerHTML = data
  ele.innerHTML = ele.querySelector('.seq_contents.tex2jax_ignore.asciimath2jax_ignore').innerText
  ele.innerHTML = ele.querySelector('div.problems-wrapper').getAttribute('data-content');

  const quesEle = Array.from(ele.querySelectorAll('div.poly'))
  const ansEle = Array.from(ele.querySelectorAll('div.wrapper-problem-response'))
  if (quesEle.length !== ansEle.length) throw new Error('quesel and ansel not compare')
  qaEle = quesEle.map((v, i) => [v, ansEle[i]])

  const listQA = qaEle.map(([quesEl, ansEl]) => {
    const trimAns = t => t.replace('correct', '').trim();
    let img = quesEl.querySelector('.poly-body').querySelector('img');
    let ques = `${quesEl.querySelector('.poly-body').textContent.trim()}${img ? `\n${img.outerHTML}` : ''}`;
    let ans = '';
    const inputChecked = ansEl.querySelectorAll('input[checked=true]');
    if (inputChecked && inputChecked.length) {
      if (inputChecked.length > 1) {
        ans = Array.from(inputChecked).map(i => trimAns(i.parentNode.textContent))
      } else ans = trimAns(inputChecked[0].parentNode.textContent)
    }
    else {
      const correctChoice = ansEl.querySelector('div.correct > input')
      if (correctChoice) { ans = correctChoice.getAttribute('value') }
    }
    return {
      q: ques,
      a: ans
    }
  }).filter(qa => (qa.q && qa.a))

  console.log(quizNumber, listQA)
  quizzes.push(...listQA)

});


///////////

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

url = urls[0].getAttribute('href');
response = await fetch(url);
data = await response.text();
ele = document.createElement('div');
ele.innerHTML = data
ele.innerHTML = ele.querySelector('.seq_contents.tex2jax_ignore.asciimath2jax_ignore').innerText
urlSubmit = ele.querySelector('div.problems-wrapper').getAttribute('data-url');
ele.innerHTML = ele.querySelector('div.problems-wrapper').getAttribute('data-content');


quesEle = Array.from(ele.querySelectorAll('div.poly'))
ansEle = Array.from(ele.querySelectorAll('div.wrapper-problem-response'))
if (quesEle.length !== ansEle.length) throw new Error('quesel and ansel not compare')
qaEle = quesEle.map((v, i) => [v, ansEle[i]])
formData = new FormData();
qaEle.forEach(([quesEl, ansEl]) => {
  let img = quesEl.querySelector('.poly-body').querySelector('img');
  let ques = `${quesEl.querySelector('.poly-body').innerText.trim()}${img ? `\n${img.outerHTML}` : ''}`;
  let ans = ansList.find(qa => qa.q == ques);
  let isChoiceQues = Boolean(quesEl.querySelector('.poly-choices'))
  if (ans) {
    if (isChoiceQues) {
      formData.append(ansEl.querySelector('input').getAttribute('name'), ans.a)
    }
    else {
      Array.from(ansEl.querySelectorAll('label'))
        .forEach(el => {
          const ansEleTxt = el.innerText.replace('correct', '').trim()
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

response = await fetch(urlSubmit + '/problem_check', {
  method: 'post',
  body: formData,
  headers: {
    "X-CSRFToken": getCookie('csrftoken')
  },
})
result = await response.json();
console.log('score:', result.current_score)

/////////

// get list answer question correct
ansList = Array.from(document.querySelectorAll('div.poly:not(.poly-input)')).map(e => {
  const trimAns = t => t.replace('\ncorrect', '').trim()
  const ques = e.querySelector('.poly-body').innerText.trim()
  let ans = ''
  const inputChecked = e.nextElementSibling.querySelectorAll('input[checked=true]')
  if (inputChecked.length) {
    if (inputChecked.length > 1) {
      ans = Array.from(inputChecked).map(i => trimAns(i.parentNode.innerText))
    } else ans = trimAns(inputChecked[0].parentNode.innerText)
  }
  return {
    q: ques,
    a: ans
  }
})

// chon dap an dung tu listqa dung
[...document.querySelectorAll('.poly-body')].forEach(quesEl => {
  let img = quesEl.querySelector('img');
  let ques = `${quesEl.innerText.trim()}${img ? `\n${img.outerHTML}` : ''}`;
  let ans = ansList.find(qa => qa.q == ques);
  if (ans) {
      Array.from(quesEl.parentNode.nextElementSibling.querySelectorAll('label'))
        .forEach(el => {
          ansEleTxt = el.innerText.replace('\ncorrect', '').trim()
          if (typeof(ans.a) == 'object') {
            for (a of ans.a) {
              if (a == ansEleTxt) el.firstElementChild.click()
            }
          }
          else {
            console.log(ansEleTxt, '-', ans.a)
            if (ansEleTxt  == ans.a) el.firstElementChild.click()
          }
        })
  }
});

// tao form data tu listqa dung
let formData = new FormData();
[...document.querySelectorAll('.poly-body')].forEach(quesEl => {
  let img = quesEl.querySelector('img');
  let ques = `${quesEl.innerText.trim()}${img ? `\n${img.outerHTML}` : ''}`;
  let ans = ansList.find(qa => qa.q == ques);
  if (ans) {
      Array.from(quesEl.parentNode.nextElementSibling.querySelectorAll('label'))
        .forEach(el => {
          const ansEleTxt = el.innerText.replace('\ncorrect', '').trim()
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
});