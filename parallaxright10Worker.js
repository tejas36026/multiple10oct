self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions,
        imageCount,
        maxBrightness,
        value1,
        value2,
        value3,
        value4,
        value5,
        clickedPoints,
        lines
    } = e.data;
    
    const segmentedImages = [];
    const width = imageData.width;
    const height = imageData.height;

    function cloneAndMoveRegion(imageData, selectedRegion, shiftAmount) {
        const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);

        selectedRegion.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            const index = (y * width + x) * 4;

            // Apply horizontal shift
            const newX = (x + shiftAmount) % width;
            const newIndex = (y * width + newX) * 4;

            newImageData.data[newIndex] = imageData.data[index];
            newImageData.data[newIndex + 1] = imageData.data[index + 1];
            newImageData.data[newIndex + 2] = imageData.data[index + 2];
            newImageData.data[newIndex + 3] = imageData.data[index + 3];
        });

        return newImageData;
    }

    selectedRegions.forEach(region => {
        for (let i = 0; i < imageCount; i++) {
            const shiftAmount = i*2; // Move by 1 pixel for each clone
            const newImageData = cloneAndMoveRegion(imageData, region, shiftAmount);
            segmentedImages.push(newImageData);
        }
    });

    // Post the result back to the main thread
    self.postMessage({
        segmentedImages: segmentedImages,
        isComplete: true
    });
};