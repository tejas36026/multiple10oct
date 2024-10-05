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
    const radius = Math.min(25, Math.floor(value)); // Limit radius to improve performance

    fastBlur(data, width, height, radius);

    self.postMessage({ imageData, index, value });
};