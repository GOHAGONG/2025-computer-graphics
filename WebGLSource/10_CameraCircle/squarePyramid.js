// squarePyramid.js - 면마다 색상이 다르게 설정된 사각뿔

export class SquarePyramid {
    constructor(gl) {
        this.gl = gl;
        this.init();
    }

    init() {
        const gl = this.gl;

        // 정점 위치 배열 (각 면별로 정점 중복 정의)
        const vertices = new Float32Array([
            // floor
            -0.5, 0.0, -0.5,  // 0
             0.5, 0.0, -0.5,  // 1
             0.5, 0.0,  0.5,  // 2
            -0.5, 0.0,  0.5,  // 3

            // Red
            -0.5, 0.0, -0.5,  // 4
             0.5, 0.0, -0.5,  // 5
             0.0, 1.0,  0.0,  // 6

            // Yellow
             0.5, 0.0, -0.5,  // 7
             0.5, 0.0,  0.5,  // 8
             0.0, 1.0,  0.0,  // 9

            // Magenta
             0.5, 0.0,  0.5,  // 10
            -0.5, 0.0,  0.5,  // 11
             0.0, 1.0,  0.0,  // 12

            // Cyan
            -0.5, 0.0,  0.5,  // 13
            -0.5, 0.0, -0.5,  // 14
             0.0, 1.0,  0.0   // 15
        ]);

        // 각 정점에 대응하는 색상 (RGBA)
        const colors = new Float32Array([
            // gray (0~3)
            0.5, 0.5, 0.5, 1,
            0.5, 0.5, 0.5, 1,
            0.5, 0.5, 0.5, 1,
            0.5, 0.5, 0.5, 1,

            // cyan (13~15)
            0, 1, 1, 1,
            0, 1, 1, 1,
            0, 1, 1, 1,

            // Front face: magenta (10~12)
            1, 0, 1, 1,
            1, 0, 1, 1,
            1, 0, 1, 1,

            // Right face: yellow (7~9)
            1, 1, 0, 1,
            1, 1, 0, 1,
            1, 1, 0, 1,

            // Back face: red (4~6)
            1, 0, 0, 1,
            1, 0, 0, 1,
            1, 0, 0, 1
        ]);

        // 인덱스 배열
        const indices = new Uint16Array([
            0, 1, 2,   // bottom
            0, 2, 3,

            4, 5, 6,   // back
            7, 8, 9,   // right
            10,11,12,  // front
            13,14,15   // left
        ]);

        this.vertexCount = indices.length;

        // VAO
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // VBO - 위치
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        // VBO - 색상
        this.cbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cbo);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);

        // EBO
        this.ebo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        // Unbind
        gl.bindVertexArray(null);
    }

    draw(shader) {
        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }
}
