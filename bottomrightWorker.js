// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const width = imageData.width;
//     const height = imageData.height;

//     const newImageData = new ImageData(width, height);

//     newImageData.data.set(imageData.data);

//     const halfWidth = Math.floor(width / 2);
//     const halfHeight = Math.floor(height / 2);

//     const shiftX = Math.floor(value * halfWidth);
//     const shiftY = Math.floor(value * halfHeight);

//     for (let y = halfHeight; y < height; y++) {
//         for (let x = halfWidth; x < width; x++) {
//             const newX = halfWidth + ((x - halfWidth + shiftX) % halfWidth);
//             const newY = halfHeight + ((y - halfHeight + shiftY) % halfHeight);

//             const sourceIndex = (y * width + x) * 4;
//             const targetIndex = (newY * width + newX) * 4;

//             for (let i = 0; i < 4; i++) {
//                 newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
//             }
//         }
//     }

//     self.postMessage({ imageData: newImageData });
// };

self.onmessage = function(e) {
    const { imageData, selectedRegions, imageCount } = e.data;
    const width = imageData.width;
    const height = imageData.height;

    const segmentedImages = [];
    const maxShiftX = Math.floor(width * 0.2);  // 20% of width max
    const maxShiftY = Math.floor(height * 0.2); // 20% of height max

    // Create a set of selected pixels for faster lookup
    const selectedPixels = new Set(selectedRegions.flat());

    for (let i = 0; i < imageCount; i++) {
        const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
        
        // Calculate shift for this frame
        const progress = i / (imageCount - 1);
        const shiftX = Math.floor(maxShiftX * progress);
        const shiftY = Math.floor(maxShiftY * progress);

        // Apply the shift effect to the selected regions
        selectedPixels.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);

            // Calculate new position with boundaries check
            const newX = Math.min(Math.max(x + shiftX, 0), width - 1);
            const newY = Math.min(Math.max(y + shiftY, 0), height - 1);

            const oldIndex = pixelIndex * 4;
            const newIndex = (newY * width + newX) * 4;

            // Copy pixel data to new position
            for (let j = 0; j < 4; j++) {
                newImageData.data[newIndex + j] = imageData.data[oldIndex + j];
            }

            // Clear the original position
            for (let j = 0; j < 4; j++) {
                newImageData.data[oldIndex + j] = 0;
            }
        });

        segmentedImages.push(newImageData);
    }

    self.postMessage({ segmentedImages, isComplete: true });
};