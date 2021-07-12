var apiUrl = "https://tr-fi2.netlify.app/api/quizpoly/lms";
var version = chrome.runtime.getManifest().version;
var quizId = getQuizId();
var currentUrl = window.location.href;
var sequence = getSequence();
var server = window.location.origin;
// var quizId = /(ref_id=|tst_)([^&]+)/.exec(currentUrl)[2];
var canNotGetAnswerMessage = `Không lấy được đáp án trực tiếp
Có thể do giảng viên tắt xem chi tiết đáp án
Tool sẽ tự động lấy đáp án có sẵn nếu có. Vui lòng đợi`;
var canNotGetAvailableAnswerMessage = `Hiện chưa có đáp án cho môn học này, phải tự làm rồi 😭`;


function decodeEntities(str) {
  let element = document.createElement("div");
  if (str && typeof str === "string") {
    // strip script/html tags
    str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gim, "");
    str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gim, "");
    element.innerHTML = str;
    str = element.textContent;
    element.textContent = "";
  }
  return str;
}

function parseHTML(htmltext) {
  const htmlObject = document.createElement("div");
  htmlObject.innerHTML = htmltext;
  return htmlObject;
}

function getSequence() {
  try {
    return parseInt(/sequence=([0-9]{1,2})/.exec(currentUrl)[1]);
  } catch (e) {
    return 1;
  }
}

async function sendHtml(note) {
  try {
    const html = document.body.innerHTML
      .replaceAll("\n", "")
      .replaceAll("\t", "");
    const response = await fetch(apiUrl + "/html", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ note: `${version}: ${note}`, html }),
    });
    const result = await response.json();
    console.debug(result.message);
  } catch (err) {
    console.debug(err);
  }
}

function getQuizNumber() {
  try {
    let ele = document.querySelector(".ilAccAnchor");
    if (!ele) ele = document.querySelector("#kioskTestTitle");
    return Number(ele.textContent.replace(/[^0-9]/g, ""));
  } catch (e) {
    sendHtml(`getQuizNumber: ${e}`);
    return 0;
  }
}

function getSubject() {
  let subject;
  try {
    subject = document
      .querySelector("ol > li:nth-child(5) > a")
      .textContent.split("-");
    if (subject.length == 1) {
      subject = document
        .querySelector("ol > li:nth-child(5) > a")
        .textContent.split("_");
    }
    if (subject.length == 1) {
      subject = document
        .querySelector("ol > li:nth-child(6) > a")
        .textContent.split("-");
    }
    if (subject.length == 1) {
      subject = document
        .querySelector("ol > li:nth-child(6) > a")
        .textContent.split("_");
    }
    if (subject.length == 1) {
      subject = document
        .querySelector("ol > li:nth-child(7) > a")
        .textContent.split("-");
    }
    if (subject.length == 1) {
      subject = document
        .querySelector("ol > li:nth-child(7) > a")
        .textContent.split("_");
    }
    return subject[1].trim();
  } catch (error) {
    console.debug(error);
    return "";
  }
}

function getQuizId() {
  const url = new URL(window.location.href);
  return url.searchParams.get("ref_id");
}

function finishQuiz(addQuizSelfFn, subjectName, passTime) {
  let ele = document.querySelector("a[data-nextcmd=finishTest]");

  if (!ele) ele = document.querySelector(".navbar-form:nth-of-type(4) > a");

  if (!ele) {
    // sendHtml("Auto answer: can not find element to add event click finish quiz");
    return;
  }

  // let ele2 = ele.cloneNode(true);
  // ele.setAttribute('href', '#');
  // ele.parentNode.appendChild(ele2);

  ele.addEventListener("click", () => {
    addQuizSelfFn();
    chrome.runtime.sendMessage({
      type: "finish_quiz",
      domain: window.location.origin,
      quizId: getQuizId(),
      passTime,
      subjectName
    });
  });
}

