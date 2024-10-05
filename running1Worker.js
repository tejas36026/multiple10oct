// runningAnimationWorker.js

self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const width = imageData.width;
    const height = imageData.height;

    const newImageData = new ImageData(width, height);

    // Animation parameters
    const cycleLength = 100; // Adjust for faster/slower animation
    const verticalShift = Math.sin(value * Math.PI * 2 / cycleLength) * 10;
    const horizontalShift = Math.cos(value * Math.PI * 2 / cycleLength) * 5;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Apply vertical and horizontal shift
            let sourceX = x - horizontalShift;
            let sourceY = y - verticalShift;

            // Wrap around if out of bounds
            sourceX = (sourceX + width) % width;
            sourceY = (sourceY + height) % height;

            const sourceIndex = (Math.floor(sourceY) * width + Math.floor(sourceX)) * 4;
            const targetIndex = (y * width + x) * 4;

            // Copy pixel data
            for (let i = 0; i < 4; i++) {
                newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
            }
        }
    }

    // Simulate limb movement by slightly deforming the lower part of the image
    const limbMovement = Math.sin(value * Math.PI * 2 / cycleLength) * 5;
    for (let y = Math.floor(height * 0.6); y < height; y++) {
        for (let x = 0; x < width; x++) {
            const deform = Math.sin((y / height) * Math.PI) * limbMovement;
            let sourceX = x + deform;
            sourceX = (sourceX + width) % width;

            const sourceIndex = (y * width + Math.floor(sourceX)) * 4;
            const targetIndex = (y * width + x) * 4;

            for (let i = 0; i < 4; i++) {
                newImageData.data[targetIndex + i] = newImageData.data[sourceIndex + i];
            }
        }
    }

    self.postMessage({ imageData: newImageData });
};