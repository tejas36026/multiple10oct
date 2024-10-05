// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const width = imageData.width;
//     const height = imageData.height;

//     const newImageData = new ImageData(width, height);

//     // Copy the original image data
//     newImageData.data.set(imageData.data);

//     // Calculate the quadrant boundaries
//     const halfWidth = Math.floor(width / 2);
//     const halfHeight = Math.floor(height / 2);

//     // Shift amount (you can replace this with any other effect)
//     const shiftX = Math.floor(value * halfWidth);
//     const shiftY = Math.floor(value * halfHeight);
//     const segmentedImages = [];

//     for (let y = halfHeight; y < height; y++) {
//         for (let x = 0; x < halfWidth; x++) {
//             const newX = (x + shiftX) % halfWidth;
//             const newY = halfHeight + ((y - halfHeight + shiftY) % halfHeight);

//             const sourceIndex = (y * width + x) * 4;
//             const targetIndex = (newY * width + newX) * 4;

//             for (let i = 0; i < 4; i++) {
//                 newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
//             }
//         }         

//     }
//     segmentedImages.push(newImageData);

// console.log('imageData :>> ', imageData);
//     // self.postMessage({ imageData: newImageData });
//     self.postMessage({ segmentedImages, isComplete: true });

    
// };


self.onmessage = function(e) {
    const { imageData, selectedRegions, imageCount } = e.data;
    const width = imageData.width;
    const height = imageData.height;

    const segmentedImages = [];
    const maxShiftX = Math.floor(width * 0.2);  // 20% of width max, negative for left movement
    const maxShiftY = Math.floor(height * 0.2); // 20% of height max

    // Create a set of selected pixels for faster lookup
    const selectedPixels = new Set(selectedRegions.flat());

    for (let i = 0; i < imageCount; i++) {
        const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
        
        // Calculate shift for this frame
        const progress = i / (imageCount - 1);
        const shiftX = -Math.floor(maxShiftX * progress); // Negative for left movement
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