// squeezeYWorker.js

self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const squeezedImageData = applySqueeze(imageData, value, 'y');
    self.postMessage({ imageData: squeezedImageData });
};

function applySqueeze(imageData, value, axis) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);

    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');

    // Calculate squeeze factor (1 = no squeeze, 0.5 = half width/height, 2 = double width/height)
    const squeezeFactor = 1 + (value - 0.5);

    if (axis === 'y') {
        const newHeight = imageData.height * squeezeFactor;
        tempCtx.drawImage(canvas, 0, 0, imageData.width, imageData.height, 
                          0, (imageData.height - newHeight) / 2, imageData.width, newHeight);
    }

    return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
}