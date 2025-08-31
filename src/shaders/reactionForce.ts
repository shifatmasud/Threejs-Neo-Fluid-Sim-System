
export const reactionForceShader = `
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uChemicals;
    uniform float uReactionForce;
    uniform vec2 uTexelSize;

    void main() {
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        if (uReactionForce < 0.001) {
            gl_FragColor = vec4(velocity, 0.0, 1.0);
            return;
        }

        float L = texture2D(uChemicals, vUv - vec2(uTexelSize.x, 0.0)).g;
        float R = texture2D(uChemicals, vUv + vec2(uTexelSize.x, 0.0)).g;
        float B = texture2D(uChemicals, vUv - vec2(0.0, uTexelSize.y)).g;
        float T = texture2D(uChemicals, vUv + vec2(0.0, uTexelSize.y)).g;
        
        vec2 gradV = 0.5 * vec2(R - L, T - B);
        
        gl_FragColor = vec4(velocity - gradV * uReactionForce, 0.0, 1.0);
    }
`;
