/*-------------------------------------------------------------------------
07_LineSegments.js

left mouse button을 click하면 선분을 그리기 시작하고, 
button up을 하지 않은 상태로 마우스를 움직이면 임시 선분을 그리고, 
button up을 하면 최종 선분을 저장하고 임시 선분을 삭제함.

첫 번째 선분은 선분이 아니라 "원을 그리는 시작점"으로 사용되며,
드래그하는 동안 원의 반지름이 실시간으로 커졌다 작아졌다 하며 보여진다.
---------------------------------------------------------------------------*/
import {
    resizeAspectRatio,
    setupText,
    updateText,
    Axes,
} from "../util/util.js";
import { Shader, readShaderFile } from "../util/shader.js";

let isInitialized = false;
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");
let shader;
let vao;
let positionBuffer;
let isDrawing = false;
let startPoint = null;
let tempEndPoint = null;
let lines = [];
let textOverlay;
let textOverlay2;
let axes = new Axes(gl, 0.85);

document.addEventListener("DOMContentLoaded", () => {
    if (isInitialized) {
        console.log("Already initialized");
        return;
    }

    main()
        .then((success) => {
            if (!success) {
                console.log("프로그램을 종료합니다.");
                return;
            }
            isInitialized = true;
        })
        .catch((error) => {
            console.error("프로그램 실행 중 오류 발생:", error);
        });
});

function initWebGL() {
    if (!gl) {
        console.error("WebGL 2 is not supported by your browser.");
        return false;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.7, 0.8, 0.9, 1.0);

    return true;
}

function setupCanvas() {
    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.2, 0.3, 1.0);
}

function setupBuffers(shader) {
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    shader.setAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
}

function convertToWebGLCoordinates(x, y) {
    return [(x / canvas.width) * 2 - 1, -((y / canvas.height) * 2 - 1)];
}

function setupMouseEvents() {
    function handleMouseDown(event) {
        event.preventDefault();
        event.stopPropagation();

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (!isDrawing) {
            let [glX, glY] = convertToWebGLCoordinates(x, y);
            startPoint = [glX, glY];
            isDrawing = true;
        }
    }

    function handleMouseMove(event) {
        if (isDrawing) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            let [glX, glY] = convertToWebGLCoordinates(x, y);
            tempEndPoint = [glX, glY];
            render();
        }
    }

    function handleMouseUp() {
        if (isDrawing && tempEndPoint) {
            lines.push([...startPoint, ...tempEndPoint]);

            if (lines.length == 1) {
                updateText(
                    textOverlay,
                    "First circle: center (" +
                    lines[0][0].toFixed(2) +
                    ", " +
                    lines[0][1].toFixed(2) +
                    ") ~ radius to (" +
                    lines[0][2].toFixed(2) +
                    ", " +
                    lines[0][3].toFixed(2) +
                    ")"
                );
                updateText(
                    textOverlay2,
                    "Click and drag to draw the second line segment"
                );
            } else {
                updateText(
                    textOverlay2,
                    "Second line segment: (" +
                    lines[1][0].toFixed(2) +
                    ", " +
                    lines[1][1].toFixed(2) +
                    ") ~ (" +
                    lines[1][2].toFixed(2) +
                    ", " +
                    lines[1][3].toFixed(2) +
                    ")"
                );
            }

            isDrawing = false;
            startPoint = null;
            tempEndPoint = null;
            render();
        }
    }

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
}

function drawCircleWithLines(center, radius, color, segments = 100) {
    let vertices = [];

    for (let i = 0; i <= segments; i++) {
        let angle = (2 * Math.PI * i) / segments;
        let x = center[0] + radius * Math.cos(angle);
        let y = center[1] + radius * Math.sin(angle);
        vertices.push(x, y);
    }

    shader.setVec4("u_color", color);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.LINE_STRIP, 0, vertices.length / 2);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    shader.use();

    // 실시간 원 미리보기 (첫 번째 선 이전 상태)
    if (isDrawing && startPoint && tempEndPoint && lines.length === 0) {
        const [x1, y1] = startPoint;
        const [x2, y2] = tempEndPoint;
        const radius = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        drawCircleWithLines([x1, y1], radius, [1.0, 1.0, 0.0, 1.0]);
    }

    let num = 0;
    for (let line of lines) {
        if (num == 0) {
            let x1 = line[0], y1 = line[1];
            let x2 = line[2], y2 = line[3];
            let radius = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            drawCircleWithLines([x1, y1], radius, [1.0, 1.0, 0.0, 1.0]);
        } else {
            shader.setVec4("u_color", [1.0, 0.0, 1.0, 1.0]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(line), gl.STATIC_DRAW);
            gl.bindVertexArray(vao);
            gl.drawArrays(gl.LINES, 0, 2);
        }
        num++;
    }

    // 두 번째 선 임시 선
    if (isDrawing && startPoint && tempEndPoint && lines.length === 1) {
        shader.setVec4("u_color", [0.5, 0.5, 0.5, 1.0]);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([...startPoint, ...tempEndPoint]),
            gl.STATIC_DRAW
        );
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.LINES, 0, 2);
    }

    axes.draw(mat4.create(), mat4.create());
}

async function initShader() {
    const vertexShaderSource = await readShaderFile("shVert.glsl");
    const fragmentShaderSource = await readShaderFile("shFrag.glsl");
    return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

async function main() {
    try {
        if (!initWebGL()) throw new Error("WebGL 초기화 실패");

        shader = await initShader();
        setupCanvas();
        setupBuffers(shader);
        shader.use();

        textOverlay = setupText(canvas, "No line segment", 1);
        textOverlay2 = setupText(canvas, "Click mouse button and drag to draw line segments", 2);

        setupMouseEvents();
        render();
        return true;
    } catch (error) {
        console.error("Failed to initialize program:", error);
        alert("프로그램 초기화에 실패했습니다.");
        return false;
    }
}
