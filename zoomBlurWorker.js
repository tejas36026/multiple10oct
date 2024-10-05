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
    const [strength, centerXRatio, centerYRatio] = value;
    const centerX = width * centerXRatio;
    const centerY = height * centerYRatio;

    const tempData = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = Math.sqrt(width * width + height * height);
            const factor = 1 - Math.min(distance / maxDistance, 1);
            const blurAmount = strength * factor;

            let r = 0, g = 0, b = 0, a = 0, totalWeight = 0;

            for (let i = 0; i < blurAmount; i++) {
                const weight = 1 - i / blurAmount;
                const sampleX = Math.round(centerX + dx * (1 - i / blurAmount));
                const sampleY = Math.round(centerY + dy * (1 - i / blurAmount));

                if (sampleX >= 0 && sampleX < width && sampleY >= 0 && sampleY < height) {
                    const sampleIndex = (sampleY * width + sampleX) * 4;
                    r += tempData[sampleIndex] * weight;
                    g += tempData[sampleIndex + 1] * weight;
                    b += tempData[sampleIndex + 2] * weight;
                    a += tempData[sampleIndex + 3] * weight;
                    totalWeight += weight;
                }
            }

            const dstIndex = (y * width + x) * 4;
            if (totalWeight > 0) {
                data[dstIndex] = r / totalWeight;
                data[dstIndex + 1] = g / totalWeight;
                data[dstIndex + 2] = b / totalWeight;
                data[dstIndex + 3] = a / totalWeight;
            }
        }
    }

    self.postMessage({ imageData, index, value });
};