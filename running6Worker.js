let originalImageData; // Stores the full sprite sheet
let width, height; // Dimensions of the entire sprite sheet
let frameWidth, frameHeight; // Dimensions of a single frame
let animationFrame = 0; // Keeps track of the current frame

// Event listener for messages from the main thread
self.onmessage = function(e) {
    if (e.data.imageData) {
        // Initial setup with the sprite sheet
        originalImageData = e.data.imageData;
        width = originalImageData.width;
        height = originalImageData.height;
        
        // Calculate frame dimensions
        frameWidth = Math.floor(width / 7);  // 7 frames horizontally
        frameHeight = Math.floor(height / 2);  // 2 rows of frames
        
        // Start the animation loop
        animationLoop();
    }
};

function animationLoop() {
    // Create a new ImageData object for the current frame
    const newImageData = new ImageData(frameWidth, frameHeight);
    
    // Calculate current frame
    const totalFrames = 10;  // 7 in first row, 3 in second row
    const currentFrame = animationFrame % totalFrames;
    
    // Determine which row and column to use from the sprite sheet
    const sourceRow = currentFrame >= 7 ? 1 : 0;
    const sourceCol = currentFrame >= 7 ? currentFrame - 7 : currentFrame;
    
    // Copy the current frame to the new image data
    for (let y = 0; y < frameHeight; y++) {
        for (let x = 0; x < frameWidth; x++) {
            // Calculate source and target pixel indices
            const sourceX = sourceCol * frameWidth + x;
            const sourceY = sourceRow * frameHeight + y;
            const sourceIndex = (sourceY * width + sourceX) * 4;
            const targetIndex = (y * frameWidth + x) * 4;
            
            // Copy RGBA values from source to target
            for (let i = 0; i < 4; i++) {
                newImageData.data[targetIndex + i] = originalImageData.data[sourceIndex + i];
            }
        }
    }
    
    // Send the current frame back to the main thread
    self.postMessage({ imageData: newImageData });
    
    // Move to the next frame
    animationFrame++;
    
    // Continue the animation loop
    setTimeout(animationLoop, 100);  // 100ms delay between frames (10 fps)
}