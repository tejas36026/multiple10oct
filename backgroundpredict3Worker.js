    self.onmessage = function(e) {
        const { imageData, selectedRegions } = e.data;

        if (!imageData || !selectedRegions) {
            self.postMessage({
                error: "Missing required data. Please provide both imageData and selectedRegions.",
                isComplete: true
            });
            return;
        }

        const width = imageData.width;
        const height = imageData.height;

        if (!width || !height) {
            self.postMessage({
                error: "Invalid image data. Width or height is missing.",
                isComplete: true
            });
            return;
        }

        try {
            const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);

            // Create a map of selected pixels for faster lookups
            const selectedPixels = new Set(selectedRegions.flat());

            const backgroundMap = createBackgroundMap(imageData, selectedPixels, width, height);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const pixelIndex = y * width + x;
                    if (selectedPixels.has(pixelIndex)) {
                        const backgroundColor = predictBackgroundColor(x, y, backgroundMap, width, height);
                        const i = pixelIndex * 4;
                        newImageData.data[i] = backgroundColor[0];
                        newImageData.data[i + 1] = backgroundColor[1];
                        newImageData.data[i + 2] = backgroundColor[2];
                        newImageData.data[i + 3] = backgroundColor[3];
                    }
                }
            }

            self.postMessage({
                segmentedImages: [newImageData],
                isComplete: true
            });
        } catch (error) {
            self.postMessage({
                error: "An error occurred during processing: " + error.message,
                isComplete: true
            });
        }
    };

    function createBackgroundMap(imageData, selectedPixels, width, height) {
        const backgroundMap = new Array(height);
        for (let y = 0; y < height; y++) {
            backgroundMap[y] = new Array(width);
            for (let x = 0; x < width; x++) {
                const pixelIndex = y * width + x;
                if (!selectedPixels.has(pixelIndex)) {
                    const i = pixelIndex * 4;
                    backgroundMap[y][x] = [
                        imageData.data[i],
                        imageData.data[i + 1],
                        imageData.data[i + 2],
                        imageData.data[i + 3]
                    ];
                }
            }
        }
        return backgroundMap;
    }

    function predictBackgroundColor(x, y, backgroundMap, width, height) {
        const searchRadius = 5;
        let totalColor = [0, 0, 0, 0];
        let count = 0;

        for (let dy = -searchRadius; dy <= searchRadius; dy++) {
            for (let dx = -searchRadius; dx <= searchRadius; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height && backgroundMap[ny][nx]) {
                    totalColor[0] += backgroundMap[ny][nx][0];
                    totalColor[1] += backgroundMap[ny][nx][1];
                    totalColor[2] += backgroundMap[ny][nx][2];
                    totalColor[3] += backgroundMap[ny][nx][3];
                    count++;
                }
            }
        }

        if (count === 0) return [128, 128, 128, 255]; // Default to gray if no background pixels found

        return totalColor.map(channel => Math.round(channel / count));
    }