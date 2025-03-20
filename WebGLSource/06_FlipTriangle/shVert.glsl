#version 300 es

layout (location = 0) in vec3 aPos;

uniform vec2 uOffset; // 이동을 위한 좌표
uniform float uAspect; // 화면 비율 보정

uniform float verticalFlip;

void main() {
    vec2 adjustedPos = vec2(aPos.x * uAspect, aPos.y); // 가로 비율 보정
    gl_Position = vec4(adjustedPos + uOffset, 0.0, 1.0); // 이동 반영
} 