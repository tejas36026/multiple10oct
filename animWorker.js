
self.onmessage = function(e) {
    const { imageData, selectedRegions } = e.data;
    const width = imageData.width;
    const height = imageData.height;
    
    const totalIterations = 10;
    let allSegmentedImages = [];
    console.log(totalIterations);

    for (let i = 0; i < totalIterations; i++) {
        const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
        
        // Vary color quantization and edge detection threshold based on iteration
        const colorLevels = 2 + i; // Varies from 2 to 11
        const edgeThreshold = 30 + i * 5; // Varies from 30 to 75
        
        applySimplifiedCartoonEffect(imageData, newImageData, selectedRegions, width, height, colorLevels, edgeThreshold);
        
        allSegmentedImages.push(newImageData);
        
        if (i % 3 === 0 || i === totalIterations - 1) {
            self.postMessage({
                progress: (i / totalIterations) * 100,
                segmentedImages: allSegmentedImages
            });
            allSegmentedImages = []; // Clear the array to save memory
        }
    }
    
    // Send the final batch of processed images back to the main thread
    self.postMessage({ segmentedImages: allSegmentedImages, isComplete: true });
};

function applySimplifiedCartoonEffect(sourceImageData, targetImageData, selectedRegions, width, height, colorLevels, edgeThreshold) {
    // Create a Set for faster lookup of selected pixels
    const selectedPixels = new Set(selectedRegions.flat());

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            
            // Only process pixels in the selected region
            if (selectedPixels.has(y * width + x)) {
                const [r, g, b] = [
                    sourceImageData.data[index],
                    sourceImageData.data[index + 1],
                    sourceImageData.data[index + 2]
                ];
                
                // Simple edge detection
                const isEdge = (x > 0 && Math.abs(r - sourceImageData.data[index - 4]) > edgeThreshold) ||
                               (y > 0 && Math.abs(r - sourceImageData.data[index - width * 4]) > edgeThreshold);
                
                if (isEdge) {
                    // Draw edge in black
                    targetImageData.data[index] = 0;
                    targetImageData.data[index + 1] = 0;
                    targetImageData.data[index + 2] = 0;
                } else {
                    // Apply color quantization
                    const factor = 255 / (colorLevels - 1);
                    targetImageData.data[index] = Math.round(Math.round(r / factor) * factor);
                    targetImageData.data[index + 1] = Math.round(Math.round(g / factor) * factor);
                    targetImageData.data[index + 2] = Math.round(Math.round(b / factor) * factor);
                }
                targetImageData.data[index + 3] = sourceImageData.data[index + 3]; // Keep alpha unchanged
            } else {
                // For unselected regions, copy the original pixel
                targetImageData.data[index] = sourceImageData.data[index];
                targetImageData.data[index + 1] = sourceImageData.data[index + 1];
                targetImageData.data[index + 2] = sourceImageData.data[index + 2];
                targetImageData.data[index + 3] = sourceImageData.data[index + 3];
            }
        }
    }
}