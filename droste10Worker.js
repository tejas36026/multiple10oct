
self.onmessage = function(e) {
    const { imageData, selectedRegions } = e.data;
    const width = imageData.width;
    const height = imageData.height;
    
    const totalIterations = 10;
    let allSegmentedImages = [];
    console.log(totalIterations);

    for (let i = 0; i < totalIterations; i++) {
        const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
        
        // Calculate scaling factor based on the current iteration
        const scaleFactor = 1 - (i / totalIterations) * 0.5;
        
        if (i === 0) {
            console.log(`Initial scale factor: ${scaleFactor}`);
        }
        if (i === totalIterations - 1) {
            console.log(`Final scale factor: ${scaleFactor}`);
        }
        
        applyDrosteEffect(imageData, newImageData, scaleFactor, selectedRegions, width, height);
        
        allSegmentedImages.push(newImageData);
        
        if (i % 30 === 0) {
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

function applyDrosteEffect(sourceImageData, targetImageData, scaleFactor, selectedRegions, width, height) {
    // Create a Set for faster lookup of selected pixels
    const selectedPixels = new Set(selectedRegions.flat());

    const centerX = width / 2;
    const centerY = height / 2;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            
            // Only process pixels in the selected region
            if (selectedPixels.has(y * width + x)) {
                // Calculate the position relative to the center
                const relX = x - centerX;
                const relY = y - centerY;

                // Scale the position
                const scaledX = relX / scaleFactor;
                const scaledY = relY / scaleFactor;

                // Wrap the scaled position back to image coordinates
                const sourceX = Math.round((scaledX + centerX + width) % width);
                const sourceY = Math.round((scaledY + centerY + height) % height);

                // Get the color from the source position
                const sourceIndex = (sourceY * width + sourceX) * 4;
                targetImageData.data[index] = sourceImageData.data[sourceIndex];
                targetImageData.data[index + 1] = sourceImageData.data[sourceIndex + 1];
                targetImageData.data[index + 2] = sourceImageData.data[sourceIndex + 2];
                targetImageData.data[index + 3] = sourceImageData.data[sourceIndex + 3];
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