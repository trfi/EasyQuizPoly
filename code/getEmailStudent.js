Array.from(document.querySelectorAll('tbody>tr')).map(tr => {
  if (tr.children.length == 5) {
  studentCode = tr.children[2].innerText
  fullName = tr.children[3].innerText
  nameArr = fullName.split(' ')
  firstName = slug(nameArr.pop())
  lastName = nameArr.map(n => slug(n.charAt(0)))
  return firstName + lastName.join('') + studentCode.toLowerCase()
  }
})

function slug(str, separator='') {
  str = str
    .toLowerCase()
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
    .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .replace(/[^A-Za-z0-9_ ]/g, '')
    .replace(/-+/g, '-')
  if (separator) {
    if (separator == ' ') {
      console.log(str);
      return str
    }
    return str.replace(/\s/g, separator)
  }
  return str.replace(/\s/g, '-')
}