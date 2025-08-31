
export const particleSplatShader = `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uTarget;
    uniform vec2 uCenter;
    uniform float uRadius;
    uniform float uIntensity;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

    void main() {
        vec4 particle = texture(uTarget, vUv);

        // If particle is dead...
        if (particle.b >= particle.a) {
            vec2 p = vUv - uCenter;
            float falloff = 1.0 - smoothstep(0.0, uRadius, length(p));
            
            // ...and we are under the cursor with enough intensity...
            if (falloff > 0.0 && hash(vUv * 999.0) < uIntensity * falloff * 0.2) {
                float lifetime = 2.0 + hash(vUv.yx) * 3.0;
                // Spawn particle at cursor position
                pc_fragColor = vec4(uCenter.x, uCenter.y, 0.0, lifetime);
                return;
            }
        }
        
        pc_fragColor = particle;
    }
`;