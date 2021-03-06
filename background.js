const install_notication = `Nhấn follow hoặc kết bạn với tác giả để nhận cập nhật khi có bản mới nhé!
Mình có nhận làm hộ quiz CMS tất cả các môn, tất cả cơ sở ib fb
Tính năng:
- Giải quiz LMS tự động chọn đáp án đúng
- Giải quiz CMS môn Chính trị và Pháp luật
- Bỏ giới hạn dung lượng upload file fshare khi nộp bài
Hướng dẫn: Bắt đầu làm bài quiz xong nhấn chuột phải chọn "Giải đáp án"
*Lưu ý: Quiz LMS nếu giảng viên tắt chức năng "Hiện chi tiết đáp án" sau khi làm sẽ không giải được
Các cơ sở khác ngoài HCM hầu như các môn đều tắt "Hiện chi tiết đáp án"
Báo lỗi, hỗ trợ ib fb`
const update_notication = `Nhấn follow hoặc kết bạn với tác giả để nhận cập nhật khi có bản mới nhé!
Mình có nhận làm hộ quiz CMS tất cả các môn, tất cả cơ sở ib fb
Cập nhật version 1.1.5 30/1/2021:
- Giải quiz lms tự động chọn đáp án đúng các bạn chỉ việc nhấn next
- Bỏ giới hạn dung lượng upload file fshare khi nộp bài (Trường chỉ cho upload file tối đa 16m)`
const wrong_url_notication = `Bắt đầu làm bài quiz rồi nhấn chuột phải chọn "Giải đáp án" nha
Giải quiz LMS nếu giảng viên tắt Xem chi tiết đáp án sau khi làm sẽ không giải được
Mình có nhận làm hộ quiz CMS tất cả các môn, tất cả cơ sở ib fb`

// Show hide icon
const match = {
	conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: { urlMatches: '(cms.poly.edu.vn|lms.poly.edu.vn)' }
    })
  ],
  actions: [ new chrome.declarativeContent.ShowPageAction() ]
};


chrome.runtime.onInstalled.addListener(function(details) {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([match]);
  });

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
  //   console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
  // }

  // Get CMS data
  fetch('https://tr-fi.netlify.app/api/cms')
  .then(response => response.json())
  .then(data => {
    chrome.storage.local.set({cmsData: data}, function() {
      console.debug('Data is set');
    });
  });
});

// Open popup list quiz

function executeScript(tab_url) {
  let site = tab_url.includes('cms') ? 'cms' : 'lms'
  console.log(tab_url)
  if (site == 'lms') {
    if (!tab_url.includes('ilObjTestGUI') && 
    !tab_url.includes('iltestplayerrandomquestionsetgui') &&
    !tab_url.includes('ilobjtestgui') &&
    !tab_url.includes('outUserResultsOverview') &&
    !tab_url.includes('&sequence=') &&
    !tab_url.includes('outUserPassDetails') &&
    !tab_url.includes('outCorrectSolution') &&
    !tab_url.includes('goto.php?target=tst_')) {
      alert(wrong_url_notication)
      return
    }
  }

  let swidth = screen.width*0.39;
  let left = screen.width - swidth;

  chrome.tabs.executeScript(null, { file: `${site}_script.js` })
  if (site=='lms') chrome.windows.create({url: 'aqlist.html', type: 'panel', width: parseInt(swidth), height: screen.height, left: parseInt(left)}, window => {})
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  const tab_url = tab.url
  if (info.menuItemId === 'getQuestion' && tab_url.includes('cms.poly.edu.vn')) {
    executeScript(tab_url)
  }
  else if (info.menuItemId === 'getQuestion' && tab_url.includes('lms.poly.edu.vn')) {
    executeScript(tab_url)
  }
  else {
    alert(wrong_url_notication)
  }
})

chrome.pageAction.onClicked.addListener(function(tab) {
  const tab_url = tab.url
  if (tab_url.includes('cms.poly.edu.vn')) {
    executeScript(tab_url)
  }
  else if (tab_url.includes('lms.poly.edu.vn')) {
    executeScript(tab_url)
  }
  else {
    alert(wrong_url_notication)
  }
});
