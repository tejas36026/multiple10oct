self.onmessage = function(e) {
    const { imageData, value, index } = e.data;
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const [topLeft, topRight, bottomLeft, bottomRight] = value;

    const tempCanvas = new OffscreenCanvas(width, height);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);

    const ctx = new OffscreenCanvas(width, height).getContext('2d');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.clip();

    ctx.transform(
        topLeft, 0,
        0, topRight,
        bottomLeft, bottomRight
    );

    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();

    const newImageData = ctx.getImageData(0, 0, width, height);
    self.postMessage({ imageData: newImageData, index, value });
};