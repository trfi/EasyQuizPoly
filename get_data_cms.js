let ques, ans
ques = [...document.querySelectorAll('.poly-body')].map(x => x.innerText.trim())
ans = [...document.querySelectorAll('.choicegroup_correct')].map(x => x.innerText.replace('\ncorrect','').trim())
JSON.stringify(ques.map((q,i) => ({[q]: ans[i]})))

// Get QA
ques = [...document.querySelectorAll('.poly-body')].map(x => x.textContent.trim())
ans = [...document.querySelectorAll('.choicegroup_correct')].map(x => x.textContent.replace('correct','').trim())
copy(JSON.stringify(ques.map((q,i) => ({q: q, a: ans[i]}))).replace('[','').replace(']',''))

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

function findAnswer({ques, ans}) {
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



findElementByText(findElementByText(document.querySelectorAll('pre.poly-body'),'Bản chất của Nhà nước CHXHCN Việt Nam là:'),'Của dân, do dân và vì dân')