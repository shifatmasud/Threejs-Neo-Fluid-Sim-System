
export const clearShader = `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uTexture;
    uniform float uValue;
    uniform vec3 uClearColor;
    uniform bool uUseClearColor;

    void main () {
        if (uUseClearColor) {
            pc_fragColor = vec4(uClearColor, 1.0);
        } else {
            pc_fragColor = uValue * texture(uTexture, vUv);
        }
    }
`;