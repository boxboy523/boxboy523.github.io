#version 300 es
layout(location = 0) in vec3 aPos;
uniform vec2 uPos;

void main() {
    gl_Position = vec4(aPos.x + uPos.x, aPos.y + uPos.y, aPos.z,  1.0);
}