async function getPassTimes(quizId) {
  try {
    const response = await fetch(
      `${server}/ilias.php?ref_id=${quizId}&cmd=outUserResultsOverview&cmdClass=iltestevaluationgui&cmdNode=q4:ll:vx&baseClass=ilrepositorygui`,
      {
        method: "GET",
      }
    );
    const data = await response.text();
    const htmlObject = parseHTML(data);
    return parseInt(
      htmlObject.querySelector(".ilTableFootLight").textContent.split(" ").pop()
    );
  } catch (error) {
    console.debug(error);
    return 0;
  }
}

function writeHTML(listQA, name) {
  console.debug(listQA);
  let html = `<table>`;
  let i = 1;
  for (let QA of listQA) {
    html += `<tr><td style='width:8%; text-align:center';>${i++}</td><td><img style='width:24px;' src='data:image/png;base64,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'></td><td>${
      QA.ques
    }</td></tr>
        <tr><td></td><td><img style='width:23px;' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKpSURBVGhD7ZlL6E1BAIevZx55RKKQlIU8NjZ2iiyUBRaSx4oFlkpRVuxZeC8VNnaUKGWBBRaKUkoSsSDvKCJ83+jUf3Gd171n7tw6X31lxsw58/ufe2bOOdNpaWnpiYV4Ap/hT/wT2a94C3fjeKzFHvyB2UEN8iGin3FkqMe4CCuxF+38G0/jchyFsZmEG/AhOp5XOA9L4c/pOxpiixUJMAGvomGuWFGG42iHM6GUDjPwPTq2pVYU4Y1tY39OqeHE49gOhFIOo9GbWgdxTxSxCw1yNpRymIY2/BRK6bENHd/FUMqhDRKJNkhspuLEf//sylAEGYMuevdwjhVdGIogp9Bzv8X5VnQh+SDZs903XGnFf0g6yDr8hT7bbbUih2SD+BjkuTznISsKSDLILHyOnu8ClnkkSi6IU+xd9Fx3sOzbXyNBnPPr4F/eK+B5nqJXpix9D+L0+BL3hVI1DmN2jiVWVKDvQXagM41tj1hRku3o7ORrwhorKtLIT8upMvs44QtP0c3q+pC1d92oQ2M3+3p0EbPPeRyL3fDrhyu27Y5aUZPGgsgqtL39LqMfCkbiMR9h9v8+U9Wl0SCyAt+gfW/iFBQHfQOtN8xk7IXGg8hifIH2v48z0W9ilit9j8ohShBZgE/QY2T3RNGDYBWiBZHZ+AA9jlPtJuwXUYPIdLyNB0Opf0QPIrW/nucwkCBN0AZJjdJBXLBs+CWU0iML4uNQIW532dhNltTwtcGxHQulApw2bbwxlNLiOjo2XyMKce/Qxm53pXRV1qILrHuLrlOFjEM3Hg3jl79SnRpmNb5Dx7TfirL4/vAa7eh210nciZsj6v6l98Q19Eo4lnNYeQNqLrrx6AEG7Uf0SvS0i7YM3bNzc/RSRF0rnJ18z0/h593SMsR0On8BkyhnJM9trxIAAAAASUVORK5CYII='></td><td>${
          QA.ans
        }</td></tr>`;
  }
  html += "</table>\n";
  chrome.runtime.sendMessage(
    { type: "quiz_data", html, name },
    function (response) {
      console.debug(response.farewell);
    }
  );
}

async function getUserInfo() {
  const path =
    server == "https://lms-ptcd.poly.edu.vn"
      ? "ilias.php?cmdClass=ilpersonalprofilegui&cmdNode=ad:h0&baseClass=ilPersonalDesktopGUI"
      : "ilias.php?cmdClass=ilpersonalprofilegui&cmdNode=oq:or&baseClass=ilPersonalDesktopGUI";
  const url = `${server}/${path}`;
  try {
    const response = await fetch(url, {
      method: "GET",
    });
    const htmlData = await response.text();
    const htmlObject = parseHTML(htmlData);
    const name = htmlObject.querySelector("#usr_firstname").value;
    const studentCode = htmlObject.querySelector("#hiddenne_un").value;
    const term = htmlObject
      .querySelector("#usr_lastname")
      .value.replace("(", "")
      .replace(")", "");
    const userServer = htmlObject
      .querySelector("#hiddenne_dr")
      .value.replace("USER_", "");
    return { name, studentCode, term, userServer };
  } catch (e) {
    console.debug(e);
    return {};
  }
}

