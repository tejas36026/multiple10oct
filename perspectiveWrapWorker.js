self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const warpStrength = value * 2; // 0 to 2
    
    const width = imageData.width;
    const height = imageData.height;
    
    const newImageData = new ImageData(width, height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const normalizedX = x / width - 0.5;
            const normalizedY = y / height - 0.5;
            
            const warpX = Math.round(x + warpStrength * normalizedX * Math.sin(normalizedY * Math.PI) * width);
            const warpY = Math.round(y + warpStrength * normalizedY * Math.sin(normalizedX * Math.PI) * height);
            
            if (warpX >= 0 && warpX < width && warpY >= 0 && warpY < height) {
                const oldIndex = (y * width + x) * 4;
                const newIndex = (warpY * width + warpX) * 4;
                
                newImageData.data[newIndex] = imageData.data[oldIndex];
                newImageData.data[newIndex + 1] = imageData.data[oldIndex + 1];
                newImageData.data[newIndex + 2] = imageData.data[oldIndex + 2];
                newImageData.data[newIndex + 3] = imageData.data[oldIndex + 3];
            }
        }
    }
    
    self.postMessage({ imageData: newImageData });
};