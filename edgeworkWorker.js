// self.onmessage = function(e) {
//     const { imageData, value, index } = e.data;
//     const data = imageData.data;
//     const width = imageData.width;
//     const height = imageData.height;
//     const radius = Math.min(10, Math.floor(value)); // Limit radius to improve performance

//     const tempData = new Uint8ClampedArray(data);

//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             let minIntensity = 255;
//             let maxIntensity = 0;

//             for (let ky = -radius; ky <= radius; ky++) {
//                 for (let kx = -radius; kx <= radius; kx++) {
//                     const newX = Math.min(Math.max(x + kx, 0), width - 1);
//                     const newY = Math.min(Math.max(y + ky, 0), height - 1);
//                     const sourceIndex = (newY * width + newX) * 4;
//                     const intensity = (tempData[sourceIndex] + tempData[sourceIndex + 1] + tempData[sourceIndex + 2]) / 3;

//                     minIntensity = Math.min(minIntensity, intensity);
//                     maxIntensity = Math.max(maxIntensity, intensity);
//                 }
//             }

//             const targetIndex = (y * width + x) * 4;
//             const edgeIntensity = maxIntensity - minIntensity;
//             data[targetIndex] = data[targetIndex + 1] = data[targetIndex + 2] = edgeIntensity;
//             data[targetIndex + 3] = tempData[targetIndex + 3]; // Preserve alpha
//         }
//     }

//     self.postMessage({ imageData, index, value });
// };



self.onmessage = function(e) {
    const { imageData, selectedRegions, imageCount, maxBrightness, value1, value2, value3, value4, value5 } = e.data;
    
    let segmentedImages = [];
    
    for (let i = 0; i < imageCount; i++) {
        // Calculate a dynamic radius based on the iteration
        const radius = Math.max(1, Math.min(10, Math.floor(value1 * (i + 1) / imageCount)));
        
        let processedImageData = applyEdgeWork(imageData, radius);
        segmentedImages.push(processedImageData);
    }
    
    self.postMessage({ segmentedImages: segmentedImages, isComplete: true });
};

function applyEdgeWork(imageData, radius) {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;
    
    const tempData = new Uint8ClampedArray(data);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let minIntensity = 255;
            let maxIntensity = 0;
            
            for (let ky = -radius; ky <= radius; ky++) {
                for (let kx = -radius; kx <= radius; kx++) {
                    const newX = Math.min(Math.max(x + kx, 0), width - 1);
                    const newY = Math.min(Math.max(y + ky, 0), height - 1);
                    const sourceIndex = (newY * width + newX) * 4;
                    const intensity = (tempData[sourceIndex] + tempData[sourceIndex + 1] + tempData[sourceIndex + 2]) / 3;
                    
                    minIntensity = Math.min(minIntensity, intensity);
                    maxIntensity = Math.max(maxIntensity, intensity);
                }
            }
            
            const targetIndex = (y * width + x) * 4;
            const edgeIntensity = maxIntensity - minIntensity;
            data[targetIndex] = data[targetIndex + 1] = data[targetIndex + 2] = edgeIntensity;
            data[targetIndex + 3] = tempData[targetIndex + 3]; // Preserve alpha
        }
    }
    
    return new ImageData(data, width, height);
}