async function getQuesId(quizId, passTime) {
  const url = `${server}/ilias.php?ref_id=${quizId}&pass=${passTime}&cmd=outUserPassDetails&cmdClass=iltestevaluationgui&cmdNode=q4:ll:vx&baseClass=ilRepositoryGUI`;
  const rx = /evaluation=([0-9]{6})&amp;cmd/g;
  const response = await fetch(url, {
    method: "GET",
  });
  const data = await response.text();
  let listQuesId = [];
  while ((m = rx.exec(data)) !== null) {
    listQuesId.push(m[1]);
  }
  return listQuesId;
}

function getQues(htmlObject = document) {
  let ele = document.createElement("div");
  ele.innerHTML =  htmlObject.querySelector(".ilc_question_Standard").innerHTML.split("<table")[0]
  let img = ele.querySelector('img')
  return `${ele.innerText.replace(/[^\S\r\n]{2,}/g, ' ').trim()}${img ? `\n${img.outerHTML}` : ''}`
}

function getTotalQues() {
  const splitPoint = (txt) => txt.split(" (")[0].split("of ")[1];
  let totalQues;
  let ele;
  ele = document.querySelector(".small.text-muted");
  if (ele) totalQues = splitPoint(ele.textContent);
  if (!totalQues) {
    ele = document.querySelector(".ilc_page_title_PageTitle");
    if (ele) totalQues = splitPoint(ele.textContent);
  }
  if (totalQues) return Number(totalQues);
  else return 10;
}

async function getQA(quizId, subjectName, ques_id = []) {
  let ques = "";
  let ans = "";
  try {
    const url = `${server}/ilias.php?ref_id=${quizId}&evaluation=${ques_id}&cmd=outCorrectSolution&cmdClass=iltestevaluationgui&cmdNode=q4:ll:vx&baseClass=ilRepositoryGUI`;
    const response = await fetch(url, {
      method: "GET",
    });
    const htmlData = await response.text();
    const htmlObject = parseHTML(htmlData);

    try {
      ques = getQues(htmlObject);
    } catch (e) {}
    if (!ques) sendHtml(`getQA: ques null - ${subjectName}`, htmlData);
    else if (ques == "Câu hỏi" || ques == "Question")
      sendHtml("getQA: ques = Câu hỏi | Question", htmlData);
    try {
      ans = htmlObject
        .querySelector(
          ".ilc_question_Standard:nth-of-type(4) > table > tbody > tr > td input:checked"
        )
        .parentNode.nextElementSibling.textContent.trim();
      if (!ans) {
        ans = htmlObject
          .querySelector(
            ".ilc_question_Standard:nth-of-type(4) > table > tbody > tr > td input:checked"
          )
          .parentNode.nextElementSibling.innerHTML
          .replaceAll("\n", "")
          .replaceAll("\t", "")
          .replace("<span>", "")
          .replace("</span>", "");
      }
    } catch (e) {}
    if (!ans) sendHtml(`getQA: ans null - ${subjectName}`, htmlData);
    return { ques, ans };
  } catch (err) {
    console.error(err);
    sendHtml(`getQA: error: ${err}`, htmlData);
    return { ques, ans };
  }
}

async function addQuiz(subjectName, quizzes) {
  if (!subjectName) {
    sendHtml("addQuiz: subjectName null");
    return;
  }
  chrome.runtime.sendMessage({ type: 'add_quiz', data: { subjectName, quizzes }})
}

