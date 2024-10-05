// antiRunningWorker.js
self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const antiRunningImageData = applyAntiRunning(imageData, value);
    self.postMessage({ imageData: antiRunningImageData });
  };
  
  function applyAntiRunning(imageData, value) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
  
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');
  
    // Reverse the running effect by compressing vertically and applying an inverse wave
    const compressFactor = 1 / (1 + value * 0.1);
    const waveAmplitude = -value * 10;
    const waveFrequency = 0.05;
  
    tempCtx.save();
    tempCtx.translate(0, imageData.height / 2);
    tempCtx.scale(1, compressFactor);
    tempCtx.translate(0, -imageData.height / 2);
  
    for (let x = 0; x < imageData.width; x++) {
      const yOffset = Math.sin(x * waveFrequency) * waveAmplitude;
      tempCtx.drawImage(canvas, x, 0, 1, imageData.height, x, yOffset, 1, imageData.height);
    }
  
    tempCtx.restore();
  
    return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
  }