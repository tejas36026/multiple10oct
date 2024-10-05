self.onmessage = function(e) {
    const { imageData, gridSize } = e.data;
    const segments = segmentImage(imageData, gridSize);
    self.postMessage({ segments: segments });
};

function segmentImage(imageData, gridSize) {
    const width = imageData.width;
    const height = imageData.height;
    const segmentWidth = Math.floor(width / gridSize);
    const segmentHeight = Math.floor(height / gridSize);
    const segments = [];

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const startX = x * segmentWidth;
            const startY = y * segmentHeight;
            const endX = (x === gridSize - 1) ? width : (x + 1) * segmentWidth;
            const endY = (y === gridSize - 1) ? height : (y + 1) * segmentHeight;
            
            const segmentData = new ImageData(endX - startX, endY - startY);
            
            for (let j = startY; j < endY; j++) {
                for (let i = startX; i < endX; i++) {
                    const sourceIndex = (j * width + i) * 4;
                    const targetIndex = ((j - startY) * segmentData.width + (i - startX)) * 4;
                    
                    segmentData.data[targetIndex] = imageData.data[sourceIndex];
                    segmentData.data[targetIndex + 1] = imageData.data[sourceIndex + 1];
                    segmentData.data[targetIndex + 2] = imageData.data[sourceIndex + 2];
                    segmentData.data[targetIndex + 3] = imageData.data[sourceIndex + 3];
                }
            }
            
            segments.push(segmentData);
        }
    }

    return segments;
}