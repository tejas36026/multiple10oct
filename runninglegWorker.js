// runninglegWorker.js
self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const runningImageData = applyRunningAnimation(imageData, value);
    self.postMessage({ imageData: runningImageData });
  };
  
  function applyRunningAnimation(imageData, value) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
  
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');

    const poses = [
      { leftLeg: 30, rightLeg: -30, leftArm: -45, rightArm: 45 },
      { leftLeg: 0, rightLeg: 0, leftArm: 0, rightArm: 0 },
      { leftLeg: -30, rightLeg: 30, leftArm: 45, rightArm: -45 },
      { leftLeg: 0, rightLeg: 0, leftArm: 0, rightArm: 0 }
    ];
  
    // Use 'value' to determine the pose instead of frameCount
    const poseIndex = Math.floor(value * poses.length) % poses.length;
    const currentPose = poses[poseIndex];
  
    // Apply the running pose
    tempCtx.save();
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
  
    // Draw body
    tempCtx.drawImage(canvas, 0, 0, imageData.width, imageData.height * 0.6, 
                      -imageData.width / 2, -imageData.height / 2, imageData.width, imageData.height * 0.6);
  
    // Draw legs
    tempCtx.save();
    tempCtx.rotate(currentPose.leftLeg * Math.PI / 180);
    tempCtx.drawImage(canvas, 0, imageData.height * 0.6, imageData.width / 2, imageData.height * 0.4, 
                      -imageData.width / 4, 0, imageData.width / 2, imageData.height * 0.4);
    tempCtx.restore();
  
    tempCtx.save();
    tempCtx.rotate(currentPose.rightLeg * Math.PI / 180);
    tempCtx.drawImage(canvas, imageData.width / 2, imageData.height * 0.6, imageData.width / 2, imageData.height * 0.4, 
                      0, 0, imageData.width / 2, imageData.height * 0.4);
    tempCtx.restore();
  
    // Draw arms
    tempCtx.save();
    tempCtx.rotate(currentPose.leftArm * Math.PI / 180);
    tempCtx.drawImage(canvas, 0, imageData.height * 0.2, imageData.width / 2, imageData.height * 0.2, 
                      -imageData.width / 4, -imageData.height * 0.2, imageData.width / 2, imageData.height * 0.2);
    tempCtx.restore();
  
    tempCtx.save();
    tempCtx.rotate(currentPose.rightArm * Math.PI / 180);
    tempCtx.drawImage(canvas, imageData.width / 2, imageData.height * 0.2, imageData.width / 2, imageData.height * 0.2, 
                      0, -imageData.height * 0.2, imageData.width / 2, imageData.height * 0.2);
    tempCtx.restore();
  
    tempCtx.restore();
  
    return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
  }