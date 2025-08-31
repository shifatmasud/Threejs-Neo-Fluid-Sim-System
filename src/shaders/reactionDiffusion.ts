
export const reactionDiffusionShader = `
    precision mediump float;
    in vec2 vUv;

    uniform sampler2D uChemicals;
    uniform vec2 uTexelSize;
    uniform float uFeedRate;
    uniform float uKillRate;
    
    const float uDu = 0.16;
    const float uDv = 0.08;
    const float uDt = 1.0;

    void main() {
        if (uFeedRate < 0.001 && uKillRate < 0.001) {
            pc_fragColor = texture(uChemicals, vUv);
            return;
        }

        vec2 chemical = texture(uChemicals, vUv).rg;
        float u = chemical.r;
        float v = chemical.g;

        float lap_u = (
            texture(uChemicals, vUv + vec2(0.0, uTexelSize.y)).r +
            texture(uChemicals, vUv - vec2(0.0, uTexelSize.y)).r +
            texture(uChemicals, vUv + vec2(uTexelSize.x, 0.0)).r +
            texture(uChemicals, vUv - vec2(uTexelSize.x, 0.0)).r -
            4.0 * u
        );

        float lap_v = (
            texture(uChemicals, vUv + vec2(0.0, uTexelSize.y)).g +
            texture(uChemicals, vUv - vec2(0.0, uTexelSize.y)).g +
            texture(uChemicals, vUv + vec2(uTexelSize.x, 0.0)).g +
            texture(uChemicals, vUv - vec2(uTexelSize.x, 0.0)).g -
            4.0 * v
        );

        float reaction = u * v * v;
        float du_dt = uDu * lap_u - reaction + uFeedRate * (1.0 - u);
        float dv_dt = uDv * lap_v + reaction - (uKillRate + uFeedRate) * v;

        float new_u = u + du_dt * uDt;
        float new_v = v + dv_dt * uDt;

        float old_b = texture(uChemicals, vUv).b;
        pc_fragColor = vec4(clamp(new_u, 0.0, 1.0), clamp(new_v, 0.0, 1.0), old_b, 1.0);
    }
`;