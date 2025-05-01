export class Pyramid {
    constructor(gl, options = {}) {
        this.gl = gl;

        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        const h = Math.SQRT1_2;

        // 6개의 정점 (모든 edge 길이 = 2*sqrt(2)/2 = 1)
        this.vertices = new Float32Array([
            // face 0
            0.0, h, 0.0,   -0.5, 0, 0.5,   0.5, 0, 0.5,
            // face 1
            0.0, h, 0.0,    0.5, 0, 0.5,   0.5, 0, -0.5,
            // face 2
            0.0, h, 0.0,    0.5, 0, -0.5,  -0.5, 0, -0.5,
            // face 3
            0.0, h, 0.0,   -0.5, 0, -0.5,  -0.5, 0, 0.5,
            // face 4
            0.0, -h, 0.0,   0.5, 0, 0.5,  -0.5, 0, 0.5,
            // face 5
            0.0, -h, 0.0,   0.5, 0, -0.5,   0.5, 0, 0.5,
            // face 6
            0.0, -h, 0.0,  -0.5, 0, -0.5,   0.5, 0, -0.5,
            // face 7
            0.0, -h, 0.0,  -0.5, 0, 0.5,  -0.5, 0, -0.5,
        ]);

        // 단순한 정점 노멀 (정삼각형이라도 정확한 노멀은 face 기준으로 계산해야 함)
        this.normals = new Float32Array([
            1,  0,  0,
           -1,  0,  0,
            0,  1,  0,
            0, -1,  0,
            0,  0,  1,
            0,  0, -1
        ]);

        // 색상 설정 (옵션이 있으면 일괄 적용, 없으면 정점마다 다르게)
        this.colors = new Float32Array(
            options.color ? Array(6).fill(options.color).flat() : [
                1, 0, 0, 1,  // v0: red
                0, 1, 0, 1,  // v1: green
                0, 0, 1, 1,  // v2: blue
                1, 1, 0, 1,  // v3: yellow
                1, 0, 1, 1,  // v4: magenta
                0, 1, 1, 1   // v5: cyan
            ]
        );

        // 텍스처 좌표 (임의로 설정 — 실제 텍스처 매핑 시 적절히 조정 필요)
        this.texCoords = new Float32Array([
            // --- 위쪽 4면 (v: 0.5 ~ 1.0) ---

            // face 0 (top - front)
            0.5, 1.0,   // top
            0.0,   0.5,
            0.25,  0.5,

            // face 1 (top - right)
            0.5, 1.0,
            0.25,  0.5,
            0.5,   0.5,

            // face 2 (top - back)
            0.5, 1.0,
            0.5,   0.5,
            0.75,  0.5,

            // face 3 (top - left)
            0.5, 1.0,
            0.75,  0.5,
            1.0,   0.5,

            // --- 아래쪽 4면 (v: 0.0 ~ 0.5) ---

            // face 4 (bottom - front)
            0.5, 0.0,   // bottom
            0.0,   0.5,
            0.25,  0.5,

            // face 5 (bottom - right)
            0.5, 0.0,
            0.25,  0.5,
            0.5,   0.5,

            // face 6 (bottom - back)
            0.5, 0.0,
            0.5,   0.5,
            0.75,  0.5,

            // face 7 (bottom - left)
            0.5, 0.0,
            0.75,  0.5,
            1.0,   0.5,
        ]);

        // // 면 구성 (총 8개의 정삼각형)
        // this.indices = new Uint16Array([
        //     0, 2, 3,  // top - front
        //     0, 3, 4,  // top - right
        //     0, 4, 5,  // top - back
        //     0, 5, 2,  // top - left
        //     1, 3, 2,  // bottom - front
        //     1, 4, 3,  // bottom - right
        //     1, 5, 4,  // bottom - back
        //     1, 2, 5   // bottom - left
        // ]);

        this.initBuffers();
    }

    initBuffers() {
        const gl = this.gl;
    
        const vSize = this.vertices.byteLength;
        const nSize = this.normals.byteLength;
        const cSize = this.colors.byteLength;
        const tSize = this.texCoords.byteLength;
        const totalSize = vSize + nSize + cSize + tSize;
    
        gl.bindVertexArray(this.vao);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, totalSize, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.texCoords);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize, this.colors);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize + cSize, this.texCoords);
    
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);  // position
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, vSize);  // normal
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, vSize + nSize);  // color
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, vSize + nSize + cSize);  // texCoord
    
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.enableVertexAttribArray(3);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    draw(shader) {
        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, 24);  // 총 정점 개수
        gl.bindVertexArray(null);
    }

    delete() {
        const gl = this.gl;
        gl.deleteBuffer(this.vbo);
        //gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }
}
