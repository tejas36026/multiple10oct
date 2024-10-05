self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const width = imageData.width;
    const height = imageData.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const segments = Math.floor(value);

    const newImageData = new ImageData(width, height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            let angle = Math.atan2(dy, dx);
            const distance = Math.sqrt(dx * dx + dy * dy);

            angle = ((angle % (Math.PI * 2 / segments)) + Math.PI * 2) % (Math.PI * 2);
            
            const sourceX = Math.round(centerX + distance * Math.cos(angle));
            const sourceY = Math.round(centerY + distance * Math.sin(angle));

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