const timerDisplay = document.getElementById('timer');
const statusDisplay = document.getElementById('status');
const cycleCountDisplay = document.getElementById('cycle-count');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const toggleViewButton = document.getElementById('toggle-view');
const notification = document.getElementById('notification');
const digitalView = document.getElementById('digital-view');
const analogView = document.getElementById('analog-view');
const progressArc = document.getElementById('progress-arc');
const needle = document.getElementById('needle');
const quoteText = document.getElementById('quote-text');
const quoteSource = document.getElementById('quote-source');

let timer;
let isPaused = false;
let timeInSeconds = 1500; // 25 minutes
let totalTime = 1500;
let currentCycle = 0;
let isWorkTime = true;
let isAnalogView = false;

async function getQuote() {
    try {
        const response = await fetch('https://api.quotable.io/random');
        const data = await response.json();
        quoteText.textContent = `"${data.content}"`;
        quoteSource.textContent = `- ${data.author}`;
    } catch (error) {
        quoteText.textContent = '"시간은 금이다!"';
        quoteSource.textContent = '- 벤자민 프랭클린';
    }
}

function updateDisplay() {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    updateAnalogClock();
}

function updateAnalogClock() {
    const angle = ((totalTime - timeInSeconds) / totalTime) * 360;
    const workColor = '#4A90E2';
    const breakColor = '#E24A4A';

    progressArc.setAttribute('d', describeArc(100, 100, 90, 0, angle));
    progressArc.setAttribute('stroke', isWorkTime ? workColor : breakColor);
    needle.setAttribute('transform', `rotate(${angle} 100 100)`);
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function describeArc(x, y, radius, startAngle, endAngle) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    const d = [
        'M', start.x, start.y,
        'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
    return d;
}

function startTimer() {
    if (timer) return;

    timer = setInterval(() => {
        if (!isPaused) {
            timeInSeconds--;
            updateDisplay();

            if (timeInSeconds <= 0) {
                clearInterval(timer);
                timer = null;
                notification.play();
                switchState();
            }
        }
    }, 1000);
}

function pauseTimer() {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? '계속' : '일시정지';
}

function resetTimer() {
    clearInterval(timer);
    timer = null;
    isPaused = false;
    isWorkTime = true;
    currentCycle = 0;
    timeInSeconds = 1500;
    totalTime = 1500;
    updateDisplay();
    cycleCountDisplay.textContent = currentCycle;
    pauseButton.textContent = '일시정지';
    getQuote();
}

function switchState() {
    isWorkTime = !isWorkTime;

    if (isWorkTime) {
        currentCycle++;
        cycleCountDisplay.textContent = currentCycle;
        timeInSeconds = 1500; // 25 minutes
        totalTime = 1500;
    } else {
        if (currentCycle === 3) {
            timeInSeconds = 900; // 15 minutes long break
            totalTime = 900;
            currentCycle = 0; // Reset cycle after long break
        } else {
            timeInSeconds = 300; // 5 minutes short break
            totalTime = 300;
        }
    }

    updateDisplay();
    startTimer();
}

function toggleView() {
    isAnalogView = !isAnalogView;
    digitalView.classList.toggle('hidden');
    analogView.classList.toggle('hidden');
    toggleViewButton.textContent = isAnalogView ? '디지털 보기' : '아날로그 보기';
}

startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);
toggleViewButton.addEventListener('click', toggleView);

// Initial state
getQuote();
updateDisplay();
