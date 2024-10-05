self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const centerOffset = value * imageData.width / 4; // 0 to 1/4 of image width
    
    const width = imageData.width;
    const height = imageData.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const newImageData = new ImageData(width, height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            const sourceX = Math.floor((angle + Math.PI) / (2 * Math.PI) * width);
            const sourceY = Math.floor((distance + centerOffset) / (Math.max(width, height) / 2 + centerOffset) * height);
            
            if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                const sourceIndex = (sourceY * width + sourceX) * 4;
                const targetIndex = (y * width + x) * 4;
                
                for (let i = 0; i < 4; i++) {
                    newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
                }
            }
        }
    }
    
    self.postMessage({ imageData: newImageData });
};