self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions,
        imageCount,
        maxVibrance,
        value1,
        value2,
        value3,
        value4,
        value5,
        clickedPoints,
        lines
    } = e.data;

    const segmentedImages = [];

    for (let i = 0; i < imageCount; i++) {
        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );

        // Calculate vibrance adjustment for this image
        const vibranceAdjustment = (i / (imageCount - 1)) * maxVibrance;

        for (const region of selectedRegions) {
            for (const pixelIndex of region) {
                const x = pixelIndex % imageData.width;
                const y = Math.floor(pixelIndex / imageData.width);
                const index = (y * imageData.width + x) * 4;

                applyVibrance(newImageData.data, index, vibranceAdjustment);
            }
        }

        applyAdditionalEffects(newImageData, value1, value2, value3, value4, value5);
        segmentedImages.push(newImageData);
    }

    self.postMessage({ segmentedImages: segmentedImages });
};

function applyVibrance(data, index, amount) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];

    const max = Math.max(r, g, b);
    const avg = (r + g + b) / 3;
    const diff = max - avg;

    const factor = 1 + (amount / 100) * (1 - diff / 128);

    data[index] = Math.min(255, r * factor);
    data[index + 1] = Math.min(255, g * factor);
    data[index + 2] = Math.min(255, b * factor);
}

function applyAdditionalEffects(imageData, value1, value2, value3, value4, value5) {
    // Existing implementation
}

function applyAdditionalEffects(imageData, value1, value2, value3, value4, value5) {
    // This function remains unchanged
    const redAdjustment = value1 / 100;

    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] * (1 + redAdjustment)));
    }
}