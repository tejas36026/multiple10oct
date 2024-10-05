
self.onmessage = function(e) {
    const { imageData, selectedRegions, imageCount, maxBrightness, value1, value2, value3, value4, value5 } = e.data;
    
    const totalIterations = 10;
    let allProcessedImages = [];
    
    // Generate 10 variations
    for (let i = 0; i < totalIterations; i++) {
        // Calculate a dynamic radius based on the iteration
        const radius = Math.max(1, Math.min(10, Math.floor(value1 * (i + 1) / totalIterations)));
        
        let processedImageData = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
        applyEdgeWork(imageData, processedImageData, radius, selectedRegions);
        allProcessedImages.push(processedImageData);
        
        // Send a progress update
        self.postMessage({ 
            progress: (i + 1) / totalIterations, 
            segmentedImages: [processedImageData]
        });
    }
    
    // Select imageCount number of images from the processed images
    let segmentedImages = [];
    for (let i = 0; i < imageCount; i++) {
        const index = Math.floor(i * (totalIterations / imageCount));
        if (allProcessedImages[index]) {
            segmentedImages.push(allProcessedImages[index]);
        }
    }
    console.log('segmentedImages :>> ', segmentedImages);
    self.postMessage({ segmentedImages: segmentedImages, isComplete: true });
};

function applyEdgeWork(sourceImageData, targetImageData, radius, selectedRegions) {
    const width = sourceImageData.width;
    const height = sourceImageData.height;
    
    const selectedPixels = new Set(selectedRegions.flat());
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const targetIndex = (y * width + x) * 4;
            
            // Only process pixels in the selected region
            if (selectedPixels.has(y * width + x)) {
                let minIntensity = 255;
                let maxIntensity = 0;
                
                for (let ky = -radius; ky <= radius; ky++) {
                    for (let kx = -radius; kx <= radius; kx++) {
                        const newX = Math.min(Math.max(x + kx, 0), width - 1);
                        const newY = Math.min(Math.max(y + ky, 0), height - 1);
                        const sourceIndex = (newY * width + newX) * 4;
                        const intensity = (sourceImageData.data[sourceIndex] + sourceImageData.data[sourceIndex + 1] + sourceImageData.data[sourceIndex + 2]) / 3;
                        
                        minIntensity = Math.min(minIntensity, intensity);
                        maxIntensity = Math.max(maxIntensity, intensity);
                    }
                }
                
                const edgeIntensity = maxIntensity - minIntensity;
                targetImageData.data[targetIndex] = targetImageData.data[targetIndex + 1] = targetImageData.data[targetIndex + 2] = edgeIntensity;
                targetImageData.data[targetIndex + 3] = sourceImageData.data[targetIndex + 3]; // Preserve alpha
            } else {
                // For unselected regions, copy the original pixel
                targetImageData.data[targetIndex] = sourceImageData.data[targetIndex];
                targetImageData.data[targetIndex + 1] = sourceImageData.data[targetIndex + 1];
                targetImageData.data[targetIndex + 2] = sourceImageData.data[targetIndex + 2];
                targetImageData.data[targetIndex + 3] = sourceImageData.data[targetIndex + 3];
            }
        }
    }
}