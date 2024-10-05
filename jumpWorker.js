// jumpWorker.js

self.onmessage = function(e) {
    const { imageData, value, clickedPoints } = e.data;
    const jumpedImageData = applyJumpEffect(imageData, value, clickedPoints);
    self.postMessage({ imageData: jumpedImageData });
};

function applyJumpEffect(imageData, progress, clickedPoints) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);

    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');

    // Calculate jump height
    const maxJumpHeight = 50; // Adjust this value to change the maximum jump height
    const jumpHeight = Math.sin(progress * Math.PI) * maxJumpHeight;

    // Apply jump effect
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, -jumpHeight);

    // If there are clicked points, we'll make those parts of the image jump higher
    if (clickedPoints && clickedPoints.length > 0) {
        const radius = 30; // Radius around clicked points to affect
        clickedPoints.forEach(point => {
            const extraJump = 20; // Extra jump height for clicked areas
            tempCtx.save();
            tempCtx.beginPath();
            tempCtx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            tempCtx.clip();
            tempCtx.drawImage(canvas, 0, -(jumpHeight + extraJump));
            tempCtx.restore();
        });
    }

    return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
}