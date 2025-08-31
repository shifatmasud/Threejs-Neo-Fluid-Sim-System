
export const gradientSubtractShader = `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    uniform vec2 uTexelSize;

    void main () {
        float L = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
        float R = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
        float B = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
        float T = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
        vec2 velocity = texture(uVelocity, vUv).xy;
        velocity.xy -= 0.5 * vec2(R - L, T - B);
        pc_fragColor = vec4(velocity, 0.0, 1.0);
    }
`;