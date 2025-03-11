const { default: configData } = await import("../pomodoroProfiles/colorProfiles/default.json", {
    with: { type: "json" }
}); 
const { default: timerData } = await import("../pomodoroProfiles/timerProfiles/default.json", {
    with: { type: "json" }
});
import { Pomodoro } from "./pomodoro.js"

let colorSettings = {
    "pomodoro": {
        "block": configData.blockColor, 
        "accent": configData.accentColor,
        "font": configData.fontColor,
        "wheel": configData.wheelColor,
        "wheelHighlight": configData.wheelHighlightColor,
        "image": configData.imageColor,
        "imageHighlight": configData.imageHighlightColor,
        "timer": configData.timerColor,
    },
}

function setPomodoroStyle() {
    document.documentElement.style.setProperty('--pomodoro-block', configData.blockColor.hex);
    document.documentElement.style.setProperty("--pomodoro-accent", configData.accentColor.hex);
    document.documentElement.style.setProperty("--pomodoro-font", configData.fontColor.hex);
    document.documentElement.style.setProperty("--pomodoro-wheel", configData.wheelColor.hex);
    document.documentElement.style.setProperty("--pomodoro-wheel-highlight", configData.wheelHighlightColor.hex);
    document.documentElement.style.setProperty("--pomodoro-image", configData.imageColor.hex);
    document.documentElement.style.setProperty("--pomodoro-image-highlight", configData.imageHighlightColor.hex);
    document.documentElement.style.setProperty("--pomodoro-timer", configData.timerColor.hex);
    
    // small delay to make sure the transitions aren't shown while settings the css vars
    setTimeout(() => document.body.classList.add("ready"), 300); 
};

function timerOptionClickHandler(idx, intervals) {
    if (isRemoving) 
        return;
    if (Notification.permission !== "granted" && Notification.permission !== "denied")
        Notification.requestPermission();
    pomodoro.setTimer(intervals[idx][0], intervals[idx][1]); 
    pomodoro.stopCounter(); 
}

function replaceInputTimerOption(inputElemList) {
    const newDiv = document.createElement("div"); 
    newDiv.classList.add("timerOption");
    const interval = [inputElemList[0].value, inputElemList[1].value];
    newDiv.textContent = `${interval[0]} · ${interval[1]}`; 
    newDiv.dataset.index = ind;
    const intervals = []; 
    intervals[ind++] = interval; 
    newDiv.addEventListener("click", () => timerOptionClickHandler(newDiv.dataset.index, intervals));
    inputElemList[0].parentElement.replaceWith(newDiv);
}

function stopAdding() {
    const bttn = document.querySelector(".addingTimerOption"); 
    isAdding = false; 
    bttn.classList.remove("addingTimerOption");
}


let isAdding; 
function addTimerOptionBttnClickHandler(e) {
    if (isRemoving)
        return;

    if (isAdding) {
        const inputElemList = document.querySelectorAll(".timerOptionInput");
        if (inputElemList[0].value <= 0 || inputElemList[1].value <= 0)
            return; 
        replaceInputTimerOption(inputElemList);

        stopAdding(); 
    } else {
        isAdding = true; 

        const newDiv = document.createElement("div");
        newDiv.classList.add("timerOption");

        const totalInput = document.createElement("input");
        totalInput.classList.add("timerOptionInput"); 
        totalInput.type = "number";
        totalInput.placeholder = "....";
        totalInput.required = true; 

        const restInput = document.createElement("input");
        restInput.classList.add("timerOptionInput"); 
        restInput.type = "number";
        restInput.placeholder = "....";
        restInput.required = true; 

        newDiv.appendChild(totalInput);
        const midDot = document.createTextNode(" · ");
        newDiv.appendChild(midDot);
        newDiv.appendChild(restInput);
        newDiv.classList.add("settingTimerOption");

        e.currentTarget.classList.add("addingTimerOption");
        e.currentTarget.parentElement.insertBefore(newDiv, e.currentTarget);
    }
}

function removeTimerOption(e) {
    if (e.currentTarget.classList.contains("settingTimerOption"))
        stopAdding(); 
    e.currentTarget.remove(); 
}

let isRemoving = false; 
function removeTimerOptionBttnClickHandler(e) {
    const options = document.querySelectorAll(".timerOption");

    if (!isRemoving) {
        e.currentTarget.classList.add("removingTimerOption");
        isRemoving = true;  
        for (let i = 0; i < options.length; ++i) {
            options[i].classList.add("shakeTimerOption");
            options[i].addEventListener("click", removeTimerOption);
        }
    } else {
        e.currentTarget.classList.remove("removingTimerOption");
        isRemoving = false; 
        for (let i = 0; i < options.length; ++i) {
            options[i].classList.remove("shakeTimerOption");
            options[i].removeEventListener("click", removeTimerOption);
        }
    }
}

let ind; 
let pomodoro;
function setPomodoroTimer(pom, parentElem) {
    pomodoro = pom;
    const frag = document.createDocumentFragment(); 

    for (let i = 0; i < timerData.intervals.length; ++i) {
        const newDiv = document.createElement("div");
        newDiv.classList.add("timerOption");
        newDiv.dataset.index = i;
        newDiv.textContent = `${timerData.intervals[i][0]} · ${timerData.intervals[i][1]}`;

        newDiv.addEventListener("click", () => timerOptionClickHandler(i, timerData.intervals));
        frag.appendChild(newDiv);
    } 
    ind = timerData.intervals.length; 

    const addBttn = document.querySelector("#addTimerOptionBttn");
    document.querySelector("#addTimerOptionBttn").addEventListener("click", addTimerOptionBttnClickHandler);
    document.querySelector("#removeTimerOptionBttn").addEventListener("click", removeTimerOptionBttnClickHandler); 

    parentElem.insertBefore(frag, addBttn);
}

export { setPomodoroStyle, setPomodoroTimer, colorSettings };
