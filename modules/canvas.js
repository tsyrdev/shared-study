import { Pomodoro } from "./pomodoro.js"; 
import { timeToArc } from "./utils.js";
import { colorSettings } from "./domSetter.js";

function createCtx(canvas) {
    const rect = canvas.getBoundingClientRect();  
    canvas.width = rect.width;
    canvas.height = rect.height;
    return canvas.getContext("2d", {
        willReadFrequently: true,
    });
}

function drawPomodoro(ctx, totalTime, missingTime, isCounting) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = colorSettings.pomodoro.wheel.hex;

    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const outerRadius = ctx.canvas.width / 2.5;
    const innerRadius = ctx.canvas.width / 6; 
    const borderRadius = outerRadius + 7; 

    ctx.fillStyle = colorSettings.pomodoro.block.hex;
    ctx.beginPath(); 
    ctx.arc(centerX, centerY, borderRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colorSettings.pomodoro.wheel.hex; 
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.fill(); 

    ctx.fillStyle = colorSettings.pomodoro.block.hex;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY); 
    const arcEnd = -timeToArc(totalTime, missingTime) - (Math.PI / 2);
    const arcStart = -Math.PI / 2; 
    // add 2 to make sure it cleans the bottom circle
    ctx.arc(centerX, centerY, outerRadius + 2, arcStart, arcEnd, false);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath(); 
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2); 
    ctx.fill(); 

    const imgWidth = ctx.canvas.width / 3.5;
    const imgHeight = ctx.canvas.height / 3.5;

    const offCanvas = drawPomodoroImage(ctx.canvas.width, ctx.canvas.height, imgWidth, imgHeight, isCounting);
    ctx.drawImage(offCanvas, centerX - (imgWidth / 2.0), centerY - (imgHeight / 2.0));

    ctx.strokeStyle = colorSettings.pomodoro.wheel.hex;
    ctx.lineWidth = 3;
    ctx.beginPath(); 
    ctx.arc(centerX, centerY, borderRadius, 0, Math.PI * 2);
    ctx.stroke(); 
}

function drawPomodoroImage(w, h, iw, ih, isCounting) {
    let img = Pomodoro.PAUSE_IMAGE;
    img.width = iw;
    img.height = ih;
    if (!isCounting) {
        img = Pomodoro.PLAY_IMAGE;
        img.width = iw + 10;
        img.height = ih;
    }

    const offCanvas = document.createElement("canvas");
    offCanvas.width = w; 
    offCanvas.height = h; 
    const offCtx = offCanvas.getContext("2d");

    offCtx.drawImage(img, 0, 0, img.width, img.height); 
    const imageData = offCtx.getImageData(0, 0, img.width, img.height); 
    const data = imageData.data; 

    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) {
            data[i] = colorSettings.pomodoro.image.rgb[0];
            data[i + 1] = colorSettings.pomodoro.image.rgb[1];
            data[i + 2] = colorSettings.pomodoro.image.rgb[2];
        }
    }
    offCtx.putImageData(imageData, 0, 0);
    return offCanvas;
}

function fadePomodoro(fadeIn, fadeInter, ctx, maxTime, timeMissing, isCounting) {
    let opacity = 0; 
    fadeInter.interval = setInterval(() => {
        opacity += 1; 
        if (opacity == 10 && !fadeIn) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
        if (opacity > 10) {
            clearInterval(fadeInter.interval);
            fadeInter.interval = null;
        }

        const otherCanvas = document.createElement("canvas");
        otherCanvas.width = ctx.canvas.width;
        otherCanvas.height = ctx.canvas.height;
        const otherCtx = otherCanvas.getContext("2d");
        drawPomodoro(otherCtx, maxTime, timeMissing, isCounting);

        ctx.globalAlpha = opacity / 10.0;
        ctx.drawImage(otherCanvas, 0, 0);
        ctx.globalAlpha = 1;
    }, 30); 
}

function clickPomodoro(ctx, maxTime, timeMissing, isCounting) {
    let interval; 
    return interval = setInterval(() => {
        drawPomodoro(ctx, maxTime, timeMissing, isCounting); 
    });
}

export { createCtx, drawPomodoro, fadePomodoro, clickPomodoro }; 
