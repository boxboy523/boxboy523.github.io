import { resizeAspectRatio } from './util.js';
import { Shader, readShaderFile } from './shader.js';

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 700;

const canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2');
let isInitalized = false;

function initWebGL(): boolean {
    if (!gl) {
        console.error('WebGL 2 not supported in this browser.');
        return false;
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.3, 0.4, 1.0);
    return true;
}

interface ModelData {
    vertices: Float32Array;
    indices: Uint16Array;
    colors: Float32Array;
}

interface Transform {
    position: vec3;
    rotation: quat;
    scale: vec3;
}

interface Object3D {
    model: ModelData;
    transform: Transform;
    vao: WebGLVertexArrayObject;
}

function createRectModel(color: vec4): ModelData {
    const colors = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
        colors.set(color, i * 4);
    }

    return {
        vertices: new Float32Array([
            -0.5, 0.5, 0.0,
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0,
            0.5, 0.5, 0.0
        ]),
        indices: new Uint16Array([
            0, 1, 2,
            0, 2, 3
        ]),
        colors: colors
    };
}

function vaoFromModel(model: ModelData, shader: Shader): WebGLVertexArrayObject {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW);
    shader.setAttribPointer('a_position', 3, gl.FLOAT, false, 0, 0);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indices, gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, model.colors, gl.STATIC_DRAW);
    shader.setAttribPointer('a_color', 4, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
    return vao;
}

function getTransformMatrix(transform: Transform): mat4 {
    const transformMat = mat4.create();
    const rotationMat = mat4.create();
    const scaleMat = mat4.create();
    const resultMat = mat4.create();

    mat4.translate(transformMat, transformMat, transform.position);
    mat4.fromQuat(rotationMat, transform.rotation);
    mat4.scale(scaleMat, scaleMat, transform.scale);

    mat4.multiply(resultMat, transformMat, rotationMat);
    mat4.multiply(resultMat, resultMat, scaleMat);

    return resultMat;
}

function create3DObject(model: ModelData, transform: Transform, shader: Shader): Object3D {
    return {
        model,
        transform,
        vao: vaoFromModel(model, shader)
    };
}

// This function should be called by render loop, any other call can raise unexpected behavior.
function renderObject(object: Object3D, shader: Shader) {
    shader.setMat4("u_transform", getTransformMatrix(object.transform));
    gl.bindVertexArray(object.vao);
    gl.drawElements(gl.TRIANGLES, object.model.indices.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
}

function render(objects: Object3D[], shader: Shader) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    shader.use();
    for (const object of objects) {
        renderObject(object, shader);
    }
}

async function initShader(): Promise<Shader> {
    const vertexSource = await readShaderFile('shader/shVert.glsl');
    const fragmentSource = await readShaderFile('shader/shFrag.glsl');
    let shader = new Shader(gl, vertexSource, fragmentSource);
    return shader;
}

async function main(): Promise<boolean> {
    try {
        if (!initWebGL())
        {
            throw new Error('Failed to initialize WebGL.');
        }
        let shader = await initShader();
        let base_rect = createRectModel(vec4.fromValues(0.6, 0.3, 0.0, 1.0));
        let base_transform: Transform = {
            position: vec3.fromValues(0.0, 0.0, 0.0),
            rotation: quat.create(),
            scale: vec3.fromValues(0.2, 1.0, 1.0)
        };
        let base_obj = create3DObject(base_rect, base_transform, shader);
        let fan1_rect = createRectModel(vec4.fromValues(1.0, 1.0, 1.0, 1.0));
        let fan1_transform: Transform = {
            position: vec3.fromValues(0.0, 0.5, 0.0),
            rotation: quat.create(),
            scale: vec3.fromValues(0.6, 0.1, 1.0)
        };
        let fan1_obj = create3DObject(fan1_rect, fan1_transform, shader);
        let fan2_rect = createRectModel(vec4.fromValues(0.5, 0.5, 0.5, 1.0));
        let fan2_left_transform: Transform = {
            position: vec3.fromValues(-0.2, 0.0, 0.0),
            rotation: quat.create(),
            scale: vec3.fromValues(0.2, 0.05, 1.0)
        };

        let fan2_right_transform: Transform = {
            position: vec3.fromValues(0.2, 0.0, 0.0),
            rotation: quat.create(),
            scale: vec3.fromValues(0.2, 0.05, 1.0)
        };

        let fan2_left_obj = create3DObject(fan2_rect, fan2_left_transform, shader);
        let fan2_right_obj = create3DObject(fan2_rect, fan2_right_transform, shader);

        let startTime = 0;
        let isFirstFrame = true;
        function animate(time: number) {
            if (isFirstFrame) {
                startTime = time;
                isFirstFrame = false;
            }
            let elapsed = (time - startTime) / 1000; // seconds
            let fan1_angle = toDegree(Math.sin(elapsed) * Math.PI * 2.0);
            let fan2_angle = toDegree(Math.sin(elapsed) * Math.PI * -10.0);

            fan1_obj.transform.rotation = quat.fromEuler(quat.create(), 0, 0, fan1_angle);
            vec3.add(fan2_left_obj.transform.position, fan1_obj.transform.position, vec3.fromValues(-0.3 * Math.cos(toRadian(fan1_angle)), -0.3 * Math.sin(toRadian(fan1_angle)), 0));
            vec3.add(fan2_right_obj.transform.position, fan1_obj.transform.position, vec3.fromValues(0.3 * Math.cos(toRadian(fan1_angle)), 0.3 * Math.sin(toRadian(fan1_angle)), 0));
            fan2_left_obj.transform.rotation = quat.fromEuler(quat.create(), 0, 0, fan2_angle);
            fan2_right_obj.transform.rotation = quat.fromEuler(quat.create(), 0, 0, fan2_angle);
            render([base_obj, fan1_obj, fan2_left_obj, fan2_right_obj], shader);

            requestAnimationFrame(animate);
        }
        isInitalized = true;
        requestAnimationFrame(animate);
        return true;
    }
    catch (error) {
        console.error('An error occurred:', error);
        return false;
    }
}

function toRadian(angle: number): number {
    return angle * Math.PI / 180.0;
}

function toDegree(angle: number): number {
    return angle * 180.0 / Math.PI;
}

document.addEventListener('DOMContentLoaded', () => {
    if (isInitalized) {
        console.log('WebGL is already initialized.');
        return;
    }
    main().then(success => {
        if (!success) {
            console.error('Failed to initialize the application.');
            return;
        }
    }).catch(error => {
        console.error('An unexpected error occurred during initialization:', error);
    });
});
