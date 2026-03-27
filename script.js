let questions = [
    {
        question: "Inside which HTML element do we put the JavaScript?",
        answers: [
            { text: "<script>", correct: true },
            { text: "<scripting>", correct: false },
            { text: "<javascript>", correct: false },
            { text: "<js>", correct: false }
        ]
    },
    {
        question: "Which JS keyword declares a block-scoped variable?",
        answers: [
            { text: "const", correct: true },
            { text: "let", correct: true },
            { text: "var", correct: false },
            { text: "all of these", correct: false }
        ]
    },
    {
        question: "What is result of '5' + 3?",
        answers: [
            { text: "8", correct: false },
            { text: "53", correct: true },
            { text: "15", correct: false },
            { text: "NaN", correct: false }
        ]
    },
    {
        question: "Which method converts JSON to a JavaScript object?",
        answers: [
            { text: "JSON.parse()", correct: true },
            { text: "JSON.stringify()", correct: false },
            { text: "JSON.object()", correct: false },
            { text: "JSON.convert()", correct: false }
        ]
    }
];

let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let timer;
let timeLeft = 10;

const questionEl = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextBtn = document.getElementById("next-btn");
const downloadBtn = document.getElementById("download-btn");
const restartBtn = document.getElementById("restart-btn");

function startQuiz(){
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    showQuestion();
}

function showQuestion(){
    resetState();
    startTimer();
    let q = questions[currentQuestionIndex];
    questionEl.innerText = q.question;

    q.answers.forEach(ans=>{
        const btn = document.createElement("button");
        btn.innerText = ans.text;
        btn.classList.add("btn");
        if(ans.correct) btn.dataset.correct = true;
        btn.onclick = selectAnswer;
        answerButtons.appendChild(btn);
    });
}

function resetState(){
    nextBtn.style.display = "none";
    answerButtons.innerHTML = "";
    clearInterval(timer);
}

function startTimer(){
    timeLeft = 10;
    document.getElementById("timer").innerText = "Time: " + timeLeft;
    timer = setInterval(()=>{
        timeLeft--;
        document.getElementById("timer").innerText = "Time: " + timeLeft;
        if(timeLeft === 0){
            clearInterval(timer);
            autoNext();
        }
    },1000);
}

function selectAnswer(e){
    clearInterval(timer);
    const selected = e.target;
    const isCorrect = selected.dataset.correct === "true";

    const q = questions[currentQuestionIndex];
    userAnswers.push({
        question: q.question,
        selected: selected.innerText,
        correct: q.answers.find(a=>a.correct).text,
        isCorrect
    });

    if(isCorrect) score++;

    Array.from(answerButtons.children).forEach(btn=>{
        if(btn.dataset.correct === "true") btn.classList.add("correct");
        else btn.classList.add("wrong");
        btn.disabled = true;
    });

    nextBtn.style.display = "block";
}

function autoNext(){
    const q = questions[currentQuestionIndex];
    userAnswers.push({
        question: q.question,
        selected: "No Answer",
        correct: q.answers.find(a=>a.correct).text,
        isCorrect:false
    });
    Array.from(answerButtons.children).forEach(btn=>{
        if(btn.dataset.correct === "true") btn.classList.add("correct");
        btn.disabled = true;
    });
    nextBtn.style.display = "block";
}

nextBtn.onclick = ()=>{
    currentQuestionIndex++;
    if(currentQuestionIndex < questions.length) showQuestion();
    else showScore();
};

function showScore(){
    document.querySelector(".app").style.display = "none";
    const resultBox = document.getElementById("result-box");
    resultBox.style.display = "block";
    document.getElementById("score-text").innerText = `Score: ${score} / ${questions.length}`;

    const table = document.getElementById("result-table");
    table.innerHTML = `<tr><th>#</th><th>Question</th><th>Your Answer</th><th>Correct Answer</th><th>Status</th></tr>`;

    userAnswers.forEach((ans,i)=>{
        let row = table.insertRow();
        row.innerHTML = `
            <td>${i+1}</td>
            <td>${ans.question}</td>
            <td>${ans.selected}</td>
            <td>${ans.correct}</td>
            <td class="${ans.isCorrect?'correct-text':'wrong-text'}">${ans.isCorrect?'Correct':'Wrong'}</td>
        `;
    });
}

function downloadResult(){
    let text = "Quiz Result\n\n";
    userAnswers.forEach((ans,i)=>{
        text += `${i+1}. ${ans.question}\nYour: ${ans.selected}\nCorrect: ${ans.correct}\n\n`;
    });
    let blob = new Blob([text], {type:"text/plain"});
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "result.txt";
    link.click();
}

function restartQuiz(){
    document.getElementById("result-box").style.display = "none";
    document.querySelector(".app").style.display = "block";
    startQuiz();
}

function decodeHTML(html){
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}


async function loadQuestions(){
    const url = "https://opentdb.com/api.php?amount=5&type=multiple";
    try {
        const res = await fetch(url);
        const data = await res.json();
        questions = data.results.map(q => {
            let answers = [
                ...q.incorrect_answers.map(a => ({text:decodeHTML(a), correct:false})),
                {text:decodeHTML(q.correct_answer), correct:true}
            ];
            answers.sort(()=>Math.random()-0.5);
            return { question: decodeHTML(q.question), answers };
        });
    } catch(err){
        console.error("API failed, using local questions", err);
    }
    startQuiz();
}

downloadBtn.onclick = downloadResult;
restartBtn.onclick = restartQuiz;

loadQuestions();

