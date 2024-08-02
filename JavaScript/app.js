const PIN = '000';
const currencies = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'NZD'];
const country = ['US', 'DE', 'JP', 'GB', 'AU', 'CA', 'CH', 'CN', 'HK', 'NZ'];
let currentRate;
let currentAmount;
let currentCurrency;
let score = 0;
let questionNumber = 0;
const totalQuestions = 10;
let timeLeft = 20;
let timerInterval;
let isPlaying = false;

let EXCHANGERATE = [];
let LOG = [];

async function EXCHANGERATE_ScoreBoard() {
    await GameInformation();
    FillContent("Bảng chuyển đổi tỉ giá", EXCHANGERATE);
}

EXCHANGERATE_ScoreBoard();

function FillContent(title, content) {
    const titleElement = document.getElementById("title");
    titleElement.textContent = title;

    const contentElement = document.getElementById("content");
    contentElement.innerHTML = "";
    for (const items of content) {
        contentElement.innerHTML += `${items}`
    }
    if (contentElement.innerHTML == "") {
        contentElement.innerHTML += `Không có ${title} nào được ghi nhận`
    }
}

async function fetchExchangeRates() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/VND');
        const data = await response.json();
        return data.rates;
    } catch (error) {
        Swal.fire({
            title: "Lỗi kết nối API",
            text: error,
            icon: "error"
          });
        return null;
    }
}

StartScreen();

function StartScreen() {
    document.getElementById("screen").innerHTML = `<h1>ARE YOU READY?</h1>
                                                              <button onclick="CheckPin()" class="ready">Ready</button>
                                                              <br>
                                                              <input type="password" maxlength="12" class="pin" id="pin" placeholder="Nhập mã PIN">`;
}

function QuestionScreen() {
    document.getElementById("screen").innerHTML = `<div id="question"></div>
                                                             <input type="number" id="answer-input" data-vnd="0" data-country="">
                                                             <button class="ready" onclick="checkAnswer(this)" id="submit">Submit</button>
                                                             <div id="result"></div>
                                                             <div id="score"></div>
                                                             <div id="question-number"></div>
                                                             <div id="timer">Thời gian: 40 giây</div>`;
}

function EndScreen() {
    document.getElementById("screen").innerHTML = `<h1 class="end-h1">GAME OVER!</h1>
                                                             <button onclick="Restart()" class="ready end-btn">RESTART</button>`;
}

async function startGame() {
    CountdownBegins();
}

function CheckPin() {
    const PIN_Input = document.getElementById("pin").value;
    if (PIN_Input != "") {
        if (PIN == PIN_Input) {
            startGame();
        }
        else {
            Swal.fire({
                title: "Mã PIN không hợp lệ",
                icon: "error"
              });
        }
    }
    else {
        Swal.fire({
            title: "Cần nhập mã PIN",
            icon: "error"
          });
    }
}

function startTimer() {
    timeLeft = 40;
    document.getElementById('timer').textContent = `Thời gian: ${timeLeft} giây`;
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = `Thời gian: ${timeLeft} giây`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            Swal.fire({
                title: "Trò chơi kết thúc",
                text: `Bạn đã hết thời gian trả lời`,
                icon: "warning"
              });
              clearInterval(timerInterval);
              isPlaying = false;
              endGame();
        }
    }, 1000);
}

async function GameInformation() {
    const rates = await fetchExchangeRates();
    if (!rates) {
        alert('Không thể lấy tỉ giá. Vui lòng thử lại sau.');
        return;
    }
    EXCHANGERATE = [];
    for (let index = 0; index < currencies.length; index++) {
        EXCHANGERATE.push(`<h2><img src="https://flagsapi.com/VN/flat/16.png"> 1.000 VNĐ = <img src="https://flagsapi.com/${country[index]}/flat/16.png"> ${(1000 * rates[currencies[index]]).toFixed(3)} ${currencies[index]}</h2>`);
    }
}

async function newQuestion() {
    if (questionNumber >= totalQuestions) {
        endGame();
        return;
    }

    if (!isPlaying) {
        startTimer();
        isPlaying = true;
    }

    questionNumber++;
    const rates = await fetchExchangeRates();
    if (!rates) {
        alert('Không thể lấy tỉ giá. Vui lòng thử lại sau.');
        return;
    }

    currentCurrency = currencies[Math.floor(Math.random() * currencies.length)];
    currentRate = rates[currentCurrency];
    currentAmount = (Math.floor(Math.random() * 1000) + 100) * 1000;

    document.getElementById('question').textContent = `Quy đổi ${currentAmount.toLocaleString()} VND sang ${currentCurrency}:`;
    document.getElementById('answer-input').value = '';
    document.getElementById('answer-input').dataset.vnd = `${currentAmount}`;
    document.getElementById('answer-input').dataset.country = `${currentCurrency}`;
    document.getElementById('result').textContent = '';
    document.getElementById('question-number').textContent = `Câu hỏi ${questionNumber}/${totalQuestions}`;
    document.getElementById('score').textContent = `Điểm: ${score}`;
}

