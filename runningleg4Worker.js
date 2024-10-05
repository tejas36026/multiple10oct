// runninglegWorker.js
self.onmessage = function(e) {
    const { imageData, value, direction } = e.data;
    const runningImageData = applyRunningAnimation(imageData, value, direction);
    self.postMessage({ imageData: runningImageData });
};
function applyRunningAnimation(imageData, value) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);

    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');

    // Define running poses based on the images
    const poses = [
        { bodyRotation: -5, leftLeg: 45, rightLeg: -30, leftArm: -45, rightArm: 30 },
        { bodyRotation: -2, leftLeg: 30, rightLeg: -45, leftArm: -30, rightArm: 45 },
        { bodyRotation: 0, leftLeg: 0, rightLeg: -60, leftArm: 0, rightArm: 60 },
        { bodyRotation: 2, leftLeg: -30, rightLeg: -45, leftArm: 30, rightArm: 45 },
        { bodyRotation: 5, leftLeg: -45, rightLeg: 30, leftArm: 45, rightArm: -30 }
    ];

    const poseIndex = Math.floor(value * poses.length) % poses.length;
    const currentPose = poses[poseIndex];

    tempCtx.save();
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);

    // Apply body rotation
    tempCtx.rotate(currentPose.bodyRotation * Math.PI / 180);

    // Draw upper body
    tempCtx.drawImage(canvas, 0, 0, imageData.width, imageData.height * 0.5,
                      -imageData.width / 2, -imageData.height / 2, imageData.width, imageData.height * 0.5);

    // Draw legs
    tempCtx.save();
    tempCtx.rotate(currentPose.leftLeg * Math.PI / 180);
    tempCtx.drawImage(canvas, 0, imageData.height * 0.5, imageData.width / 2, imageData.height * 0.5,
                      -imageData.width / 4, 0, imageData.width / 2, imageData.height * 0.5);
    tempCtx.restore();

    tempCtx.save();
    tempCtx.rotate(currentPose.rightLeg * Math.PI / 180);
    tempCtx.drawImage(canvas, imageData.width / 2, imageData.height * 0.5, imageData.width / 2, imageData.height * 0.5,
                      0, 0, imageData.width / 2, imageData.height * 0.5);
    tempCtx.restore();

    // Draw arms
    tempCtx.save();
    tempCtx.rotate(currentPose.leftArm * Math.PI / 180);
    tempCtx.drawImage(canvas, 0, imageData.height * 0.2, imageData.width / 2, imageData.height * 0.3,
                      -imageData.width / 4, -imageData.height * 0.3, imageData.width / 2, imageData.height * 0.3);
    tempCtx.restore();

    tempCtx.save();
    tempCtx.rotate(currentPose.rightArm * Math.PI / 180);
    tempCtx.drawImage(canvas, imageData.width / 2, imageData.height * 0.2, imageData.width / 2, imageData.height * 0.3,
                      0, -imageData.height * 0.3, imageData.width / 2, imageData.height * 0.3);
    tempCtx.restore();

    tempCtx.restore();

    return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
}