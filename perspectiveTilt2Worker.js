self.onmessage = function(e) {
    const { imageData, value, clickedPoints } = e.data;
    const result = applyPerspectiveTilt(imageData, value, clickedPoints);
    self.postMessage({ imageData: result });
  };
  
  function applyPerspectiveTilt(imageData, value, clickedPoints) {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let totalTiltX = 0;
            let totalTiltY = 0;
            let totalWeight = 0;

            // Calculate weighted tilt based on distance to clicked points
            clickedPoints.forEach(point => {
                const dx = x - point.x;
                const dy = y - point.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const weight = 1 / (1 + distance * 0.01);

                totalTiltX += value.tiltX * weight;
                totalTiltY += value.tiltY * weight;
                totalWeight += weight;
            });

            // Normalize the tilt
            const tiltX = totalWeight > 0 ? totalTiltX / totalWeight : value.tiltX;
            const tiltY = totalWeight > 0 ? totalTiltY / totalWeight : value.tiltY;

            // Apply perspective transformation
            const sourceX = x + tiltX * (x - width/2);
            const sourceY = y + tiltY * (y - height/2);

            if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                const targetIndex = (y * width + x) * 4;
                const sourceIndex = (Math.floor(sourceY) * width + Math.floor(sourceX)) * 4;

                for (let i = 0; i < 4; i++) {
                    newData[targetIndex + i] = data[sourceIndex + i];
                }
            }
        }
    }

    return new ImageData(newData, width, height);
}