
function fastBlur(data, width, height, radius) {
    const tempData = new Uint8ClampedArray(data.length);
    const size = width * height;

    // Horizontal pass
    for (let i = 0; i < size; i++) {
        let r = 0, g = 0, b = 0, a = 0;
        let hits = 0;
        for (let j = Math.max(0, i - radius); j < Math.min(size, i + radius + 1); j++) {
            r += data[j * 4];
            g += data[j * 4 + 1];
            b += data[j * 4 + 2];
            a += data[j * 4 + 3];
            hits++;
        }
        tempData[i * 4] = r / hits;
        tempData[i * 4 + 1] = g / hits;
        tempData[i * 4 + 2] = b / hits;
        tempData[i * 4 + 3] = a / hits;
    }

    // Vertical pass
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            let r = 0, g = 0, b = 0, a = 0;
            let hits = 0;
            for (let k = Math.max(0, j - radius); k < Math.min(height, j + radius + 1); k++) {
                r += tempData[(k * width + i) * 4];
                g += tempData[(k * width + i) * 4 + 1];
                b += tempData[(k * width + i) * 4 + 2];
                a += tempData[(k * width + i) * 4 + 3];
                hits++;
            }
            data[(j * width + i) * 4] = r / hits;
            data[(j * width + i) * 4 + 1] = g / hits;
            data[(j * width + i) * 4 + 2] = b / hits;
            data[(j * width + i) * 4 + 3] = a / hits;
        }
    }
}

self.onmessage = function(e) {
    const { imageData, value, index } = e.data;
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const [startY, endY] = value;

    const tempData = new Uint8ClampedArray(data);
    const blurredData = new Uint8ClampedArray(data);

    // Apply maximum blur to the entire image
    fastBlur(blurredData, width, height, 20);

    const transitionSize = height * 0.1; // 10% of the image height for transition

    for (let y = 0; y < height; y++) {
        let blendFactor;
        if (y < startY * height - transitionSize / 2) {
            blendFactor = 1;
        } else if (y > endY * height + transitionSize / 2) {
            blendFactor = 1;
        } else if (y >= startY * height + transitionSize / 2 && y <= endY * height - transitionSize / 2) {
            blendFactor = 0;
        } else if (y < startY * height + transitionSize / 2) {
            blendFactor = 1 - (y - (startY * height - transitionSize / 2)) / transitionSize;
        } else {
            blendFactor = (y - (endY * height - transitionSize / 2)) / transitionSize;
        }

        blendFactor = Math.max(0, Math.min(1, blendFactor)); // Ensure blendFactor is between 0 and 1

        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            data[i] = blurredData[i] * blendFactor + tempData[i] * (1 - blendFactor);
            data[i + 1] = blurredData[i + 1] * blendFactor + tempData[i + 1] * (1 - blendFactor);
            data[i + 2] = blurredData[i + 2] * blendFactor + tempData[i + 2] * (1 - blendFactor);
            data[i + 3] = blurredData[i + 3] * blendFactor + tempData[i + 3] * (1 - blendFactor);
        }
    }

    self.postMessage({ imageData, index, value });
};