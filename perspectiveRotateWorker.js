self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const angle = value * 360; // 0 to 360 degrees
    
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
            const originalAngle = Math.atan2(dy, dx);
            
            const newAngle = originalAngle + angle * Math.PI / 180;
            
            const newX = Math.round(centerX + distance * Math.cos(newAngle));
            const newY = Math.round(centerY + distance * Math.sin(newAngle));
            
            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                const oldIndex = (y * width + x) * 4;
                const newIndex = (newY * width + newX) * 4;
                
                newImageData.data[newIndex] = imageData.data[oldIndex];
                newImageData.data[newIndex + 1] = imageData.data[oldIndex + 1];
                newImageData.data[newIndex + 2] = imageData.data[oldIndex + 2];
                newImageData.data[newIndex + 3] = imageData.data[oldIndex + 3];
            }
        }
    }
    
    self.postMessage({ imageData: newImageData });
};