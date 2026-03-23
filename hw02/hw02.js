import { resizeAspectRatio, setupText } from './util.js';
import { createProgram, readShaderFile } from './shader.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');

if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}

canvas.width = 600;
canvas.height = 600;

resizeAspectRatio(gl, canvas);

gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.0, 0.0, 0.0, 1.0);

const vertexShaderSource = await readShaderFile('./shader/vertex.glsl');

const fragmentShaderSource = await readShaderFile('./shader/fragment.glsl');

const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

const vertices = new Float32Array([
    -0.1, -0.1, 0.0,  // Bottom left
     0.1, -0.1, 0.0,  // Bottom right
    0.1,  0.1, 0.0,   //
    -0.1,  0.1, 0.0    //
]);

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(0); // 0: location

gl.useProgram(program);

const uPosLocation = gl.getUniformLocation(program, 'uPos');

var pos = [0.0, 0.0];

function move(dx, dy) {
    console.log("pos: " + pos[0] + ", " + pos[1]);
    pos[0] += dx;
    pos[1] += dy;
    if (pos[0] > 0.9) pos[0] = 0.9;
    if (pos[0] < -0.9) pos[0] = -0.9;
    if (pos[1] > 0.9) pos[1] = 0.9;
    if (pos[1] < -0.9) pos[1] = -0.9;
}

var up = false;
var down = false;
var left = false;
var right = false;

window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') up = true;
    if (event.key === 'ArrowDown') down = true;
    if (event.key === 'ArrowLeft') left = true;
    if (event.key === 'ArrowRight') right = true;
});

window.addEventListener('keyup', (event) => {
    up = event.key === 'ArrowUp' ? false : up;
    down = event.key === 'ArrowDown' ? false : down;
    left = event.key === 'ArrowLeft' ? false : left;
    right = event.key === 'ArrowRight' ? false : right;
});

setupText(canvas, "Use arrow keys to move the rectangle");
// Render loop
function render(time) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform2fv(uPosLocation, pos);

    gl.bindVertexArray(vao);
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    if (up) move(0, 0.01);
    if (down) move(0, -0.01);
    if (left) move(-0.01, 0);
    if (right) move(0.01, 0);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
