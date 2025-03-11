import { TWENTY_MINS, TEN_MINS, minToMilli, milliToMinSec, loadImage } from "./utils.js";
import { drawPomodoro } from "./canvas.js";

class Pomodoro {
    static PAUSE_IMAGE = null; 
    static PLAY_IMAGE = null; 

    static async init() {
        const [pauseImg, playImg] = await Promise.all([
            loadImage("./images/pause.png"),
            loadImage("./images/play.png"),
        ]);

        Pomodoro.PAUSE_IMAGE = pauseImg; 
        Pomodoro.PLAY_IMAGE = playImg; 
    };

    #isCounting; 
    #timeMissing; 
    #maxTime; 
    #restTime; 
    #ctx; 

    #timerInterval; 

    constructor(count, next, context) {
        this.#ctx = context; 
        this.countdownElement = count; 
        this.nextCountdownElement = next;
        this.#isCounting = false; 
        this.#maxTime = null;
        this.#timeMissing = this.#maxTime; 
        this.#restTime = null; 
        this.#timerInterval = null;

        this.notificationTitle = "Ring! Ring";
        this.notificationBody = "Your alarm went off!!!"; 
    }

    hasStarted() {
        return this.#maxTime !== null;
    }

    get maxTime() {
        return this.#maxTime; 
    }

    get timeMissing() {
        return this.#timeMissing;
    }

    get restTime() {
        return milliToMinSec(this.#restTime).min;
    }

    get isCounting() {
        return this.#isCounting; 
    }

    #notifyUser() {
        const userAgent = navigator.userAgent;
        if (Notification.permission === "granted") 
            new Notification(this.notificationTitle, { body: this.notificationBody });
        const alarm = new Audio("./pomodoroProfiles/audioProfiles/iphone_alarm.mp3");
        alarm.play(); 

        document.querySelector(".innerPomodoroColors").classList.add("notify");
        const notifyPopup = document.querySelector(".pomodoroNotify")
        notifyPopup.classList.remove("hidden");

        notifyPopup.querySelector("button").addEventListener("click", () => {
            document.querySelector(".innerPomodoroColors").classList.remove("notify");
            document.querySelector(".pomodoroNotify").classList.add("hidden");
            alarm.pause();
            alarm.currentTime = 0; 
        });
    }

    flipIntervals() {
        if (!this.hasStarted())
            return; 

        clearInterval(this.#timerInterval);
        const tmp = this.#maxTime; 
        this.#maxTime = this.#timeMissing = this.#restTime; 
        this.#restTime = tmp; 
        this.#setNextTimerElement(milliToMinSec(tmp).min);
        const obj = milliToMinSec(this.#timeMissing);
        this.#setTimerElements(obj.min, obj.sec);
        this.#isCounting = false; 
        drawPomodoro(this.#ctx, this.#maxTime, this.#timeMissing, this.#isCounting);
    }

    toggleCounter() {
        if (!this.#maxTime)
            return; 

        this.#isCounting = !this.#isCounting; 

        if (this.#isCounting) {
            this.#timerInterval = setInterval(() => {
                this.#timeMissing -= 1000; 
                if (this.#timeMissing == 0) {
                    clearInterval(this.#timerInterval);
                    this.flipIntervals();
                    this.#notifyUser(); 
                } 
                drawPomodoro(this.#ctx, this.#maxTime, this.#timeMissing, this.#isCounting);
                const obj = milliToMinSec(this.#timeMissing);
                this.#setTimerElements(obj.min, obj.sec);
            }, 1000);
        } else {
            clearInterval(this.#timerInterval);
        }
    }

    stopCounter() {
        this.#isCounting = false; 
        clearInterval(this.#timerInterval);
        drawPomodoro(this.#ctx, this.#maxTime, this.#timeMissing, this.#isCounting);
    }

    setTimer(time, rest) {
        this.#timeMissing = this.#maxTime = minToMilli(time); 
        this.#restTime = minToMilli(rest); 
        this.#setTimerElements(time, 0); 
        this.#setNextTimerElement(rest);
    }

    #setTimerElements(min, sec) {
        const secPadded = sec.toString().padStart(2, "0");
        this.countdownElement.textContent = `${min}:${secPadded}`; 
    }

    #setNextTimerElement(rest) {
        this.nextCountdownElement.querySelector(".nextSvg").classList.add("nextSvgHidden");
        this.nextCountdownElement.querySelector(".nextCountdown").textContent = rest;
    }
}

export { Pomodoro }; 
