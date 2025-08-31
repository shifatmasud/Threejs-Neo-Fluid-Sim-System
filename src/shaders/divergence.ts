
export const divergenceShader = `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uVelocity;
    uniform vec2 uTexelSize;

    void main () {
        float L = texture(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).x;
        float R = texture(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).x;
        float B = texture(uVelocity, vUv - vec2(0.0, uTexelSize.y)).y;
        float T = texture(uVelocity, vUv + vec2(0.0, uTexelSize.y)).y;
        
        float div = 0.5 * (R - L + T - B);
        pc_fragColor = vec4(div, 0.0, 0.0, 1.0);
    }
`;