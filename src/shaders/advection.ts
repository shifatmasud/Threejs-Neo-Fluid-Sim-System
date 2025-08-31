
export const advectionShader = `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 uTexelSize;
    uniform float uDt;
    uniform float uDissipation;

    void main() {
        vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uTexelSize;
        pc_fragColor = uDissipation * texture(uSource, coord);
    }
`;