function checkAnswer(btn) {
    const userAnswer = parseInt(document.getElementById('answer-input').value, 10);
    const correctAnswer = Math.round(currentAmount * currentRate);
    let tolerance;

    if (!isNaN(userAnswer)) {
        if (correctAnswer < 1000) {
            tolerance = 9;
        } else {
            tolerance = 99;
        }
    
        const input = btn.previousElementSibling;
        if (Math.abs(userAnswer - correctAnswer) <= tolerance) {
            // LOG.push(`<h2><i class="fa-solid fa-circle-check"></i> ${Number(input.dataset.vnd).toLocaleString()} VNĐ = ${correctAnswer.toLocaleString()} ${input.dataset.country}</h2>`);   
            if (score >= 1 && score <= 3) {
                LOG.push(`<h2> ${score} <i class="fa-solid fa-circle-check"></i> Bạn nhận được 1 giftcode <img src="Image/Tier/i_rare.png" alt=""><img src="Image/Tier/rare.png" alt=""> </h2>`);   
            }
            else if (score >= 4 && score <= 5) {
                LOG.push(`<h2> ${score} <i class="fa-solid fa-circle-check"></i> Bạn nhận được 1 giftcode <img src="Image/Tier/i_epic.png" alt=""><img src="Image/Tier/epic.png" alt=""> </h2>`);   
            }
            else if (score >= 6 && score <= 8) {
                LOG.push(`<h2> ${score} <i class="fa-solid fa-circle-check"></i> Bạn nhận được 1 giftcode <img src="Image/Tier/i_legendary.png" alt=""><img src="Image/Tier/legendary.png" alt=""> </h2>`);   
            }
            else if (score > 8) {
                LOG.push(`<h2> ${score} <i class="fa-solid fa-circle-check"></i> Bạn nhận được <img src="Image/Tier/i_mythic.png" alt=""><img src="Image/Tier/boss.png" alt=""> FULL MENU </h2>`);   
            }
            score++;
            document.getElementById('result').classList.add("Exactly");
            document.getElementById('result').textContent = 'Chính xác!';
            timeLeft += 20;
            setTimeout(newQuestion, 2000);
        } else {
            LOG.push(`<h2><i class="fa-solid fa-circle-xmark"></i> ${Number(input.dataset.vnd).toLocaleString()} VNĐ = ${Number(userAnswer).toLocaleString()} ${input.dataset.country} => <i class="fa-solid fa-circle-check"></i> ${Number(input.dataset.vnd).toLocaleString()} VNĐ = ${correctAnswer.toLocaleString()} ${input.dataset.country}</h2>`);
            Swal.fire({
                title: "Kết thúc",
                text: `Sai. Đáp án đúng là ${correctAnswer.toLocaleString()} ${currentCurrency}`,
                icon: "error"
              });
              clearInterval(timerInterval);
              isPlaying = false;
              endGame();
        }
    }
    else {
        Swal.fire({
            title: "Opps...",
            text: `Bạn cần điền đáp án để gửi đáp án`,
            icon: "error"
          });
    }
}

async function resetGame() {
    clearInterval(timerInterval);
    LOG = [];
    isPlaying = false;
    score = 0;
    questionNumber = 0;
    timeLeft = 20;
    StartScreen();
    await GameInformation();
    FillContent("Bản chuyển đổi tỉ giá", EXCHANGERATE);
}

function Restart() {
    resetGame();
}

function endGame() {
    clearInterval(timerInterval);
    FillContent("Rewards", LOG);
    EndScreen();
}

function CountdownBegins() {
    const screen = document.getElementById('screen');
    
    function createElementWithClass(tag, className, text) {
        const element = document.createElement(tag);
        element.id = "countdown";
        element.className = className;
        element.textContent = text;
        return element;
    }

    function countdown() {
        let count = 3;
        
        function updateCount() {
            if (count > 0) {
                const countElement = createElementWithClass('div', 'slide-in center', count.toString());
                screen.innerHTML = '';
                screen.appendChild(countElement);
                
                setTimeout(() => {
                    countElement.classList.remove('slide-in');
                    countElement.classList.add('slide-out');
                }, 500);

                count--;
                setTimeout(updateCount, 1000);
            } else {
                const startElement = createElementWithClass('div', 'slide-in, start-text center', 'Chào mừng bạn đến địa ngục');
                screen.innerHTML = '';
                startElement.classList.add('slide-in');
                screen.appendChild(startElement);

                setTimeout(() => {
                    startElement.classList.remove('slide-in');
                    startElement.classList.add('fade-out');
                }, 500);

                setTimeout(() => {
                    QuestionScreen();
                    newQuestion();
                }, 1400);
            }
        }

        updateCount();
    }
    countdown();
}