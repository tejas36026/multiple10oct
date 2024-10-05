importScripts('opencv.js');
self.onmessage = async function(e) {
    const {canvas, words} = e.data;
    const img = await createImageBitmap(await fetch(canvas));
    const textRemovedCanvas = await removeTextAndFill(img, words);
    self.postMessage(textRemovedCanvas.toDataURL());
};