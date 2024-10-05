self.onmessage = function(e) {
    const { imageData, selectedRegions, imageCount, value1, value2, value3, value4, value5 } = e.data;
    
    const lipRegion = selectedRegions[0];
    
    let segmentedImages = [];
    
    const mouthShapes = [
        { openness: 0.1, width: 1.0, height: 1.0 },  // Normal
        { openness: 0.7, width: 1.2, height: 0.8 },  // A,E,I
        { openness: 0.1, width: 0.9, height: 1.1 },  // B,M,P
        { openness: 0.4, width: 1.1, height: 0.9 },  // C,D,G,K,N,S,T,X,Y,Z
        { openness: 0.3, width: 1.0, height: 1.0 },  // F,V
        { openness: 0.6, width: 0.7, height: 0.7 },  // O
        { openness: 0.4, width: 0.8, height: 0.9 },  // U
        { openness: 0.5, width: 0.9, height: 1.1 },  // R
        { openness: 0.3, width: 1.3, height: 0.8 },  // Smile
        { openness: 0.1, width: 0.6, height: 1.2 }   // Kiss
    ];

    for (let i = 0; i < imageCount; i++) {

        let modifiedImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
        
        // Choose a random mouth shape
        const shapeIndex = Math.floor(Math.random() * mouthShapes.length);
        const shape = mouthShapes[shapeIndex];
        
        // Modify the lip region for this frame
        lipSync(modifiedImageData, lipRegion, shape, value1, value2, value3);
        
        // Add the modified image to the array
        segmentedImages.push(modifiedImageData);
    }
    
    // Send the processed images back to the main thread
    self.postMessage({
        segmentedImages: segmentedImages,
        isComplete: true
    });
};

function lipSync(imageData, lipRegion, shape, intensity, smoothness, stretch) {
    const centerX = imageData.width / 2;
    const centerY = imageData.height / 2;

    for (let i = 0; i < lipRegion.length; i++) {
        const pixelIndex = lipRegion[i];
        const x = pixelIndex % imageData.width;
        const y = Math.floor(pixelIndex / imageData.width);
        
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Apply shape transformations
        const opennessFactor = y < centerY ? 1 : (1 + shape.openness * intensity / 100);
        const widthFactor = shape.width + (stretch / 100);
        const newDistance = distance * (opennessFactor * shape.height);
        const newAngle = angle * widthFactor;

        const newX = centerX + newDistance * Math.cos(newAngle);
        const newY = centerY + newDistance * Math.sin(newAngle);

        // Apply smoothing
        const smoothX = x + (newX - x) * (smoothness / 100);
        const smoothY = y + (newY - y) * (smoothness / 100);

        // Apply the transformation
        if (smoothX >= 0 && smoothX < imageData.width && smoothY >= 0 && smoothY < imageData.height) {
            const oldIndex = (y * imageData.width + x) * 4;
            const newIndex = (Math.floor(smoothY) * imageData.width + Math.floor(smoothX)) * 4;
            
            imageData.data[newIndex] = imageData.data[oldIndex];
            imageData.data[newIndex + 1] = imageData.data[oldIndex + 1];
            imageData.data[newIndex + 2] = imageData.data[oldIndex + 2];
            imageData.data[newIndex + 3] = imageData.data[oldIndex + 3];
        }
    }
}