self.onmessage = function(e) {
    const { imageData, value, clickedPoints } = e.data;
    // console.log("Received animation points:", animationPoints);
    console.log("Worker received:", { valueX: value.tiltX, valueY: value.tiltY, points: clickedPoints.length });

    if (clickedPoints.length === 0) {
        self.postMessage({ error: "No animation points provided. Cannot process effect accurately." });
        return;
    }
    const result = applyPerspectiveTilt(imageData, value, clickedPoints);
    // console.log('result :>> ', result);
    self.postMessage({ imageData: result });
};

function applyPerspectiveTilt(imageData, value, points) {
    const { width, height } = imageData;
    const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let weightedTiltX = 0;
            let weightedTiltY = 0;
            let totalWeight = 0;
            
            points.forEach(point => {
                const dx = x - point.x;
                const dy = y - point.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const weight = 1 / (1 + distance * 0.001); // Decreased from 0.01 to increase influence

                weightedTiltX += value.tiltX * weight * 10; // Multiplied by 10 to increase effect
                weightedTiltY += value.tiltY * weight * 10;
      
                totalWeight += weight;
            });
            
            if (totalWeight === 0) {
                // If no points influence this pixel, apply a minimal default effect
                weightedTiltX = value.tiltX * 0.1;
                weightedTiltY = value.tiltY * 0.1;
            } else {
                weightedTiltX /= totalWeight;
                weightedTiltY /= totalWeight;
            }

            const tiltX = weightedTiltX * (x - centerX) / centerX * 50; // Multiplied by 50
            const tiltY = weightedTiltY * (y - centerY) / centerY * 50; // Multiplied by 50
            
            const sourceX = x + tiltX;
            const sourceY = y + tiltY;
            
            if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                const sourceIndex = (Math.floor(sourceY) * width + Math.floor(sourceX)) * 4;
                const targetIndex = (y * width + x) * 4;
                newImageData.data[targetIndex] = Math.min(255, newImageData.data[targetIndex] + 50);

                for (let i = 0; i < 4; i++) {
                    newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
                }
            }
        }
    }
    
    return newImageData;
}