const install_notication = `Nhấn follow hoặc kết bạn với tác giả để nhận cập nhật khi có bản mới nhé!
Tính năng:
- Giải đáp án quiz LMS tất cả các môn (Chỉ áp dụng cơ sở HCM)
- Giải đáp án quiz Chính trị và Pháp luật CMS (Tất cả cơ sở)
- Bỏ giới hạn dung lượng upload file fshare khi nộp bài
- Mình có nhận làm giúp quiz CMS tất cả các môn các cơ sở (có phí inbox)`
const update_notication = `Nhấn follow hoặc kết bạn với tác giả để nhận cập nhật khi có bản mới nhé!
Cập nhật version 1.1.5 14/12/2020:
- Giải quiz lms tự động chọn đáp án đúng các bạn chỉ việc nhấn next
- Bỏ giới hạn dung lượng upload file fshare khi nộp bài (Trường chỉ cho upload file tối đa 16m)`
const wrong_url_notication = `Vào làm quiz rồi nhấn Giải đáp án nha bồ
Giải quiz lms chỉ dùng được cho cơ sở TP.HCM`

// Show hide icon
const match = {
	conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: { urlMatches: '(cms.poly.edu.vn|cms.poly.edu.vn/courses)' }
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
  else if (details.reason == "update") {
    chrome.tabs.create({'url': 'https://fb.com/hi.trfi'}, function(tab) {
      alert(update_notication)
    });
    var thisVersion = chrome.runtime.getManifest().version;
    console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
  }

  // Get CMS data
  fetch('https://tr-fi.netlify.app/api/cms')
  .then(response => response.json())
  .then(data => {
    chrome.storage.local.set({cmsData: data}, function() {
      console.log('Data is set');
    });
  });
});

// Open popup list quiz

function executeScript(site) {
  console.log(site)
  let swidth = screen.width*0.39;
  let left = screen.width - swidth;

  chrome.tabs.executeScript(null, { file: `${site}_script.js` })
  if (site=='lms') chrome.windows.create({url: 'aqlist.html', type: 'panel', width: parseInt(swidth), height: screen.height, left: parseInt(left)}, window => {})
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  const tab_url = tab.url
  if (info.menuItemId === 'getQuestion' && tab_url.includes('cms.poly.edu.vn')) {
    executeScript('cms')
  }
  else if (info.menuItemId === 'getQuestion' && tab_url.includes('hcm-lms.poly.edu.vn')) {
    executeScript('lms')
  }
  else {
    alert(wrong_url_notication)
  }
})

chrome.pageAction.onClicked.addListener(function(tab) {
  const tab_url = tab.url
  if (tab_url.includes('cms.poly.edu.vn')) {
    executeScript('cms')
  }
  else if (tab_url.includes('hcm-lms.poly.edu.vn')) {
    executeScript('lms')
  }
  else {
    alert(wrong_url_notication)
  }
});
