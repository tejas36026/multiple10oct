self.onmessage = function(e) {
    const { imageData, value, clickedPoints } = e.data;
    console.log("Worker received:", { rotation: value.rotation, points: clickedPoints.length });
    
    const result = applyPerspectiveAroundPoints(imageData, value, clickedPoints);
    self.postMessage({ imageData: result });
};

function applyPerspectiveAroundPoints(imageData, value, clickedPoints) {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data.length);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let maxPerspective = 0;
            let closestPoint = null;

            clickedPoints.forEach(point => {
                const dx = x - point.x;
                const dy = y - point.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const perspective = Math.exp(-distance * 0.005);
                
                if (perspective > maxPerspective) {
                    maxPerspective = perspective;
                    closestPoint = point;
                }
            }); 

            if (maxPerspective > 0) {
                const perspectiveX = value.perspectiveX * maxPerspective;
                const perspectiveY = value.perspectiveY * maxPerspective;

                const sourceX = Math.round(x + perspectiveX * (x - closestPoint.x) / width);
                const sourceY = Math.round(y + perspectiveY * (y - closestPoint.y) / height);

                if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                    const targetIndex = (y * width + x) * 4;
                    const sourceIndex = (sourceY * width + sourceX) * 4;
                    for (let i = 0; i < 4; i++) {
                        newData[targetIndex + i] = data[sourceIndex + i];
                    }
                }
            } else {
                const index = (y * width + x) * 4;
                for (let i = 0; i < 4; i++) {
                    newData[index + i] = data[index + i];
                }
            }
        }
    }

    return new ImageData(newData, width, height);
}