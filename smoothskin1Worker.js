self.onmessage = function(e) {
    const { imageData, selectedRegions, imageCount, maxBrightness, value1, value2, value3 } = e.data;
    const segmentedImages = applyExtremeGaussianBlur(imageData, selectedRegions, imageCount, maxBrightness, value1, value2, value3);
    // self.postMessage({ segmentedImages });
    self.postMessage({ segmentedImages, isComplete: true });

};

function applyExtremeGaussianBlur(imageData, selectedRegions, imageCount, maxBrightness, baseRadius, intensityFactor, passes) {
    const segmentedImages = [];
    const width = imageData.width;
    const height = imageData.height;
console.log('height :>> ', height);
    for (let i = 0; i < imageCount; i++) {
        const strength = (i / (imageCount - 1)) * maxBrightness;
        const effectiveRadius = Math.max(1, Math.round(baseRadius * strength / 255 * intensityFactor));

        // Apply blur to the entire image
        let blurredImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
        for (let pass = 0; pass < passes; pass++) {
            blurredImageData = singlePassBlur(blurredImageData, effectiveRadius);
        }

        // Composite blurred image with original based on selected regions
        const compositeImageData = compositeImages(imageData, blurredImageData, selectedRegions, strength / 255);

        segmentedImages.push(compositeImageData);
    }

    return segmentedImages;
}

function singlePassBlur(imageData, radius) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
    const kernel = generateGaussianKernel(radius);
console.log('kernel :>> ', kernel);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const blurredColor = applyKernel(imageData, x, y, kernel, radius);
            setPixel(newImageData, x, y, blurredColor);
        }
    }

    return newImageData;
}

function compositeImages(originalImageData, blurredImageData, selectedRegions, blendFactor) {
    const width = originalImageData.width;
    const height = originalImageData.height;
    const compositeImageData = new ImageData(new Uint8ClampedArray(originalImageData.data), width, height);

    const selectedPixels = new Set(selectedRegions.flat());

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            if (selectedPixels.has(index)) {
                const originalColor = getPixel(originalImageData, x, y);
                const blurredColor = getPixel(blurredImageData, x, y);
                const blendedColor = blendColors(originalColor, blurredColor, blendFactor);
                setPixel(compositeImageData, x, y, blendedColor);
            }
        }
    }

    return compositeImageData;
}

function blendColors(color1, color2, factor) {
    return {
        r: Math.round(color1.r * (1 - factor) + color2.r * factor),
        g: Math.round(color1.g * (1 - factor) + color2.g * factor),
        b: Math.round(color1.b * (1 - factor) + color2.b * factor)
    };
}

function generateGaussianKernel(radius) {
    const size = radius * 2 + 1;
    const kernel = new Array(size).fill().map(() => new Array(size).fill(0));
    let sum = 0;

    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            const exponent = -(x * x + y * y) / (2 * radius * radius);
            const value = Math.exp(exponent) / (2 * Math.PI * radius * radius);
            kernel[y + radius][x + radius] = value;
            sum += value;
        }
    }

    // Normalize the kernel
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            kernel[y][x] /= sum;
        }
    }

    return kernel;
}

function applyKernel(imageData, centerX, centerY, kernel, radius) {
    const width = imageData.width;
    const height = imageData.height;
    let r = 0, g = 0, b = 0, weightSum = 0;

    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            const pixelX = Math.min(Math.max(centerX + x, 0), width - 1);
            const pixelY = Math.min(Math.max(centerY + y, 0), height - 1);
            const pixel = getPixel(imageData, pixelX, pixelY);
            const weight = kernel[y + radius][x + radius];

            r += pixel.r * weight;
            g += pixel.g * weight;
            b += pixel.b * weight;
            weightSum += weight;
        }
    }

    return {
        r: Math.round(r / weightSum),
        g: Math.round(g / weightSum),
        b: Math.round(b / weightSum)
    };
}

function getPixel(imageData, x, y) {
    const index = (y * imageData.width + x) * 4;
    return {
        r: imageData.data[index],
        g: imageData.data[index + 1],
        b: imageData.data[index + 2]
    };
}

function setPixel(imageData, x, y, color) {
    const index = (y * imageData.width + x) * 4;
    imageData.data[index] = color.r;
    imageData.data[index + 1] = color.g;
    imageData.data[index + 2] = color.b;
}