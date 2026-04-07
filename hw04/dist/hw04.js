import { resizeAspectRatio, Axes } from '../util.js';
import { Shader, readShaderFile } from '../shader.js';
let isInitialized = false;
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let axes;
let rotationAngle = 0;
let isAnimating = false;
let lastTime = 0;
let textOverlay;
let rects = [];
document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) {
        console.log("Already initialized");
        return;
    }
    main().then(success => {
        if (!success) {
            console.log('프로그램을 종료합니다.');
            return;
        }
        isInitialized = true;
        requestAnimationFrame(animate);
    }).catch(error => {
        console.error('프로그램 실행 중 오류 발생:', error);
    });
});
function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }
    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.3, 0.4, 1.0);
    return true;
}
function setupRectBuffers(position, size, rotation, color) {
    const cubeVertices = new Float32Array([
        -0.5, 0.5, // 좌상단
        -0.5, -0.5, // 좌하단
        0.5, -0.5, // 우하단
        0.5, 0.5 // 우상단
    ]);
    const indices = new Uint16Array([
        0, 1, 2, // 첫 번째 삼각형
        0, 2, 3 // 두 번째 삼각형
    ]);
    const cubeColors = new Float32Array([
        color[0], color[1], color[2], 1.0, // 좌상단
        color[0], color[1], color[2], 1.0, // 좌하단
        color[0], color[1], color[2], 1.0, // 우하단
        color[0], color[1], color[2], 1.0 // 우상단
    ]);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    // VBO for position
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);
    // VBO for color
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);
    shader.setAttribPointer("a_color", 4, gl.FLOAT, false, 0, 0);
    // EBO
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    return vao;
}
function getTransformMatrices(rect) {
    const T = mat4.create();
    const R = mat4.create();
    const S = mat4.create();
    mat4.translate(T, T, [rect.position[0], rect.position[1], 0]); // translation
    mat4.rotate(R, R, rect.rotation, [0, 0, 1]); // rotation about z-axis
    mat4.scale(S, S, [rect.size[0], rect.size[1], 1]); // scale
    return { T, R, S };
}
function createRectangle(position, size, rotation, color) {
    const rect = {
        position: position,
        size: size,
        rotation: rotation,
        vao: setupRectBuffers({ position, size, rotation }, color)
    };
    return rect;
}
function renderRect(rect) {
    const transform = applyRectTransform('TRS', rect);
    shader.setMat4("u_transform", transform);
    gl.bindVertexArray(rect.vao);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}
function applyRectTransform(type, rect) {
    const finalTransform = mat4.create();
    const { T, R, S } = getTransformMatrices(rect);
    const transformOrder = {
        'TRS': [T, R, S],
        'TSR': [T, S, R],
        'RTS': [R, T, S],
        'RST': [R, S, T],
        'STR': [S, T, R],
        'SRT': [S, R, T]
    };
    /*
      type은 'TRS', 'TSR', 'RTS', 'RST', 'STR', 'SRT' 중 하나
      array.forEach(...) : 각 type의 element T or R or S 에 대해 반복
    */
    if (transformOrder[type]) {
        transformOrder[type].forEach(matrix => {
            mat4.multiply(finalTransform, matrix, finalTransform);
        });
    }
    return finalTransform;
}
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    // draw cube
    shader.use();
    shader.setMat4("u_transform", finalTransform);
    gl.bindVertexArray(vao);
    // gl.drawElements(mode, index_count, type, byte_offset);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}
function animate(currentTime) {
    if (!lastTime)
        lastTime = currentTime; // if lastTime == 0
    // deltaTime: 이전 frame에서부터의 elapsed time (in seconds)
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    if (isAnimating) {
        for (const rect of rects) {
            renderRect(rect);
        }
    }
    render();
    requestAnimationFrame(animate);
}
async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
}
async function main() {
    try {
        if (!initWebGL()) {
            throw new Error('WebGL 초기화 실패');
        }
        await initShader();
        rects.push(createRectangle([-0.5, 0.5], [0.4, 0.4], 0, [1.0, 0.0, 0.0])); // 빨간색 사각형
        return true;
    }
    catch (error) {
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}
