self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const foldAngle = value * 90; // 0 to 90 degrees
    
    const width = imageData.width;
    const height = imageData.height;
    const centerX = width / 2;
    
    const newImageData = new ImageData(width, height);
    
    const foldRadians = foldAngle * Math.PI / 180;
    const foldPosition = Math.round(width / 2);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sourceX;
            
            if (x < foldPosition) {
                sourceX = x;
            } else {
                const dx = x - foldPosition;
                const foldedX = dx * Math.cos(foldRadians);
                const foldedY = dx * Math.sin(foldRadians);
                
                sourceX = Math.round(foldPosition + foldedX);
                
                if (foldedY > y) {
                    continue; // Skip this pixel as it's "behind" the fold
                }
            }
            
            if (sourceX >= 0 && sourceX < width) {
                const oldIndex = (y * width + sourceX) * 4;
                const newIndex = (y * width + x) * 4;
                
                newImageData.data[newIndex] = imageData.data[oldIndex];
                newImageData.data[newIndex + 1] = imageData.data[oldIndex + 1];
                newImageData.data[newIndex + 2] = imageData.data[oldIndex + 2];
                newImageData.data[newIndex + 3] = imageData.data[oldIndex + 3];
            }
        }
    }
    
    self.postMessage({ imageData: newImageData });
};