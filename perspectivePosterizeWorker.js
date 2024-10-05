self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const levels = Math.floor(value * 7) + 2; // 2 to 9 levels
    
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = new ImageData(width, height);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
        for (let j = 0; j < 3; j++) {
            newImageData.data[i + j] = Math.floor(imageData.data[i + j] / 255 * (levels - 1)) / (levels - 1) * 255;
        }
        newImageData.data[i + 3] = imageData.data[i + 3];
    }
    
    self.postMessage({ imageData: newImageData });
};