// Global constants
const canvas = document.getElementById('glCanvas'); // Get the canvas element 
const gl = canvas.getContext('webgl2'); // Get the WebGL2 context

if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}

// Set canvas size: 현재 window 전체를 canvas로 사용
canvas.width = 500;
canvas.height = 500;

firstWidth = window.innerWidth;

// Start rendering
render();

// Divide Viewport
function divideViewport(x, y, width, height, color )
{
    //console.log(`Setting viewport at x: ${x}, y: ${y}, width: ${width}, height: ${height}`);
    gl.viewport(x, y, width, height);
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(x, y, width, height)
    gl.clearColor(...color);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST); 
    //console.log(color);
}

// Render loop
function render() {

    const w = canvas.width / 2;
    const h = canvas.height / 2;
    
    divideViewport(w, h, w, h, [0, 1.0, 0, 1.0]); // Green
    divideViewport(0, h, w, h, [1.0, 0, 0, 1.0]); // Red
    divideViewport(0, 0, w, h, [0, 0, 1.0, 1.0]); // Blue
    divideViewport(w, 0, w, h, [1.0, 1.0, 0, 1.0]); // Yellow
    // Draw something here
}

// Resize viewport when window size changes
window.addEventListener('resize', () => {
    
    // calculate resize ratio
    const ratioWidth = window.innerWidth / firstWidth;
    const ratioHeight = window.innerHeight / firstWidth;

    const ratio = Math.max(ratioWidth, ratioHeight);

    // set new canvas size
    canvas.width = 500 * ratio;
    canvas.height = 500 * ratio;
    render();
});