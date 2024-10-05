self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const pinchStrength = value * 2 - 1; // -1 to 1
    
    const width = imageData.width;
    const height = imageData.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2;
    const newImageData = new ImageData(width, height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const normalized = Math.min(distance / radius, 1);
            const strength = Math.pow(normalized, 1 + pinchStrength);
            
            const sourceX = Math.floor(centerX + dx * strength);
            const sourceY = Math.floor(centerY + dy * strength);
            
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