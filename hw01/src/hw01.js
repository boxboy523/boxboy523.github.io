// Global constants
const canvas = document.getElementById('glCanvas'); // Get the canvas element
const gl = canvas.getContext('webgl2'); // Get the WebGL2 context

if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}
// Set canvas size: 현재 window 전체를 canvas로 사용
canvas.width = 500;
canvas.height = 500;

var len_w = canvas.width / 2;
var len_h = canvas.height / 2;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    len_w = canvas.width / 2;
    len_h = canvas.height / 2;
    gl.viewport(0, 0, canvas.width, canvas.height);
    render();
});
// Initialize WebGL settings: viewport and clear color
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.1, 0.2, 0.3, 1.0);

// Start rendering
render();

// Render loop
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(0, len_h, len_w, len_h);
    gl.clearColor(0.0, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.scissor(len_w, len_h, len_w, len_h);
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.scissor(0, 0, len_w, len_h);
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.scissor(len_w, 0, len_w, len_h);
    gl.clearColor(1.0, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}
