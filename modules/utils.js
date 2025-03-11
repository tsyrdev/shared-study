const TWENTY_MINS = 20 * 60 * 1000; 
const TEN_MINS = 10 * 60 * 1000; 

function milliToMinSec(milli) {
    const minRes = Math.floor(milli / 1000 / 60); 
    const secRes = milli / 1000 - minRes * 60; 
    return { min: minRes, sec: secRes };
}

function minToMilli(min) {
    return min * 60 * 1000; 
}

function secToMilli(sec) {
    return sec * 1000; 
}

function timeToArc(max, miss) {
    return (miss * Math.PI * 2) / max;  
}

function loadImage(src) {
    return new Promise((res, rej) => {
        const img = new Image(); 
        img.src = src; 
        img.onload = () => res(img);
        img.onerror = () => rej(new Error(`Failed to load: ${src}`)); 
    });
}

export { TWENTY_MINS, TEN_MINS, minToMilli, secToMilli, milliToMinSec, loadImage, timeToArc };

