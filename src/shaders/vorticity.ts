
export const vorticityShader = `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float uVorticity;
    uniform float uDt;
    uniform vec2 uTexelSize;

    void main() {
        vec2 velocity = texture(uVelocity, vUv).xy;
        if (uVorticity < 0.01) {
            pc_fragColor = vec4(velocity, 0.0, 1.0);
            return;
        }

        float L = texture(uCurl, vUv - vec2(uTexelSize.x, 0.0)).r;
        float R = texture(uCurl, vUv + vec2(uTexelSize.x, 0.0)).r;
        float B = texture(uCurl, vUv - vec2(0.0, uTexelSize.y)).r;
        float T = texture(uCurl, vUv + vec2(0.0, uTexelSize.y)).r;
        
        float curl = texture(uCurl, vUv).r;
        
        vec2 grad = 0.5 * vec2(R - L, T - B);
        vec2 N = normalize(grad + 0.0001);
        vec2 force = uVorticity * curl * vec2(N.y, -N.x);
        
        velocity += force * uDt;
        
        pc_fragColor = vec4(velocity, 0.0, 1.0);
    }
`;