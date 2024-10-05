self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const skewFactor = value * 2 - 1; // -1 to 1
    
    const width = imageData.width;
    const height = imageData.height;
    
    const newImageData = new ImageData(width, height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const skewX = Math.round(x + skewFactor * y);
            
            if (skewX >= 0 && skewX < width) {
                const oldIndex = (y * width + x) * 4;
                const newIndex = (y * width + skewX) * 4;
                
                newImageData.data[newIndex] = imageData.data[oldIndex];
                newImageData.data[newIndex + 1] = imageData.data[oldIndex + 1];
                newImageData.data[newIndex + 2] = imageData.data[oldIndex + 2];
                newImageData.data[newIndex + 3] = imageData.data[oldIndex + 3];
            }
        }
    }
    
    self.postMessage({ imageData: newImageData });
};