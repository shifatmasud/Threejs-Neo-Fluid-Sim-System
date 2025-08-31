
export const particleUpdateShader = `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uParticles; // R,G = pos.x, pos.y; B = age; A = lifetime
    uniform sampler2D uVelocity;
    uniform float uDt;
    uniform float uParticleAdvection;

    void main() {
        vec4 particle = texture(uParticles, vUv);

        // If particle is dead, keep it dead
        if (particle.b >= particle.a) {
            pc_fragColor = vec4(0.0, 0.0, particle.a, particle.a);
            return;
        }

        vec2 pos = particle.xy;
        vec2 vel = texture(uVelocity, pos).xy;

        pos += vel * uDt * uParticleAdvection; // Advect particle
        
        // Simple periodic boundary conditions
        pos = mod(pos, 1.0);

        float age = particle.b + uDt;
        
        pc_fragColor = vec4(pos, age, particle.a);
    }
`;