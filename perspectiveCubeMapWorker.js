self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const cubeRotation = value * 360 * Math.PI / 180;
    
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = new ImageData(width, height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const u = (x / width) * 2 - 1;
            const v = (y / height) * 2 - 1;
            
            let x3d = Math.cos(cubeRotation) * u - Math.sin(cubeRotation) * v;
            let y3d = Math.sin(cubeRotation) * u + Math.cos(cubeRotation) * v;
            let z3d = 1;
            
            const absX = Math.abs(x3d);
            const absY = Math.abs(y3d);
            const absZ = Math.abs(z3d);
            
            let sourceX, sourceY;
            if (absX >= absY && absX >= absZ) {
                sourceX = (y3d / absX + 1) / 2;
                sourceY = (z3d / absX + 1) / 2;
            } else if (absY >= absX && absY >= absZ) {
                sourceX = (x3d / absY + 1) / 2;
                sourceY = (z3d / absY + 1) / 2;
            } else {
                sourceX = (x3d / absZ + 1) / 2;
                sourceY = (y3d / absZ + 1) / 2;
            }
            
            sourceX = Math.floor(sourceX * width);
            sourceY = Math.floor(sourceY * height);
            
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