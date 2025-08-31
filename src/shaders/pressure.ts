
export const pressureShader = `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    uniform vec2 uTexelSize;

    void main () {
        float L = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
        float R = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
        float B = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
        float T = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
        float divergence = texture(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        pc_fragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
`;