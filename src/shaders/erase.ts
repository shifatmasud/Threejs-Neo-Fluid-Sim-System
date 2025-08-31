
export const eraseShader = `
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float uAspectRatio;
    uniform vec2 uCenter;
    uniform float uRadius;
    uniform float uStrength;

    void main() {
        vec2 p = vUv - uCenter.xy;
        p.x *= uAspectRatio;
        float intensity = 1.0 - smoothstep(0.0, uRadius, length(p));
        vec4 base = texture2D(uTarget, vUv);
        
        base.rg *= 1.0 - intensity * uStrength;
        
        gl_FragColor = base;
    }
`;
