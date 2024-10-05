self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const width = imageData.width;
    const height = imageData.height;

    const newImageData = new ImageData(width, height);

    const t = value;

    const cycleLength = 1;
    const phase = (t * cycleLength) % 1;
    const stepHeight = 10;
    const armSwing = 5;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sourceX = x;
            let sourceY = y;

            sourceX += Math.sin(phase * Math.PI * 2) * 3;

            if (y > height * 0.5) {
                const legPhase = (phase * 2 + (x > width / 2 ? 0.5 : 0)) % 1;
                sourceY += Math.sin(legPhase * Math.PI) * stepHeight * ((y - height * 0.5) / (height * 0.5));
            }

            if (y < height * 0.4) {
                const armPhase = (phase * 2 + (x > width / 2 ? 0 : 0.5)) % 1;
                sourceX += Math.sin(armPhase * Math.PI) * armSwing * (1 - y / (height * 0.4));
            }

            sourceX += (y / height - 0.5) * 2;

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