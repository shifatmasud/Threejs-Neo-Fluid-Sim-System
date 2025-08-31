
export const clearShader = `
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float uValue;
    uniform vec3 uClearColor;
    uniform bool uUseClearColor;

    void main () {
        if (uUseClearColor) {
            gl_FragColor = vec4(uClearColor, 1.0);
        } else {
            gl_FragColor = uValue * texture2D(uTexture, vUv);
        }
    }
`;
