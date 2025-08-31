
export const ripplePropagateShader = `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uRippleTexture; // .r = current height, .g = previous height
    uniform vec2 uTexelSize;
    uniform float uRippleSpeed;
    uniform float uRippleDamping;

    void main() {
        vec2 prevState = texture(uRippleTexture, vUv).rg;
        float h_prev = prevState.g;
        float h_curr = prevState.r;

        float h_l = texture(uRippleTexture, vUv - vec2(uTexelSize.x, 0.0)).r;
        float h_r = texture(uRippleTexture, vUv + vec2(uTexelSize.x, 0.0)).r;
        float h_b = texture(uRippleTexture, vUv - vec2(0.0, uTexelSize.y)).r;
        float h_t = texture(uRippleTexture, vUv + vec2(0.0, uTexelSize.y)).r;

        float laplacian = (h_l + h_r + h_b + h_t) - 4.0 * h_curr;
        
        // Wave equation: new_h = 2*h_curr - h_prev + (speed^2 * laplacian)
        // A stability factor of 0.4 is added to prevent numerical artifacts.
        float h_new = 2.0 * h_curr - h_prev + laplacian * (uRippleSpeed * uRippleSpeed) * 0.4;
        
        // Apply damping to make ripples fade
        h_new *= uRippleDamping;

        pc_fragColor = vec4(h_new, h_curr, 0.0, 1.0); // Store new height in .r, current height in .g
    }
`;