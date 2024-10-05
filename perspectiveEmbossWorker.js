self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const strength = value * 5; // 0 to 5
    
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = new ImageData(width, height);
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const tl = (y - 1) * width + (x - 1);
            const br = (y + 1) * width + (x + 1);
            
            for (let i = 0; i < 3; i++) {
                const diff = imageData.data[br * 4 + i] - imageData.data[tl * 4 + i];
                newImageData.data[(y * width + x) * 4 + i] = 128 + diff * strength;
            }
            newImageData.data[(y * width + x) * 4 + 3] = imageData.data[(y * width + x) * 4 + 3];
        }
    }
    
    self.postMessage({ imageData: newImageData });
};