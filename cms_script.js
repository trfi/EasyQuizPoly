var courseName = document.querySelector('.course-name').textContent;

if (courseName) {
  chrome.storage.local.get(['cmsData'], function(data) {
    [...document.querySelectorAll('.poly-body')].map(quesEl => {
      let ques = quesEl.textContent.trim()
      let ans = data.cmsData[courseName].find(qa => qa.q === ques).a
      Array.from(quesEl.parentNode.nextElementSibling.firstChild.firstElementChild.children)
        .find(el => el.textContent.includes(ans)).firstElementChild.click()
    })
    document.querySelector('button[type="button"]').disabled = false
    setTimeout(() => {
      alert('Đã chọn xong các đáp án đúng. Submit nào!')
    }, 500);
  });
}

else alert('Vào trang làm bài xong chọn Giải đáp án nhé bạn!')
