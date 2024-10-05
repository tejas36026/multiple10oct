self.onmessage = function(e) {
    const { imageData, selectedRegions, imageCount, maxBrightness, value1, value2, value3, value4, value5, clickedPoints, lines } = e.data;

    // Process the image to close the mouth
    const closedMouthImageData = closeTheMouth(imageData, selectedRegions);

    // Create variations of the closed mouth image
    const variations = createVariations(closedMouthImageData, imageCount, maxBrightness, value1, value2, value3, value4, value5);

    self.postMessage({
        segmentedImages: variations,
        isComplete: true
    });
};

function closeTheMouth(imageData, selectedRegions) {

    const processedImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );

    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const i = pixelIndex * 4;
            // Darken the selected region to simulate a closed mouth
            processedImageData.data[i] = Math.max(0, processedImageData.data[i] - 50);     // Red
            processedImageData.data[i + 1] = Math.max(0, processedImageData.data[i + 1] - 50); // Green
            processedImageData.data[i + 2] = Math.max(0, processedImageData.data[i + 2] - 50); // Blue
        });
    });

    return processedImageData;
}

function createVariations(imageData, count, maxBrightness, value1, value2, value3, value4, value5) {
    const variations = [];

    for (let i = 0; i < count; i++) {
        // Create a copy of the image data for each variation
        const variationData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );

        // Apply some variations (this is a simple example; you can make this more complex)
        const brightnessChange = (Math.random() * 2 - 1) * maxBrightness;
        
        for (let j = 0; j < variationData.data.length; j += 4) {
            variationData.data[j] = Math.max(0, Math.min(255, variationData.data[j] + brightnessChange));
            variationData.data[j + 1] = Math.max(0, Math.min(255, variationData.data[j + 1] + brightnessChange));
            variationData.data[j + 2] = Math.max(0, Math.min(255, variationData.data[j + 2] + brightnessChange));
        }

        variations.push(variationData);
    }

    return variations;
}