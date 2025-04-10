/*-------------------------------------------------------------------------
10_CameraCircle.js

- Viewing a square pyramid at origin with perspective projection
- The pyramid is fixed in place and does not rotate
- A camera is rotating around the origin through the circle of radius 3
- The height (y position) of the camera changes sinusoidally from 0 to 10
- The camera is always looking at the origin.
---------------------------------------------------------------------------*/

import { resizeAspectRatio, setupText, updateText, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';
import { SquarePyramid } from './squarePyramid.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let startTime;
let lastFrameTime;

let isInitialized = false;

let viewMatrix = mat4.create();
let projMatrix = mat4.create();
let modelMatrix = mat4.create();
const cameraRadius = 3.0;
const verticalAmplitude = 5.0; // sin파형 높이 범위 (0~10)
const verticalOffset = 5.0;    // sin값 + 오프셋 -> 0~10 범위 만들기
const horizontalSpeed = 90.0;  // deg/sec (x, z 방향)
const verticalSpeed = 45.0;    // deg/sec (y 방향 속도 = sin 주기)
const pyramid = new SquarePyramid(gl); // 사각뿔 객체
const axes = new Axes(gl, 1.8);

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) {
        console.log("Already initialized");
        return;
    }

    main().then(success => {
        if (!success) {
            console.log('program terminated');
            return;
        }
        isInitialized = true;
    }).catch(error => {
        console.error('program terminated with error:', error);
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
    gl.clearColor(0.1, 0.1, 0.2, 1.0);

    return true;
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

function render() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastFrameTime) / 1000.0;
    const elapsedTime = (currentTime - startTime) / 1000.0;
    lastFrameTime = currentTime;

    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // Model matrix: no rotation, fixed position
    mat4.identity(modelMatrix);

    // Compute camera position
    let camX = cameraRadius * Math.sin(glMatrix.toRadian(horizontalSpeed * elapsedTime));
    let camZ = cameraRadius * Math.cos(glMatrix.toRadian(horizontalSpeed * elapsedTime));
    let camY = verticalAmplitude * Math.sin(glMatrix.toRadian(verticalSpeed * elapsedTime)) + verticalOffset;

    // View matrix
    mat4.lookAt(viewMatrix,
        vec3.fromValues(camX, camY, camZ),
        vec3.fromValues(0, 0, 0),
        vec3.fromValues(0, 1, 0));

    // Projection matrix is constant

    shader.use();
    shader.setMat4('u_model', modelMatrix);
    shader.setMat4('u_view', viewMatrix);
    shader.setMat4('u_projection', projMatrix);
    pyramid.draw(shader);  // 사각뿔 그리기

    axes.draw(viewMatrix, projMatrix);  // 좌표축 그리기

    requestAnimationFrame(render);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error('WebGL initialization failed');
        }

        shader = await initShader();

        mat4.perspective(
            projMatrix,
            glMatrix.toRadian(60),
            canvas.width / canvas.height,
            0.1,
            100.0
        );

        startTime = lastFrameTime = Date.now();

        requestAnimationFrame(render);
        return true;
    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('Failed to initialize program');
        return false;
    }
}
