// Function to detect faces and create regions
function detectFaces(imageData) {
    // This is a placeholder function. In a real-world scenario, 
    // you would use a face detection library or API here.
    // For this example, we'll just create a dummy region.
    return [{
        x: Math.floor(imageData.width * 0.25),
        y: Math.floor(imageData.height * 0.25),
        width: Math.floor(imageData.width * 0.5),
        height: Math.floor(imageData.height * 0.5)
    }];
}

// Function to create selected regions
function createSelectedRegions(imageData) {
    // This is a placeholder function. In a real-world scenario,
    // you might have user-selected regions or use an algorithm to determine regions.
    // For this example, we'll just create a dummy region.
    return [{
        x: 0,
        y: 0,
        width: imageData.width,
        height: imageData.height
    }];
}

function processImage(imageData) {
    const backgroundWorker = new Worker('backgroundpredict6Worker.js');
    const faceWorker = new Worker('facemovement6Worker.js');

    // Define selectedRegions and faceRegions
    const selectedRegions = createSelectedRegions(imageData);
    const faceRegions = detectFaces(imageData);

    backgroundWorker.postMessage({
        imageData: imageData,
        selectedRegions: selectedRegions
    });

    backgroundWorker.onmessage = function(e) {
        if (e.data.error) {
            console.error("Background prediction error:", e.data.error);
            return;
        }

        const backgroundPredictedImage = e.data.segmentedImages[0];

        // Then, animate faces
        faceWorker.postMessage({
            imageData: backgroundPredictedImage,
            faceRegions: faceRegions,
            params: { offset: 5 } // Example parameter
        });
    };

    faceWorker.onmessage = function(e) {
        if (e.data.error) {
            console.error("Face animation error:", e.data.error);
            return;
        }

        const finalAnimatedImage = e.data.animatedImage;

        // Use the final animated image
        displayFinalImage(finalAnimatedImage);
    };
}

function displayFinalImage(imageData) {
    const canvas = document.getElementById('outputCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
}

// Add an event listener to the process button
document.getElementById('processButton').addEventListener('click', function() {
    const inputCanvas = document.getElementById('inputCanvas');
    const ctx = inputCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, inputCanvas.width, inputCanvas.height);
    processImage(imageData);
});