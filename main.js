import { createCtx, drawPomodoro, fadePomodoro } from "./modules/canvas.js"; 
import { setPomodoroStyle, setPomodoroTimer, colorSettings } from "./modules/domSetter.js";
import { Pomodoro } from "./modules/pomodoro.js";

const pomodoroOutter = document.querySelector(".pomodoroColors");
const pomodoroInner = document.querySelector(".innerPomodoroColors");
const pomodoroProfile = document.querySelector("#timerProfileName");
const pomodoroProfileBttn = document.querySelector("#timerProfileBttn");
const pomodoroCountdown = document.querySelector(".countdown");
const pomodoroNext = document.querySelector(".nextTimer");
const pomodoroCanvas = document.querySelector(".countdownDisplay");
const pomodoroOptions = document.querySelector(".optionWrapper");

let pomCtx = createCtx(pomodoroCanvas);
let pomOriginalColors; 
let pom; 
(async () => {
    await Pomodoro.init();
    pom = new Pomodoro(pomodoroCountdown, pomodoroNext, pomCtx); 
    setPomodoroStyle();
    setPomodoroTimer(pom, pomodoroOptions, pomodoroCountdown, pomodoroNext);
    pomOriginalColors = [colorSettings.pomodoro.wheel, colorSettings.pomodoro.image]; 
    drawPomodoro(pomCtx, pom.maxTime, pom.timeMissing, pom.isCounting);
})(); // makes sures the images are loaded before drawPomodoro is called 


pomodoroCanvas.addEventListener("click", e => {
    if (isOnPomBttn(e.offsetX, e.offsetY)) {
        pom.toggleCounter(); 
        clearInterval(fadeInterval.interval);
        drawPomodoro(pomCtx, pom.maxTime, pom.timeMissing, pom.isCounting);
    }
});

pomodoroNext.addEventListener("click", () => pom.flipIntervals());

pomodoroNext.addEventListener("mouseenter", e => {
    if (!pom.hasStarted())
        return; 

    e.currentTarget.innerHTML = `
        <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" stroke="var(--pomodoro-block)">
        <path d="M8 3.5L8 16.5M8 3.5L3.5 7.83333M8 3.5L12.5 7.83333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M17 20.5L17 7.5M17 20.5L21.5 16.1667M17 20.5L12.5 16.1667" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
});

pomodoroNext.addEventListener("mouseleave", e => {
    if (!pom.hasStarted())
        return; 

    e.currentTarget.textContent = pom.restTime;
})

function isOnPomBttn(x, y) {
    const imageData = pomCtx.getImageData(x, y, 1, 1);
    return imageData.data[3] && (imageData.data[0] != colorSettings.pomodoro.block.rgb[0]);
}

let isIn = false; 
let fadeInterval = { interval: null }; 
pomodoroCanvas.addEventListener("mousemove", e => {
    if (!isIn && isOnPomBttn(e.offsetX, e.offsetY)) {
        pomodoroCanvas.style.cursor = "pointer";
        colorSettings.pomodoro.wheel = colorSettings.pomodoro.wheelHighlight;
        colorSettings.pomodoro.image = colorSettings.pomodoro.imageHighlight;
        pomodoroCountdown.classList.add("countdownHighlight");
        isIn = true; 
        clearInterval(fadeInterval.interval); 
        fadeInterval.interval = null;
        fadePomodoro(true, fadeInterval, pomCtx, pom.maxTime, pom.timeMissing, pom.isCounting);
    } else if (isIn && !isOnPomBttn(e.offsetX, e.offsetY)) {
        pomodoroCanvas.style.cursor = "";
        colorSettings.pomodoro.wheel = pomOriginalColors[0];
        colorSettings.pomodoro.image = pomOriginalColors[1];
        pomodoroCountdown.classList.remove("countdownHighlight");
        isIn = false; 
        clearInterval(fadeInterval.interval);
        fadeInterval.interval = null;
        fadePomodoro(false, fadeInterval, pomCtx, pom.maxTime, pom.timeMissing, pom.isCounting);
    }
});

