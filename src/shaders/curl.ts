
export const curlShader = `
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform vec2 uTexelSize;

    void main() {
        float L = texture2D(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).y;
        float R = texture2D(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).y;
        float B = texture2D(uVelocity, vUv - vec2(0.0, uTexelSize.y)).x;
        float T = texture2D(uVelocity, vUv + vec2(0.0, uTexelSize.y)).x;
        
        float curl = 0.5 * ((T - B) - (R - L));
        gl_FragColor = vec4(curl, 0.0, 0.0, 1.0);
    }
`;
