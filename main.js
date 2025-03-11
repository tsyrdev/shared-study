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
const pomodoroOffBttn = document.querySelector(".pomodoroSilenceNotifyOverlay");

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

    e.currentTarget.querySelector(".nextSvg").classList.remove("nextSvgHidden");
    e.currentTarget.querySelector(".nextCountdown").classList.add("nextCountdownHidden");
});

pomodoroNext.addEventListener("mouseleave", e => {
    if (!pom.hasStarted())
        return; 

    e.currentTarget.querySelector(".nextSvg").classList.add("nextSvgHidden");
    e.currentTarget.querySelector(".nextCountdown").classList.remove("nextCountdownHidden");
});


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

