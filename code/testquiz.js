function getQues() {
  let ques = "";
  const quesEl = document.querySelector(".ilc_question_Standard > p");
  if (quesEl) ques = quesEl.innerText;
  else {
    ques = document
      .querySelector(".ilc_question_Standard")
      .innerHTML.split("<table")[0]
      .replaceAll("\t", "")
      .replaceAll("\n", "")
      .replaceAll("<br>", "\n")
      .trim();
  }
  return ques;
}

var apiUrl = "https://tr-fi.netlify.app/api/quizpoly/lms";
var subjectName = "Lập trình Java5"
response = await fetch(`${apiUrl}/${subjectName}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
result = await response.json(); 
listQA = result.data.quizzes;


ques = getQues().slice(0, 80);
qa = listQA.find((q) => {
qaQues = q.ques;
if (qaQues.charAt(0) === '"') qaQues = qaQues.replace('"', "");
return (
  qaQues.replaceAll("\n", "").replaceAll("\r", "").slice(0, 80) ===
  ques
);
});
if (qa) textAnswer = qa.ans;
console.log(textAnswer)

answerElement = [
  ...document.querySelectorAll(".middle>label"),
].find((el) => el.textContent.trim() == textAnswer);
if (answerElement)
  answerElement.dispatchEvent(new MouseEvent("click"));