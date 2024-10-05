self.onmessage = function(e) {
    const { imageData, value, index } = e.data;
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2;

    const tempData = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius) {
                const percent = (radius - distance) / radius;
                const theta = percent * percent * value;
                const sin = Math.sin(theta);
                const cos = Math.cos(theta);

                const newX = Math.round(centerX + dx * cos - dy * sin);
                const newY = Math.round(centerY + dx * sin + dy * cos);

                if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                    const targetIndex = (y * width + x) * 4;
                    const sourceIndex = (newY * width + newX) * 4;

                    for (let i = 0; i < 4; i++) {
                        data[targetIndex + i] = tempData[sourceIndex + i];
                    }
                }
            }
        }
    }

    self.postMessage({ imageData, index, value });
};