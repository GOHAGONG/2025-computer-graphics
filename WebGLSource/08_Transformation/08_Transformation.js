import { resizeAspectRatio, setupText, updateText, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

let sunAngle = 0;
let sunTransform = mat4.create();

let earthAngle = 0;      // 공전용
let earthSelfAngle = 0;  // 자전용
let earthTransform = mat4.create();

let moonAngle = 0;
let moonSelfAngle = 0;
let moonTransform = mat4.create();

let isInitialized = false;
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let axesVAO;
let sunVAO, earthVAO, moonVAO;
let finalTransform;
let rotationAngle = 0;
let currentTransformType = null;
let isAnimating = false;
let lastTime = 0;
let textOverlay;

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

function createCubeVAO(color) {
    const cubeVertices = new Float32Array([
        -0.25,  0.25,
        -0.25, -0.25,
        0.25, -0.25,
        0.25,  0.25
    ]);
    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    const cubeColors = new Float32Array([...color, ...color, ...color, ...color]);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);
    shader.setAttribPointer("a_color", 4, gl.FLOAT, false, 0, 0);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
    return vao;
}

function setupAxesBuffers(shader) {
    axesVAO = gl.createVertexArray();
    gl.bindVertexArray(axesVAO);

    const axesVertices = new Float32Array([
        -1.0, 0.0, 1.0, 0.0,  // x축
        0.0, -1.0, 0.0, 1.0   // y축
    ]);

    const axesColors = new Float32Array([
        1.0, 0.3, 0.0, 1.0, 1.0, 0.3, 0.0, 1.0,  // x축 색상
        0.0, 1.0, 0.5, 1.0, 0.0, 1.0, 0.5, 1.0   // y축 색상
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, axesVertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, axesColors, gl.STATIC_DRAW);
    shader.setAttribPointer("a_color", 4, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
}

function setupKeyboardEvents() {
    let key;
    document.addEventListener('keydown', (event) => {
        key = event.key;
        switch(key) {
            case '1': currentTransformType = 'TRS'; isAnimating = true; break;
            case '2': currentTransformType = 'TSR'; isAnimating = true; break;
            case '3': currentTransformType = 'RTS'; isAnimating = true; break;
            case '4': currentTransformType = 'RST'; isAnimating = true; break;
            case '5': currentTransformType = 'STR'; isAnimating = true; break;
            case '6': currentTransformType = 'SRT'; isAnimating = true; break;1234
            case '7':
                currentTransformType = null;
                isAnimating = false;
                rotationAngle = 0;
                finalTransform = mat4.create();
                break;2
        }
        if (currentTransformType) {
            updateText(textOverlay, event.key + ': ' + currentTransformType);
        } else {
            updateText(textOverlay, 'NO TRANSFORMA1TION');
        }
    });
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    shader.use();

    shader.setMat4("u_transform", mat4.create());
    gl.bindVertexArray(axesVAO);
    gl.drawArrays(gl.LINES, 0, 4);

    shader.setMat4("u_transform", sunTransform);
    gl.bindVertexArray(sunVAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    shader.setMat4("u_transform", earthTransform);
    gl.bindVertexArray(earthVAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    shader.setMat4("u_transform", moonTransform);
    gl.bindVertexArray(moonVAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

function animate(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // --------------------------
    // ☀️ SUN 자전 (45도/초)
    // --------------------------
    sunAngle += Math.PI * 0.25 * deltaTime;

    const sunR = mat4.create();
    const sunS = mat4.create();
    mat4.rotate(sunR, sunR, sunAngle, [0, 0, 1]);
    mat4.scale(sunS, sunS, [0.4, 0.4, 1]); // edge = 0.5 * 0.4 = 0.2

    sunTransform = mat4.create();
    mat4.multiply(sunTransform, sunR, sunS);

    // --------------------------
    // 🌍 EARTH 공전 + 자전
    // --------------------------
    earthAngle += Math.PI / 6 * deltaTime;      // 30도/초
    earthSelfAngle += Math.PI * deltaTime;      // 180도/초

    const eS = mat4.create();             // 크기: edge = 0.5 * 0.2 = 0.1
    const eR_self = mat4.create();        // 자전
    const eT = mat4.create();             // 공전 거리 0.7
    const eR_orbit = mat4.create();       // 공전 회전

    mat4.scale(eS, eS, [0.2, 0.2, 1]);
    mat4.rotate(eR_self, eR_self, earthSelfAngle, [0, 0, 1]);
    mat4.translate(eT, eT, [0.7, 0, 0]);
    mat4.rotate(eR_orbit, eR_orbit, earthAngle, [0, 0, 1]);

    const earthOrbitTransform = mat4.create(); // 공전만
    mat4.multiply(earthOrbitTransform, eR_orbit, eT);

    earthTransform = mat4.clone(earthOrbitTransform); // 자전 포함
    mat4.multiply(earthTransform, earthTransform, eR_self);
    mat4.multiply(earthTransform, earthTransform, eS);

    // --------------------------
    // 🌕 MOON 공전 (Earth 기준) + 자전
    // --------------------------
    moonAngle += 2 * Math.PI * deltaTime;         // 60도/초
    moonSelfAngle += Math.PI * deltaTime;     // 360도/초

    const mS = mat4.create();             // 크기: edge = 0.5 * 0.1 = 0.05
    const mR_self = mat4.create();        // 자전
    const mT = mat4.create();             // 공전 거리 0.2
    const mR_orbit = mat4.create();       // 공전 회전

    mat4.scale(mS, mS, [0.1, 0.1, 1]);
    mat4.rotate(mR_self, mR_self, moonSelfAngle, [0, 0, 1]);
    mat4.translate(mT, mT, [0.2, 0, 0]);
    mat4.rotate(mR_orbit, mR_orbit, moonAngle, [0, 0, 1]);

    moonTransform = mat4.create();
    mat4.multiply(moonTransform, earthOrbitTransform, mR_orbit); // 자전 빠진 Earth 기준
    mat4.multiply(moonTransform, moonTransform, mT);
    mat4.multiply(moonTransform, moonTransform, mR_self);
    mat4.multiply(moonTransform, moonTransform, mS);

    // --------------------------
    // 기타 키보드 테스트용
    // --------------------------
    if (isAnimating && currentTransformType) {
        rotationAngle += Math.PI * 0.25 * deltaTime;
        applyTransform(currentTransformType);
    }

    render();
    requestAnimationFrame(animate);
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

async function main() {
    try {
        if (!initWebGL()) throw new Error('WebGL 초기화 실패');

        finalTransform = mat4.create();
        shader = await initShader();

        setupAxesBuffers(shader);
        sunVAO = createCubeVAO([1.0, 0.0, 0.0, 1.0]);
        earthVAO = createCubeVAO([0.0, 1.0, 1.0, 1.0]);
        moonVAO = createCubeVAO([1.0, 1.0, 0.0, 1.0]);

        setupKeyboardEvents();
        shader.use();
        return true;
    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}
