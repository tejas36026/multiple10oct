self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const width = imageData.width;
    const height = imageData.height;

    const newImageData = new ImageData(width, height);

    // Copy the original image data
    newImageData.data.set(imageData.data);

    // Calculate the quadrant boundaries
    const halfWidth = Math.floor(width / 2);
    const halfHeight = Math.floor(height / 2);

    // Shift amount (you can replace this with any other effect)
    const shiftX = Math.floor(value * halfWidth);
    const shiftY = Math.floor(value * halfHeight);

    for (let y = 0; y < halfHeight; y++) {
        for (let x = 0; x < halfWidth; x++) {
            const newX = (x + shiftX) % halfWidth;
            const newY = (y + shiftY) % halfHeight;

            const sourceIndex = (y * width + x) * 4;
            const targetIndex = (newY * width + newX) * 4;

            for (let i = 0; i < 4; i++) {
                newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
            }
        }
    }

    self.postMessage({ imageData: newImageData });
};