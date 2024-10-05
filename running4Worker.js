self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const width = imageData.width;
    const height = imageData.height;

    const newImageData = new ImageData(width, height);

    // Unpack the input value (assuming it's a single number between 0 and 1)
    const t = value;

    // Animation parameters
    const cycleLength = 10; // Number of frames in the run cycle
    const phase = (t * cycleLength) % 1; // Current phase of the run cycle
    const forwardLean = 0.1 + 0.05 * Math.sin(phase * Math.PI * 2); // Leaning forward effect
    const verticalStretch = 1 + 0.2 * Math.sin(phase * Math.PI * 4); // Stretching up and down
    const horizontalStretch = 1 + 0.1 * Math.sin(phase * Math.PI * 2); // Stretching left and right

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Normalize coordinates
            let nx = (x / width) - 0.5;
            let ny = (y / height) - 0.5;

            // Apply deformations
            nx *= horizontalStretch;
            ny *= verticalStretch;

            // Apply forward lean
            nx += ny * forwardLean;

            // Apply running motion
            nx += 0.1 * Math.sin(ny * Math.PI * 2 + phase * Math.PI * 2);
            ny += 0.05 * Math.sin(nx * Math.PI * 4 + phase * Math.PI * 4);

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