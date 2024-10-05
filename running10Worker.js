self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const width = imageData.width;
    const height = imageData.height;

    const newImageData = new ImageData(width, height);

    // Unpack the input value (assuming it's a single number between 0 and 1)
    const t = value;

    // Animation parameters
    const cycleLength = 4; // Number of frames in the zoom cycle
    const phase = (t * cycleLength) % 1; // Current phase of the zoom cycle
    const zoomAmplitude = 0.2; // Amplitude of the zoom effect
    const zoomFactor = 1 + zoomAmplitude * Math.sin(phase * Math.PI * 2); // Zoom factor based on the phase

    // Perspective parameters
    const perspectiveStrength = 0.2; // Strength of the perspective effect
    const perspectiveShiftX = 0.05 * Math.sin(phase * Math.PI * 2); // Horizontal shift based on phase
    const perspectiveShiftY = 0.05 * Math.cos(phase * Math.PI * 2); // Vertical shift based on phase

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Normalize coordinates
            let nx = (x / width) - 0.5;
            let ny = (y / height) - 0.5;

            // Apply zoom effect
            nx *= zoomFactor;
            ny *= zoomFactor;

            // Apply perspective effect
            let perspectiveFactor = 1 - perspectiveStrength * ny;
            nx *= perspectiveFactor;
            ny += perspectiveShiftY;
            nx += perspectiveShiftX;

            // Convert back to pixel coordinates
            let sourceX = (nx + 0.5) * width;
            let sourceY = (ny + 0.5) * height;

            // Ensure sourceX and sourceY are within bounds
            sourceX = Math.max(0, Math.min(width - 1, sourceX));
            sourceY = Math.max(0, Math.min(height - 1, sourceY));

            const sourceIndex = (Math.floor(sourceY) * width + Math.floor(sourceX)) * 4;
            const targetIndex = (y * width + x) * 4;

            // Copy pixel data
            for (let i = 0; i < 4; i++) {
                newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
            }
        }
    }

    self.postMessage({ imageData: newImageData });
};
