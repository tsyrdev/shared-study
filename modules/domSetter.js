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
function addTimerOptionBttnClickHandler(bttn) {
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

        bttn.classList.add("addingTimerOption");
        bttn.parentElement.insertBefore(newDiv, bttn);
    }
}

function removeTimerOption(e) {
    if (e.currentTarget.classList.contains("settingTimerOption"))
        stopAdding(); 
    e.currentTarget.remove(); 
}

let isRemoving = false; 
function removeTimerOptionBttnClickHandler(bttn) {
    const options = document.querySelectorAll(".timerOption");

    if (!isRemoving) {
        bttn.classList.add("removingTimerOption");
        isRemoving = true;  
        for (let i = 0; i < options.length; ++i) {
            options[i].classList.add("shakeTimerOption");
            options[i].addEventListener("click", removeTimerOption);
        }
    } else {
        bttn.classList.remove("removingTimerOption");
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
    const addOption = document.createElement("button"); 
    addOption.classList.add("timerOptionBttn");
    addOption.innerHTML = `
        <svg class="timerOptionBttnSVG" fill="none" stroke="var(--pomodoro-block)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="15" y1="10" x2="15" y2="20"></line> <!-- Vertical Line -->
            <line x1="10" y1="15" x2="20" y2="15"></line> <!-- Horizontal Line -->
        </svg>
    `;
    addOption.addEventListener("click", () => addTimerOptionBttnClickHandler(addOption));
    frag.appendChild(addOption); 
    const removeOption = document.createElement("button"); 
    removeOption.classList.add("timerOptionBttn");
    removeOption.innerHTML = `
        <svg class="timerOptionBttnSVG" fill="none" stroke="var(--pomodoro-block)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="10" y1="10" x2="19" y2="19"></line> <!-- Vertical Line -->
            <line x1="10" y1="19" x2="19" y2="10"></line> <!-- Horizontal Line -->
        </svg>
    `;
    removeOption.addEventListener("click", () => removeTimerOptionBttnClickHandler(removeOption)); 
    frag.appendChild(removeOption); 

    parentElem.appendChild(frag);
}

export { setPomodoroStyle, setPomodoroTimer, colorSettings };
