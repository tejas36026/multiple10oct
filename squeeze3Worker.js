self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = new ImageData(width, height);

    const t = value; // Time parameter

    const squashFactor = 0.1 * Math.sin(t * Math.PI * 2); // Squash factor
    const stretchFactor = 0.1 * Math.cos(t * Math.PI * 2); // Stretch factor

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let nx = (x / width) - 0.5;
            let ny = (y / height) - 0.5;

            // Apply diagonal squash and stretch
            nx *= 1 + squashFactor;
            ny *= 1 + squashFactor;

            // Convert back to pixel coordinates
            let sourceX = (nx + 0.5) * width;
            let sourceY = (ny + 0.5) * height;

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
