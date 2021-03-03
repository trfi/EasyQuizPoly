function decodeEntities (str) {
  let element = document.createElement('div');
  if(str && typeof str === 'string') {
    // strip script/html tags
    str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
    str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
    element.innerHTML = str;
    str = element.textContent;
    element.textContent = '';
  }

  return str;
}

function writeHTML(listQA, name) {
  let html = `<table>`
  let i = 1
  for (let QA of listQA) {
    html += `<tr><td style='width:8%; text-align:center';>${i++}</td><td><img style='width:24px;' src='data:image/png;base64,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'></td><td>${QA.ques}</td></tr>
        <tr><td></td><td><img style='width:23px;' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKpSURBVGhD7ZlL6E1BAIevZx55RKKQlIU8NjZ2iiyUBRaSx4oFlkpRVuxZeC8VNnaUKGWBBRaKUkoSsSDvKCJ83+jUf3Gd171n7tw6X31lxsw58/ufe2bOOdNpaWnpiYV4Ap/hT/wT2a94C3fjeKzFHvyB2UEN8iGin3FkqMe4CCuxF+38G0/jchyFsZmEG/AhOp5XOA9L4c/pOxpiixUJMAGvomGuWFGG42iHM6GUDjPwPTq2pVYU4Y1tY39OqeHE49gOhFIOo9GbWgdxTxSxCw1yNpRymIY2/BRK6bENHd/FUMqhDRKJNkhspuLEf//sylAEGYMuevdwjhVdGIogp9Bzv8X5VnQh+SDZs903XGnFf0g6yDr8hT7bbbUih2SD+BjkuTznISsKSDLILHyOnu8ClnkkSi6IU+xd9Fx3sOzbXyNBnPPr4F/eK+B5nqJXpix9D+L0+BL3hVI1DmN2jiVWVKDvQXagM41tj1hRku3o7ORrwhorKtLIT8upMvs44QtP0c3q+pC1d92oQ2M3+3p0EbPPeRyL3fDrhyu27Y5aUZPGgsgqtL39LqMfCkbiMR9h9v8+U9Wl0SCyAt+gfW/iFBQHfQOtN8xk7IXGg8hifIH2v48z0W9ilit9j8ohShBZgE/QY2T3RNGDYBWiBZHZ+AA9jlPtJuwXUYPIdLyNB0Opf0QPIrW/nucwkCBN0AZJjdJBXLBs+CWU0iML4uNQIW532dhNltTwtcGxHQulApw2bbwxlNLiOjo2XyMKce/Qxm53pXRV1qILrHuLrlOFjEM3Hg3jl79SnRpmNb5Dx7TfirL4/vAa7eh210nciZsj6v6l98Q19Eo4lnNYeQNqLrrx6AEG7Uf0SvS0i7YM3bNzc/RSRF0rnJ18z0/h593SMsR0On8BkyhnJM9trxIAAAAASUVORK5CYII='></td><td>${QA.ans}</td></tr>`
  }
  html += '</table>\n'
  chrome.runtime.sendMessage({html: html, name: name}, function(response) {
    console.log(response.farewell)
  });
}

async function getName() {
  const url = 'http://hcm-lms.poly.edu.vn/ilias.php?cmdClass=ilpersonalprofilegui&cmdNode=oq:or&baseClass=ilPersonalDesktopGUI'
  const response = await fetch(url, {
    method: 'GET',
  })
  const data = await response.text()
  const patt = /usr_firstname" value="(.*?)"\s\s\srequired/i
  return data.match(patt)[1]
}

async function getPassTimes(quiz_id) {
  try {
    const response = await fetch(`http://hcm-lms.poly.edu.vn/ilias.php?ref_id=${quiz_id}&cmd=outUserResultsOverview&cmdClass=iltestevaluationgui&cmdNode=q4:ll:vx&baseClass=ilrepositorygui`, {
      method: 'GET',
    })
    const data = await response.text()
    let htmlObject = document.createElement('div')
    htmlObject.innerHTML = data
    return parseInt(htmlObject.querySelector('.ilTableFootLight').textContent.split(' ').pop()) - 1
  }
  catch(error) {
    console.error(error);
    return 0
  }
}

async function getQuesId(quiz_id, pass) {
  const url = `http://hcm-lms.poly.edu.vn/ilias.php?ref_id=${quiz_id}&cmd=outUserPassDetails&cmdClass=iltestevaluationgui&cmdNode=q4:ll:vx&baseClass=ilRepositoryGUI`
  const rx = /evaluation=([0-9]{6})&amp;cmd/g;
  const response = await fetch(url, {
    method: 'GET',
  })
  const data = await response.text()
  let ques_id=[]
  while ((m=rx.exec(data)) !== null) {
    ques_id.push(m[1]);
  }
  return ques_id
}

async function getQA(quiz_id, ques_id = [], pass) {
  const patt = /ilc_PageTitle">(.*?)\s\([0-9]+\sPoint/gs
  const patt2 = /checked \/>\n\t\t\t\t\n\t\t\t<\/td>\n\t\t\t<td class="middle">\n\n\t\t\t\t(.*?)<\/span>/i
  let ques = ''
  let ans = ''
  try {
    const url = `http://hcm-lms.poly.edu.vn/ilias.php?ref_id=${quiz_id}&evaluation=${ques_id}&cmd=outCorrectSolution&cmdClass=iltestevaluationgui&cmdNode=q4:ll:vx&baseClass=ilRepositoryGUI`
    console.log(url);
    const response = await fetch(url, {
      method: 'GET',
    })
    const data = await response.text()
    ques = patt.exec(data)[1]
    ans = decodeEntities(data.match(patt2)[1].replace(/<p>|<\/p>|<span>|<div class="O1">|"/gm,''))
    return {ques, ans}
  }
  catch (err) {
    return {ques, ans}
  }
}


var quiz_id = /(ref_id=|tst_)([^&]+)/.exec(window.location.href)[2];

async function main() {
  let ques_id = await getQuesId(quiz_id, passTimes)
  // let listQA = []
  // for(qid of ques_id) {
  //   listQA.push(await getQA(quiz_id, qid, passTimes))
  // }
  const QA_promise = ques_id.map((qid) => getQA(quiz_id, qid))
  const listQA = await Promise.all(QA_promise)
  .catch(reason => alert(`Đã có lỗi xảy ra, vui lòng thử lại hoặc liên hệ tác giả để báo lỗi: ${reason}`))

  if (listQA) {
    chrome.storage.local.remove('listQA', function() {
      chrome.storage.local.set({listQA: listQA}, function() {
        console.log('set list QA')
      })
    })

    const name = await getName()
    writeHTML(listQA, name)
    
    if (window.location.href.includes('&sequence=')) window.location.reload()
  }
}

main()