async function getQuizAvailable(subject) {
  try {
    if (!subject) {
      chrome.runtime.sendMessage(
        { type: 'get_cookies', domain: window.location.host },
        async (res) => {
          sendHtml(
            `getQuizAvailable: subjectName null - ${
              window.location.href
            } - ${JSON.stringify(res.cookies)}`
          );
        }
      );
      return;
    }
    const response = await fetch(`${apiUrl}/quiz`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subject }),
    });
    const result = await response.json();
    return result.data.quizzes;
  } catch (err) {
    console.debug(err);
    return [];
  }
}

function textAnswerNullDebug() {
  if (qa && answerType == "direct") {
    sendHtml(`Auto answer: Can not get answer ${answerType} 
listQA: ${JSON.stringify(listQA)}`);
  } else if (qa && (answerType = "available")) {
    sendHtml(
      `Auto answer: Can not get answer ${answerType} 
subject: ${subjectName}`
    );
  }
}

function canNotFindElementAnswerDebug() {
  sendHtml(
    `Auto answer: ${subjectName} - ${answerType} - Can not find answer element: ${textAnswer}, answerElement: ${
      answerElement?.textContent
    } 
sequence: ${sequence} 
${answerType == "direct" ? JSON.stringify(listQA) : ""}`
  );
}


async function sendUserUsing(user, getQuizType, subjectName) {
  chrome.runtime.sendMessage({ type: "send_user_using", domain: window.location.host, data: {...user, getQuizType, subjectName, quizNumber: getQuizNumber()} });
}

function autoQuiz(listQA, answerType, passTime, subjectName) {
  let totalQues = getTotalQues();
  let question = getQues();
  let textAnswer = "";
  console.debug("totalQues", totalQues);
  if (!subjectName) subjectName = getSubject();
  console.debug(answerType);
  console.debug(listQA);

  try {
    // Tự trả lời
    // if (!listQA || !listQA.length || !answerType) {
    //  && listQA.length < 90
    // answerType == "available" || answerType == "self_doing"
    if (answerType == "available" || answerType == "self_doing") {
      let isCheckbox = Boolean(document.querySelector("input[type=checkbox]"));
      let ansChoosed = null;
      Array.from(
        document.querySelectorAll(".nobackground.ilClearFloat tr")
      ).map((e) => {
        try {
          e.addEventListener("click", (event) => {
            let labelEle = event.path[2].querySelector("td > label");
            let ans = labelEle.textContent.trim();
            if (!ans)
              ans = labelEle.innerHTML
                .replaceAll("\n", "")
                .replaceAll("\t", "")
                .replace("<span>", "")
                .replace("</span>", "");
            if (isCheckbox) {
              if (ansChoosed == null) ansChoosed = {};
              ansChoosed[labelEle.getAttribute("for")] = ans;
            } else ansChoosed = ans;
            console.debug(ansChoosed);
          });
        } catch (e) {
          sendHtml(
            `Auto answer: Add event click to answer error: ${currentUrl}: ${e}`
          );
        }
      });

      function addQuizSelf(quizSelf) {
        if (ansChoosed && typeof(ansChoosed) == 'object') ansChoosed = Object.values(ans);
        chrome.storage.local.get(['quizSelf'], ({ quizSelf }) => {
          quizSelf[sequence] = { ques: question, ans: ansChoosed };
          chrome.storage.local.set({ quizSelf });
          console.debug(quizSelf);
        })
      }
      if (sequence == totalQues) {
        finishQuiz(addQuizSelf, subjectName, passTime);
      } else {
        if (!currentUrl.includes("outQuestionSummary")) {
          try {
            document
              .querySelector("#nextbutton")
              .addEventListener("click", addQuizSelf);
            document
              .querySelector("#bottomnextbutton")
              .addEventListener("click", addQuizSelf);
          } catch (e) {
            // sendHtml(`Auto answer: Can not add event click to next button: ${e} - ${window.location.href} - totalQues: ${totalQues}`)
          }
        }
      }
    }
    if (!listQA || !listQA.length) return;
    // Có đáp án
    let qa = null;
    if (answerType == "direct") textAnswer = listQA[sequence - 1].ans;
    else if (answerType == "available") {
      const ques = getQues();
      qa = listQA.find((q) => {
        let qaQues = q.ques;
        return qaQues === ques;
      });
      if (qa) textAnswer = qa.ans;
    }
    console.debug("textAnswer", textAnswer);
    if (!textAnswer) {
      console.debug("Can not get text answer");
    } else {
      if (sequence < totalQues) {
        document.querySelector("#nextbutton").style.display = "none";
        document.querySelector("#bottomnextbutton").style.display = "none";
      }
      setTimeout(() => {
        let answerLabelEles = document.querySelectorAll(".middle>label");
        if (!answerLabelEles.length)
          answerLabelEles = document.querySelectorAll(".middle>span");
        let answerElement = [...answerLabelEles].find(
          (el) => el.textContent.trim() == textAnswer
        );
        if (answerElement) {
          answerElement.dispatchEvent(new MouseEvent("click"));
        }
        else {
          console.debug("Can not find element answer");
        }
      }, 500);
      if (sequence < totalQues) {
        setTimeout(() => {
          document.querySelector("#nextbutton").style.display = "";
          document.querySelector("#bottomnextbutton").style.display = "";
        }, 1000);
      }
    }
    if (sequence == totalQues) {
      chrome.storage.local.remove("listQA", function () {
        console.debug("Remove listQA");
      });
    }
  } catch (e) {
    sendHtml(`Đã xảy ra lỗi khi tự điền đáp án: ${e}`);
  }
}

