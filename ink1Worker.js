self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions,
        imageCount,
        maxBrightness, // This will be repurposed as maxThresholdChange
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
        // Create a copy of the original image data
        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );

        // Calculate threshold adjustment for this image
        const thresholdAdjustment = (i / (imageCount - 1)) * 8 - 4; // Range from -4 to 4

        // Apply ink effect to selected regions
        for (const region of selectedRegions) {
            for (const pixelIndex of region) {
                const x = pixelIndex % imageData.width;
                const y = Math.floor(pixelIndex / imageData.width);
                const index = (y * imageData.width + x) * 4;

                const brightness = (newImageData.data[index] + newImageData.data[index + 1] + newImageData.data[index + 2]) / 3;
                const threshold = 128 + thresholdAdjustment * 32;
                const color = brightness > threshold ? 255 : 0;

                newImageData.data[index] = newImageData.data[index + 1] = newImageData.data[index + 2] = color;
            }
        }

        // Apply additional effects based on value1, value2, etc.
        applyAdditionalEffects(newImageData, value1, value2, value3, value4, value5);

        segmentedImages.push(newImageData);
    }

    // Send the processed images back to the main script
    self.postMessage({ segmentedImages: segmentedImages });
};

function applyAdditionalEffects(imageData, value1, value2, value3, value4, value5) {
    // This function can be customized to apply additional effects based on the input values
    // For example, you could use these values to adjust the ink effect further
    
    const invertColors = value1 > 50; // Invert colors if value1 is greater than 50

    for (let i = 0; i < imageData.data.length; i += 4) {
        if (invertColors) {
            imageData.data[i] = 255 - imageData.data[i];
            imageData.data[i + 1] = 255 - imageData.data[i + 1];
            imageData.data[i + 2] = 255 - imageData.data[i + 2];
        }
    }

    // You can add more effects using the other values (value2, value3, etc.)
}