const fs = require('fs');


let quizzes = []

quizzes = require('./quizzes_pre')

console.log(quizzes.length)

// filter duplicate
quizzes = quizzes.filter((v,i,a)=>a.findIndex(t=>(t.ques === v.ques && t.ans===v.ans))===i)

quizzes = quizzes.filter((qa) => (qa.ques && qa.ans))

console.log(quizzes.length)

// sort
quizzes.sort((a,b) => (a.ques > b.ques) ? 1 : ((b.ques > a.ques) ? -1 : 0))

let data = JSON.stringify(quizzes, null, 4);

fs.writeFileSync('quizzes.json', data);
