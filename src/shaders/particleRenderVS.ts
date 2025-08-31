
export const particleRenderVS = `
    uniform sampler2D uParticles;
    uniform float uParticleSize;
    attribute vec2 a_uv;
    varying float v_age_ratio;

    void main() {
        vec4 particle = texture2D(uParticles, a_uv);
        v_age_ratio = particle.b / particle.a;

        // Only draw alive particles
        if (particle.b < particle.a) {
            vec2 pos = (particle.xy * 2.0) - 1.0;
            gl_Position = vec4(pos, 0.0, 1.0);
            gl_PointSize = uParticleSize * (1.0 - v_age_ratio);
        } else {
            // Hide dead particles
            gl_Position = vec4(-2.0, -2.0, 0.0, 1.0);
            gl_PointSize = 0.0;
        }
    }
`;
