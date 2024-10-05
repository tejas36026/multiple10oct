self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions,
        value1, // Use this for denoising strength
    } = e.data;

    const segmentedImages = [];
    const variationsCount = 5; // Reduced for faster processing

    for (let i = 0; i < variationsCount; i++) {
        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );

        const strength = (value1 / 100) * (i + 1) / variationsCount;
        applyBilateralFilter(newImageData, selectedRegions, strength);
        
        segmentedImages.push(newImageData);
    }

    self.postMessage({ segmentedImages: segmentedImages });
};

function applyBilateralFilter(imageData, selectedRegions, strength) {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data);

    const spatialSigma = 3 * strength;
    const rangeSigma = 50 * strength;
    const kernelSize = Math.ceil(3 * spatialSigma);

    function gaussianWeight(x, sigma) {
        return Math.exp(-(x * x) / (2 * sigma * sigma));
    }

    for (const region of selectedRegions) {
        for (const pixelIndex of region) {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);

            let weightSum = 0;
            let valueSum = 0;

            for (let dy = -kernelSize; dy <= kernelSize; dy++) {
                for (let dx = -kernelSize; dx <= kernelSize; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;

                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const neighborIndex = (ny * width + nx) * 4;
                        const centerIndex = pixelIndex * 4;

                        const spatialDist = Math.sqrt(dx * dx + dy * dy);
                        const colorDist = Math.abs(data[centerIndex] - data[neighborIndex]);

                        const weight = gaussianWeight(spatialDist, spatialSigma) * 
                                       gaussianWeight(colorDist, rangeSigma);

                        weightSum += weight;
                        valueSum += weight * data[neighborIndex];
                    }
                }
            }

            const outputValue = Math.round(valueSum / weightSum);
            const index = pixelIndex * 4;
            output[index] = output[index + 1] = output[index + 2] = outputValue;
        }
    }

    imageData.data.set(output);
}

// Helper functions (if needed for other operations)
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h * 360, s, l];
}

function hslToRgb(h, s, l) {
    h /= 360;
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function createKaiserWindow(size, beta) {
    const cacheKey = `${size}-${beta}`;
    if (kaiserWindowCache.has(cacheKey)) {
        return kaiserWindowCache.get(cacheKey);
    }
    const window = new Float32Array(size * size);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const x = (2 * i / (size - 1)) - 1;
            const y = (2 * j / (size - 1)) - 1;
            const r = Math.sqrt(x * x + y * y);
            window[i * size + j] = r <= 1 ? bessel(beta * Math.sqrt(1 - r * r)) / bessel(beta) : 0;
        }
    }
    kaiserWindowCache.set(cacheKey, window);
    return window;
}