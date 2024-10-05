self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const waveAmplitude = value * 20; // 0 to 20
    const waveFrequency = value * 10; // 0 to 10
    
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = new ImageData(width, height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const distortionX = Math.sin(y / height * Math.PI * waveFrequency) * waveAmplitude;
            const sourceX = Math.floor(x + distortionX);
            
            if (sourceX >= 0 && sourceX < width) {
                const sourceIndex = (y * width + sourceX) * 4;
                const targetIndex = (y * width + x) * 4;
                
                for (let i = 0; i < 4; i++) {
                    newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
                }
            }
        }
    }
    
    self.postMessage({ imageData: newImageData });
};