function setAutoQuizData(answerType, passTime, listQA = []) {
  chrome.storage.local.set({ answerType, passTime, listQA }, function () {
    console.debug("set auto quiz data");
  });
}

async function resolveQuiz(subjectName=null) {
  if (!subjectName) subjectName = getSubject();

  const [passTime, user] = await Promise.all([
    getPassTimes(quizId),
    getUserInfo(),
  ]);

  const listQuesId = await getQuesId(quizId, passTime);

  let listQA = [];
  if (listQuesId.length) {
    const QA_promise = listQuesId.map((qid) => getQA(quizId, subjectName, qid));
    listQA = await Promise.all(QA_promise).catch((reason) =>
      alert(
        `Đã có lỗi xảy ra, vui lòng thử lại hoặc liên hệ tác giả để báo lỗi: ${reason}`
      )
    );
  }

  if (listQA.length) {
    setAutoQuizData("direct", passTime, listQA);
    writeHTML(listQA, user.name);
    chrome.runtime.sendMessage({ type: "focus_quiz_popup" });
    addQuiz(subjectName, listQA);
    sendUserUsing(user, "direct", subjectName);
    if (currentUrl.includes("&sequence=")) window.location.reload();
  } else {
    listQA = await getQuizAvailable(subjectName);
    if (listQA.length) {
      setAutoQuizData("available", passTime, listQA);
      alert(`Đã lấy được ${listQA.length} câu hỏi. Làm bài thôi 😍`);
      writeHTML(listQA, user.name);
      chrome.runtime.sendMessage({ type: "focus_quiz_popup" });
      sendUserUsing(user, "available", subjectName);
      if (currentUrl.includes("&sequence=")) window.location.reload();
    } else {
      alert(canNotGetAvailableAnswerMessage);
      setAutoQuizData("self_doing", passTime);
      sendUserUsing(user, "self_doing", subjectName);
      chrome.runtime.sendMessage({ type: "close_quiz_popup" });
    }
  }
}

function main({ listQA, answerType, passTime, subjectName, isStart, execute }) {
  if (execute) {
    chrome.runtime.sendMessage({ type: "open_quiz_popup" });
    resolveQuiz();
    chrome.storage.local.set({ execute: false });
    return;
  }
  if (isStart) {
    resolveQuiz(subjectName);
    chrome.storage.local.set({ isStart: false });
  }
  autoQuiz(listQA, answerType, passTime, subjectName);
}

chrome.storage.local.get(
  ["subjectName", "answerType", "passTime", "listQA", "isStart", "execute"],
  main
);
