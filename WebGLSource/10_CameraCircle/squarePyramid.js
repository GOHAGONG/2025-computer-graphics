// squarePyramid.js

export class SquarePyramid {
    constructor(gl) {
        this.gl = gl;
        this.init();
    }

    init() {
        const gl = this.gl;

        // 정점 데이터 (bottom face: xz-plane, center at origin)
        // size 1 x 1, height 1
        const vertices = new Float32Array([
            // bottom face (y = 0)
            -0.5, 0.0, -0.5,  // 0: left-back
             0.5, 0.0, -0.5,  // 1: right-back
             0.5, 0.0,  0.5,  // 2: right-front
            -0.5, 0.0,  0.5,  // 3: left-front

            // top vertex (y = 1)
             0.0, 1.0,  0.0   // 4: apex
        ]);

        // 인덱스 데이터 (삼각형으로만 구성)
        const indices = new Uint16Array([
            // bottom face (2 triangles)
            0, 1, 2,
            0, 2, 3,

            // side faces
            0, 1, 4,  // back
            1, 2, 4,  // right
            2, 3, 4,  // front
            3, 0, 4   // left
        ]);

        this.vertexCount = indices.length;

        // VAO
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // VBO
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // Vertex position attribute
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

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
