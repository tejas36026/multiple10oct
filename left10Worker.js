self.onmessage = function(e) {
    const { imageData, selectedRegions } = e.data;
    const width = imageData.width;
    const height = imageData.height;
    
    const totalIterations = 10;
    let allSegmentedImages = [];
    console.log(totalIterations);

    for (let i = 0; i < totalIterations; i++) {
        const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
        
        const horizontalOffset = Math.floor((width / totalIterations) * i); // Calculate horizontal offset
        
        if (i === 0) {
            console.log(`Initial horizontal offset: ${horizontalOffset}`);
        }
        if (i === totalIterations - 1) {
            console.log(`Final horizontal offset: ${horizontalOffset}`);
        }
        
        applyHorizontalEffectOpposite(imageData, newImageData, selectedRegions, width, height, horizontalOffset);
        
        allSegmentedImages.push(newImageData);
        
        if (i % 30 === 0) {
            self.postMessage({
                progress: (i / totalIterations) * 100,
                segmentedImages: allSegmentedImages
            });
            allSegmentedImages = []; // Clear the array to save memory
        }
    }
    
    self.postMessage({ segmentedImages: allSegmentedImages, isComplete: true });
};

function applyHorizontalEffectOpposite(sourceImageData, targetImageData, selectedRegions, width, height, horizontalOffset) {
    const selectedPixels = new Set(selectedRegions.flat());

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const sourceIndex = (y * width + x) * 4;
            const pixelPosition = y * width + x;
            
            if (selectedPixels.has(pixelPosition)) {
                // Calculate the new x position with horizontal offset for selected pixels, but moving in the opposite direction
                const newX = (x - horizontalOffset + width) % width;
                const targetIndex = (y * width + newX) * 4;
                
                // Copy the original pixel data to the new position
                targetImageData.data[targetIndex] = sourceImageData.data[sourceIndex];
                targetImageData.data[targetIndex + 1] = sourceImageData.data[sourceIndex + 1];
                targetImageData.data[targetIndex + 2] = sourceImageData.data[sourceIndex + 2];
                targetImageData.data[targetIndex + 3] = sourceImageData.data[sourceIndex + 3]; // Keep alpha unchanged
            } else {
                // For unselected regions, copy the original pixel to the same position
                targetImageData.data[sourceIndex] = sourceImageData.data[sourceIndex];
                targetImageData.data[sourceIndex + 1] = sourceImageData.data[sourceIndex + 1];
                targetImageData.data[sourceIndex + 2] = sourceImageData.data[sourceIndex + 2];
                targetImageData.data[sourceIndex + 3] = sourceImageData.data[sourceIndex + 3];
            }
        }
    }
}
