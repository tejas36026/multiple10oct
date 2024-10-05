// antiWalkingWorker.js
self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const antiWalkingImageData = applyAntiWalking(imageData, value);
    self.postMessage({ imageData: antiWalkingImageData });
  };
  
  function applyAntiWalking(imageData, value) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
  
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');
  
    // Reverse the walking effect by tilting in the opposite direction and applying an inverse wave
    const tiltAngle = -value * Math.PI / 18; // Up to -10 degrees tilt
    const waveAmplitude = -value * 5;
    const waveFrequency = 0.03;
  
    tempCtx.save();
    tempCtx.translate(imageData.width / 2, imageData.height / 2);
    tempCtx.rotate(tiltAngle);
    tempCtx.translate(-imageData.width / 2, -imageData.height / 2);
  
    for (let x = 0; x < imageData.width; x++) {
      const yOffset = Math.sin(x * waveFrequency) * waveAmplitude;
      tempCtx.drawImage(canvas, x, 0, 1, imageData.height, x, yOffset, 1, imageData.height);
    }
  
    tempCtx.restore();
  
    return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
  }