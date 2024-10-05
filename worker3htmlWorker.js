// importScripts('https://unpkg.com/tesseract.js@v2.1.0/dist/tesseract.min.js');
try { window } catch (err) {
    console.log("Oops, `window` is not defined")
  }
  let window;
// importScripts('https://docs.opencv.org/4.5.2/opencv.js');
// importScripts('tesseract.min.js');
importScripts('opencv.js')

self.onmessage = function(e) {
    if (e.data.action === 'processImage') {
        processWithMultipleThresholds(e.data.image);
    }
};

let cv;
let cvReady = false;
let tesseract;
let tesseractWorker;
// let window


function loadTesseract() {
    return new Promise((resolve, reject) => {
        if (!self.Tesseract) {
            importScripts('tesseract.min.js');
        }
        
        if (!tesseractWorker) {
            Tesseract.createWorker()
                .then(worker => {
                    tesseractWorker = worker;
                    return worker.load();
                })
                .then(() => tesseractWorker.loadLanguage('eng'))
                .then(() => tesseractWorker.initialize('eng'))
                .then(() => resolve())
                .catch(reject);
        } else {
            resolve();
        }
    });
}
async function initTesseract() {
    await loadTesseract();
    const worker = await tesseract.createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    return worker;
}

function onOpenCvReady() {
    cv = self.cv;
    cvReady = true;
    console.log('OpenCV.js is ready in Web Worker.');
}

if (self.cv) {
    onOpenCvReady();
} else {
    self.addEventListener('opencv-loaded', onOpenCvReady);
}

async function processWithMultipleThresholds(imageData) {
    try {
        await loadTesseract(); // Load Tesseract once before processing

        const thresholds = [150, 175];
        let bestThreshold = 0;
        let maxTextLength = 0;
        let bestText = '';
        let bestWords = [];
        let thresholdResults = [];

        const canvas = new OffscreenCanvas(imageData.width, imageData.height);
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);

        for (let threshold of thresholds) {
            const preprocessedCanvas = preprocess(canvas, threshold);
            const { text, words } = await detectText(preprocessedCanvas);
            
            if (text.length > maxTextLength) {
                maxTextLength = text.length;
                bestThreshold = threshold;
                bestText = text;
                bestWords = words;
            }

            thresholdResults.push({
                value: threshold,
                image: preprocessedCanvas.toDataURL(),
                textLength: text.length,
                text: text
            });
        }

        const textRemovedCanvas = await removeTextAndFillWithFallback(canvas, bestWords);

        self.postMessage({
            action: 'processComplete',
            result: {
                bestThreshold: bestThreshold,
                maxTextLength: maxTextLength,
                bestText: bestText,
                originalImage: canvas.toDataURL(),
                textRemovedImage: textRemovedCanvas.toDataURL(),
                thresholds: thresholdResults
            }
        });
    } catch (error) {
        console.error("An error occurred during processing:", error);
        console.log('error.message :>> ', error.message);
        self.postMessage({action: 'error', message: error.message});
    }
}

function preprocess(canvas, threshold) {
    if (!cvReady) {
        throw new Error('OpenCV is not ready yet');
    }
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const val = avg > threshold ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = val;
    }

    const outputCanvas = new OffscreenCanvas(canvas.width, canvas.height);
    const outputCtx = outputCanvas.getContext('2d');
    outputCtx.putImageData(imageData, 0, 0);
    return outputCanvas;
}


async function detectText(canvas) {
    try {
        await loadTesseract();
        const result = await tesseractWorker.recognize(canvas);
        return { text: result.data.text, words: result.data.words };
    } catch (error) {
        console.error('Error in text detection:', error);
        return { text: '', words: [] };
    }
}

async function removeTextAndFillWithFallback(canvas, words) {
    try {
        return await removeTextAndFillOpenCV(canvas, words);
    } catch (error) {
        console.warn("OpenCV.js processing failed, falling back to JavaScript method:", error);
        return removeTextAndFillJS(canvas, words);
    }
}

function removeTextAndFillOpenCV(canvas, words) {
    return new Promise((resolve, reject) => {
        if (!cvReady) {
            reject(new Error('OpenCV is not ready yet'));
            return;
        }
        try {
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let src = cv.matFromImageData(imageData);
            let dst = new cv.Mat();
            let mask = cv.Mat.zeros(src.rows, src.cols, cv.CV_8U);

            for (let word of words) {
                let pt1 = new cv.Point(word.bbox.x0, word.bbox.y0);
                let pt2 = new cv.Point(word.bbox.x1, word.bbox.y1);
                cv.rectangle(mask, pt1, pt2, [255, 255, 255, 255], -1);
            }

            cv.inpaint(src, mask, dst, 3, cv.INPAINT_TELEA);

            const outputCanvas = new OffscreenCanvas(canvas.width, canvas.height);
            cv.imshow(outputCanvas, dst);

            src.delete(); dst.delete(); mask.delete();

            resolve(outputCanvas);
        } catch (error) {
            console.error('Error in removeTextAndFillOpenCV:', error);
            reject(error);
        }
    });
}

function removeTextAndFillJS(canvas, words) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let word of words) {
        const padding = 2; 
        const x0 = Math.max(0, word.bbox.x0 - padding);
        const y0 = Math.max(0, word.bbox.y0 - padding);
        const x1 = Math.min(canvas.width, word.bbox.x1 + padding);
        const y1 = Math.min(canvas.height, word.bbox.y1 + padding);

        for (let y = y0; y < y1; y++) {
            for (let x = x0; x < x1; x++) {
                const index = (y * canvas.width + x) * 4;
                const surroundingPixels = getSurroundingPixels(data, x, y, canvas.width, canvas.height, 5);
                const [r, g, b] = averageColor(surroundingPixels);
                data[index] = r;
                data[index + 1] = g;
                data[index + 2] = b;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

function getSurroundingPixels(data, x, y, width, height, radius) {
    const pixels = [];
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const index = (ny * width + nx) * 4;
                pixels.push([data[index], data[index + 1], data[index + 2]]);
            }
        }
    }
    return pixels;
}

function averageColor(pixels) {
    const sum = pixels.reduce((acc, pixel) => [acc[0] + pixel[0], acc[1] + pixel[1], acc[2] + pixel[2]], [0, 0, 0]);
    return sum.map(v => Math.round(v / pixels.length));
}