
export const radialPushShader = `
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float uAspectRatio;
    uniform vec2 uCenter;
    uniform float uRadius;
    uniform float uStrength;

    void main() {
        vec2 p = vUv - uCenter.xy;
        p.x *= uAspectRatio;
        
        float falloff = 1.0 - smoothstep(0.0, uRadius, length(p));
        if (falloff <= 0.0) {
            gl_FragColor = texture2D(uTarget, vUv);
            return;
        }

        vec2 direction = normalize(p + 0.0001);
        vec2 pushForce = direction * falloff * uStrength;
        
        vec2 baseVelocity = texture2D(uTarget, vUv).xy;
        gl_FragColor = vec4(baseVelocity + pushForce, 0.0, 1.0);
    }
`;
